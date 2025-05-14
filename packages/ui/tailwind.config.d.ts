import type { PluginAPI } from "tailwindcss/types/config.js";
declare const config: {
    darkMode: ["class"];
    content: string[];
    theme: {
        extend: {
            fontFamily: {
                sans: [string, ...string[]];
            };
            colors: {
                "primary-green": string;
                "secondary-green": string;
                "lighter-green-100": string;
                "lighter-green-50": string;
                "secondary-yellow": string;
                "yellow-lighter": string;
                "yellow-grid": string;
                "primary-orange": string;
                "light-orange": string;
                "orange-grid": string;
                "dark-blue": string;
                blue: string;
                "blue-lighter": string;
                dark: string;
                gray: string;
                "text-gray": string;
                "border-grey": string;
                "gray-lighter": string;
                red: string;
                "red-darker": string;
                "red-lighter": string;
                border: string;
                input: string;
                ring: string;
                background: string;
                foreground: string;
                primary: {
                    DEFAULT: string;
                    foreground: string;
                };
                secondary: {
                    DEFAULT: string;
                    foreground: string;
                };
                destructive: {
                    DEFAULT: string;
                    foreground: string;
                };
                muted: {
                    DEFAULT: string;
                    foreground: string;
                };
                accent: {
                    DEFAULT: string;
                    foreground: string;
                };
                popover: {
                    DEFAULT: string;
                    foreground: string;
                };
                card: {
                    DEFAULT: string;
                    foreground: string;
                };
                sidebar: {
                    DEFAULT: string;
                    foreground: string;
                    primary: string;
                    "primary-foreground": string;
                    accent: string;
                    "accent-foreground": string;
                    border: string;
                    ring: string;
                };
            };
            borderRadius: {
                lg: string;
                md: string;
                sm: string;
            };
            backgroundImage: {
                "orange-gradient": string;
            };
        };
    };
    plugins: ({
        handler: () => void;
    } | (({ addUtilities }: PluginAPI) => void))[];
};
export default config;
//# sourceMappingURL=tailwind.config.d.ts.map