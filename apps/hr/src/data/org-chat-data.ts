export interface EmployeeNode {
    name: string
    role: string
    avatar?: string
}

export const orgData = [
    {
        label: 'CEO',
        expanded: true,
        data: { name: 'Dr. Kwame Ganz', role: 'CEO', avatar: 'KG' },
        children: [
            {
                label: 'HR Director',
                expanded: true,
                data: { name: 'Sarah Uwimana', role: 'HR Director', avatar: 'SU' },
                children: [
                    {
                        label: 'HR Manager',
                        data: { name: 'Jean Baptiste Mukamana', role: 'HR Manager', avatar: 'JBM' }
                    },
                    {
                        label: 'Recruitment Lead',
                        data: { name: 'Marie Claire Nsengimana', role: 'Recruitment Lead', avatar: 'MCN' }
                    }
                ]
            },
            {
                label: 'Agriculture Director',
                expanded: true,
                data: { name: 'David Nshimiyimana', role: 'Agriculture Director', avatar: 'DN' },
                children: [
                    {
                        label: 'Field Coordinator',
                        data: { name: 'Grace Mukamana', role: 'Field Coordinator', avatar: 'GM' }
                    },
                    {
                        label: 'Research Lead',
                        data: { name: 'Emmanuel Nshimiyimana', role: 'Research Lead', avatar: 'EN' }
                    }
                ]
            },
            {
                label: 'Finance Director',
                data: { name: 'Alice Mutoni', role: 'Finance Director', avatar: 'AM' }
            }
        ]
    }
]
