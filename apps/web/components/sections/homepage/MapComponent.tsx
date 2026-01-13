"use client";

import dynamic from 'next/dynamic';

const AfricaMap = dynamic(() => import('react-africa-map').then((mod) => mod.default), { 
  ssr: false 
});

export default function MapComponent() {
  return (
    <div className="App mt-30">
      {/* This CSS targets the specific SVG elements:
          1. 'text' targets "Choose a country"
          2. 'path[stroke-dasharray]' targets the dashed arrow
      */}
      <style>{`
        .App svg text { 
          display: none !important; 
        }
        .App svg path[stroke-dasharray] { 
          display: none !important; 
        }
      `}</style>

      <AfricaMap
        countryColors={{
            RW: "#FF5733",
            BF: "#10b981",
        }}
        selection
        selected={["RW", "BF"]}
      />
    </div>
  );
}