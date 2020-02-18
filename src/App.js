import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";

import Login from "./containers/Auth/Login";
import Home from "./containers/Home/Home";
import { authCheckState } from "./store/actions/actions";

class App extends Component {
  componentDidMount() {
    this.props.authCheckState();
  }
  render() {
    let routes = (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/home" component={Home} />
        <Redirect to="/login" />
      </Switch>
    );

    return <div>{routes}</div>;
  }
}

export default withRouter(connect(null, { authCheckState })(App));
