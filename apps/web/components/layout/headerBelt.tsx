"use client";




import React from "react";

const HeaderBelt = () => {
  return (
    <div 
      className="w-full relative overflow-hidden -mt-12" 
      style={{ 
        height: '60px',
        zIndex: 9999,
        position: 'relative'
      }}
    >
      <svg 
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 24 150 28" 
        preserveAspectRatio="none"
        style={{ zIndex: 9999 }}
      >
        <defs>
          <path
            id="wave-path"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="waves">
          {/* Wave 1 - Light Primary Orange */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="0"
            className="wave wave-1 fill-primary-green opacity-60 "
          />
          {/* Wave 2 - Green */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="3"
            className="wave wave-2 fill-primary-orange opacity-80"
          />
          {/* Wave 3 - Purple */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="6"
            className="wave wave-3  fill-white "
          />
        </g>
      </svg>
      
    <div 
      className="w-full relative overflow-hidden -mt-12" 
      style={{ 
        height: '60px',
        zIndex: 9999,
        position: 'relative'
      }}
    >
      <svg 
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 24 150 28" 
        preserveAspectRatio="none"
        style={{ zIndex: 9999 }}
      >
        <defs>
          <path
            id="wave-path"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="waves">
          {/* Wave 1 - Light Primary Orange */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="0"
            className="wave wave-1 fill-primary-green opacity-60 "
          />
          {/* Wave 2 - Green */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="3"
            className="wave wave-2 fill-primary-orange opacity-80"
          />
          {/* Wave 3 - Purple */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="6"
            className="wave wave-3  fill-white "
          />
        </g>
      </svg>
      
      <style jsx>{`
        .wave {
          animation: wave-move 15s ease-in-out infinite;
        }
        
        .wave-1 {
          animation-delay: -2s;
          animation-duration: 8s;
        }
        
        .wave-2 {
          animation-delay: -4s;
          animation-duration: 12s;
        }
        
        .wave-3 {
          animation-delay: -6s;
          animation-duration: 16s;
        }
        
        @keyframes wave-move {
          0%, 100% {
            transform: translate3d(-90px, 0, 0);
        .wave {
          animation: wave-move 15s ease-in-out infinite;
        }
        
        .wave-1 {
          animation-delay: -2s;
          animation-duration: 8s;
        }
        
        .wave-2 {
          animation-delay: -4s;
          animation-duration: 12s;
        }
        
        .wave-3 {
          animation-delay: -6s;
          animation-duration: 16s;
        }
        
        @keyframes wave-move {
          0%, 100% {
            transform: translate3d(-90px, 0, 0);
          }
          50% {
            transform: translate3d(85px, 0, 0);
          }
          50% {
            transform: translate3d(85px, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default HeaderBelt;