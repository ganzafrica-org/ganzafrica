"use client";

import React from "react";

const HeaderBelt = (): JSX.Element => {
  return (
    <div 
      className="w-full relative overflow-hidden -mt-12 z-10 pointer-events-none" 
      style={{ 
        height: '60px',
        zIndex: 0,
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
            className="fill-primary-green opacity-60"
            style={{
              animation: 'wave-move-1 8s ease-in-out infinite',
              animationDelay: '-2s'
            }}
          />
          {/* Wave 2 - Green */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="3"
            className="fill-primary-orange opacity-80"
            style={{
              animation: 'wave-move-2 12s ease-in-out infinite',
              animationDelay: '-4s'
            }}
          />
          {/* Wave 3 - Purple */}
          <use
            xlinkHref="#wave-path"
            x="48"
            y="6"
            className="fill-white"
            style={{
              animation: 'wave-move-3 16s ease-in-out infinite',
              animationDelay: '-6s'
            }}
          />
        </g>
      </svg>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wave-move-1 {
            0%, 100% {
              transform: translate3d(-90px, 0, 0);
            }
            50% {
              transform: translate3d(85px, 0, 0);
            }
          }
          
          @keyframes wave-move-2 {
            0%, 100% {
              transform: translate3d(-90px, 0, 0);
            }
            50% {
              transform: translate3d(85px, 0, 0);
            }
          }
          
          @keyframes wave-move-3 {
            0%, 100% {
              transform: translate3d(-90px, 0, 0);
            }
            50% {
              transform: translate3d(85px, 0, 0);
            }
          }
        `
      }} />
    </div>
  );
};

export default HeaderBelt;