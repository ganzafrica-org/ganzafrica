"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsService = exports.deleteTag = exports.createTag = exports.listTags = exports.deleteNews = exports.updateNews = exports.getNewsById = exports.listNews = exports.createNews = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const client_1 = require("../db/client");
const news_1 = require("../db/schema/news");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("NewsService");
/**
 * Create a new news item
 */
const createNews = async (newsData) => {
    try {
        let result;
        await client_1.db.transaction(async (tx) => {
            // Insert news
            const insertedNews = await tx
                .insert(news_1.news)
                .values({
                title: newsData.title,
                content: newsData.content,
                status: newsData.status,
                publish_date: newsData.publish_date,
                category: newsData.category,
                key_lessons: newsData.key_lessons,
                media: newsData.media,
            })
                .returning();
            if (!insertedNews || insertedNews.length === 0) {
                throw new middlewares_1.AppError("Failed to create news item", 500);
            }
            const createdNews = insertedNews[0];
            // Add tags if provided
            if (newsData.tags && Array.isArray(newsData.tags) && newsData.tags.length > 0) {
                const tagRelations = newsData.tags.map((tagId) => ({
                    news_id: createdNews.id,
                    tag_id: tagId,
                }));
                await tx.insert(news_1.news_to_tags).values(tagRelations);
            }
            result = createdNews;
        });
        // Get full news item with tags after transaction
        if (result && result.id !== undefined) {
            return await (0, exports.getNewsById)(result.id);
        }
        throw new middlewares_1.AppError("Failed to create news item", 500);
    }
    catch (error) {
        logger.error("Error creating news", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create news item", 500);
    }
};
exports.createNews = createNews;
/**
 * List news items with filtering options
 */
const listNews = async (filter = {}) => {
    try {
        const { category, status, search, tags, limit = 20, offset = 0, sortBy = "created_at", sortDir = "desc", } = filter;
        // Build WHERE conditions
        const whereConditions = [];
        if (category) {
            whereConditions.push((0, drizzle_orm_1.eq)(news_1.news.category, category));
        }
        if (status) {
            whereConditions.push((0, drizzle_orm_1.eq)(news_1.news.status, status));
        }
        if (search) {
            whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(news_1.news.title, `%${search}%`), (0, drizzle_orm_1.ilike)(news_1.news.content, `%${search}%`)));
        }
        // Build the query parts separately
        const baseSelection = {
            id: news_1.news.id,
            title: news_1.news.title,
            content: news_1.news.content,
            status: news_1.news.status,
            publish_date: news_1.news.publish_date,
            category: news_1.news.category,
            key_lessons: news_1.news.key_lessons,
            media: news_1.news.media,
            created_at: news_1.news.created_at,
            updated_at: news_1.news.updated_at,
        };
        // Determine tag filtering if needed
        let newsIdsForTagFilter = [];
        let useTagFilter = false;
        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Get news IDs that have all the specified tags
            const newsWithTags = await client_1.db
                .select({ news_id: news_1.news_to_tags.news_id })
                .from(news_1.news_to_tags)
                .where((0, drizzle_orm_1.inArray)(news_1.news_to_tags.tag_id, tags))
                .groupBy(news_1.news_to_tags.news_id)
                .having((0, drizzle_orm_1.sql) `count(${news_1.news_to_tags.tag_id}) = ${tags.length}`);
            newsIdsForTagFilter = newsWithTags.map((item) => item.news_id);
            useTagFilter = true;
            if (newsIdsForTagFilter.length === 0) {
                return { news: [], total: 0 }; // No news items match the tag filter
            }
        }
        // Build the WHERE condition combining all filters
        const allConditions = [...whereConditions];
        if (useTagFilter) {
            allConditions.push((0, drizzle_orm_1.inArray)(news_1.news.id, newsIdsForTagFilter));
        }
        // Count total matching records
        const countQuery = client_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(news_1.news);
        if (allConditions.length > 0) {
            countQuery.where((0, drizzle_orm_1.and)(...allConditions));
        }
        const countResult = await countQuery;
        const total = countResult[0]?.count || 0;
        // Determine the sort column and direction
        let sortColumnToUse = news_1.news.created_at;
        let sortFunction = drizzle_orm_1.desc;
        if (sortBy && sortBy in news_1.news) {
            sortColumnToUse = news_1.news[sortBy];
            sortFunction = sortDir === "asc" ? drizzle_orm_1.asc : drizzle_orm_1.desc;
        }
        // Execute the final query with all conditions in one go
        const result = await client_1.db
            .select(baseSelection)
            .from(news_1.news)
            .where(allConditions.length > 0 ? (0, drizzle_orm_1.and)(...allConditions) : undefined)
            .orderBy(sortFunction(sortColumnToUse))
            .limit(limit)
            .offset(offset);
        // Get tags for each news item
        const newsWithTags = await Promise.all(result.map(async (newsItem) => {
            const tags = await client_1.db
                .select({
                id: news_1.news_tags.id,
                name: news_1.news_tags.name,
            })
                .from(news_1.news_tags)
                .innerJoin(news_1.news_to_tags, (0, drizzle_orm_1.eq)(news_1.news_tags.id, news_1.news_to_tags.tag_id))
                .where((0, drizzle_orm_1.eq)(news_1.news_to_tags.news_id, newsItem.id));
            return {
                ...newsItem,
                tags,
            };
        }));
        return {
            news: newsWithTags,
            total,
        };
    }
    catch (error) {
        logger.error("Error listing news", error);
        throw new middlewares_1.AppError("Failed to list news items", 500);
    }
};
exports.listNews = listNews;
/**
 * Get a news item by ID
 */
const getNewsById = async (id) => {
    try {
        const result = await client_1.db
            .select()
            .from(news_1.news)
            .where((0, drizzle_orm_1.eq)(news_1.news.id, id))
            .limit(1);
        if (result.length === 0) {
            throw new middlewares_1.AppError("News item not found", 404);
        }
        const newsItem = result[0];
        // Get tags for this news item
        const tags = await client_1.db
            .select({
            id: news_1.news_tags.id,
            name: news_1.news_tags.name,
        })
            .from(news_1.news_tags)
            .innerJoin(news_1.news_to_tags, (0, drizzle_orm_1.eq)(news_1.news_tags.id, news_1.news_to_tags.tag_id))
            .where((0, drizzle_orm_1.eq)(news_1.news_to_tags.news_id, id));
        return {
            ...newsItem,
            tags,
        };
    }
    catch (error) {
        logger.error(`Error getting news by id: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get news item", 500);
    }
};
exports.getNewsById = getNewsById;
/**
 * Update a news item
 */
const updateNews = async (id, newsData) => {
    try {
        let result;
        await client_1.db.transaction(async (tx) => {
            // Update news
            const updatedNews = await tx
                .update(news_1.news)
                .set({
                ...(newsData.title && { title: newsData.title }),
                ...(newsData.content && { content: newsData.content }),
                ...(newsData.status && { status: newsData.status }),
                ...(typeof newsData.publish_date !== "undefined" && {
                    publish_date: newsData.publish_date,
                }),
                ...(newsData.category && { category: newsData.category }),
                ...(typeof newsData.key_lessons !== "undefined" && {
                    key_lessons: newsData.key_lessons,
                }),
                ...(typeof newsData.media !== "undefined" && { media: newsData.media }),
            })
                .where((0, drizzle_orm_1.eq)(news_1.news.id, id))
                .returning();
            if (!updatedNews || updatedNews.length === 0) {
                throw new middlewares_1.AppError("News item not found", 404);
            }
            // Update tags if provided
            if (Array.isArray(newsData.tags)) {
                // Delete existing tag relations
                await tx.delete(news_1.news_to_tags).where((0, drizzle_orm_1.eq)(news_1.news_to_tags.news_id, id));
                // Add new tag relations
                if (newsData.tags.length > 0) {
                    const tagRelations = newsData.tags.map((tagId) => ({
                        news_id: id,
                        tag_id: tagId,
                    }));
                    await tx.insert(news_1.news_to_tags).values(tagRelations);
                }
            }
            result = updatedNews[0];
        });
        // Get full news item with tags after transaction
        return await (0, exports.getNewsById)(id);
    }
    catch (error) {
        logger.error(`Error updating news: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update news item", 500);
    }
};
exports.updateNews = updateNews;
/**
 * Delete a news item
 */
const deleteNews = async (id) => {
    try {
        const result = await client_1.db.delete(news_1.news).where((0, drizzle_orm_1.eq)(news_1.news.id, id)).returning();
        if (result.length === 0) {
            throw new middlewares_1.AppError("News item not found", 404);
        }
        return true;
    }
    catch (error) {
        logger.error(`Error deleting news: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete news item", 500);
    }
};
exports.deleteNews = deleteNews;
/**
 * List all tags
 */
const listTags = async () => {
    try {
        return await client_1.db.select().from(news_1.news_tags).orderBy((0, drizzle_orm_1.asc)(news_1.news_tags.name));
    }
    catch (error) {
        logger.error("Error listing tags", error);
        throw new middlewares_1.AppError("Failed to list tags", 500);
    }
};
exports.listTags = listTags;
/**
 * Create a new tag
 */
const createTag = async (name) => {
    try {
        const result = await client_1.db
            .insert(news_1.news_tags)
            .values({ name })
            .returning();
        if (!result || result.length === 0) {
            throw new middlewares_1.AppError("Failed to create tag", 500);
        }
        return result[0];
    }
    catch (error) {
        logger.error("Error creating tag", error);
        // Check for unique constraint violation
        if (error?.code === '23505') {
            throw new middlewares_1.AppError(`Tag with name "${name}" already exists`, 400);
        }
        throw new middlewares_1.AppError("Failed to create tag", 500);
    }
};
exports.createTag = createTag;
/**
 * Delete a tag
 */
const deleteTag = async (id) => {
    try {
        const result = await client_1.db.delete(news_1.news_tags).where((0, drizzle_orm_1.eq)(news_1.news_tags.id, id)).returning();
        if (result.length === 0) {
            throw new middlewares_1.AppError("Tag not found", 404);
        }
        return true;
    }
    catch (error) {
        logger.error(`Error deleting tag: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete tag", 500);
    }
};
exports.deleteTag = deleteTag;
// Create a service object to export
exports.newsService = {
    createNews: exports.createNews,
    listNews: exports.listNews,
    getNewsById: exports.getNewsById,
    updateNews: exports.updateNews,
    deleteNews: exports.deleteNews,
    listTags: exports.listTags,
    createTag: exports.createTag,
    deleteTag: exports.deleteTag,
};
// Default export for the service object
exports.default = exports.newsService;
