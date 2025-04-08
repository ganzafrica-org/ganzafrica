// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../db/client';
import { project_categories } from '../../db/schema';
import { z } from 'zod';

// Validation schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body as JSON
    const body = await request.json();
    console.log('Category request body:', body);
    
    // Validate input
    const validatedData = createCategorySchema.parse(body);
    
    // Insert category
    const [newCategory] = await db.insert(project_categories)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    console.log('New category created:', newCategory);
    
    if (!newCategory) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create category'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: { category: newCategory }
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all categories
    const categories = await db.query.project_categories.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}