export interface Policy {
    id: number;
    name: string;
    description: string;
    feature: string;
    status: string;
    lastEdited: string;
}

export const policies = [
    {
        id: 1,
        name: 'Data change policy',
        description: 'Approval policy for changes to personal infor...',
        feature: 'Data update',
        status: 'Active',
        lastEdited: 'May 8th 2024',
    },
    {
        id: 2,
        name: 'Default expenses policy',
        description: 'Default approval policy for expenses',
        feature: 'Expenses',
        status: 'Active',
        lastEdited: 'Mar 25',
    },
    {
        id: 3,
        name: 'Default Time tracking policy',
        description: 'Default policy for time tracking',
        feature: 'Time tracking submissions',
        status: 'Active',
        lastEdited: 'May 23',
    },
    {
        id: 4,
        name: 'Default Worker Resignation Approval ...',
        description: 'To be approved by user with Organization Ad...',
        feature: 'Worker Resignation',
        status: 'Active',
        lastEdited: 'Mar 14th 2025',
    },
    {
        id: 5,
        name: 'Payment items policy for 1 approvers',
        description: 'Approval policy for payment items requests su...',
        feature: "Contractors' submissions",
        status: 'Active',
        lastEdited: 'Nov 14th 2024',
    },
    {
        id: 6,
        name: 'Time off Direct Manager policy',
        description: 'Time off Direct Manager policy',
        feature: 'Time off',
        status: 'Active',
        lastEdited: 'May 23rd 2024',
    },
    {
        id: 7,
        name: 'Time off policy',
        description: 'Approval policy for all time off requests submit...',
        feature: 'Time off',
        status: 'Active',
        lastEdited: 'May 23rd 2024',
    },
    {
        id: 8,
        name: 'Workforce planning policy',
        description: 'Approval policy for workforce planning, new hir...',
        feature: 'Workforce planning',
        status: 'Active',
        lastEdited: 'Dec 9th 2024',
    },
]
