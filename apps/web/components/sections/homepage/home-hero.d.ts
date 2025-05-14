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
        team?: string;
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
interface HomeHeroProps {
    locale: string;
    dict: DictionaryType;
    backgroundImage?: string;
}
export default function HomeHero({ locale, dict, backgroundImage, }: HomeHeroProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=home-hero.d.ts.map