import React from 'react';
interface SocialMedia {
    twitter: string;
    linkedin: string;
}
interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email: string;
}
interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
}
interface UserData {
    name: string;
    role: string;
    title: string;
    telephone: string;
    email: string;
    reportingManager: string;
    biography: string;
    nationalId: string;
    gender: string;
    taxId: string;
    socialSecurity: string;
    address: string;
    startDate: string;
    socialMedia: SocialMedia;
    emergencyContact: EmergencyContact;
    bankDetails: BankDetails;
}
interface UserProfileProps {
    user: UserData;
}
export declare function UserProfile({ user: initialUser }: UserProfileProps): React.JSX.Element;
export default function Page(): React.JSX.Element;
export {};
//# sourceMappingURL=page.d.ts.map