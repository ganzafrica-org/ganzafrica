import React from "react";
export const DecoratedHeading = ({ firstText, secondText, className = "", }) => {
    return (<div className={`inline-block ${className}`}>
      {/* Heading text */}
      <h2 className="font-h4 md:font-h3 whitespace-normal">
        <span className="text-black">{firstText}</span>{" "}
        <span className="text-primary-green">{secondText}</span>
      </h2>
    </div>);
};
export default DecoratedHeading;
