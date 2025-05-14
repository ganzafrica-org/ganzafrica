import * as React from "react";
interface DictionaryType {
    navigation?: {
        about?: string;
        our_approach?: string;
        programs?: string;
        projects?: string;
        opportunities?: string;
    };
    about?: {
        who_we_are?: string;
        our_story?: string;
        [key: string]: string | undefined;
    };
    cta?: {
        sign_in?: string;
    };
}
interface NavigationProps {
    locale: string;
    dict: DictionaryType;
    isHomePage?: boolean;
}
export default function Navigation({ locale, dict, isHomePage, }: NavigationProps): React.JSX.Element;
export {};
//# sourceMappingURL=navigation.d.ts.map