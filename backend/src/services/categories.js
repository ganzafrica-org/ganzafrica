"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
exports.createCategory = createCategory;
exports.getCategoryById = getCategoryById;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.listCategories = listCategories;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const middlewares_1 = require("../middlewares");
const config_1 = require("../config");
const logger = new config_1.Logger("CategoryService");
// Create a new category
async function createCategory(categoryData) {
    try {
        // Check if a category with the same name already exists
        const existingCategory = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.name, categoryData.name))
            .limit(1);
        if (existingCategory.length > 0) {
            throw new middlewares_1.AppError(`Category with name '${categoryData.name}' already exists`, 409);
        }
        // Insert the category
        await client_1.db.insert(schema_1.project_categories).values({
            name: categoryData.name,
            description: categoryData.description || null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        // Get the created category
        const createdCategory = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.name, categoryData.name))
            .limit(1);
        if (!createdCategory.length) {
            throw new middlewares_1.AppError("Failed to create category", 500);
        }
        return mapToCategoryOutput(createdCategory[0]);
    }
    catch (error) {
        logger.error("Error creating category", error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to create category", 500);
    }
}
// Get category by ID
async function getCategoryById(id) {
    try {
        const result = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id))
            .limit(1);
        if (!result.length) {
            throw new middlewares_1.AppError("Category not found", 404);
        }
        return mapToCategoryOutput(result[0]);
    }
    catch (error) {
        logger.error(`Error getting category by ID: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to get category", 500);
    }
}
// Update category
async function updateCategory(id, categoryData) {
    try {
        // Check if category exists
        const existingCategory = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id))
            .limit(1);
        if (!existingCategory.length) {
            throw new middlewares_1.AppError("Category not found", 404);
        }
        // If updating name, check if the new name already exists
        if (categoryData.name && categoryData.name !== existingCategory[0].name) {
            const nameExists = await client_1.db
                .select()
                .from(schema_1.project_categories)
                .where((0, drizzle_orm_1.eq)(schema_1.project_categories.name, categoryData.name))
                .limit(1);
            if (nameExists.length > 0) {
                throw new middlewares_1.AppError(`Category with name '${categoryData.name}' already exists`, 409);
            }
        }
        // Update category
        await client_1.db
            .update(schema_1.project_categories)
            .set({
            ...categoryData,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id));
        // Get updated category
        const updatedCategory = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id))
            .limit(1);
        return mapToCategoryOutput(updatedCategory[0]);
    }
    catch (error) {
        logger.error(`Error updating category: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to update category", 500);
    }
}
// Delete category
async function deleteCategory(id) {
    try {
        // Check if category exists
        const existingCategory = await client_1.db
            .select()
            .from(schema_1.project_categories)
            .where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id))
            .limit(1);
        if (!existingCategory.length) {
            throw new middlewares_1.AppError("Category not found", 404);
        }
        // Check if the category is used by any projects
        // If you have a projects table with a category_id foreign key, you should add a check here
        // to prevent deletion of categories that are in use
        // Delete the category
        await client_1.db.delete(schema_1.project_categories).where((0, drizzle_orm_1.eq)(schema_1.project_categories.id, id));
        return true;
    }
    catch (error) {
        logger.error(`Error deleting category: ${id}`, error);
        if (error instanceof middlewares_1.AppError) {
            throw error;
        }
        throw new middlewares_1.AppError("Failed to delete category", 500);
    }
}
// List all categories
async function listCategories() {
    try {
        const result = await client_1.db.select().from(schema_1.project_categories);
        return result.map(mapToCategoryOutput);
    }
    catch (error) {
        logger.error("Error listing categories", error);
        throw new middlewares_1.AppError("Failed to list categories", 500);
    }
}
// Helper function to map database category to CategoryOutput type
function mapToCategoryOutput(category) {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        created_at: category.created_at,
        updated_at: category.updated_at,
    };
}
// Export the service functions
exports.categoryService = {
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    listCategories,
};
// Default export for the service object
exports.default = exports.categoryService;
