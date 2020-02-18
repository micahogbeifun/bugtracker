import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import uniqid from "uniqid";

import "./ManageProfile.css";
import { fetchData, updateData } from "../../store/actions/actions";
import ListDisplay from "../ListDisplay/ListDisplay";
import { storageRef } from "../../store/actions/actions";

class ManageProfile extends Component {
  componentDidMount() {
    this.props.fetchData("users");
  }
  state = {
    user: null,
    usersArray: null
  };
  fileChangeHandler = async event => {
    const file = event.target.files[0];
    const usersArray = [...this.state.usersArray];
    const { userId } = this.props;
    const date =
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();

    const currentUser = usersArray.find(user => user.id === userId);

    const fileRef = storageRef.child(
      `buglog/${currentUser.accountId}/${file.name}`
    );
    await fileRef.put(file);
    let profileUrl = await fileRef.getDownloadURL();
    //console.log(profileUrl);

    usersArray.forEach(user => {
      if (user.id === userId) {
        const message = `you updated your profile picture`;
        const notification = {
          date,
          message,
          type: "update profile picture",
          id: uniqid(),
          read: false
        };
        const notifications = user["notifications"]
          ? [...user["notifications"], notification]
          : [notification];
        user["notifications"] = notifications;
        user.profileUrl = profileUrl;
      }
    });

    this.props.updateData("users", usersArray);
    this.props.fetchData("users");
  };

  readNotificationHandler = notId => {
    let { usersArray, user } = this.state;
    const userIndex = usersArray.findIndex(item => item.id === user.id);
    user.notifications.forEach(not => {
      if (not.id === notId) {
        not.read = true;
      }
    });

    usersArray[userIndex] = user;
    this.props.updateData("users", usersArray);
    this.props.fetchData("users");
  };

  getRegex = query => new RegExp(`${query}+.*`, "gi");
  regexFilter = (array, regex) => {
    const newArray = [];
    array.forEach(item => {
      if (
        (item && item.message && item.message.match(regex)) ||
        (item && item.date && item.date.match(regex)) ||
        (item && item.type && item.type.match(regex))
      ) {
        newArray.push(item);
      }
    });
    return newArray;
  };

  deleteNotificationHandler = notId => {
    console.log(notId);
    let { usersArray, user } = this.state;
    const userIndex = usersArray.findIndex(item => item.id === user.id);
    user.notifications.forEach(not => {
      if (not.id === notId) {
        user.notifications = user.notifications.filter(
          item => item.id !== notId
        );
      }
    });
    usersArray[userIndex] = user;
    this.props.updateData("users", usersArray, "delete");
    this.props.fetchData("users");
  };

  static getDerivedStateFromProps(props, state) {
    const { users, userId } = props;
    let user,
      usersArray = [];
    const controlArray = [
      "type",
      "typeType",
      "priorityTypes",
      "statusTypes",
      "ticketTypes"
    ];
    if (users) {
      for (let key in users) {
        if (!controlArray.includes(key)) {
          usersArray.push(users[key]);
          if (users[key].id === userId) {
            user = users[key];
          }
        }
      }
      if (user !== state.user || usersArray !== state.usersArray) {
        return { ...state, user, usersArray };
      }
    }

    return null;
  }
  render() {
    let { user } = this.state;

    const fullName = !user ? null : `${user.firstname} ${user.lastname}`;
    const email = !user ? null : `${user.email}`;

    return (
      <div className="ManageProfile">
        <div className="personnel-div">
          <div className="personnel-header">
            <h3 className="personnel-header-title">{`details for ${fullName}`}</h3>
            <p>
              <input
                type="file"
                className="custom-file-input-profile"
                onChange={this.fileChangeHandler}
              />
            </p>
          </div>
          <div className="unique-ticket-details user">
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">name</p>
              <p className="unique-ticket property">{fullName}</p>
            </div>
            <div className="unique-ticket-inner-detail">
              <p className="unique-ticket label">email</p>
              <p className="unique-ticket property">{email}</p>
            </div>
          </div>
          <ListDisplay
            deleteNotificationHandler={this.deleteNotificationHandler}
            readNotificationHandler={this.readNotificationHandler}
            userProfile
            category="user"
            user={user}
            fetchData={this.props.fetchData}
            getRegex={this.getRegex}
            regexFilter={this.regexFilter}
            identifier="id"
            firstProperty="type"
            secondProperty="message"
            thirdProperty="date"
            firstColumn="type"
            secondColumn="message"
            thirdColumn="date"
            heading="notifications"
            subHeading="all your notifications"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.fetchedData.users,
    userId: state.auth.userId
  };
};

export default withRouter(
  connect(mapStateToProps, { fetchData, updateData })(ManageProfile)
);
