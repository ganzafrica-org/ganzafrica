declare module "@react-jvectormap/world" {
  export const worldMill: any;
}

declare module "@react-jvectormap/core" {
  import { Component } from "react";

  export interface VectorMapProps {
    map: any;
    backgroundColor?: string;
    zoomOnScroll?: boolean;
    zoomButtons?: boolean;
    regionStyle?: {
      initial?: {
        fill?: string;
        fillOpacity?: number;
        "fill-opacity"?: number;
        stroke?: string;
        strokeWidth?: number;
        "stroke-width"?: number;
        strokeOpacity?: number;
        "stroke-opacity"?: number;
        [key: string]: any;
      };
      hover?: {
        fill?: string;
        fillOpacity?: number;
        "fill-opacity"?: number;
        cursor?: string;
        [key: string]: any;
      };
      selected?: {
        fill?: string;
        [key: string]: any;
      };
      selectedHover?: {
        fill?: string;
        [key: string]: any;
      };
    };
    series?: {
      regions?: Array<{
        values?: Record<string, string | number>;
        attribute?: string;
        [key: string]: any;
      }>;
    };
    onRegionTipShow?: (event: any, label: any, code: string) => void;
    onRegionClick?: (event: any, code: string) => void;
    onRegionOver?: (event: any, code: string) => void;
    onRegionOut?: () => void;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    [key: string]: any;
  }

  export class VectorMap extends Component<VectorMapProps> {}
}
