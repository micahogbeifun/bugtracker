import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import uniqid from "uniqid";

import "./Ticket.css";
import { fetchData, updateData } from "../../store/actions/actions";
import Button from "../../components/UI/Button/Button";
import ListDisplay from "../ListDisplay/ListDisplay";
import { updateObject, checkValidity } from "../../shared/utility";
import Input from "../../components/UI/Input/Input";
import { storageRef } from "../../store/actions/actions";

class Ticket extends Component {
  componentDidMount() {
    this.props.fetchData("projects");
    this.props.fetchData("tickets");
    this.props.fetchData("users");
    this.props.fetchData("ticketData");
    this.setState({
      currentTicket: this.props.location.pathname.split("/")[3]
    });
  }

  state = {
    ticket: null,
    userValue: { value: null },
    projectValue: { value: null },
    priorityValue: { value: null },
    statusValue: { value: null },
    ticketTypeValue: { value: null },
    projectsArray: null,
    usersArray: null,
    ticketsArray: null,
    prioritiesArray: null,
    statusesArray: null,
    ticketTypesArray: null,
    ticketForm: {
      ticketName: {
        elementType: "input",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "ticketName",
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20
        },
        valid: true,
        touched: false,
        placeholder: "Ticket Name"
      },
      description: {
        elementType: "textarea",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "description",
        validation: {
          required: true,
          minLength: 3,
          maxLength: 100
        },
        valid: true,
        touched: false,
        placeholder: "Ticket Description"
      }
    },
    formIsValid: true,
    commentForm: {
      message: {
        elementType: "textarea",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "message",
        validation: {
          required: true,
          minLength: 1,
          maxLength: 100
        },
        valid: false,
        touched: false,
        placeholder: "Comment"
      }
    },
    fileForm: {
      description: {
        elementType: "input",
        elementConfig: {
          type: "textarea"
        },
        value: "",
        valueType: "description",
        validation: {
          required: true,
          minLength: 1,
          maxLength: 100
        },
        valid: false,
        touched: false,
        placeholder: "Description"
      }
    },
    commentFormIsValid: false,
    fileFormIsValid: false,
    userFormIsValid: false,
    editTicket: false,
    viewTicket: false,
    noError: true,
    appReload: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.projectsArray && this.props.projects) {
      const projectsArray = [];
      for (let key in this.props.projects) {
        if (key !== "type") {
          projectsArray.push(this.props.projects[key]);
        }
      }

      this.setState({ projectsArray, originalProjectsArray: projectsArray });
    }
    if (!prevState.usersArray && this.props.users) {
      const usersArray = [];
      for (let key in this.props.users) {
        if (key !== "type") {
          usersArray.push(this.props.users[key]);
        }
      }

      this.setState({ usersArray, originalUsersArray: usersArray });
    }
    if (!prevState.ticketsArray && this.props.tickets) {
      const controlArray = [
        "type",
        "typeType",
        "priorityTypes",
        "statusTypes",
        "ticketTypes"
      ];
      let ticketsArray = [],
        prioritiesArray = [],
        statusesArray = [],
        ticket,
        ticketTypesArray = [];
      for (let key in this.props.tickets) {
        if (!controlArray.includes(key)) {
          ticketsArray.push(this.props.tickets[key]);
          if (this.props.tickets[key].id === this.state.currentTicket) {
            ticket = this.props.tickets[key];
          }
        }
        if (key === controlArray[2]) {
          prioritiesArray = [...this.props.tickets[key].data];
        }
        if (key === controlArray[3]) {
          statusesArray = [...this.props.tickets[key].data];
        }
        if (key === controlArray[4]) {
          ticketTypesArray = [...this.props.tickets[key].data];
        }
      }
      const ticketForm = { ...this.state.ticketForm };
      ticketForm.ticketName.value = ticket.ticketName;
      ticketForm.description.value = ticket.description;

      this.setState({
        userValue: { value: ticket.developer },
        projectValue: { value: ticket.project },
        priorityValue: { value: ticket.priority },
        statusValue: { value: ticket.status },
        ticketTypeValue: { value: ticket.type },
        ticket,
        ticketsArray,
        originalTicketsArray: ticketsArray,
        prioritiesArray,
        statusesArray,
        ticketTypesArray,
        ticketForm
      });
    }
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(
      this.state.ticketForm[inputIdentifier],
      {
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          this.state.ticketForm[inputIdentifier].validation
        ),
        touched: true
      }
    );

    const updatedOrderForm = updateObject(this.state.ticketForm, {
      [inputIdentifier]: updatedFormElement
    });
    let formIsValid = true;
    for (let inputIdentifier in updatedOrderForm) {
      formIsValid = updatedOrderForm[inputIdentifier].valid && formIsValid;
    }

    this.setState({ ticketForm: updatedOrderForm, formIsValid });
  };

  toggleEdit = () => {
    const {
      ticketForm,
      projectValue,
      priorityValue,
      userValue,
      statusValue,
      ticketTypeValue,
      ticketsArray,
      currentTicket
    } = this.state;
    const subjectTicket = ticketsArray.find(item => item.id === currentTicket);
    ticketForm.description.value = subjectTicket.description;
    ticketForm.ticketName.value = subjectTicket.ticketName;

    userValue.value = subjectTicket.developer;
    projectValue.value = subjectTicket.project;
    priorityValue.value = subjectTicket.priority;
    statusValue.value = subjectTicket.status;
    ticketTypeValue.value = subjectTicket.type;

    this.setState(prevState => {
      return {
        editTicket: !prevState.editTicket,
        ticketForm,
        userValue,
        projectValue,
        priorityValue,
        statusValue,
        ticketTypeValue
      };
    });
  };

  inputChangedHandlerComment = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(
      this.state.commentForm[inputIdentifier],
      {
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          this.state.commentForm[inputIdentifier].validation
        ),
        touched: true
      }
    );

    const updatedOrderForm = updateObject(this.state.commentForm, {
      [inputIdentifier]: updatedFormElement
    });
    let commentFormIsValid = true;
    for (let inputIdentifier in updatedOrderForm) {
      commentFormIsValid =
        updatedOrderForm[inputIdentifier].valid && commentFormIsValid;
    }

    this.setState({ commentForm: updatedOrderForm, commentFormIsValid });
  };

  inputChangedHandlerFile = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(
      this.state.fileForm[inputIdentifier],
      {
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          this.state.fileForm[inputIdentifier].validation
        ),
        touched: true
      }
    );

    const updatedOrderForm = updateObject(this.state.fileForm, {
      [inputIdentifier]: updatedFormElement
    });
    let fileFormIsValid = true;
    for (let inputIdentifier in updatedOrderForm) {
      fileFormIsValid =
        updatedOrderForm[inputIdentifier].valid && fileFormIsValid;
    }

    this.setState({ fileForm: updatedOrderForm, fileFormIsValid });
  };

  selectValueHandler = (value, inputType) => {
    this.setState(prevState => {
      let object = { ...prevState };
      switch (inputType) {
        case "user":
          object = {
            ...object,
            userValue: value,
            formIsValid: this.selectValidate(value)
          };

          break;
        case "project":
          object = {
            ...object,
            projectValue: value,
            formIsValid: this.selectValidate(value)
          };
          break;
        case "priority":
          object = {
            ...object,
            priorityValue: value,
            formIsValid: this.selectValidate(value)
          };
          break;
        case "status":
          object = {
            ...object,
            statusValue: value,
            formIsValid: this.selectValidate(value)
          };
          break;
        case "ticket-type":
          object = {
            ...object,
            ticketTypeValue: value,
            formIsValid: this.selectValidate(value)
          };
          break;
        default:
      }
      return object;
    });
  };

  selectValidate = value => {
    let valid;
    valid = value.value !== null;
    return valid;
  };

  validate = value => {
    let valid = true;
    const { ticketsArray } = this.state;
    ticketsArray.forEach(ticket => {
      valid =
        value === this.state.ticket.ticketName ||
        (ticket.ticketName !== value && valid);
    });

    return valid;
  };

  fileChangeHandler = event => {
    this.setState({ file: event.target.files[0] });
  };

  uploadFileHandler = async () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const ticketsArray = [...this.state.ticketsArray];
    const { fileForm, ticket, file } = this.state;
    const newFile = {};
    for (let key in fileForm) {
      newFile[key] = fileForm[key].value.trim();
    }
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    newFile.dateCreated = date;
    const fileId = uniqid();
    newFile.id = fileId;
    newFile.fileName = file.name;
    const newHistory = {};
    newHistory.dateCreated = date;
    newHistory.id = uniqid();
    newHistory.message = "file added";
    const currentUser = usersArray.find(user => user.id === userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    newFile.uploader = fullName;

    const fileRef = storageRef.child(
      `buglog/${newFile.id}/${newFile.fileName}`
    );
    await fileRef.put(file);
    const url = await fileRef.getDownloadURL();

    newFile.url = url;

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you uploaded to file ${file.name} to the ticket '${ticket.ticketName}'`;
        const notification = {
          date,
          message,
          type: "added file to ticket",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }

      if (user.tickets && user.tickets.find(item => item === ticket.id)) {
        const message = `${fullName} added the file ${file.name} to your ticket ${ticket.ticketName}`;
        const notification = {
          date,
          message,
          type: "ticket file added",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }
    });

    ticketsArray.forEach(ticketItem => {
      if (ticketItem.id === ticket.id) {
        ticketItem.history.push(newHistory);
        ticketItem["files"] = ticketItem["files"]
          ? [...ticketItem["files"], newFile]
          : [newFile];
      }
    });

    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray);
    this.props.fetchData("users");
    this.props.fetchData("tickets");
    this.setState(prevState => {
      return { appReload: !prevState.appReload };
    });
  };

  createCommentHandler = () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const ticketsArray = [...this.state.ticketsArray];
    const { commentForm, ticket } = this.state;
    const newComment = {};
    for (let key in commentForm) {
      newComment[key] = commentForm[key].value.trim();
    }
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    newComment.dateCreated = date;
    const commentId = uniqid();
    newComment.id = commentId;
    const newHistory = {};
    newHistory.dateCreated = date;
    newHistory.id = uniqid();
    newHistory.message = "comment added";
    const currentUser = usersArray.find(user => user.id === userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    newComment.commenter = fullName;

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you commented on the ticket '${ticket.ticketName}'`;
        const notification = {
          date,
          message,
          type: "commented on ticket",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }

      if (user.tickets && user.tickets.find(item => item === ticket.id)) {
        const message = `${fullName} left a comment on your ticket ${ticket.ticketName}`;
        const notification = {
          date,
          message,
          type: "ticket comment",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }
    });

    ticketsArray.forEach(ticketItem => {
      if (ticketItem.id === ticket.id) {
        ticketItem.history.push(newHistory);
        ticketItem["comments"] = ticketItem["comments"]
          ? [...ticketItem["comments"], newComment]
          : [newComment];
      }
    });

    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray);
    this.props.fetchData("users");
    this.props.fetchData("tickets");
    this.setState(prevState => {
      return {
        appReload: !prevState.appReload,
        commentForm: {
          ...commentForm,
          message: { ...commentForm.message, value: "" }
        }
      };
    });
  };

  editTicketHandler = () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const projectsArray = [...this.state.projectsArray];
    const ticketsArray = [...this.state.ticketsArray];
    const {
      ticketForm,
      userValue,
      projectValue,
      priorityValue,
      statusValue,
      ticketTypeValue,
      ticket
    } = this.state;
    const newTicket = { ...ticket };
    for (let key in ticketForm) {
      newTicket[key] = ticketForm[key].value;
    }
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

    newTicket.dateUpdated = date;

    const currentUser = usersArray.find(user => user.id === userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    const ticketIndex = ticketsArray.findIndex(
      ticketItem => ticketItem.id === ticket.id
    );

    newTicket.developer = userValue.value.split(" #")[0];
    newTicket.project = projectValue.value;
    newTicket.priority = priorityValue.value;
    newTicket.status = statusValue.value;
    newTicket.type = ticketTypeValue.value;
    newTicket.submitter = fullName;

    if (
      newTicket.developer === ticket.developer &&
      newTicket.project === ticket.project &&
      newTicket.priority === ticket.priority &&
      newTicket.status === ticket.status &&
      newTicket.type === ticket.type &&
      newTicket.ticketName === ticket.ticketName &&
      newTicket.description === ticket.description
    ) {
      this.toggleEdit();
      return;
    }

    let developerChange = false,
      projectChange = false;
    const controlArray = [
      "type",
      "priority",
      "developer",
      "project",
      "status",
      "ticketName",
      "description"
    ];
    for (let key in ticket) {
      if (!controlArray.includes(key)) continue;

      if (ticket[key] !== newTicket[key]) {
        if (key === "developer") developerChange = true;
        if (key === "project") projectChange = true;
        const newHistory = {};
        newHistory.dateCreated = date;
        newHistory.id = uniqid();
        newHistory.message = `ticket ${key} changed`;
        newHistory.oldValue = ticket[key];
        newHistory.newValue = newTicket[key];
        newTicket.history.push(newHistory);
      }
    }

    ticketsArray[ticketIndex] = newTicket;

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you edited the ticket '${newTicket.ticketName}'`;
        const notification = {
          date,
          message,
          type: "ticket edited",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }

      if (
        developerChange &&
        user.firstname === newTicket.developer.split(" ")[0] &&
        user.role === "developer"
      ) {
        const message = `you were assigned as a developer to the ticket '${newTicket.ticketName}' by ${fullName}`;
        const notification = {
          date,
          message,
          type: "assigned to ticket",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
        user["tickets"] = user["tickets"]
          ? [...user["tickets"], ticket.id]
          : [ticket.id];
      }

      if (
        developerChange &&
        user.firstname === ticket.developer.split(" ")[0] &&
        user.role === "developer"
      ) {
        const message = `you were removed as a developer from the ticket '${newTicket.ticketName}' by ${fullName}`;
        const notification = {
          date,
          message,
          type: "removed from ticket",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
        user["tickets"] = user["tickets"]
          ? [...user["tickets"]].filter(ticket => ticket !== newTicket.id)
          : [];
      }
    });

    projectsArray.forEach(project => {
      if (projectChange && project.projectName === newTicket.project) {
        project["tickets"] = project["tickets"]
          ? [...project["tickets"], ticket.id]
          : [ticket.id];
        newTicket.projectId = project.id;
      }

      if (projectChange && project.projectName === ticket.project) {
        project["tickets"] = project["tickets"]
          ? [...project["tickets"]].filter(ticket => ticket !== newTicket.id)
          : [];
      }
    });
    ticketsArray.push(newTicket);
    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray);
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.props.fetchData("tickets");
    this.toggleEdit();
  };

  deleteTicketHandler = () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    let projectsArray = [...this.state.projectsArray];
    let ticketsArray = [...this.state.ticketsArray];
    let {
      ticketForm,
      ticket,
      prioritiesArray,
      statusesArray,
      ticketTypesArray
    } = this.state;
    const newTicket = { ...ticket };
    for (let key in ticketForm) {
      newTicket[key] = ticketForm[key].value;
    }
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

    const currentUser = usersArray.find(user => user.id === userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;

    usersArray.forEach(user => {
      const userFullName = `${user.firstname} ${user.lastname}`;
      if (user.id === userId) {
        const message = `you deleted the ticket '${newTicket.ticketName}'`;
        const notification = {
          date,
          message,
          type: "deleted ticket",
          id: uniqid(),
          read: false
        };
        const notifications = [...user["notifications"], notification];
        user["notifications"] = notifications;
      }

      if (
        userFullName === ticket.developer ||
        userFullName === ticket.submitter
      ) {
        const message = `the ticket '${newTicket.ticketName}' was deleted by ${fullName}`;
        const notification = {
          date,
          message,
          type: "ticket deleted",
          id: uniqid(),
          read: false
        };
        user.tickets = user.tickets.filter(item => item !== ticket.id);
        const notifications = [...user["notifications"], notification];
        user["notifications"] = notifications;
      }
    });

    projectsArray.forEach(projectItem => {
      if (projectItem.tickets && projectItem.tickets.includes(ticket.id)) {
        projectItem["tickets"] = projectItem["tickets"].filter(
          item => item !== ticket.id
        );
      }
    });
    const controlObjectArray = [
      { id: "typeType", type: "tickets" },
      { id: "priorityTypes", data: prioritiesArray },
      {
        id: "statusTypes",
        data: statusesArray
      },
      { id: "ticketTypes", data: ticketTypesArray }
    ];
    ticketsArray = ticketsArray.filter(item => item.id !== newTicket.id);
    ticketsArray = [...ticketsArray, ...controlObjectArray];

    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray, "delete");
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.props.fetchData("tickets");
    this.toggleEdit();
    for (let key in ticketForm) {
      ticketForm[key].value = null;
    }
    this.setState({ ticketForm });
    this.props.history.push(`/home/my-tickets`);
  };

  getRegex = query => new RegExp(`${query}+.*`, "gi");
  regexFilter = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        item.message.match(regex) ||
        item.dateCreated.match(regex) ||
        (item.oldValue && item.oldValue.match(regex)) ||
        (item.newValue && item.newValue.match(regex))
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  regexFilterComments = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        item.message.match(regex) ||
        item.dateCreated.match(regex) ||
        item.commenter.match(regex)
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  regexFilterFiles = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        item.fileName.match(regex) ||
        item.uploader.match(regex) ||
        item.dateCreated.match(regex) ||
        item.description.match(regex)
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  static getDerivedStateFromProps(props, state) {
    const { tickets, ticketData } = props;
    let ticketsArray = [],
      prioritiesArray = [],
      statusesArray = [],
      ticket,
      ticketTypesArray = [];
    const controlArray = [
      "type",
      "typeType",
      "priorityTypes",
      "statusTypes",
      "ticketTypes"
    ];
    if (tickets && ticketData) {
      for (let key in tickets) {
        if (!controlArray.includes(key)) {
          ticketsArray.push(tickets[key]);
          if (tickets[key].id === state.currentTicket) {
            ticket = tickets[key];
          }
        }

        prioritiesArray = ticketData.ticketPriorities;

        statusesArray = ticketData.ticketStatuses;

        ticketTypesArray = ticketData.ticketTypes;
      }

      return {
        ...state,
        ticketsArray,
        ticket,
        prioritiesArray,
        statusesArray,
        ticketTypesArray
      };
    }

    return null;
  }

  render() {
    let {
      ticket,
      editTicket,
      formIsValid,
      commentFormIsValid,
      fileFormIsValid,
      projectsArray,
      ticketsArray,
      usersArray,
      prioritiesArray,
      statusesArray,
      ticketTypesArray,
      userValue,
      projectValue,
      priorityValue,
      statusValue,
      ticketTypeValue,
      appReload
    } = this.state;
    let noError = true,
      userOptions,
      projectOptions,
      priorityOptions,
      statusOptions,
      ticketTypeOptions,
      userSelect,
      projectSelect,
      prioritySelect,
      statusSelect,
      ticketTypeSelect,
      ticketDetails,
      editErrorMessage,
      ticketEdit;

    if (ticketsArray && editTicket) {
      noError = this.validate(this.state.ticketForm.ticketName.value);
      formIsValid = formIsValid && noError;
    }

    const formElementsArray = [];
    for (let key in this.state.ticketForm) {
      formElementsArray.push({
        id: key,
        config: this.state.ticketForm[key]
      });
    }
    let form = (
      <form
        className="create-project-form"
        onSubmit={formIsValid ? this.editTicketHandler : null}
      >
        {formElementsArray.map(formElement => (
          <Input
            height="100%"
            borderRadius="4px"
            key={formElement.id}
            elementType={formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            valueType={formElement.config.valueType}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={event => this.inputChangedHandler(event, formElement.id)}
            placeholder={formElement.config.placeholder}
          />
        ))}
      </form>
    );

    const formElementsArrayComments = [];
    for (let key in this.state.commentForm) {
      formElementsArrayComments.push({
        id: key,
        config: this.state.commentForm[key]
      });
    }
    let commentForm = (
      <form
        className="create-project-form"
        onSubmit={commentFormIsValid ? this.createCommentHandler : null}
      >
        {formElementsArrayComments.map(formElement => (
          <Input
            height="100%"
            borderRadius="4px"
            key={formElement.id}
            elementType={formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            valueType={formElement.config.valueType}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={event =>
              this.inputChangedHandlerComment(event, formElement.id)
            }
            placeholder={formElement.config.placeholder}
          />
        ))}
      </form>
    );

    const formElementsArrayFiles = [];
    for (let key in this.state.fileForm) {
      formElementsArrayFiles.push({
        id: key,
        config: this.state.fileForm[key]
      });
    }
    let fileForm = (
      <form
        className="create-project-form"
        onSubmit={fileFormIsValid ? this.createCommentHandler : null}
      >
        {formElementsArrayFiles.map(formElement => (
          <Input
            height="100%"
            borderRadius="4px"
            key={formElement.id}
            elementType={formElement.config.elementType}
            elementConfig={formElement.config.elementConfig}
            value={formElement.config.value}
            valueType={formElement.config.valueType}
            invalid={!formElement.config.valid}
            shouldValidate={formElement.config.validation}
            touched={formElement.config.touched}
            changed={event =>
              this.inputChangedHandlerFile(event, formElement.id)
            }
            placeholder={formElement.config.placeholder}
          />
        ))}
      </form>
    );

    if (
      usersArray &&
      ticketsArray &&
      projectsArray &&
      prioritiesArray &&
      statusesArray &&
      ticketTypesArray
    ) {
      userOptions = usersArray.map(user => {
        const fullName = `${user.firstname} ${user.lastname} #${user.accountId}`;
        formIsValid &= this.selectValidate(userValue);
        return { value: fullName, label: fullName };
      });
      projectOptions = projectsArray.map(project => {
        formIsValid &= this.selectValidate(projectValue);
        return { value: project.projectName, label: project.projectName };
      });
      priorityOptions = prioritiesArray.map(priority => {
        formIsValid &= this.selectValidate(priorityValue);
        return { value: priority, label: priority };
      });

      statusOptions = statusesArray.map(status => {
        formIsValid &= this.selectValidate(statusValue);
        return { value: status, label: status };
      });
      ticketTypeOptions = ticketTypesArray.map(ticketType => {
        formIsValid &= this.selectValidate(ticketTypeValue);
        return { value: ticketType, label: ticketType };
      });
      userSelect = (
        <div className="ticket-select">
          <p className="ticket-select-label">developer</p>
          <Select
            value={userValue}
            placeholder={userValue}
            onChange={value => this.selectValueHandler(value, "user")}
            options={userOptions}
            menuPlacement="auto"
          />
        </div>
      );
      projectSelect = (
        <div className="ticket-select">
          <p className="ticket-select-label">project</p>
          <Select
            value={projectValue}
            placholder={projectValue.value}
            onChange={value => this.selectValueHandler(value, "project")}
            options={projectOptions}
            menuPlacement="auto"
          />
        </div>
      );
      prioritySelect = (
        <div className="ticket-select">
          <p className="ticket-select-label">priority</p>
          <Select
            value={priorityValue}
            placeholder={priorityValue.value}
            onChange={value => this.selectValueHandler(value, "priority")}
            options={priorityOptions}
            menuPlacement="auto"
          />
        </div>
      );

      statusSelect = (
        <div className="ticket-select">
          <p className="ticket-select-label">status</p>
          <Select
            value={statusValue}
            placeholder={statusValue.value}
            onChange={value => this.selectValueHandler(value, "status")}
            options={statusOptions}
            menuPlacement="auto"
          />
        </div>
      );

      ticketTypeSelect = (
        <div className="ticket-select">
          <p className="ticket-select-label">type</p>
          <Select
            value={ticketTypeValue}
            placeholder={ticketTypeValue.value}
            onChange={value => this.selectValueHandler(value, "ticket-type")}
            options={ticketTypeOptions}
            menuPlacement="auto"
          />
        </div>
      );

      editErrorMessage =
        !noError && editTicket ? (
          <p className="create-error">project with name already exists</p>
        ) : null;

      ticketEdit = !editTicket ? null : (
        <div className="create-ticket">
          <div className="ticket-details">{form}</div>
          <div className="ticket-admin">
            {userSelect}
            {projectSelect}
            {prioritySelect}
            {statusSelect}
            {ticketTypeSelect}
          </div>
        </div>
      );
    }
    ticketDetails =
      editTicket || !ticket ? null : (
        <div className="personnel-div">
          <div className="personnel-header">
            <h3 className="personnel-header-title">{`details for ${ticket.ticketName}`}</h3>
            <p>
              <span onClick={() => this.props.history.push(`/home/my-tickets`)}>
                view all tickets
              </span>{" "}
              <span onClick={this.toggleEdit}>edit ticket</span>{" "}
            </p>
          </div>
          <div className="unique-ticket-details one">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">ticket title</p>
              <p className="unique-ticket property">{ticket.ticketName}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">ticket description</p>
              <p className="unique-ticket property">{ticket.description}</p>
            </div>
          </div>
          <div className="unique-ticket-details two">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">assigned developer</p>
              <p className="unique-ticket property">{ticket.developer}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">submitter</p>
              <p className="unique-ticket property">{ticket.submitter}</p>
            </div>
          </div>
          <div className="unique-ticket-details three">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">project name</p>
              <p className="unique-ticket property">{ticket.project}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">ticket priority</p>
              <p className="unique-ticket property">{ticket.priority}</p>
            </div>
          </div>
          <div className="unique-ticket-details four">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">ticket status</p>
              <p className="unique-ticket property">{ticket.status}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">ticket type</p>
              <p className="unique-ticket property">{ticket.type}</p>
            </div>
          </div>
          <div className="unique-ticket-details five">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">created</p>
              <p className="unique-ticket property">{ticket.dateCreated}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">updated</p>
              <p className="unique-ticket property">{ticket.dateUpdated}</p>
            </div>
          </div>
        </div>
      );

    let ticketHistory =
      editTicket || !ticket ? null : (
        <ListDisplay
          editTicket={editTicket}
          category="history"
          ticket={ticket}
          ticketHistory
          fetchData={this.props.fetchData}
          getRegex={this.getRegex}
          regexFilter={this.regexFilter}
          identifier="id"
          firstProperty="message"
          secondProperty="oldValue"
          thirdProperty="newValue"
          fourthProperty="dateCreated"
          firstColumn="property"
          secondColumn="old value"
          thirdColumn="new value"
          fourthColumn="date changed"
          heading="ticket history"
          subHeading="all history interactions for the ticket"
          appReload={appReload}
        />
      );

    let ticketComments =
      editTicket || !ticket ? null : (
        <ListDisplay
          editTicket={editTicket}
          category="comments"
          ticket={ticket}
          ticketComments
          fetchData={this.props.fetchData}
          getRegex={this.getRegex}
          regexFilter={this.regexFilterComments}
          identifier="id"
          firstProperty="commenter"
          secondProperty="message"
          thirdProperty="dateCreated"
          firstColumn="commenter"
          secondColumn="message"
          thirdColumn="created"
          heading="ticket comments"
          subHeading="all comments for this ticket"
          appReload={appReload}
        />
      );

    let ticketFiles =
      editTicket || !ticket ? null : (
        <ListDisplay
          editTicket={editTicket}
          category="files"
          ticket={ticket}
          ticketFiles
          fetchData={this.props.fetchData}
          getRegex={this.getRegex}
          regexFilter={this.regexFilterFiles}
          identifier="id"
          firstProperty="fileName"
          secondProperty="uploader"
          thirdProperty="description"
          fourthProperty="dateCreated"
          firstColumn="file"
          secondColumn="uploader"
          thirdColumn="notes"
          fourthColumn="created"
          fifthColumn=""
          heading="ticket files"
          subHeading="all files for this ticket"
          appReload={appReload}
        />
      );
    const finalClass = editTicket ? "Ticket edit" : "Ticket";
    return (
      <div className={finalClass}>
        {editTicket ? (
          <div className="projects-button">
            <Button btnType="Danger" disabled={false} clicked={this.toggleEdit}>
              cancel
            </Button>
          </div>
        ) : null}
        {editTicket ? (
          <div className="projects-button">
            <Button
              btnType="Danger"
              disabled={false}
              clicked={this.deleteTicketHandler}
            >
              delete
            </Button>
          </div>
        ) : null}
        {!editTicket ? null : (
          <div className="create-projects-button">
            <Button
              btnType="Success"
              disabled={editTicket ? !formIsValid : false}
              clicked={this.editTicketHandler}
            >
              save
            </Button>
          </div>
        )}
        {editErrorMessage}
        {ticketEdit}
        {editTicket ? null : (
          <Fragment>
            <div className="ticket-column-one">
              {ticketDetails}
              <div className="ticket-history">{ticketHistory}</div>
            </div>
            <div className="ticket-column-two">
              <div className="ticket-comments">
                <h3>add a comment ?</h3>
                <div className="comment-form">
                  {commentForm}
                  <Button
                    btnType="Success"
                    disabled={!commentFormIsValid}
                    clicked={this.createCommentHandler}
                  >
                    add
                  </Button>
                </div>
                {ticketComments}
              </div>
              <div className="ticket-attachments">
                <h3>add a attachment ?</h3>
                <div className="attachment-form">
                  <input
                    type="file"
                    className="custom-file-input"
                    onChange={this.fileChangeHandler}
                  />
                  {fileForm}
                  <Button
                    btnType="Success"
                    disabled={false}
                    clicked={this.state.file ? this.uploadFileHandler : null}
                  >
                    add
                  </Button>
                </div>
                {ticketFiles}
              </div>
            </div>{" "}
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    projects: state.fetchedData.projects,
    users: state.fetchedData.users,
    tickets: state.fetchedData.tickets,
    ticketData: state.fetchedData.ticketData,
    userId: state.auth.userId
  };
};

export default withRouter(
  connect(mapStateToProps, { fetchData, updateData })(Ticket)
);
