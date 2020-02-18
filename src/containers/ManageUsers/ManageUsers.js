import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./ManageUsers.css";
import { fetchData } from "../../store/actions/actions";
import ListDisplay from "../ListDisplay/ListDisplay";

const ManageUsers = props => {
  const getRegexUsers = query =>
    new RegExp(`${query}+[\\w,\\d,@,\\.,-]*`, "gi");
  const regexFilterUsers = (array, regex) => {
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

  let UsersList = (
    <ListDisplay
      ManageUsers
      fetchData={props.fetchData}
      category="users"
      getRegex={getRegexUsers}
      regexFilter={regexFilterUsers}
      identifier="id"
      firstProperty="fullName"
      secondProperty="email"
      thirdProperty="role"
      firstColumn="name"
      secondColumn="email"
      thirdColumn="role"
      fourthColumn=""
      heading="your personnel"
      subHeading="all users in your database"
    />
  );

  return <div className="ManageUsers">{UsersList}</div>;
};

export default withRouter(connect(null, { fetchData })(ManageUsers));
