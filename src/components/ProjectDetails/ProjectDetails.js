import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./ProjectDetails.css";
import { updateObject } from "../../shared/utility";
import SearchBar from "../../components/UI/SearchBar/SearchBar";

class ProjectDetails extends Component {
  componentDidMount() {
    const { fetchData, category } = this.props;
    fetchData(category);
  }
  state = {
    itemsArray: null,
    search: { value: "", placeholder: `search ${this.props.category}` },
    page: 1,
    pageMax: 10,
    nextButton: "pointer",
    prevButton: "not-allowed",
    sort: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.createProject !== this.props.createProject) {
      const { fetchData, category } = this.props;
      fetchData(category);
    }

    if (
      (!prevState.itemsArray && this.props[this.props.category]) ||
      prevProps[this.props.category] !== this.props[this.props.category]
    ) {
      const itemsArray = [];
      for (let key in this.props[this.props.category]) {
        if (key !== "type") {
          itemsArray.push(this.props[this.props.category][key]);
        }
      }

      this.setState({ itemsArray, originalArray: itemsArray });
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

  render() {
    let { itemsArray, page, pageMax, sort } = this.state;
    const {
      category,
      identifier,
      firstProperty,
      secondProperty,
      thirdProperty,
      firstColumn,
      secondColumn,
      thirdColumn,
      heading,
      subHeading,
      openUserEdit
    } = this.props;
    let itemList, pageNav;

    if (itemsArray) {
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

      itemList = itemsArray.slice(start, end).map(item => {
        let firstPropertyItem;
        let secondItem = item[secondProperty];
        if (secondItem.length > 30) {
          secondItem = secondItem.substring(0, 30) + "...";
        }
        let thirdElement;
        switch (firstProperty) {
          case "fullName":
            firstPropertyItem = item.firstname + " " + item.lastname;
            thirdElement = (
              <p className="user-list-item">{item[thirdProperty]}</p>
            );
            break;
          case "projectName":
            firstPropertyItem = item.projectName;
            thirdElement = (
              <ul className="user-list-item">
                <li
                  className="project-options"
                  onClick={() => openUserEdit(item.id)}
                >
                  Manage users
                </li>
                <li className="project-options">Details</li>
              </ul>
            );
            break;
          default:
            firstPropertyItem = null;
        }

        return (
          <div key={item[identifier]} className="users-grid-list">
            <p className="user-list-item">{firstPropertyItem}</p>
            <p className="user-list-item two">{secondItem}</p>
            {thirdElement}
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
          } of ${arrayLength} users`}</p>
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

    return (
      <div className="personnel-div">
        <div className="personnel-header">
          <h3 className="personnel-header-title">{heading}</h3>
          <p>{subHeading}</p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.fetchedData.users,
    roles: state.fetchedData.roles,
    projects: state.fetchedData.projects,
    userId: state.auth.userId
  };
};

export default withRouter(connect(mapStateToProps, {})(ProjectDetails));
