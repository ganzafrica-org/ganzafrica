// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { projects, project_members } from '@/db/schema';
import { createProjectSchema } from '@/modules/project/project';

export async function POST(request: NextRequest) {
  try {
    const userId = 1; // Temporary hardcoded user ID for testing
    const body = await request.json();

    console.log('Request body:', body);

    // Validate input
    const validatedData = createProjectSchema.parse(body);

    console.log('Validated data:', validatedData);

    // Insert project
    const [newProject] = await db.insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        status: validatedData.status,
        category_id: validatedData.category_id || null,
        location: validatedData.location || null,
        impacted_people: validatedData.impacted_people || null,
        media: validatedData.cover_image ? JSON.stringify({
          url: validatedData.cover_image,
          type: "image",
          cover: true
        }) : null,
        start_date: new Date(validatedData.start_date),
        end_date: validatedData.end_date ? new Date(validatedData.end_date) : null,
        budget: validatedData.budget || null,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    console.log('New project created:', newProject);

    if (!newProject) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Always add the team lead first (if provided)
    if (validatedData.team_lead) {
      await db.insert(project_members)
        .values({
          project_id: newProject.id,
          user_id: Number(validatedData.team_lead),
          role: 'lead',
          start_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
      
      console.log('Team lead added:', validatedData.team_lead);
    } else {
      // If no team lead provided, add creator as project lead
      await db.insert(project_members)
        .values({
          project_id: newProject.id,
          user_id: userId,
          role: 'lead',
          start_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
      
      console.log('Creator added as team lead:', userId);
    }

    // Add other team members if provided
    if (validatedData.team_members && validatedData.team_members.length > 0) {
      const teamMembersToAdd: number[] = validatedData.team_members.filter(
        (memberId: number) => 
          // Remove team lead from regular members if it was included
          !validatedData.team_lead || Number(memberId) !== Number(validatedData.team_lead)
      );
      
      for (const memberId of teamMembersToAdd) {
        await db.insert(project_members)
          .values({
            project_id: newProject.id,
            user_id: Number(memberId),
            role: 'member',
            start_date: new Date(),
            created_at: new Date(), 
            updated_at: new Date()
          });
        
        console.log('Team member added:', memberId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: { project: newProject }
    }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all projects
    const allProjects = await db.query.projects.findMany({
      orderBy: { created_at: 'desc' },
      with: {
        category: true,
        members: {
          with: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: allProjects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}