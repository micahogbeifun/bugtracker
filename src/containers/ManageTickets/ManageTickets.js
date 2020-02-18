import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import uniqid from "uniqid";

import "./ManageTickets.css";
import { fetchData, updateData } from "../../store/actions/actions";
import Button from "../../components/UI/Button/Button";
import ListDisplay from "../ListDisplay/ListDisplay";
import { updateObject, checkValidity } from "../../shared/utility";
import Input from "../../components/UI/Input/Input";

class ManageTickets extends Component {
  componentDidMount() {
    this.props.fetchData("projects");
    this.props.fetchData("tickets");
    this.props.fetchData("users");
    this.props.fetchData("ticketData");
  }

  state = {
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
        valid: false,
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
        valid: false,
        touched: false,
        placeholder: "Ticket Description"
      }
    },
    formIsValid: false,
    createTicket: false,
    viewTicket: false,
    noError: true,
    currentTicket: null
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
        ticketTypesArray = [];
      for (let key in this.props.tickets) {
        if (!controlArray.includes(key)) {
          ticketsArray.push(this.props.tickets[key]);
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

      this.setState({
        ticketsArray,
        originalTicketsArray: ticketsArray,
        prioritiesArray,
        statusesArray,
        ticketTypesArray
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

  toggleCreate = () => {
    this.setState(prevState => {
      return { createTicket: !prevState.createTicket };
    });
  };

  openViewTicket = currentTicket =>
    this.setState({ viewTicket: true, currentTicket });
  closeViewTicket = () =>
    this.setState({ viewTicket: false, currentTicket: null });

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
      valid = ticket.ticketName.toLowerCase() !== value.toLowerCase() && valid;
    });

    return valid;
  };

  createTicketHandler = () => {
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
      ticketTypeValue
    } = this.state;
    const newTicket = {};
    for (let key in ticketForm) {
      newTicket[key] = ticketForm[key].value;
    }
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    newTicket.dateCreated = date;
    newTicket.dateUpdated = date;
    const ticketId = uniqid();
    newTicket.id = ticketId;
    const newHistory = {};
    newHistory.dateCreated = date;
    newHistory.id = uniqid();
    newHistory.message = "created";
    newTicket.history = [newHistory];

    const currentUser = usersArray.find(user => user.id === userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;

    newTicket.developer = userValue.value.split(" #")[0];
    newTicket.project = projectValue.value;
    newTicket.priority = priorityValue.value;
    newTicket.status = statusValue.value;
    newTicket.type = ticketTypeValue.value;
    newTicket.submitter = fullName;

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you created the ticket '${ticketForm.ticketName.value}'`;
        const notification = {
          date,
          message,
          type: "ticket created",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
        user["tickets"] = user["tickets"]
          ? [...user["tickets"], ticketId]
          : [ticketId];
      }

      if (user.id === userValue.value.split(" ")[2].substr(1)) {
        const message = `you were assigned as a developer to the ticket '${ticketForm.ticketName.value}' by ${fullName}`;
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
          ? [...user["tickets"], ticketId]
          : [ticketId];
      }
    });

    projectsArray.forEach(project => {
      if (project.projectName === projectValue.value) {
        project["tickets"] = project["tickets"]
          ? [...project["tickets"], ticketId]
          : [ticketId];
        newTicket.projectId = project.id;
      }
    });
    ticketsArray.push(newTicket);
    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray);
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.props.fetchData("tickets");

    this.toggleCreate();
    for (let key in ticketForm) {
      ticketForm[key].value = "";
    }
    this.setState({ ticketForm });
  };

  getRegex = query => new RegExp(`${query}+.*`, "gi");
  regexFilter = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        item.ticketName.match(regex) ||
        item.submitter.match(regex) ||
        item.developer.match(regex)
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  static getDerivedStateFromProps = (props, state) => {
    const { tickets, ticketData } = props;
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
      ticketTypesArray = [];
    if (tickets && ticketData) {
      for (let key in tickets) {
        if (!controlArray.includes(key)) {
          ticketsArray.push(tickets[key]);
        }

        prioritiesArray = ticketData.ticketPriorities;

        statusesArray = ticketData.ticketStatuses;

        ticketTypesArray = ticketData.ticketTypes;
      }

      return {
        ...state,
        ticketsArray,
        originalTicketsArray: ticketsArray,
        prioritiesArray,
        statusesArray,
        ticketTypesArray
      };
    }

    return null;
  };

  render() {
    let {
      createTicket,
      formIsValid,
      projectsArray,
      ticketsArray,
      usersArray,
      viewTicket,
      prioritiesArray,
      statusesArray,
      ticketTypesArray,
      userValue,
      projectValue,
      priorityValue,
      statusValue,
      ticketTypeValue
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
      ticketCreate;
    if (ticketsArray) {
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
        onSubmit={formIsValid ? this.createTicketHandler : null}
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

    if (
      usersArray &&
      ticketsArray &&
      projectsArray &&
      prioritiesArray &&
      statusesArray &&
      ticketTypesArray
    ) {
      userOptions = usersArray
        .filter(user => user.role === "developer")
        .map(user => {
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
          <p className="ticket-select-label">user</p>
          <Select
            value={userValue}
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
            onChange={value => this.selectValueHandler(value, "ticket-type")}
            options={ticketTypeOptions}
            menuPlacement="auto"
          />
        </div>
      );

      let createErrorMessage =
        !noError && createTicket ? (
          <p className="create-error">project with name already exists</p>
        ) : null;

      ticketCreate = !createTicket ? null : (
        <div className="create-ticket">
          <div className="ticket-details">
            {form}
            {createErrorMessage}
          </div>
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

    let ticketsList =
      createTicket || viewTicket ? null : (
        <ListDisplay
          ticketListHome
          currentUser={this.props.myUser}
          createTicket={createTicket}
          fetchData={this.props.fetchData}
          category="tickets"
          getRegex={this.getRegex}
          regexFilter={this.regexFilter}
          identifier="id"
          firstProperty="ticketName"
          secondProperty="submitter"
          thirdProperty="developer"
          fourthProperty="status"
          fifthProperty="dateCreated"
          firstColumn="title"
          secondColumn="submitter"
          thirdColumn="developer"
          fourthColumn="status"
          fifthColumn="created"
          sixthColumn=""
          heading="your tickets"
          subHeading="all the tickets you have in your database"
        />
      );

    return (
      <div className="ManageTickets">
        {createTicket ? (
          <div className="projects-button">
            <Button
              btnType="Danger"
              disabled={false}
              clicked={this.toggleCreate}
            >
              cancel
            </Button>
          </div>
        ) : null}
        {this.props.myUser &&
        (this.props.myUser.role === "admin" ||
          this.props.myUser.role === "submitter") ? (
          <div className="create-projects-button">
            <Button
              btnType="Success"
              disabled={createTicket ? !formIsValid : false}
              clicked={
                createTicket ? this.createTicketHandler : this.toggleCreate
              }
            >
              {createTicket ? "save" : "create new ticket"}
            </Button>
          </div>
        ) : null}
        {ticketCreate}
        {ticketsList}
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
  connect(mapStateToProps, { fetchData, updateData })(ManageTickets)
);
