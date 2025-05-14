import React from "react";
interface SectionProps {
    number: string;
    title: string;
    text: string;
    imageUrl: string;
    imageAlt: string;
    bgColor: string;
    accentColor: string;
    textColor: string;
    imageFirst: boolean;
    contentClass: string;
    videoRef?: React.RefObject<HTMLVideoElement>;
    isVideoSection?: boolean;
}
export default function SectionWithScrollAnimation({ number, title, text, imageUrl, imageAlt, bgColor, accentColor, textColor, imageFirst, contentClass, videoRef, isVideoSection, }: SectionProps): React.JSX.Element;
export {};
//# sourceMappingURL=SectionWithScroll.d.ts.map