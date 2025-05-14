import { Metadata } from "next";
interface PageProps {
    params: Promise<{
        locale: string;
    }>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export declare function generateMetadata({ params, }: {
    params: Promise<{
        locale: string;
    }>;
}): Promise<Metadata>;
export default function HomePage({ params }: PageProps): Promise<import("react").JSX.Element>;
export declare function generateStaticParams(): Promise<{
    locale: string;
}[]>;
export {};
//# sourceMappingURL=page.d.ts.map