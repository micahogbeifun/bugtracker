import React from "react";

import Aux from "../../../hoc/Auxilary/Auxilary";

const PageButtons = ({ match, page, clicked, totalPages }) => {
  // Render pagination buttons
  let buttons = null,
    buttonsCount;
  if (page === 1 && totalPages > 1) {
    buttons = (
      <button
        onClick={() => clicked("next")}
        key={1}
        className="ui button purple"
        id="next"
        style={{ float: "right", fontFamily: "Open Sans, sans-serif" }}
      >
        next page
      </button>
    );
    buttonsCount = 1;
  } else if (page < totalPages) {
    buttons = (
      <Aux>
        <button
          onClick={() => clicked("prev")}
          key={2}
          className="ui button purple"
          id="prev"
          style={{ fontFamily: "Open Sans, sans-serif" }}
        >
          prev page
        </button>
        <button
          onClick={() => clicked("next")}
          key={1}
          className="ui button purple"
          id="next"
          style={{ fontFamily: "Open Sans, sans-serif" }}
        >
          next page
        </button>
      </Aux>
    );
    buttonsCount = 2;
  } else if (page === totalPages && page > 1) {
    buttons = (
      <button
        onClick={() => clicked("prev")}
        key={2}
        className="ui button purple"
        id="prev"
        style={{ float: "left", fontFamily: "Open Sans, sans-serif" }}
      >
        prev page
      </button>
    );
    buttonsCount = 1;
  } else {
    buttons = null;
  }
  return (
    <div
      style={{
        width: "250px",
        margin: "20px auto",
        display: "flex",
        alignItems: "center",
        justifyContent: `${buttonsCount > 1 ? "space-between" : "center"}`
      }}
    >
      {buttons}
    </div>
  );
};

export default PageButtons;
