import React from "react";
import "../css/Searchinput.css";

const SearchInput = ({ placeholder }) => {
  return (
    <input
      type="text"
      className="search-input"
      placeholder={placeholder || "Search..."}
    />
  );
};

export default SearchInput;
