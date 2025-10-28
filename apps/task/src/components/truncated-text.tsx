"use client";

import { useState } from "react";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showToggle?: boolean;
}

export function TruncatedText({ 
  text, 
  maxLength = 170, 
  className = "", 
  showToggle = true 
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If text is shorter than maxLength, show it all
  if (!text || text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  const truncatedText = text.slice(0, maxLength);
  const remainingText = text.slice(maxLength);
  
  return (
    <span className={className}>
      {isExpanded ? text : truncatedText}
      {!isExpanded && remainingText && (
        <>
          <span className="text-gray-500">...</span>
          {showToggle && (
            <button
              onClick={() => setIsExpanded(true)}
              className="ml-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              view more
            </button>
          )}
        </>
      )}
      {isExpanded && showToggle && (
        <button
          onClick={() => setIsExpanded(false)}
          className="ml-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          view less
        </button>
      )}
    </span>
  );
}
