export type CreateFaqInput = {
    question: string;
    answer: string;
    is_active?: boolean;
};
export type UpdateFaqInput = {
    question?: string;
    answer?: string;
    is_active?: boolean;
    view_count?: number;
};
export type FaqOutput = {
    id: number;
    question: string;
    answer: string;
    is_active: boolean;
    view_count: number;
    created_by?: number;
    created_at: Date;
    updated_at: Date;
};
export declare function createFaq(faqData: CreateFaqInput): Promise<FaqOutput>;
export declare function getFaqById(id: number): Promise<FaqOutput>;
export declare function incrementViewCount(id: number): Promise<boolean>;
export declare function updateFaq(id: number, faqData: UpdateFaqInput): Promise<FaqOutput>;
export declare function deleteFaq(id: number): Promise<boolean>;
export declare function listFaqs(activeOnly?: boolean): Promise<FaqOutput[]>;
export declare const faqService: {
    createFaq: typeof createFaq;
    getFaqById: typeof getFaqById;
    updateFaq: typeof updateFaq;
    deleteFaq: typeof deleteFaq;
    listFaqs: typeof listFaqs;
    incrementViewCount: typeof incrementViewCount;
};
export default faqService;
//# sourceMappingURL=faqs.d.ts.map