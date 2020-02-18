import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import "./Home.css";
import SideMenu from "../../components/Navigation/SideMenu/SideMenu";
import TopMenu from "../../components/Navigation/TopMenu/TopMenu";
import { updateObject } from "../../shared/utility";
import { logout, fetchData, updateData } from "../../store/actions/actions";
import Backdrop from "../../components/UI/Backdrop/Backdrop";
import ManageRoles from "../ManageRoles/ManageRoles";
import ManageProjects from "../ManageProjects/ManageProjects";
import ManageTickets from "../ManageTickets/ManageTickets";
import Ticket from "../Ticket/Ticket";
import ManageUsers from "../ManageUsers/ManageUsers";
import ManageProfile from "../ManageProfile/ManageProfile";
import Dashboard from "../Dashboard/Dashboard";

class Home extends Component {
  componentDidMount() {
    this.props.fetchData("users");
  }

  state = {
    search: {
      value: "",
      placeholder: "search",
      showSide: false,
      usersArray: null
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.usersArray && this.props.users) {
      const usersArray = [];
      for (let key in this.props.users) {
        if (key !== "type") {
          usersArray.push(this.props.users[key]);
        }
      }

      this.setState({ usersArray, originalUsersArray: usersArray });
    }
  }

  inputChangedhanler = event => {
    const search = updateObject(this.state.search, {
      value: event.target.value
    });
    this.setState({ search });
  };
  openSide = () => this.setState({ showSide: true });
  closeSide = () => this.setState({ showSide: false });

  static getDerivedStateFromProps(props, state) {
    if (props.userId && props.users) {
      const usersArray = [];
      for (let key in props.users) {
        if (key !== "type") {
          usersArray.push(props.users[key]);
        }
      }

      return {
        ...state,
        userId: props.userId,
        urls: props.location.pathname.split("/"),
        currentUser: usersArray.find(item => item.id === props.userId),
        usersArray
      };
    }

    return null;
  }

  render() {
    const { urls, currentUser } = this.state;

    let authRedirect = null;
    if (!this.props.isAuthenticated) {
      authRedirect = <Redirect to={"/login"} />;
    }
    let component = null;

    switch (this.props.location.pathname) {
      case "/home":
        authRedirect = <Redirect to={"/home/dashboard"} />;
        break;
      case "/home/manage-roles":
        component = <ManageRoles myUser={currentUser} />;
        break;
      case "/home/my-projects":
        component = <ManageProjects myUser={currentUser} />;
        break;
      case "/home/my-tickets":
        component = <ManageTickets myUser={currentUser} />;
        break;
      case "/home/manage-users":
        component = <ManageUsers myUser={currentUser} />;
        break;
      case "/home/my-profile":
        component = <ManageProfile myUser={currentUser} />;
        break;
      case "/home/dashboard":
        component = <Dashboard myUser={currentUser} />;
        break;
      default:
        break;
    }

    const regex = /\/home\/my-tickets\/.+/;
    const isTicket = this.props.location.pathname.match(regex);
    if (isTicket) {
      component = <Ticket />;
    }

    const selected = urls ? urls[2] : null;
    return (
      <div className="Home">
        {authRedirect}

        <SideMenu
          selected={selected}
          currentUser={currentUser}
          showSide={this.state.showSide}
          closeSide={this.closeSide}
          logout={this.props.logout}
        />
        <Backdrop show={this.state.showSide} clicked={this.closeSide} />
        <div className="main">
          <TopMenu
            currentUser={currentUser}
            searchValue={this.state.search.value}
            changed={this.inputChangedhanler}
            placeholder={this.state.search.placeholder}
            logout={this.props.logout}
            showSide={this.state.showSide}
            openSide={this.openSide}
            closeSide={this.closeSide}
          />
          <div className="home-main">{component}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    firstname: state.auth.firstname,
    isAuthenticated: state.auth.token !== null,
    users: state.fetchedData.users,
    userId: state.auth.userId
  };
};

export default withRouter(
  connect(mapStateToProps, { logout, fetchData, updateData })(Home)
);
