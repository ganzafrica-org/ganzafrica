import "@workspace/ui/globals.css";
export declare function generateMetadata(props: {
    params: Promise<{
        locale: string;
    }>;
}): Promise<{
    title: {
        default: any;
        template: string;
    };
    description: any;
    metadataBase: URL;
    alternates: {
        canonical: string;
        languages: {
            en: string;
            fr: string;
        };
    };
}>;
export default function RootLayout(props: {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
    }>;
}): Promise<import("react").JSX.Element>;
//# sourceMappingURL=layout.d.ts.map