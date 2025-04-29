import { z } from "zod";

// Base project status validation
const projectStatusEnum = z.enum(["planned", "active", "completed", "cancelled", "on_hold"]);

// Project member role validation
const projectMemberRoleEnum = z.enum(["lead", "member", "supervisor", "contributor"]);

// Media tag validation
const mediaTagEnum = z.enum(["feature", "description", "others"]);

// Project media item validation
const mediaItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: z.enum(["image", "video"]),
  url: z.string().min(1, "URL is required"),
  cover: z.boolean().default(false),
  tag: mediaTagEnum.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  size: z.number().optional(),
  duration: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  order: z.number().optional(),
});

// Project goal item validation
const goalItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  completed: z.boolean().optional(),
  order: z.number().optional(),
});

// Project outcome item validation
const outcomeItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().optional(),
  order: z.number().optional(),
});

// Project member validation - Changed from user_id to team_id
const projectMemberSchema = z.object({
  team_id: z.number().int().positive("Team ID is required"),
  role: projectMemberRoleEnum,
  start_date: z.string().transform((val) => new Date(val)),
  end_date: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

// Project partner validation
const projectPartnerSchema = z.object({
  partner_id: z.number().int().positive("Partner ID is required"),
});

// Project document validation
const projectDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  file_url: z.string().min(1, "File URL is required"),
  file_size: z.number().optional(),
});

// Create project validation
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    status: projectStatusEnum,
    start_date: z.string().transform((val) => new Date(val)),
    end_date: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    category_id: z.number().int().positive("Category ID is required"),
    partner_id: z.number().int().positive().optional(),
    location: z.string().optional(),
    impacted_people: z.number().int().optional(),
    
    // New fields
    goals: z.object({
      items: z.array(goalItemSchema)
    }).optional(),
    
    outcomes: z.object({
      items: z.array(outcomeItemSchema)
    }).optional(),
    
    media: z.object({
      items: z.array(mediaItemSchema)
    }).optional(),
    
    other_information: z.record(z.any()).optional(),
    
    members: z.array(projectMemberSchema).optional(),
    partners: z.array(projectPartnerSchema).optional(),
    documents: z.array(projectDocumentSchema).optional(),
  }),
});

// Update project validation
export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    status: projectStatusEnum.optional(),
    start_date: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    end_date: z
      .string()
      .transform((val) => new Date(val))
      .optional()
      .nullable(),
    category_id: z.number().int().positive().optional(),
    partner_id: z.number().int().positive().optional(),
    location: z.string().optional(),
    impacted_people: z.number().int().optional(),
    
    // New fields
    goals: z.object({
      items: z.array(goalItemSchema)
    }).optional(),
    
    outcomes: z.object({
      items: z.array(outcomeItemSchema)
    }).optional(),
    
    media: z.object({
      items: z.array(mediaItemSchema)
    }).optional(),
    
    other_information: z.record(z.any()).optional(),
  }),
});

// Get project by ID validation
export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
});

// Delete project validation
export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
});

// List projects validation
export const listProjectsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    sort_by: z.string().optional(),
    sort_order: z.enum(["asc", "desc"]).optional(),
    status: z.string().optional(),
    team_id: z.string().optional(), // Changed from member_id to team_id
    category_id: z.string().optional(),
    partner_id: z.string().optional(), // Added partner_id
  }),
});

// Add project member validation
export const addProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
  body: projectMemberSchema,
});

// Remove project member validation
export const removeProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
    userId: z.string().min(1, "Team ID is required"), // Changed parameter name description
  }),
});

// Import projects validation
export const importProjectsSchema = z.object({
  body: z
    .array(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().optional(),
        status: projectStatusEnum,
        start_date: z.string().transform((val) => new Date(val)),
        end_date: z
          .string()
          .transform((val) => new Date(val))
          .optional(),
        category_id: z.number().int().positive("Category ID is required"),
        partner_id: z.number().int().positive().optional(),
        location: z.string().optional(),
        impacted_people: z.number().int().optional(),
        
        // New fields
        goals: z.object({
          items: z.array(goalItemSchema)
        }).optional(),
        
        outcomes: z.object({
          items: z.array(outcomeItemSchema)
        }).optional(),
        
        media: z.object({
          items: z.array(mediaItemSchema)
        }).optional(),
        
        other_information: z.record(z.any()).optional(),
        
        members: z.array(projectMemberSchema).optional(),
        partners: z.array(projectPartnerSchema).optional(),
        documents: z.array(projectDocumentSchema).optional(),
      }),
    )
    .min(1, "At least one project is required"),
});