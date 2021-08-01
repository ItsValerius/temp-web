import React from "react";

const NameInputs = ({ handleChange,files,texts }) => {
  if (files && files.length > 0) {
    return Array.from(files).map((file, index) => {
      return (
        <input
          type="text"
          value={texts[index]}
          onChange={(e) => {
            handleChange(index, e.target.value);
          }}
          name={index}
          key={index}
        />
      );
    });
  }
  return null;
};

export default NameInputs;
