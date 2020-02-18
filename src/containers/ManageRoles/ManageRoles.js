import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import uniqid from "uniqid";

import "./ManageRoles.css";
import { fetchData, updateData } from "../../store/actions/actions";
import Button from "../../components/UI/Button/Button";
import ListDisplay from "../ListDisplay/ListDisplay";

class ManageRoles extends Component {
  componentDidMount() {
    this.props.fetchData("users");
    this.props.fetchData("roles");
  }
  state = {
    userValues: null,
    rolesValue: { value: null },
    namesArray: null,
    rolesArray: null,
    formIsValid: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.namesArray && this.props.users) {
      const namesArray = [];
      for (let key in this.props.users) {
        if (key !== "type") {
          namesArray.push(this.props.users[key]);
        }
      }

      this.setState({ namesArray, originalArray: namesArray });
    }
    if (!prevState.rolesArray && this.props.roles) {
      this.setState({
        rolesArray: ["N/A", ...this.props.roles.roles]
      });
    }
  }

  userValueHandler = userValues => {
    this.setState({
      userValues,
      formIsValid: this.validate("users", userValues)
    });
  };

  roleValueHandler = rolesValue => {
    this.setState({
      rolesValue,
      formIsValid: this.validate("roles", rolesValue)
    });
  };

  validate = (category, value) => {
    let valid;
    if (category === "users") {
      valid = value && value.length > 0;
    }
    if (category === "roles") {
      valid = value.value !== null;
    }
    return valid;
  };

  saveHandler = () => {
    const namesArray = [...this.state.namesArray];
    const userArray = [];
    for (let key in this.state.userValues) {
      userArray.push(this.state.userValues[key]);
    }
    const { value } = this.state.rolesValue;
    const currentUser = namesArray.find(user => user.id === this.props.userId);
    const fullName = currentUser.firstname + " " + currentUser.lastname;
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    //console.log(this.state.userValues, namesArray, userArray);
    namesArray.forEach(user => {
      const message = `your role was changed${
        user["role"] ? " from " + user["role"] : ""
      } to ${value} by ${fullName}`;
      const changed =
        this.state.userValues.find(
          addedUser =>
            addedUser.value.split(" ")[2].substr(1) === user.accountId
        ) && user["role"] !== value;
      user["role"] = changed ? value : user["role"] ? user["role"] : null;

      const notification = {
        date,
        message,
        type: "role change",
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

    this.props.updateData("users", namesArray);
    this.props.fetchData("users");
  };

  getRegex = query => new RegExp(`${query}+[\\w,\\d,@,\\.,-]*`, "gi");
  regexFilter = (array, regex) => {
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

  render() {
    let { namesArray, rolesArray } = this.state;

    let namesSelect, nameOptions, rolesSelect, rolesOptions;

    if (namesArray && rolesArray) {
      nameOptions = namesArray.map(name => {
        const fullName = `${name.firstname} ${name.lastname} #${name.accountId}`;
        return { value: fullName, label: fullName };
      });

      rolesOptions = rolesArray.map(role => {
        return { value: role, label: role };
      });
      namesSelect = (
        <Select
          value={this.state.userValues}
          onChange={this.userValueHandler}
          options={nameOptions}
          isMulti={true}
        />
      );
      rolesSelect = (
        <Select
          value={this.state.rolesValue}
          onChange={this.roleValueHandler}
          options={rolesOptions}
        />
      );
      // const propusers = [];
      // for (let i = 0; i < 3; i++) {
      //   propusers.push({
      //     id: i,
      //     firstname: "user" + i,
      //     lastname: "userLastName" + i,
      //     email: "userEmail" + i,
      //     role: "userRole" + i
      //   });
      // }
    }

    return (
      <div className="ManageRoles">
        <h1>Manage User Roles</h1>
        <div className="selection-div">
          <h3>Select 1 or more users</h3>
          {namesSelect}
          <h3>Select roles</h3>
          {rolesSelect}
          <h3>save changes</h3>
          <Button
            btnType="Success"
            disabled={!this.state.formIsValid}
            clicked={this.saveHandler}
          >
            save
          </Button>
        </div>
        <ListDisplay
          fetchData={this.props.fetchData}
          category="users"
          getRegex={this.getRegex}
          regexFilter={this.regexFilter}
          identifier="id"
          firstProperty="fullName"
          secondProperty="email"
          thirdProperty="role"
          firstColumn="name"
          secondColumn="email"
          thirdColumn="role"
          heading="your personnel"
          subHeading="all users in your database"
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.fetchedData.users,
    roles: state.fetchedData.roles,
    userId: state.auth.userId
  };
};

export default withRouter(
  connect(mapStateToProps, { fetchData, updateData })(ManageRoles)
);
