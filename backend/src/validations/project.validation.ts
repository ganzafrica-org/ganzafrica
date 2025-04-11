import { z } from "zod";

// Base project status validation
const projectStatusEnum = z.enum(["planned", "active", "completed"]);

// Project member role validation
const projectMemberRoleEnum = z.enum(["lead", "member", "supervisor"]);

// Project member validation
const projectMemberSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  role: projectMemberRoleEnum,
  start_date: z.string().transform((val) => new Date(val)),
  end_date: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
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
    created_by: z.string().min(1, "Creator ID is required"),
    members: z.array(projectMemberSchema).optional(),
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
    created_by: z.string().optional(),
    member_id: z.string().optional(),
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
    userId: z.string().min(1, "User ID is required"),
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
        created_by: z.string().min(1, "Creator ID is required"),
        members: z.array(projectMemberSchema).optional(),
      }),
    )
    .min(1, "At least one project is required"),
});
