import { db } from '../client';
import { applications } from '../schema/opportunities';
import { sql } from 'drizzle-orm';

export async function fixOpportunityCascadeDelete() {
  try {
    console.log('Starting migration: Fix opportunity cascade delete...');
    
    // Drop the existing foreign key constraint
    await db.execute(sql`
      ALTER TABLE applications 
      DROP CONSTRAINT IF EXISTS applications_opportunity_id_fkey
    `);
    
    // Add the new foreign key constraint with CASCADE DELETE
    await db.execute(sql`
      ALTER TABLE applications 
      ADD CONSTRAINT applications_opportunity_id_fkey 
      FOREIGN KEY (opportunity_id) 
      REFERENCES opportunities(id) 
      ON DELETE CASCADE
    `);
    
    console.log('Migration completed: Opportunity cascade delete fixed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  fixOpportunityCascadeDelete()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
