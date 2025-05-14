interface ContactData {
    name: string;
    email: string;
    phone?: string;
    message: string;
    location?: string;
}
interface ContactUpdateData {
    status?: string;
    is_resolved?: boolean;
    responded_at?: Date | null;
}
/**
 * Creates a new contact form submission
 * @param contactData The contact form data
 * @returns The created contact record
 */
export declare const createContact: (contactData: ContactData) => Promise<{
    id: number;
    name: string;
    created_at: Date;
    status: string;
    email: string;
    location: string | null;
    phone: string | null;
    message: string;
    updated_at: Date;
    is_resolved: boolean;
    responded_at: Date | null;
} | undefined>;
/**
 * Lists contact form submissions with optional filtering
 * @param status Optional status to filter by
 * @param isResolved Optional resolution status to filter by
 * @param location Optional location to filter by
 * @param sortBy Field to sort by (defaults to created_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of contact form submissions
 */
export declare const listContacts: (status?: string, isResolved?: boolean, location?: string, sortBy?: string, sortOrder?: string) => Promise<any>;
/**
 * Gets a contact submission by ID
 * @param id The contact ID
 * @returns The contact submission
 */
export declare const getContactById: (id: number) => Promise<{
    created_at: Date;
    updated_at: Date;
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: string;
    is_resolved: boolean;
    responded_at: Date | null;
    location: string | null;
}>;
/**
 * Updates a contact submission
 * @param id The contact ID
 * @param updateData The update data
 * @returns The updated contact
 */
export declare const updateContact: (id: number, updateData: ContactUpdateData) => Promise<{
    created_at: Date;
    updated_at: Date;
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: string;
    is_resolved: boolean;
    responded_at: Date | null;
    location: string | null;
}>;
/**
 * Deletes a contact submission
 * @param id The contact ID
 */
export declare const deleteContact: (id: number) => Promise<boolean>;
/**
 * Subscribes an email to the newsletter
 * @param email The email to subscribe
 * @returns The created subscription
 */
export declare const subscribeNewsletter: (email: string) => Promise<{
    id: number;
    created_at: Date;
    email: string;
    is_active: boolean;
    subscribed_at: Date;
    unsubscribed_at: Date | null;
    updated_at: Date;
} | undefined>;
/**
 * Unsubscribes an email from the newsletter
 * @param id The subscription ID
 * @returns The updated subscription
 */
export declare const unsubscribeNewsletter: (id: number) => Promise<{
    created_at: Date;
    updated_at: Date;
    id: number;
    email: string;
    is_active: boolean;
    subscribed_at: Date;
    unsubscribed_at: Date | null;
} | undefined>;
/**
 * Lists all newsletter subscribers
 * @param activeOnly If true, only return active subscribers
 * @param sortBy Field to sort by (defaults to subscribed_at)
 * @param sortOrder Sort order (asc or desc, defaults to desc)
 * @returns Array of newsletter subscribers
 */
export declare const listNewsletterSubscribers: (activeOnly?: boolean, sortBy?: string, sortOrder?: string) => Promise<any>;
export declare const contactService: {
    createContact: (contactData: ContactData) => Promise<{
        id: number;
        name: string;
        created_at: Date;
        status: string;
        email: string;
        location: string | null;
        phone: string | null;
        message: string;
        updated_at: Date;
        is_resolved: boolean;
        responded_at: Date | null;
    } | undefined>;
    listContacts: (status?: string, isResolved?: boolean, location?: string, sortBy?: string, sortOrder?: string) => Promise<any>;
    getContactById: (id: number) => Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        is_resolved: boolean;
        responded_at: Date | null;
        location: string | null;
    }>;
    updateContact: (id: number, updateData: ContactUpdateData) => Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        name: string;
        email: string;
        phone: string | null;
        message: string;
        status: string;
        is_resolved: boolean;
        responded_at: Date | null;
        location: string | null;
    }>;
    deleteContact: (id: number) => Promise<boolean>;
    subscribeNewsletter: (email: string) => Promise<{
        id: number;
        created_at: Date;
        email: string;
        is_active: boolean;
        subscribed_at: Date;
        unsubscribed_at: Date | null;
        updated_at: Date;
    } | undefined>;
    unsubscribeNewsletter: (id: number) => Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        email: string;
        is_active: boolean;
        subscribed_at: Date;
        unsubscribed_at: Date | null;
    } | undefined>;
    listNewsletterSubscribers: (activeOnly?: boolean, sortBy?: string, sortOrder?: string) => Promise<any>;
};
export default contactService;
//# sourceMappingURL=contact.d.ts.map