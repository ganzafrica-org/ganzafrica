import React from "react";

const HeaderBanner = ({
  categories = ["Environment", "Agriculture", "Land", "Food system", "Climate"],
}) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Yellow band */}
      <div className="bg-yellow-300 h-16 transform -skew-y-1">
        <div className="container mx-auto px-4 transform skew-y-1 h-full">
          <div className="flex justify-between items-center h-full">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 bg-black rounded-full mr-3"></div>
                <span className="text-xl font-bold">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Green band - positioned exactly as in screenshot */}
      <div className="bg-green-800 h-16 transform -skew-y-1"></div>
    </div>
  );
};

export default HeaderBanner;
