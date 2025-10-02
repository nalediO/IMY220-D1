import React from "react";
import "../css/Searchinput.css";

const SearchInput = ({ placeholder, value, onChange }) => {
  return (
    <input
      type="text"
      className="search-input"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchInput;
