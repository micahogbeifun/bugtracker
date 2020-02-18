import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./TopMenu.css";
import Logo from "../../Logo/Logo";
import Searchbar from "../../UI/SearchBar/SearchBar";

const TopMenu = props => {
  const { currentUser } = props;
  let unreadNotCount = 0;
  if (currentUser && currentUser.notifications) {
    unreadNotCount = currentUser.notifications.filter(
      item => item.read === false
    ).length;
  }
  return (
    <div className="TopMenu">
      <div className="toggle-div" onClick={props.openSide}>
        <ion-icon name="menu"></ion-icon>
      </div>
      <div className="top-logo-div">
        <Logo />
      </div>
      <div className="action-div">
        <Searchbar
          submit={props.submit}
          searchValue={props.searchValue}
          changed={props.changed}
          placeholder={props.placeholder}
        />
        <div
          className="notifications-div"
          onClick={() => props.history.push("/home/my-profile")}
        >
          <p>notifications</p>
          <div className="not-icon-div">
            <ion-icon name="notifications"></ion-icon>
            <p
              className="notifications-count"
              style={{ opacity: `${unreadNotCount ? "1" : "0"}` }}
            >
              {unreadNotCount}
            </p>
          </div>
          {/* <div className="notifications dropdown"></div> */}
        </div>

        <div className="user-actions-div">
          <p>user actions</p>
          <ion-icon name="person"></ion-icon>
          <div className="user-actions dropdown">
            <div onClick={() => props.history.push("/home/my-profile")}>
              <p>profile</p>
            </div>
            <div onClick={() => props.history.push("/home/my-profile")}>
              <p>settings</p>
            </div>
            <div onClick={props.logout}>
              <p>logout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    username: state.auth.username
  };
};

export default withRouter(connect(mapStateToProps)(TopMenu));
