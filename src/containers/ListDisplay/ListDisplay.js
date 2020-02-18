import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./ListDisplay.css";
import { updateObject } from "../../shared/utility";
import SearchBar from "../../components/UI/SearchBar/SearchBar";

class ListDisplay extends Component {
  componentDidMount() {
    const { fetchData, category } = this.props;
    if (
      category !== "history" &&
      category !== "comments" &&
      category !== "files" &&
      category !== "user"
    ) {
      fetchData(category);
    }
  }
  state = {
    editTicket: true,
    ticket: null,
    itemsArray: null,
    search: { value: "", placeholder: `search ${this.props.category}` },
    page: 1,
    pageMax: 10,
    nextButton: "pointer",
    prevButton: "not-allowed",
    sort: false,
    viewProject: null
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.createProject !== this.props.createProject ||
      prevProps.editProjectDetails !== this.props.editProjectDetails ||
      prevProps.editTicket !== this.props.editTicket ||
      prevProps.createProject !== this.props.createProject ||
      prevProps.createTicket !== this.props.createTicket
    ) {
      const { fetchData, category } = this.props;
      if (
        category !== "history" &&
        category !== "comments" &&
        category !== "files" &&
        category !== "user"
      ) {
        fetchData(category);
      }
    }

    if (
      (!prevState.itemsArray && this.props[this.props.category]) ||
      prevProps[this.props.category] !== this.props[this.props.category] ||
      prevProps.appReload !== this.state.appReload ||
      prevProps.viewProject !== this.props.viewProject ||
      prevProps.createProject !== this.props.createProject ||
      prevProps.editTicket !== this.props.editTicket
    ) {
      const itemsArray = [];
      const controlArray = [
        "type",
        "typeType",
        "priorityTypes",
        "statusTypes",
        "ticketTypes"
      ];
      for (let key in this.props[this.props.category]) {
        if (!controlArray.includes(key)) {
          itemsArray.push(this.props[this.props.category][key]);
        }
      }

      this.setState({
        itemsArray,
        originalArray: itemsArray,
        appReload: this.props.appReload
      });
    }

    if (
      this.props.ticket &&
      (prevState.ticket !== this.props.ticket ||
        prevProps.appReload !== this.state.appReload ||
        prevProps.editTicket !== this.props.editTicket) &&
      this.props.category
    ) {
      const { category, ticket } = this.props;
      const itemsArray =
        category === "history"
          ? ticket.history
          : category === "comments"
          ? ticket.comments
          : category === "files"
          ? ticket.files
          : [];

      this.setState({
        ticket: this.props.ticket,
        itemsArray,
        originalArray: itemsArray,
        appReload: this.props.appReload
      });
    }

    if (
      prevState.search.value !== this.state.search.value &&
      this.state.originalArray
    ) {
      this.searchItems();
    }
  }

  searchChangedhanler = event => {
    const search = updateObject(this.state.search, {
      value: event.target.value
    });
    this.setState({ search });
  };

  navigate = direction => {
    const { page, pageMax, itemsArray } = this.state;

    if (direction === "next" && page <= itemsArray.length / pageMax) {
      this.setState(prevState => {
        return { page: prevState.page + 1 };
      });
    }
    if (direction === "prev" && page > 1) {
      this.setState(prevState => {
        return { page: prevState.page - 1 };
      });
    }
  };

  searchItems = event => {
    if (event) {
      event.preventDefault();
    }
    const query = this.state.search.value;
    if (query !== "") {
      const regex = this.props.getRegex(query);
      const newArray = this.props.regexFilter(this.state.originalArray, regex);
      this.setState({ itemsArray: newArray });
    } else {
      this.setState({ itemsArray: [...this.state.originalArray] });
    }
  };

  toggleSort = () => {
    this.setState(prevState => {
      return { sort: !prevState.sort };
    });
  };

  static getDerivedStateFromProps(props, state) {
    const { fetchData, category, ticket, user, currentUser } = props;

    if (fetchData && category && ticket) {
      const itemsArray =
        category === "history"
          ? ticket.history
          : category === "comments"
          ? ticket.comments
          : category === "files"
          ? ticket.files
          : [];
      return { ...state, itemsArray, originalArray: itemsArray };
    }
    if (currentUser) return { ...state, currentUser };

    if (fetchData && category && user && state.search.value === "") {
      const itemsArray = category === "user" && user ? user.notifications : [];
      return { ...state, itemsArray, originalArray: itemsArray };
    }

    // Return null to indicate no change to state.
    return null;
  }

  render() {
    let { itemsArray, page, pageMax, sort } = this.state;
    const {
      ticketHistory,
      ticketComments,
      ticketFiles,
      category,
      identifier,
      firstProperty,
      secondProperty,
      thirdProperty,
      fourthProperty,
      fifthProperty,
      firstColumn,
      secondColumn,
      thirdColumn,
      fourthColumn,
      fifthColumn,
      sixthColumn,
      heading,
      subHeading,
      openUserEdit,
      openViewProject,
      projectDetailsUsers,
      projectDetailsTickets,
      ManageUsers,
      userProfile,
      user
    } = this.props;
    let itemList, pageNav;
    if (
      itemsArray &&
      (ticketComments || ticketFiles || ticketHistory || userProfile)
    ) {
      if (userProfile) {
        itemsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        itemsArray.sort(
          (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
        );
      }
    }
    if (itemsArray) {
      if (projectDetailsUsers) {
        itemsArray = itemsArray.filter(
          item =>
            item.projects &&
            item.projects.find(project => project === projectDetailsUsers)
        );
      }
      if (projectDetailsTickets) {
        itemsArray = itemsArray.filter(
          item => item.projectId && item.projectId === projectDetailsTickets
        );
      }

      if (
        category === "projects" &&
        this.props.currentUser &&
        this.props.currentUser.role !== "admin" &&
        this.props.currentUser.role !== "project manager"
      ) {
        itemsArray = itemsArray.filter(
          item =>
            item.users && item.users.includes(this.props.currentUser.accountId)
        );
      }

      if (
        this.props.ticketListHome &&
        this.props.currentUser &&
        this.props.currentUser.role !== "admin" &&
        this.props.currentUser.role !== "project manager"
      ) {
        const fullName = `${this.props.currentUser.firstname} ${this.props.currentUser.lastname}`;

        itemsArray = itemsArray.filter(
          item => item.developer === fullName || item.submitter === fullName
        );
      }

      const arrayLength = itemsArray.length;
      let sortedArray = [];
      const nextButton =
          page < arrayLength / pageMax ? "pointer" : "not-allowed",
        prevButton = page <= 1 ? "not-allowed" : "pointer";
      const start = (page - 1) * pageMax;
      const end = start + pageMax;
      const overflow = end > arrayLength ? end - arrayLength : null;
      const underFlow = arrayLength <= end ? arrayLength : null;

      if (sort) {
        sortedArray = itemsArray.map(item => {
          let sortItem;
          switch (category) {
            case "users":
              sortItem = item.firstname + " " + item.lastname;
              break;
            case "projects":
              sortItem = item.projectName;
              break;
            case "tickets":
              sortItem = item.ticketName;
              break;
            case "history":
              sortItem = item.message;
              break;
            case "comments":
              sortItem = item.commenter;
              break;
            case "files":
              sortItem = item.fileName;
              break;
            case "user":
              sortItem = item.type;
              break;
            default:
              sortItem = null;
          }
          return { ...item, sortItem };
        });
        itemsArray = [...sortedArray];
        itemsArray.sort((a, b) => {
          const nameA = a.sortItem.toUpperCase();
          const nameB = b.sortItem.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
      }

      itemList = itemsArray.slice(start, end).map((item, i) => {
        let firstPropertyItem;
        let secondItem;
        let secondElement,
          thirdElement,
          fourthElement,
          fifthElement,
          sixthElement;
        switch (firstProperty) {
          case "fullName":
            firstPropertyItem = item.firstname + " " + item.lastname;
            secondItem = item[secondProperty];
            // if (secondItem.length > 30) {
            //   secondItem = secondItem.substring(0, 30) + "...";
            // }
            secondElement = (
              <p className="user-list-item email">{secondItem}</p>
            );
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );

            break;
          case "projectName":
            firstPropertyItem = item.projectName;
            secondItem = item[secondProperty];
            secondElement = <p className="user-list-item two">{secondItem}</p>;
            const { currentUser } = this.state;
            const validUser =
              currentUser &&
              (currentUser.role === "admin" ||
                currentUser.role === "project manager");
            thirdElement = (
              <ul className="user-list-item">
                <li
                  className="project-options"
                  onClick={() => openUserEdit(item.id)}
                  style={validUser ? null : { visibility: "hidden" }}
                >
                  Manage users
                </li>
                <li
                  className="project-options"
                  onClick={() => openViewProject(item.id)}
                  // style={validUser ? null : { visibility: "hidden" }}
                >
                  Details
                </li>
              </ul>
            );
            break;
          case "ticketName":
            firstPropertyItem = item.ticketName;
            secondItem = item[secondProperty];
            secondElement = (
              <p className="user-list-item tickets">{secondItem}</p>
            );
            thirdElement = (
              <p className="user-list-item tickets">{item[thirdProperty]}</p>
            );
            fourthElement = (
              <p className="user-list-item tickets">{item[fourthProperty]}</p>
            );
            fifthElement = (
              <p className="user-list-item tickets">{item[fifthProperty]}</p>
            );
            sixthElement = (
              <ul className="user-list-item details">
                <li
                  className="project-options"
                  onClick={() =>
                    this.props.history.push(`/home/my-tickets/${item.id}`)
                  }
                >
                  Details
                </li>
              </ul>
            );
            break;
          case "message":
            firstPropertyItem = item.message;
            secondItem = item[secondProperty];
            secondElement = <p className="user-list-item two">{secondItem}</p>;
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );

            fourthElement = (
              <p className="user-list-item history">{item[fourthProperty]}</p>
            );

            break;
          case "commenter":
            firstPropertyItem = item.commenter;
            secondItem = item[secondProperty];
            secondElement = <p className="user-list-item two">{secondItem}</p>;
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );

            break;
          case "fileName":
            firstPropertyItem = item.fileName;
            secondItem = item[secondProperty];
            secondElement = <p className="user-list-item two">{secondItem}</p>;
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );

            fourthElement = (
              <p className="user-list-item file">{item[fourthProperty]}</p>
            );
            fifthElement = (
              <ul className="user-list-item details">
                <li className="project-options">
                  <a
                    href={item.url}
                    className="link primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view / download
                  </a>
                </li>
              </ul>
            );
            break;
          case "type":
            firstPropertyItem = item.type;
            secondItem = item[secondProperty];
            secondElement = <p className="user-list-item two">{secondItem}</p>;
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );
            fourthElement = (
              <ul className="user-list-item details">
                <li
                  className="project-options"
                  onClick={() => {
                    const { search } = this.state;
                    search.value = "";
                    this.setState({ search });
                    this.props.deleteNotificationHandler(item.id);
                  }}
                >
                  delete
                </li>
              </ul>
            );
            if (!item.read) this.props.readNotificationHandler(item.id);
            break;
          default:
            firstPropertyItem = null;
        }

        if (this.props.ManageUsers) {
          fourthElement = (
            <ul className="user-list-item details">
              <li
                className="project-options"
                onClick={() => this.props.history.push(`/home/manage-roles`)}
              >
                Change Role
              </li>
            </ul>
          );
        }

        let gridItemClass = `users-grid-list${
          category === "tickets"
            ? " tickets"
            : ticketHistory
            ? " history"
            : ticketComments
            ? " comments"
            : ticketFiles
            ? " files"
            : userProfile
            ? " profile"
            : ""
        }`;

        if (ManageUsers) gridItemClass += " users";

        return (
          <div key={item[identifier]} className={gridItemClass}>
            <p className="user-list-item">{firstPropertyItem}</p>
            {secondElement}
            {thirdElement}
            {userProfile ? fourthElement : null}
            {ManageUsers ? fourthElement : null}
            {category !== "tickets" ? null : (
              <Fragment>
                {fourthElement}
                {fifthElement}
                {sixthElement}
              </Fragment>
            )}
            {ticketHistory ? fourthElement : null}
            {!ticketFiles ? null : (
              <Fragment>
                {fourthElement}
                {fifthElement}
              </Fragment>
            )}
          </div>
        );
      });
      const finalLength = itemsArray.slice(start, end).length;
      pageNav = (
        <div className="users-pagination">
          <p className="pagination-label">{`showing ${
            finalLength ? start + 1 : 0
          } to ${
            !finalLength
              ? 0
              : underFlow
              ? underFlow
              : overflow
              ? start + overflow
              : start + pageMax
          } of ${arrayLength} ${!user ? category : "notifications"}`}</p>
          <div className="pagination-controls">
            <p
              className="button"
              onClick={() => this.navigate("prev")}
              style={{ cursor: prevButton }}
            >
              previous
            </p>
            <p className="page current">{page}</p>
            <p
              className="page"
              style={{
                opacity: nextButton === "not-allowed" ? "0" : "1"
              }}
            >
              {page + 1}
            </p>
            <p
              className="button"
              onClick={() => this.navigate("next")}
              style={{ cursor: nextButton }}
            >
              next
            </p>
          </div>
        </div>
      );
    }
    let gridHeadClass = `users-grid-head${
      category === "tickets"
        ? " tickets"
        : ticketHistory
        ? " history"
        : ticketComments
        ? " comments"
        : ticketFiles
        ? " files"
        : userProfile
        ? " profile"
        : ""
    }`;

    if (ManageUsers) gridHeadClass += " users";

    const gridThirdColumClass = `users-grid-roles${
      category === "tickets"
        ? " tickets"
        : ticketHistory
        ? " history"
        : ticketComments
        ? " comments"
        : ticketFiles
        ? " files"
        : userProfile
        ? " profile"
        : ""
    }`;

    const gridSecondColumClass = `users-grid-emails${
      category === "tickets"
        ? " tickets"
        : ticketHistory
        ? " history"
        : ticketComments
        ? " comments"
        : ticketFiles
        ? " files"
        : userProfile
        ? " profile"
        : ""
    }`;
    return (
      <div className="personnel-div">
        <div className="personnel-header">
          <h3 className="personnel-header-title">{heading}</h3>
          <p>{subHeading}</p>
        </div>
        <SearchBar
          submit={this.searchitems}
          searchValue={this.state.search.value}
          changed={this.searchChangedhanler}
          placeholder={this.state.search.placeholder}
        />
        <div className={gridHeadClass}>
          <div className="users-grid-names">
            {firstColumn}
            <span onClick={this.toggleSort}>
              <ion-icon name="caret-up"></ion-icon>
            </span>
          </div>
          <div className={gridSecondColumClass}>{secondColumn}</div>
          <div className={gridThirdColumClass}>{thirdColumn}</div>
          {category !== "tickets" ? null : (
            <Fragment>
              <div className="users-grid-roles fold">{fourthColumn}</div>
              <div className="users-grid-roles fold">{fifthColumn}</div>
              <div className="users-grid-roles">{sixthColumn}</div>
            </Fragment>
          )}
          {!ticketHistory ? null : (
            <div className="users-grid-roles history">{fourthColumn}</div>
          )}
          {!ticketFiles ? null : (
            <Fragment>
              <div className="users-grid-roles files">{fourthColumn}</div>
              <div className="users-grid-roles files">{fifthColumn}</div>
            </Fragment>
          )}
          {!ManageUsers ? null : (
            <div className="users-grid-roles users">{fourthColumn}</div>
          )}

          {!userProfile ? null : (
            <div className="users-grid-roles profile">{fourthColumn}</div>
          )}
        </div>
        {itemList}

        {pageNav}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.fetchedData.users,
    roles: state.fetchedData.roles,
    projects: state.fetchedData.projects,
    tickets: state.fetchedData.tickets,
    userId: state.auth.userId
  };
};

export default withRouter(connect(mapStateToProps, {})(ListDisplay));
