export type CreatePartnerInput = {
    name: string;
    logo?: string;
    website_url?: string;
    location?: string;
};
export type UpdatePartnerInput = {
    name?: string;
    logo?: string;
    website_url?: string;
    location?: string;
};
export type PartnerOutput = {
    id: number;
    name: string;
    logo: string | null;
    website_url: string | null;
    location: string | null;
    created_at: Date;
    updated_at: Date;
};
export declare function createPartner(partnerData: CreatePartnerInput): Promise<PartnerOutput>;
export declare function getPartnerById(id: number): Promise<PartnerOutput>;
export declare function updatePartner(id: number, partnerData: UpdatePartnerInput): Promise<PartnerOutput>;
export declare function deletePartner(id: number): Promise<boolean>;
export declare function listPartners(): Promise<PartnerOutput[]>;
export declare const partnerService: {
    createPartner: typeof createPartner;
    getPartnerById: typeof getPartnerById;
    updatePartner: typeof updatePartner;
    deletePartner: typeof deletePartner;
    listPartners: typeof listPartners;
};
export default partnerService;
//# sourceMappingURL=partner.service.d.ts.map