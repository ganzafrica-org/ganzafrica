import React from "react";
import { TranslatableText } from "@/components/translate/TranslatableText";

interface DecoratedHeadingProps {
  firstText: string;
  secondText: string;
  className?: string;
}

export const DecoratedHeading: React.FC<DecoratedHeadingProps> = ({
  firstText,
  secondText,
  className = "",
}) => {
  return (
    <div className={`inline-block ${className}`}>
      {/* Heading text */}
      <h2 className="font-h4 md:font-h3 whitespace-normal">
        <span className="text-black">
          <TranslatableText>{firstText}</TranslatableText>
        </span>{" "}
        <span className="text-primary-green">
          <TranslatableText>{secondText}</TranslatableText>
        </span>
      </h2>
    </div>
  );
};

export default DecoratedHeading;
