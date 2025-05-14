export type CreateTestimonialInput = {
    author_name: string;
    position?: string;
    image?: string;
    description: string;
    company?: string;
    occupation?: string;
    date?: Date | string;
    rating?: number;
};
export type UpdateTestimonialInput = {
    author_name?: string;
    position?: string;
    image?: string;
    description?: string;
    company?: string;
    occupation?: string;
    date?: Date | string;
    rating?: number;
};
export type TestimonialOutput = {
    id: number;
    author_name: string;
    position: string | null;
    image: string | null;
    description: string;
    company: string | null;
    occupation: string | null;
    date: Date;
    rating: number | null;
    created_at: Date;
    updated_at: Date;
};
export declare function createTestimonial(testimonialData: CreateTestimonialInput): Promise<TestimonialOutput>;
export declare function getTestimonialById(id: number): Promise<TestimonialOutput>;
export declare function updateTestimonial(id: number, testimonialData: UpdateTestimonialInput): Promise<TestimonialOutput>;
export declare function deleteTestimonial(id: number): Promise<boolean>;
export declare function listTestimonials(): Promise<TestimonialOutput[]>;
export declare const testimonialService: {
    createTestimonial: typeof createTestimonial;
    getTestimonialById: typeof getTestimonialById;
    updateTestimonial: typeof updateTestimonial;
    deleteTestimonial: typeof deleteTestimonial;
    listTestimonials: typeof listTestimonials;
};
export default testimonialService;
//# sourceMappingURL=testimonial.service.d.ts.map