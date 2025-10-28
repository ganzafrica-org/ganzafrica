import { z } from "zod";

// Base project status validation
const projectStatusEnum = z.enum(["planned", "active", "completed", "cancelled", "on_hold", "overdue"]);

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

// File validation schema for middleware
export const fileValidationSchema = z.object({
  fieldname: z.string(),
  originalname: z.string().min(1, "Original filename is required"),
  encoding: z.string(),
  mimetype: z.string().refine(
    (mime) => 
      // List of allowed mime types
      [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'text/plain',
        'text/csv'
      ].includes(mime),
    {
      message: "Unsupported file type. Only PDF, Word, Excel, PowerPoint, images, and text files are allowed."
    }
  ),
  size: z.number().max(10 * 1024 * 1024, "File size must be less than 10MB"),
  buffer: z.instanceof(Buffer).optional(),
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

// Create project validation - updated to handle files
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
    
    // These fields might be strings in multipart/form-data
    goals: z.union([
      z.object({
        items: z.array(goalItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for goals");
        }
      })
    ]).optional(),
    
    outcomes: z.union([
      z.object({
        items: z.array(outcomeItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for outcomes");
        }
      })
    ]).optional(),
    
    media: z.union([
      z.object({
        items: z.array(mediaItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for media");
        }
      })
    ]).optional(),
    
    other_information: z.union([
      z.record(z.any()),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for other_information");
        }
      })
    ]).optional(),
    
    members: z.union([
      z.array(projectMemberSchema),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for members");
        }
      })
    ]).optional(),
    
    partners: z.union([
      z.array(projectPartnerSchema),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for partners");
        }
      })
    ]).optional(),
    
    documents: z.array(projectDocumentSchema).optional(),
  }),
  files: z.array(fileValidationSchema).optional(),
});

// Update project validation - updated to handle files
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
    
    // These fields might be strings in multipart/form-data
    goals: z.union([
      z.object({
        items: z.array(goalItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for goals");
        }
      })
    ]).optional(),
    
    outcomes: z.union([
      z.object({
        items: z.array(outcomeItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for outcomes");
        }
      })
    ]).optional(),
    
    media: z.union([
      z.object({
        items: z.array(mediaItemSchema)
      }),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for media");
        }
      })
    ]).optional(),
    
    other_information: z.union([
      z.record(z.any()),
      z.string().transform(val => {
        try {
          return JSON.parse(val);
        } catch (e) {
          throw new Error("Invalid JSON for other_information");
        }
      })
    ]).optional(),
  }),
  files: z.array(fileValidationSchema).optional(),
});

// Rest of the validation schemas remain the same
export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Project ID is required"),
  }),
});

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