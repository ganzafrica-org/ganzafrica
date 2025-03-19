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
                                                                      firstTextColor = "text-primary-green",
                                                                      secondTextColor = "text-primary-orange",
                                                                      borderColor = "border-primary-green",
                                                                      cornerColor = "bg-primary-orange",
                                                                      className = "",
                                                                  }) => {
    return (
        <div className={`relative inline-block px-8 py-4 ${className}`}>
            {/* Border */}
            <div className={`absolute inset-0 border-2 ${borderColor}`}></div>

            {/* Corner squares with proper positioning */}
            <div className={`absolute w-3 h-3 ${cornerColor} -translate-x-1/2 -translate-y-1/2 top-0 left-0`}></div>
            <div className={`absolute w-3 h-3 ${cornerColor} translate-x-1/2 -translate-y-1/2 top-0 right-0`}></div>
            <div className={`absolute w-3 h-3 ${cornerColor} -translate-x-1/2 translate-y-1/2 bottom-0 left-0`}></div>
            <div className={`absolute w-3 h-3 ${cornerColor} translate-x-1/2 translate-y-1/2 bottom-0 right-0`}></div>

            {/* Heading text */}
            <h2 className="font-h4 md:font-h3 relative z-10 whitespace-normal">
                <span className={firstTextColor}>{firstText}</span>{" "}
                <span className={secondTextColor}>{secondText}</span>
            </h2>
        </div>
    );
};

export default DecoratedHeading;