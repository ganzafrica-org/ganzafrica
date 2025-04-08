import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../db/client';
import { project_categories } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Schema for project category validation
import { z } from 'zod';

export const createProjectCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const categories = await db.query.project_categories.findMany({
      orderBy: project_categories.name.asc()
    });

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get project categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve project categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body as JSON
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({
        success: false,
        message: 'Invalid request body: JSON parsing failed'
      }, { status: 400 });
    }

    // Validate input
    try {
      const validatedData = createProjectCategorySchema.parse(body);
      
      // Check if category already exists
      const existingCategory = await db.query.project_categories.findFirst({
        where: eq(project_categories.name, validatedData.name)
      });

      if (existingCategory) {
        return NextResponse.json({
          success: false,
          message: 'A category with this name already exists'
        }, { status: 409 });
      }

      // Insert new category
      const [newCategory] = await db.insert(project_categories)
        .values({
          name: validatedData.name,
          description: validatedData.description,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Project category created successfully',
        data: { category: newCategory }
      }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create project category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create project category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}