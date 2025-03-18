import React from "react";

interface DecoratedHeadingProps {
  firstText: string;
  secondText: string;
  firstTextColor?: string;
  secondTextColor?: string;
  borderColor?: string;
  cornerColor?: string;
  className?: string;
}

export const DecoratedHeading: React.FC<DecoratedHeadingProps> = ({
  firstText,
  secondText,
  firstTextColor = "text-green-800",
  secondTextColor = "text-yellow-400",
  borderColor = "border-yellow-400",
  cornerColor = "bg-yellow-400",
  className = "",
}) => {
  return (
    <div className={`relative inline-block px-6 py-3 ${className}`}>
      <div className={`absolute inset-0 border-2 ${borderColor}`}></div>
      <div className={`absolute w-3 h-3 ${cornerColor} -top-2 -left-2`}></div>
      <div className={`absolute w-3 h-3 ${cornerColor} -top-2 -right-2`}></div>
      <div
        className={`absolute w-3 h-3 ${cornerColor} -bottom-2 -left-2`}
      ></div>
      <div
        className={`absolute w-3 h-3 ${cornerColor} -bottom-2 -right-2`}
      ></div>
      <h2 className="text-2xl font-bold relative z-10">
        <span className={firstTextColor}>{firstText}</span>{" "}
        <span className={secondTextColor}>{secondText}</span>
      </h2>
    </div>
  );
};

export default DecoratedHeading;
