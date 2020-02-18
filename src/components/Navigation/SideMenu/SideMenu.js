import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./SideMenu.css";

const SideMenu = props => {
  // const [currentUser, setcurrentUser] = React.useState(props.currentUser);
  // const [Reloaded, setReloaded] = React.useState("reloaded");
  // React.useEffect(() => {
  //   setcurrentUser(props.currentUser);
  // }, [props.currentUser]);

  const sidemenuActions = [
    { icon: "grid", label: "dashboard", link: "dashboard" },
    { icon: "people", label: "manage roles", link: "manage-roles" },
    { icon: "person-add", label: "manage users", link: "manage-users" },
    { icon: "list", label: "my projects", link: "my-projects" },
    { icon: "bug", label: "my tickets", link: "my-tickets" },
    { icon: "person", label: "my profile", link: "my-profile" }
  ];
  const optionClicked = link => {
    props.history.push(`/home/${link}`);

    props.closeSide();
  };
  let role,
    unreadNotCount = 0;
  const { currentUser } = props;
  if (currentUser) {
    role = currentUser.role;
    if (currentUser.notifications) {
      unreadNotCount = currentUser.notifications.filter(
        item => item.read === false
      ).length;
    }
  }
  let urls = props.location.pathname.split("/");
  let selectedLink = !urls ? "" : urls[2];
  const actions = (
    <div className="side-actions-div">
      {sidemenuActions.map(action => {
        let selected = selectedLink === action.link ? "selected" : "";
        if (action.label === "manage roles" && role !== "admin") return null;
        if (action.label === "manage users" && role !== "admin") return null;
        return (
          <div
            key={action.label}
            className={`side-action ${selected}`}
            onClick={() => optionClicked(action.link)}
          >
            <ion-icon name={action.icon}></ion-icon>
            <p>{action.label}</p>
          </div>
        );
      })}
    </div>
  );
  return (
    <div
      className={props.showSide ? "SideMenu show" : "SideMenu close"}
      // style={{
      //   transform: props.showSide ? "translateX(0)" : "translateX(-100vw)"
      // }}
    >
      <div className="toggle-div" onClick={props.closeSide}>
        <ion-icon name="close"></ion-icon>
      </div>
      <div className="user-profile-div">
        {!currentUser || !currentUser.profileUrl ? (
          <ion-icon name="person"></ion-icon>
        ) : (
          <div
            className="pic-wrapper"
            style={{
              backgroundImage: `url(${currentUser.profileUrl})`
            }}
          ></div>
        )}
        <h1>
          welcome, <span>{props.firstname}</span>
        </h1>
      </div>
      <p className="role-label">logged in as: {role}</p>
      <div
        className="notifications-div side"
        onClick={() => props.history.push("/home/my-profile")}
      >
        <p className="side-label">notifications</p>
        <div className="not-icon-div side">
          <ion-icon name="notifications"></ion-icon>
          <p
            className="notifications-count"
            style={{ opacity: `${unreadNotCount ? "1" : "0"}` }}
          >
            {unreadNotCount}
          </p>
        </div>
        {/* <div className="notifications dropdown side"></div> */}
      </div>
      <div className="user-actions-div side">
        <p className="side-label">user actions</p>
        <ion-icon name="person"></ion-icon>
        <div className="user-actions dropdown side" onClick={props.closeSide}>
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
      {actions}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    firstname: state.auth.firstname
  };
};

export default withRouter(connect(mapStateToProps)(SideMenu));
