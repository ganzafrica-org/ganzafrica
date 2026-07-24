export const IDS = {
  admin: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  hr: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  employee: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  otherEmployee: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  contract: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  asset: "ffffffff-ffff-ffff-ffff-ffffffffffff",
  category: "11111111-1111-4111-8111-111111111111",
  ticket: "22222222-2222-4222-8222-222222222222",
  document: "33333333-3333-4333-8333-333333333333",
  leave: "44444444-4444-4444-8444-444444444444",
  maintenance: "55555555-5555-4555-8555-555555555555",
} as const;

export const VALID_CONTRACT_BODY = {
  jobTitle: "Software Engineer",
  startDate: "2024-01-01T00:00:00.000Z",
  employmentTerm: "indefinite" as const,
  employmentType: "full-time" as const,
  compensationType: "salaried" as const,
  currency: "USD",
  grossAnnualRate: "60000.00",
};

export const VALID_DOCUMENT_BODY = {
  document_name: "Employee Handbook",
  category: "Policies & Procedures" as const,
  version: "1.0",
  description: "Company policies",
  department: "HR",
  fileName: "handbook.pdf",
  fileContentBase64: "dGVzdA==",
  createdById: IDS.hr,
  access: {
    type: "department" as const,
    target: "HR",
    permission: "see" as const,
  },
};

export const VALID_ASSET_BODY = {
  deviceName: "Laptop",
  serialNumber: "SN123",
  categoryId: IDS.category,
  status: "AVAILABLE" as const,
};

export const VALID_MAINTENANCE_BODY = {
  assetId: IDS.asset,
  requesterId: IDS.hr,
  title: "Screen repair",
};
