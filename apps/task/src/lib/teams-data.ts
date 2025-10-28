export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[]; // IDs of members in this team
  memberCount: number;
  projectCount: number;
  lead: string;
  projects?: string[]; // Optional array of project names
}

export const mockTeams: Team[] = [
  {
    id: 'agro',
    name: 'Agra Minagri',
    description: 'Agricultural and mining initiatives team',
    color: '#005C30',
    memberIds: ['am', 'bk', 'cm'],
    memberCount: 3,
    projectCount: 4,
    lead: 'John Doe',
    projects: ['Farm Development', 'Mining Survey', 'Crop Research', 'Equipment Procurement']
  },
  {
    id: 'it',
    name: 'IT Team',
    description: 'Technology infrastructure and development',
    color: '#073392',
    memberIds: ['me', 'bk', 'th'],
    memberCount: 3,
    projectCount: 6,
    lead: 'Sarah Johnson',
    projects: ['Website Redesign', 'Cloud Migration', 'Security Audit', 'Mobile App', 'API Development', 'Database Optimization']
  },
  {
    id: 'data',
    name: 'Data Team',
    description: 'Data analytics and business intelligence',
    color: '#2F88E1',
    memberIds: ['bk', 'cm', 'sb', 'jeannine', 'hermione', 'gentille'],
    memberCount: 6,
    projectCount: 3,
    lead: 'Mike Chen',
    projects: ['Sales Dashboard', 'Customer Analytics', 'Predictive Modeling']
  },
  {
    id: 'communication',
    name: 'Communication Team',
    description: 'Marketing and public relations',
    color: '#F8B712',
    memberIds: ['am', 'sb'],
    memberCount: 2,
    projectCount: 5,
    lead: 'Emma Wilson',
    projects: ['Social Media Campaign', 'Brand Strategy', 'Press Release', 'Content Marketing', 'Event Planning']
  },
  {
    id: 'finance',
    name: 'Finance Team',
    description: 'Financial planning and accounting',
    color: '#009758',
    memberIds: ['cm', 'th'],
    memberCount: 2,
    projectCount: 2,
    lead: 'David Brown',
    projects: ['Budget Planning 2025', 'Expense Reporting System']
  },
  {
    id: 'operations',
    name: 'Operations Team',
    description: 'Business operations and logistics',
    color: '#D42B1D',
    memberIds: ['me', 'am', 'sb'],
    memberCount: 3,
    projectCount: 4,
    lead: 'Lisa Garcia',
    projects: ['Supply Chain Optimization', 'Warehouse Management', 'Logistics Planning', 'Vendor Relations']
  }
];



