declare module "react-africa-map" {
  import { Component, ComponentProps } from "react";

  export interface AfricaMapProps {
    onSelectCountry?: (countryCode: string) => void;
    onHoverCountry?: (countryCode: string | null) => void;
    countryColors?: Record<string, string>;
    [key: string]: any;
  }

  const AfricaMap: React.FC<AfricaMapProps>;
  export default AfricaMap;
}
