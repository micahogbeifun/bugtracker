import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import "./Dashboard.css";
import { fetchData, updateData } from "../../store/actions/actions";

class Dashboard extends Component {
  componentDidMount() {
    this.props.fetchData("tickets");
  }
  state = {
    user: null,
    ticketsArray: null
  };
  countOccurrences = (array, number) => {
    const counts = {};

    for (let i = 0; i < array.length; i++) {
      let num = array[i];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    return counts[number];
  };

  getRandomColor = () => {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  getChartData = (array, field, params) => {
    let dataArray = [];
    params.forEach((param, i) => {
      let prirityCount = array.filter(item => item[field] === params[i].label)
        .length;
      dataArray.push(prirityCount);
    });
    let mostPriority = Math.max(...dataArray);
    let sum = dataArray.reduce((a, b) => a + b, 0);
    return [dataArray, mostPriority, sum];
  };

  chartElement = (xFieldsPriority, ticketsArray, field, chartLabel, yLabel) => {
    let [priorityCounts, mostPriority] = this.getChartData(
      ticketsArray,
      field,
      xFieldsPriority
    );
    let percentageArray = Array.apply(
      null,
      Array(priorityCounts.length)
    ).map((x, i) => Math.floor((i / priorityCounts.length) * 100));
    percentageArray.push(100);
    return (
      <Fragment>
        <div className="chart priority">
          <div className="y-axis label">
            <p className="percentage">{yLabel}</p>
          </div>
          <div className="y-axis">
            {percentageArray.map((item, i) => {
              return (
                <p className="p-figures" key={i}>
                  {item}
                </p>
              );
            })}
          </div>
          {xFieldsPriority.map((item, i) => {
            let height = (priorityCounts[i] / mostPriority) * 100;
            let label = item.label;
            label =
              label.length < 15
                ? label
                : label
                    .split(" ")
                    .map(word => word.substr(0, 1))
                    .join(". ");
            return (
              <div
                key={i}
                className="chart-box"
                style={{
                  backgroundColor: `${height === 0 ? "#ccc" : item.color}`,
                  height: `${height === 0 ? 100 : height}%`
                }}
              >
                <div className="chart-info">
                  total count: {priorityCounts[i]}
                </div>
                <p className="x-axis">
                  <span>{label}</span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="chart-label">
          <p>{chartLabel}</p>
        </div>
      </Fragment>
    );
  };
  piechartElement = (xFieldsPriority, ticketsArray, field) => {
    let [priorityCounts, mostPriority, prioritySum] = this.getChartData(
      ticketsArray,
      field,
      xFieldsPriority
    );
    const cumulativeSum = (sum => value => (sum += value))(0);
    let totalSum = priorityCounts.map(cumulativeSum);
    const mostIndex = priorityCounts.findIndex(item => item === mostPriority);
    const most = xFieldsPriority[mostIndex].label;

    priorityCounts = priorityCounts.filter(item => item !== 0);
    let percentageArray = totalSum.map((item, i) =>
      i === 0
        ? `${xFieldsPriority[i].color} ${(item / prioritySum) * 100}%`
        : `${xFieldsPriority[i].color} 0 ${(item / prioritySum) * 100}%`
    );
    const cubicString = percentageArray.join(", ");
    return (
      <div className="piechart-wrapper">
        <div
          className="piechart type"
          style={{ background: `conic-gradient(${cubicString})` }}
        ></div>
        <div className="piechart-info" style={{ background: `#ccc` }}>
          <p className="type-info">
            {most}
            <br /> count: {mostPriority}
          </p>
        </div>
      </div>
    );
  };

  piechartElementProject = ticketsArray => {
    let projectNames = ticketsArray.map(item => item.developer);
    let uniqueNames = [];
    projectNames.forEach((item, i) => {
      let count = projectNames.filter(proj => proj === item).length;
      uniqueNames.push({ name: item, count });
      if (uniqueNames.filter(name => name.name === item).length > 1) {
        uniqueNames.pop();
      }
    });
    let projectCount = uniqueNames.map(item => item.count);
    let projectData = uniqueNames.map(item => {
      return { label: item.name, color: this.getRandomColor() };
    });
    // console.log(uniqueNames, projectCount, priorityData);
    let mostPriority = Math.max(...projectCount);
    let prioritySum = projectCount.reduce((a, b) => a + b, 0);
    const cumulativeSum = (sum => value => (sum += value))(0);
    let totalSum = projectCount.map(cumulativeSum);
    const mostIndex = projectCount.findIndex(item => item === mostPriority);
    if (projectData.length === 0 || mostIndex < 0) return null;
    const most = projectData[mostIndex].label;

    projectCount = projectCount.filter(item => item !== 0);
    let percentageArray = totalSum.map((item, i) =>
      i === 0
        ? `${projectData[i].color} ${(item / prioritySum) * 100}%`
        : `${projectData[i].color} 0 ${(item / prioritySum) * 100}%`
    );
    if (percentageArray.length === 1) percentageArray.push(percentageArray[0]);
    const cubicString = percentageArray.join(", ");

    return (
      <Fragment>
        <div className="piechart-wrapper">
          <div
            className="piechart type"
            style={{ background: `conic-gradient(${cubicString})` }}
          ></div>
          <div className="piechart-info" style={{ background: `#ccc` }}>
            <p className="type-info">
              {most}
              <br /> count: {mostPriority}
            </p>
          </div>
        </div>
        <div className="chart-legends">
          {projectData.map((item, i) => {
            let label = item.label
              .split(" ")
              .map(word => word.substr(0, 1))
              .join(". ");
            return (
              <div key={i} className="chart-legend">
                <div
                  className="legend-color"
                  style={{ background: item.color }}
                ></div>
                <p className="legend-text">
                  {label} count: {projectCount[i]}
                </p>
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  };

  static getDerivedStateFromProps(props, state) {
    const { myUser, tickets } = props;
    let ticketsArray = [];
    const controlArray = [
      "type",
      "typeType",
      "priorityTypes",
      "statusTypes",
      "ticketTypes"
    ];

    if (tickets && myUser) {
      const { role, firstname, lastname } = myUser;
      const fullName = `${firstname} ${lastname}`;
      //console.log(fullName, role);
      for (let key in tickets) {
        if (!controlArray.includes(key)) {
          if (role === "submitter" && tickets[key].submitter === fullName) {
            ticketsArray.push(tickets[key]);
          }
          if (role === "developer" && tickets[key].developer === fullName) {
            ticketsArray.push(tickets[key]);
          }
          if (role === "admin" || role === "project manager") {
            ticketsArray.push(tickets[key]);
          }
        }
      }
      if (myUser !== state.user || ticketsArray !== state.ticketsArray) {
        return {
          ...state,
          user: myUser,
          ticketsArray
        };
      }
    }

    return null;
  }
  render() {
    let { user, ticketsArray } = this.state;
    let priorityData = [
        { label: "None", color: "#850000" },
        { label: "Low", color: "#D10D03" },
        { label: "Medium", color: "#FF1800" },
        { label: "High", color: "#390500" }
      ],
      statusData = [
        { label: "None", color: "#0F39A3" },
        { label: "Open", color: "#325DC9" },
        { label: "In Progress", color: "#2E4172" },
        { label: "Resolved", color: "#0A215C" },
        { label: "Additional Info Required", color: "#050C1E" }
      ],
      typeData = [
        { label: "Bugs/Errors", color: "green" },
        { label: "Feature Requests", color: "blue" },
        { label: "Other Comments", color: "red" },
        { label: "Training/Documentation Requests", color: "purple" }
      ];

    let priorityChart =
      !ticketsArray || ticketsArray.length === 0
        ? null
        : this.chartElement(
            priorityData,
            ticketsArray,
            "priority",
            "tickets by priority",
            "% highest"
          );

    let statusChart =
      !ticketsArray || ticketsArray.length === 0
        ? null
        : this.chartElement(
            statusData,
            ticketsArray,
            "status",
            "tickets by status",
            "% highest"
          );

    let typeChart =
      !ticketsArray || ticketsArray.length === 0
        ? null
        : this.piechartElement(typeData, ticketsArray, "type");

    let projectChart =
      !ticketsArray || ticketsArray.length === 0
        ? null
        : this.piechartElementProject(ticketsArray);

    const fullName = !user ? null : `${user.firstname} ${user.lastname}`;

    return (
      <div className="Dashboard">
        <div className="personnel-div dashboard">
          <div className="personnel-header">
            <h3 className="personnel-header-title">{`tickets' charts for ${fullName}`}</h3>
          </div>
          <h3>hover graphs for counts</h3>
          <div className="pie-grid">
            <div className="pie-chart">
              {priorityChart}
              {priorityChart ? null : (
                <div className="chart-label">
                  <p>tickets by priority</p>
                </div>
              )}
            </div>
            <div className="pie-chart">
              {typeChart}
              <div className="chart-label">
                <p>tickets by type</p>
              </div>
            </div>
            <div className="pie-chart">
              {statusChart}
              {statusChart ? null : (
                <div className="chart-label">
                  <p>tickets by priority</p>
                </div>
              )}
            </div>
            <div className="pie-chart">
              {projectChart}
              <div className="chart-label">
                <p>tickets by developers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    tickets: state.fetchedData.tickets
  };
};

export default withRouter(
  connect(mapStateToProps, { fetchData, updateData })(Dashboard)
);
