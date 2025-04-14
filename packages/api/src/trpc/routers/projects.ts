// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db/client";
import { projects, project_members } from "../../db/schema";
import { createProjectSchema } from "../../modules/project/project";

export async function POST(request: NextRequest) {
  try {
    const userId = 1; // Temporary hardcoded user ID for testing
    const body = await request.json();

    // Validate input
    const validatedData = createProjectSchema.parse(body);

    // Insert project - make sure the object matches your schema exactly
    const [newProject] = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        status: validatedData.status,
        category_id: validatedData.category_id || null,
        location: validatedData.location || null,
        impacted_people: validatedData.impacted_people || null,
        media: validatedData.cover_image
          ? {
              url: validatedData.cover_image,
              type: "image",
              cover: true,
            }
          : null,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date || null,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    if (!newProject) {
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 },
      );
    }

    // Add creator as project lead - ensure all fields match your schema
    await db.insert(project_members).values({
      project_id: newProject.id,
      user_id: userId,
      role: "lead", // This should be one of the enum values: 'lead', 'member', or 'supervisor'
      start_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Add team members if provided
    if (validatedData.team_members && validatedData.team_members.length > 0) {
      // Create separate team member records with proper typing
      for (const memberId of validatedData.team_members) {
        await db.insert(project_members).values({
          project_id: newProject.id,
          user_id: Number(memberId),
          role: "member", // Using an explicit role from your enum
          start_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: { project: newProject },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Fetch all projects
    const allProjects = await db.query.projects.findMany({
      orderBy: { created_at: "desc" },
      with: {
        category: true,
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: allProjects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve projects",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
