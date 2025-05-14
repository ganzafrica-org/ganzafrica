import { ReactNode } from "react";
interface OpportunityCardProps {
    title: string;
    status: "Open" | "Closed";
    description: string;
    icon: ReactNode;
    color: string;
    requirements: string[];
    type?: "fellowship" | "role";
    duration?: string;
    location: string;
    employmentType?: string;
    startDate: string;
    endDate: string;
}
export declare function OpportunityCard({ title, status, description, icon, color, requirements, type, duration, location, employmentType, startDate, endDate, }: OpportunityCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=OpportunityCard.d.ts.map