import React from "react";
import { Link } from "react-router-dom";

import "./Logo.css";

import buglogLogo from "../../assets/images/buglog-logo.png";

const Logo = props => (
  <Link to="/home" className={props.className} >
    <div className="Logo" style={{ height: props.height }}>
      <img src={buglogLogo} alt="buglog"></img>
    </div>
  </Link>
);

export default Logo;
