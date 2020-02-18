import React from "react";

import "./SearchBar.css";

const Searchbar = props => {
  return (
    <form className="search-form" onSubmit={props.submit}>
      <input
        className="search-input"
        type="text"
        value={props.searchValue}
        onChange={props.changed}
        placeholder={props.placeholder}
      />
      <ion-icon name="search-outline"></ion-icon>
    </form>
  );
};

export default Searchbar;
