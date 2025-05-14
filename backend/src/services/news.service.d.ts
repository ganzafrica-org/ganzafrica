/**
 * Create a new news item
 */
export declare const createNews: (newsData: any) => Promise<{
    tags: {
        id: number;
        name: string;
    }[];
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    id?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    status?: "published" | "not_published" | undefined;
    publish_date?: Date | null | undefined;
    category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
    key_lessons?: string | null | undefined;
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    } | null | undefined;
}>;
/**
 * List news items with filtering options
 */
export declare const listNews: (filter?: any) => Promise<{
    news: {
        tags: {
            id: number;
            name: string;
        }[];
        id: number;
        title: string;
        content: string;
        status: "published" | "not_published";
        publish_date: Date | null;
        category: "all" | "news" | "blogs" | "reports" | "publications";
        key_lessons: string | null;
        media: {
            items: Array<{
                id: string;
                type: "image" | "video";
                url: string;
                cover: boolean;
                size?: number;
                duration?: number;
                thumbnailUrl?: string;
                order?: number;
            }>;
        } | null;
        created_at: Date;
        updated_at: Date;
    }[];
    total: number;
}>;
/**
 * Get a news item by ID
 */
export declare const getNewsById: (id: number) => Promise<{
    tags: {
        id: number;
        name: string;
    }[];
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    id?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    status?: "published" | "not_published" | undefined;
    publish_date?: Date | null | undefined;
    category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
    key_lessons?: string | null | undefined;
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    } | null | undefined;
}>;
/**
 * Update a news item
 */
export declare const updateNews: (id: number, newsData: any) => Promise<{
    tags: {
        id: number;
        name: string;
    }[];
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    id?: number | undefined;
    title?: string | undefined;
    content?: string | undefined;
    status?: "published" | "not_published" | undefined;
    publish_date?: Date | null | undefined;
    category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
    key_lessons?: string | null | undefined;
    media?: {
        items: Array<{
            id: string;
            type: "image" | "video";
            url: string;
            cover: boolean;
            size?: number;
            duration?: number;
            thumbnailUrl?: string;
            order?: number;
        }>;
    } | null | undefined;
}>;
/**
 * Delete a news item
 */
export declare const deleteNews: (id: number) => Promise<boolean>;
/**
 * List all tags
 */
export declare const listTags: () => Promise<{
    created_at: Date;
    updated_at: Date;
    id: number;
    name: string;
}[]>;
/**
 * Create a new tag
 */
export declare const createTag: (name: string) => Promise<{
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
} | undefined>;
/**
 * Delete a tag
 */
export declare const deleteTag: (id: number) => Promise<boolean>;
export declare const newsService: {
    createNews: (newsData: any) => Promise<{
        tags: {
            id: number;
            name: string;
        }[];
        created_at?: Date | undefined;
        updated_at?: Date | undefined;
        id?: number | undefined;
        title?: string | undefined;
        content?: string | undefined;
        status?: "published" | "not_published" | undefined;
        publish_date?: Date | null | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        key_lessons?: string | null | undefined;
        media?: {
            items: Array<{
                id: string;
                type: "image" | "video";
                url: string;
                cover: boolean;
                size?: number;
                duration?: number;
                thumbnailUrl?: string;
                order?: number;
            }>;
        } | null | undefined;
    }>;
    listNews: (filter?: any) => Promise<{
        news: {
            tags: {
                id: number;
                name: string;
            }[];
            id: number;
            title: string;
            content: string;
            status: "published" | "not_published";
            publish_date: Date | null;
            category: "all" | "news" | "blogs" | "reports" | "publications";
            key_lessons: string | null;
            media: {
                items: Array<{
                    id: string;
                    type: "image" | "video";
                    url: string;
                    cover: boolean;
                    size?: number;
                    duration?: number;
                    thumbnailUrl?: string;
                    order?: number;
                }>;
            } | null;
            created_at: Date;
            updated_at: Date;
        }[];
        total: number;
    }>;
    getNewsById: (id: number) => Promise<{
        tags: {
            id: number;
            name: string;
        }[];
        created_at?: Date | undefined;
        updated_at?: Date | undefined;
        id?: number | undefined;
        title?: string | undefined;
        content?: string | undefined;
        status?: "published" | "not_published" | undefined;
        publish_date?: Date | null | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        key_lessons?: string | null | undefined;
        media?: {
            items: Array<{
                id: string;
                type: "image" | "video";
                url: string;
                cover: boolean;
                size?: number;
                duration?: number;
                thumbnailUrl?: string;
                order?: number;
            }>;
        } | null | undefined;
    }>;
    updateNews: (id: number, newsData: any) => Promise<{
        tags: {
            id: number;
            name: string;
        }[];
        created_at?: Date | undefined;
        updated_at?: Date | undefined;
        id?: number | undefined;
        title?: string | undefined;
        content?: string | undefined;
        status?: "published" | "not_published" | undefined;
        publish_date?: Date | null | undefined;
        category?: "all" | "news" | "blogs" | "reports" | "publications" | undefined;
        key_lessons?: string | null | undefined;
        media?: {
            items: Array<{
                id: string;
                type: "image" | "video";
                url: string;
                cover: boolean;
                size?: number;
                duration?: number;
                thumbnailUrl?: string;
                order?: number;
            }>;
        } | null | undefined;
    }>;
    deleteNews: (id: number) => Promise<boolean>;
    listTags: () => Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        name: string;
    }[]>;
    createTag: (name: string) => Promise<{
        id: number;
        name: string;
        created_at: Date;
        updated_at: Date;
    } | undefined>;
    deleteTag: (id: number) => Promise<boolean>;
};
export default newsService;
//# sourceMappingURL=news.service.d.ts.map