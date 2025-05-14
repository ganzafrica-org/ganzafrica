export interface NewsItem {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    image: string;
    content: string;
}
export declare const generateSlug: (title: string) => string;
export declare const newsItems: NewsItem[];
export declare const getNewsBySlug: (slug: string) => NewsItem | undefined;
//# sourceMappingURL=news-data.d.ts.map