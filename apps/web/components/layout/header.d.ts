import React from "react";
interface DictionaryType {
    navigation?: {
        about?: string;
        what_we_do?: string;
        our_approach?: string;
        programs?: string;
        community_hub?: string;
    };
    about?: {
        who_we_are?: string;
        our_story?: string;
        [key: string]: string | undefined;
    };
    what_we_do?: {
        food_systems?: string;
        climate_change_adaptation?: string;
        [key: string]: string | undefined;
    };
    home?: {
        hero?: {
            title?: string;
            subtitle?: string;
            title_after?: {
                line1?: string;
                line2?: string;
                line3?: string;
                line4?: string;
            };
        };
    };
    cta?: {
        sign_in?: string;
        discover_more?: string;
    };
}
interface HeaderProps {
    locale: string;
    dict: DictionaryType;
}
export default function Header({ locale, dict }: HeaderProps): React.JSX.Element;
export {};
//# sourceMappingURL=header.d.ts.map