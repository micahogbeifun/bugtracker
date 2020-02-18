import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import uniqid from "uniqid";

import "./ManageProjects.css";
import { fetchData, updateData } from "../../store/actions/actions";
import Button from "../../components/UI/Button/Button";
import ListDisplay from "../ListDisplay/ListDisplay";
import { updateObject, checkValidity } from "../../shared/utility";
import Input from "../../components/UI/Input/Input";

class ManageProjects extends Component {
  componentDidMount() {
    this.props.fetchData("projects");
    this.props.fetchData("users");
    this.props.fetchData("tickets");
  }

  state = {
    userValues: [],
    projectsArray: null,
    usersArray: null,
    ticketsArray: null,
    projectForm: {
      projectName: {
        elementType: "input",
        elementConfig: {
          type: "text"
        },
        value: "",
        valueType: "projectName",
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20
        },
        valid: false,
        touched: false,
        placeholder: "Project Name"
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
        placeholder: "Project Description"
      }
    },
    formIsValid: false,
    userFormIsValid: false,
    createProject: false,
    createProjectDetails: false,
    editProject: false,
    viewProject: false,
    authModal: false,
    forgotPasswordModal: false,
    noError: true,
    currentProject: null
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      (!prevState.projectsArray && this.props.projects) ||
      prevState.createProject !== this.state.createProject ||
      prevState.editProject !== this.state.editProject
    ) {
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
      const ticketsArray = [];
      for (let key in this.props.tickets) {
        if (!controlArray.includes(key)) {
          ticketsArray.push(this.props.tickets[key]);
        }
      }

      this.setState({ ticketsArray, originalTicketsArray: ticketsArray });
    }

    if (!prevState.editProjectDetails && this.state.editProjectDetails) {
      const form = { ...this.state.projectForm };
      const project = this.state.projectsArray.find(
        project => project.id === this.state.currentProject
      );

      for (let key in form) {
        form[key].value = project[key];
        form[key].valid = true;
      }

      this.setState({ projectForm: form, formIsValid: true });
    }
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedFormElement = updateObject(
      this.state.projectForm[inputIdentifier],
      {
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          this.state.projectForm[inputIdentifier].validation
        ),
        touched: true
      }
    );

    const updatedOrderForm = updateObject(this.state.projectForm, {
      [inputIdentifier]: updatedFormElement
    });
    let formIsValid = true;
    for (let inputIdentifier in updatedOrderForm) {
      formIsValid = updatedOrderForm[inputIdentifier].valid && formIsValid;
    }

    this.setState({ projectForm: updatedOrderForm, formIsValid });
  };

  toggleCreate = () => {
    this.setState(prevState => {
      return { createProject: !prevState.createProject };
    });
    this.closeViewProject();
  };

  toggleEdit = () => {
    this.setState(prevState => {
      return {
        editProjectDetails: !prevState.editProjectDetails,
        viewProject: false,
        openUserEdit: false
      };
    });
    this.closeViewProject();
  };

  openUserEdit = currentProject =>
    this.setState({ editProject: true, currentProject });
  closeUserEdit = () => this.setState({ editProject: false });

  openViewProject = currentProject =>
    this.setState({ viewProject: true, currentProject });
  closeViewProject = () => this.setState({ viewProject: false });

  userValueHandler = userValues => {
    this.setState({
      userValues,
      userFormIsValid: this.userValidate("users", userValues)
    });
  };

  userValidate = (category, value) => {
    let valid;
    if (category === "users") {
      valid = value && value.length > 0;
    }
    if (category === "roles") {
      valid = value.value !== null;
    }
    return valid;
  };

  validate = value => {
    let valid = true;
    value = value ? value.trim() : value;
    const { projectsArray, currentProject } = this.state;
    const specProject = projectsArray.find(
      project => project.id === currentProject
    );
    projectsArray.forEach(project => {
      valid =
        (specProject && specProject.projectName === project.projectName) ||
        (project.projectName !== value && valid);
    });
    return valid;
  };

  createProjectHandler = () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const projectsArray = [...this.state.projectsArray];
    const projectForm = { ...this.state.projectForm };
    const newProject = {};
    for (let key in projectForm) {
      newProject[key] = projectForm[key].value;
      projectForm[key].value = "";
    }

    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    newProject.dateCreated = date;
    newProject.id = uniqid();
    projectsArray.push(newProject);

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you created the project '${newProject.projectName}'`;
        const notification = {
          date,
          message,
          type: "project created",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }
    });
    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.setState({ projectForm });
    this.toggleCreate();
  };

  editProjectHandler = () => {
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const projectsArray = [...this.state.projectsArray];
    const projectForm = { ...this.state.projectForm };
    const { currentProject } = this.state;

    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

    const project = projectsArray.find(
      project => project.id === currentProject
    );
    const newProject = { ...project };
    for (let key in projectForm) {
      newProject[key] = projectForm[key].value;
    }
    let changed = false;
    for (let key in projectForm) {
      if (newProject[key] !== project[key]) {
        changed = true;
      }
    }
    if (!changed) {
      this.toggleEdit();
      return;
    }
    let projectIndex = projectsArray.findIndex(
      projectItem => projectItem.id === currentProject
    );
    projectsArray[projectIndex] = newProject;
    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you edited the project '${newProject.projectName.value}'`;
        const notification = {
          date,
          message,
          type: "project edited",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
      }
    });
    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.fetchData("users");
    this.props.fetchData("projects");
    for (let key in projectForm) {
      projectForm[key].value = "";
    }
    this.setState({ projectForm });
    this.toggleEdit();
  };

  editProjectUsers = action => {
    const add = action === "add" ? true : false;
    let usersArray = [...this.state.usersArray];
    let projectsArray = [...this.state.projectsArray];
    const tempArray = [];
    for (let key in this.state.userValues) {
      tempArray.push(this.state.userValues[key]);
    }
    const { currentProject } = this.state;
    const currentUser = usersArray.find(user => user.id === this.props.userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    const project = projectsArray.find(
      project => project.id === currentProject
    );
    const projectIndex = projectsArray.findIndex(
      project => project.id === currentProject
    );
    usersArray.forEach(user => {
      const message = `you were ${
        add ? "added to" : "removed from"
      } the project '${project.projectName}' by ${fullName}`;
      const hasProject =
        user["projects"] &&
        user["projects"].find(project => project === currentProject);
      const changed = this.state.userValues.find(
        addedUser => addedUser.value.split(" ")[2].substr(1) === user.accountId
      );

      if (changed && add && !hasProject) {
        if (!user.projects) {
          user.projects = [currentProject];
        } else {
          user.projects.push(currentProject);
        }

        if (project.users) {
          project.users.push(user.accountId);
        } else {
          project.users = [user.accountId];
        }
        projectsArray[projectIndex] = project;
      }

      if (changed && !add) {
        user["projects"] = user["projects"].filter(
          project => project !== currentProject
        );
        if (project.users) {
          project.users = project.users.filter(
            projectuser => projectuser !== user.accountId
          );
        } else {
          project.users = null;
        }
        projectsArray[projectIndex] = project;
      }

      const notification = {
        date,
        message,
        type: add ? "assigned to project" : "removed from project",
        id: uniqid(),
        read: false
      };
      const notifications = user["notifications"]
        ? [...user["notifications"], notification]
        : [notification];
      user["notifications"] = changed
        ? notifications
        : user["notifications"]
        ? user["notifications"]
        : null;
    });

    this.props.updateData("projects", projectsArray);
    this.props.updateData("users", usersArray);
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.closeUserEdit();
  };

  deleteProjectHandler = () => {
    let usersArray = [...this.state.usersArray];
    let projectsArray = [...this.state.projectsArray];
    let ticketsArray = [...this.state.ticketsArray];
    const { currentProject } = this.state;
    const currentUser = usersArray.find(user => user.id === this.props.userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

    const project = projectsArray.find(
      projectItem => projectItem.id === currentProject
    );
    const projectUsers = project.users;
    const projectTickets = project.tickets;

    usersArray.forEach(user => {
      if (user.id === currentUser.id) {
        const message = `you deleted the project '${project.projectName}'`;
        const notification = {
          date,
          message,
          type: "deleted project",
          id: uniqid(),
          read: false
        };
        user["notifications"] = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
      }
      if (projectUsers && projectUsers.includes(user.accountId)) {
        const message = `the project '${project.projectName}' was deleted by ${fullName}`;
        const notification = {
          date,
          message,
          type: "project deleted",
          id: uniqid(),
          read: false
        };
        if (user.projects) {
          user.projects = user.projects.filter(
            project => project !== currentProject
          );
        }
        user["notifications"] = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
      }

      if (user.tickets && projectTickets) {
        projectTickets.forEach(ticket => {
          user.tickets.forEach(userTicket => {
            if (userTicket === ticket) {
              const targetTicket = ticketsArray.find(
                target => target.id === ticket
              );
              const message = `the project '${project.projectName}' was deleted by ${fullName} along with ticket '${targetTicket.ticketName}'`;
              const notification = {
                date,
                message,
                type: "project ticket deleted",
                id: uniqid(),
                read: false
              };
              user["notifications"] = user["notifications"]
                ? [...user["notifications"], notification]
                : [notification];
              user.tickets = user.tickets.filter(
                deleteTicket => deleteTicket !== ticket
              );
            }
          });
        });
      }
    });

    ticketsArray = ticketsArray.filter(
      ticket => ticket.projectId !== currentProject
    );
    projectsArray = projectsArray.filter(item => item.id !== currentProject);

    this.props.updateData("projects", projectsArray, "delete");
    this.props.updateData("users", usersArray);
    this.props.updateData("tickets", ticketsArray, "delete");
    this.props.fetchData("users");
    this.props.fetchData("projects");
    this.props.fetchData("tickets");
    this.toggleEdit();
    const projectForm = { ...this.state.projectForm };
    for (let key in projectForm) {
      projectForm[key].value = "";
    }
    this.setState({ projectForm });
  };

  getRegex = query => new RegExp(`${query}+.*`, "gi");
  regexFilter = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (item.projectName.match(regex) || item.description.match(regex)) {
        newArray.push(item);
      }
    });
    return newArray;
  };
  getRegexUsers = query => new RegExp(`${query}+[\\w,\\d,@,\\.,-]*`, "gi");
  regexFilterUsers = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        item.firstname.match(regex) ||
        item.lastname.match(regex) ||
        item.email.match(regex)
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  static getDerivedStateFromProps(props, state) {
    const { users, projects } = props;
    const projectsArray = [];

    if (projects && users) {
      for (let key in projects) {
        if (key !== "type") {
          projectsArray.push(projects[key]);
        }
      }
      return { ...state, projectsArray, originalProjectsArray: projectsArray };
    }

    // Return null to indicate no change to state.
    return null;
  }

  render() {
    let {
      createProject,
      editProjectDetails,
      formIsValid,
      projectsArray,
      editProject,
      usersArray,
      currentProject,
      viewProject
    } = this.state;
    let noError = true,
      nameOptions,
      namesSelect,
      projectUserEdit,
      projectDetails,
      selectedProject;
    if (projectsArray) {
      noError = this.validate(this.state.projectForm.projectName.value);

      formIsValid = formIsValid && noError;

      selectedProject = projectsArray.find(
        project => project.id === currentProject
      );
    }
    const formElementsArray = [];
    for (let key in this.state.projectForm) {
      formElementsArray.push({
        id: key,
        config: this.state.projectForm[key]
      });
    }
    let form = (
      <form
        className="create-project-form"
        onSubmit={
          formIsValid && createProject
            ? this.createProjectHandler
            : formIsValid && editProjectDetails
            ? this.editProjectHandler
            : null
        }
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

    let projectCreate =
      createProject || editProjectDetails ? (
        <div className="create-project">
          <div className="project-details">{form}</div>
          <div className="project-admin"></div>
        </div>
      ) : null;

    if (usersArray) {
      nameOptions = usersArray.map(user => {
        const fullName = `${user.firstname} ${user.lastname} #${user.accountId}`;
        return { value: fullName, label: fullName };
      });

      namesSelect = (
        <Select
          value={this.state.userValues}
          onChange={this.userValueHandler}
          options={nameOptions}
          isMulti={true}
        />
      );

      projectUserEdit = !editProject ? null : (
        <div className="create-project">
          <div className="project-details">
            <h3>Select 1 or more users to add or remove</h3>
            <div className="project-edit-button">
              <Button
                btnType="Danger"
                disabled={false}
                clicked={this.closeUserEdit}
              >
                cancel
              </Button>
            </div>{" "}
            {namesSelect}
            <div className="project-action-buttons">
              <div className="project-edit-button">
                <Button
                  btnType="Success"
                  disabled={false}
                  clicked={() => this.editProjectUsers("remove")}
                >
                  remove
                </Button>
              </div>
              <div className="project-edit-button">
                <Button
                  btnType="Success"
                  disabled={false}
                  clicked={() => this.editProjectUsers("add")}
                >
                  add
                </Button>
              </div>
            </div>
          </div>
          <div className="project-admin"></div>
        </div>
      );
    }

    projectDetails =
      createProject || editProjectDetails || !viewProject ? null : (
        <div className="personnel-div">
          <div className="personnel-header">
            <h3 className="personnel-header-title">{`details for ${selectedProject.projectName}`}</h3>
            <p>
              <span onClick={this.closeViewProject}>back to projects</span>{" "}
              {this.props.myUser &&
              (this.props.myUser.role === "admin" ||
                this.props.myUser.role === "project manager") ? (
                <span onClick={this.toggleEdit}>edit project</span>
              ) : null}
            </p>
          </div>
          <div className="personnel-div-details">
            <div className="project-details-users">
              <h3 className="personnel-header-title details">project users</h3>
              <ListDisplay
                viewProject={viewProject}
                editProject={editProject}
                editProjectDetails={editProjectDetails}
                projectDetailsUsers={currentProject}
                fetchData={this.props.fetchData}
                category="users"
                getRegex={this.getRegexUsers}
                regexFilter={this.regexFilterUsers}
                identifier="id"
                firstProperty="fullName"
                secondProperty="email"
                thirdProperty="role"
                firstColumn="name"
                secondColumn="email"
                thirdColumn="role"
                heading="project personnel"
                subHeading="all users on this project"
              />
            </div>
            <div className="project-details-tickets">
              <h3 className="personnel-header-title details">
                project tickets
              </h3>
              <ListDisplay
                projectDetailsTickets={currentProject}
                editProjectDetails={editProjectDetails}
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
                heading="project tickets"
                subHeading="all the tickets on this project"
              />
            </div>
          </div>
        </div>
      );
    let projectsList =
      createProject ||
      editProjectDetails ||
      editProject ||
      viewProject ? null : (
        <ListDisplay
          currentUser={this.props.myUser}
          createProject={createProject}
          editProjectDetails={editProjectDetails}
          viewProject={viewProject}
          editProject={editProject}
          openUserEdit={this.openUserEdit}
          openViewProject={this.openViewProject}
          fetchData={this.props.fetchData}
          category="projects"
          getRegex={this.getRegex}
          regexFilter={this.regexFilter}
          identifier="id"
          firstProperty="projectName"
          secondProperty="description"
          thirdProperty="nothing"
          firstColumn="project name"
          secondColumn="description"
          thirdColumn=""
          heading="your projects"
          subHeading="all the projects you have in your database"
        />
      );

    let createErrorMessage =
      !noError && (createProject || editProjectDetails) ? (
        <p className="create-error">project with name already exists</p>
      ) : null;

    return (
      <div className="ManageProjects">
        {createProject || editProjectDetails ? (
          <div className="projects-button">
            <Button
              btnType="Danger"
              disabled={false}
              clicked={
                createProject
                  ? this.toggleCreate
                  : editProjectDetails
                  ? this.toggleEdit
                  : null
              }
            >
              cancel
            </Button>
          </div>
        ) : null}
        {editProjectDetails ? (
          <div className="projects-button">
            <Button
              btnType="Danger"
              disabled={false}
              clicked={this.deleteProjectHandler}
            >
              delete
            </Button>
          </div>
        ) : null}

        {editProject ||
        !this.props.myUser ||
        (this.props.myUser.role !== "admin" &&
          this.props.myUser.role !== "project manager") ? null : (
          <div className="create-projects-button">
            <Button
              btnType="Success"
              disabled={
                createProject || editProjectDetails ? !formIsValid : false
              }
              clicked={
                createProject
                  ? this.createProjectHandler
                  : editProjectDetails
                  ? this.editProjectHandler
                  : this.toggleCreate
              }
            >
              {createProject || editProjectDetails
                ? "save"
                : "create new project"}
            </Button>
          </div>
        )}

        {projectCreate}
        {projectUserEdit}
        {createErrorMessage}
        {projectsList}
        {projectDetails}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    projects: state.fetchedData.projects,
    users: state.fetchedData.users,
    tickets: state.fetchedData.tickets,
    userId: state.auth.userId
  };
};

export default withRouter(
  connect(mapStateToProps, { fetchData, updateData })(ManageProjects)
);
