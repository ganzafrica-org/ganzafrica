export type CreateCategoryInput = {
    name: string;
    description?: string;
};
export type UpdateCategoryInput = {
    name?: string;
    description?: string;
};
export type CategoryOutput = {
    id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
};
export declare function createCategory(categoryData: CreateCategoryInput): Promise<CategoryOutput>;
export declare function getCategoryById(id: number): Promise<CategoryOutput>;
export declare function updateCategory(id: number, categoryData: UpdateCategoryInput): Promise<CategoryOutput>;
export declare function deleteCategory(id: number): Promise<boolean>;
export declare function listCategories(): Promise<CategoryOutput[]>;
export declare const categoryService: {
    createCategory: typeof createCategory;
    getCategoryById: typeof getCategoryById;
    updateCategory: typeof updateCategory;
    deleteCategory: typeof deleteCategory;
    listCategories: typeof listCategories;
};
export default categoryService;
//# sourceMappingURL=categories.d.ts.map