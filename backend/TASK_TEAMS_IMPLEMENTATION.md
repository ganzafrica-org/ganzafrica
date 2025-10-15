# Task Team Management Implementation

## Overview
This document describes the implementation of the Task Team Management system for the task management application. This system allows users to create teams, add members to teams, and create projects within teams.

## Database Schema

### Tables Created

#### 1. `task_teams`
Stores team information for task management.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200)) - Team name
- `description` (TEXT) - Team description
- `avatar_url` (VARCHAR(500)) - Team avatar/image URL
- `color` (VARCHAR(7)) - Hex color for UI
- `status` (task_team_status ENUM) - active, inactive, archived
- `created_by` (INTEGER) - Foreign key to users table
- `settings` (TEXT) - JSON settings
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. `task_team_members`
Stores team membership information.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `team_id` (INTEGER) - Foreign key to task_teams
- `user_id` (INTEGER) - Foreign key to users
- `role` (task_team_role ENUM) - owner, admin, member, viewer
- `is_active` (BOOLEAN)
- `joined_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Unique Constraint:** (team_id, user_id)

#### 3. `task_team_projects`
Stores projects within teams.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `team_id` (INTEGER) - Foreign key to task_teams
- `name` (VARCHAR(200)) - Project name
- `description` (TEXT) - Project description
- `status` (task_project_status ENUM) - planning, active, on_hold, completed, cancelled
- `start_date` (TIMESTAMP)
- `end_date` (TIMESTAMP)
- `color` (VARCHAR(7)) - Hex color for UI
- `created_by` (INTEGER) - Foreign key to users
- `settings` (TEXT) - JSON settings
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. `task_project_members`
Stores project membership information.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `project_id` (INTEGER) - Foreign key to task_team_projects
- `user_id` (INTEGER) - Foreign key to users
- `role` (task_team_role ENUM) - owner, admin, member, viewer
- `is_active` (BOOLEAN)
- `joined_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Unique Constraint:** (project_id, user_id)

### Enums Created

1. **task_team_role**: owner, admin, member, viewer
2. **task_team_status**: active, inactive, archived
3. **task_project_status**: planning, active, on_hold, completed, cancelled

## API Endpoints

### Task Teams

#### Create Task Team
```
POST /api/task-teams
Authorization: Bearer <token>

Body:
{
  "name": "Development Team",
  "description": "Main development team",
  "avatar_url": "https://example.com/avatar.png",
  "color": "#3B82F6",
  "status": "active",
  "created_by": 1,
  "settings": {
    "notifications": true,
    "default_view": "board"
  }
}
```

#### Get Task Team by ID
```
GET /api/task-teams/:id
Authorization: Bearer <token>
```

#### List Task Teams
```
GET /api/task-teams?status=active&created_by=1&user_id=2&search=dev&page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (active, inactive, archived)
- `created_by`: Filter by creator ID
- `user_id`: Filter teams where user is a member
- `search`: Search by name or description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

#### Update Task Team
```
PUT /api/task-teams/:id
Authorization: Bearer <token>

Body:
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "status": "active"
}
```

#### Delete Task Team
```
DELETE /api/task-teams/:id
Authorization: Bearer <token>
```

### Team Members

#### Add Team Member
```
POST /api/task-teams/:id/members
Authorization: Bearer <token>

Body:
{
  "user_id": 5,
  "role": "member"
}
```

#### Remove Team Member
```
DELETE /api/task-teams/:id/members/:userId
Authorization: Bearer <token>
```

#### Update Team Member Role
```
PATCH /api/task-teams/:id/members/:userId/role
Authorization: Bearer <token>

Body:
{
  "role": "admin"
}
```

### Task Projects

#### Create Task Project
```
POST /api/task-teams/:id/projects
Authorization: Bearer <token>

Body:
{
  "name": "New Feature",
  "description": "Implement new feature",
  "status": "planning",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "color": "#10B981",
  "created_by": 1
}
```

#### Get Task Project by ID
```
GET /api/task-teams/projects/:id
Authorization: Bearer <token>
```

#### List Team Projects
```
GET /api/task-teams/:id/projects?status=active&search=feature
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status
- `search`: Search by name or description

#### Update Task Project
```
PUT /api/task-teams/projects/:id
Authorization: Bearer <token>

Body:
{
  "name": "Updated Project Name",
  "status": "active"
}
```

#### Delete Task Project
```
DELETE /api/task-teams/projects/:id
Authorization: Bearer <token>
```

### Project Members

#### Add Project Member
```
POST /api/task-teams/projects/:id/members
Authorization: Bearer <token>

Body:
{
  "user_id": 7,
  "role": "member"
}
```

#### Remove Project Member
```
DELETE /api/task-teams/projects/:id/members/:userId
Authorization: Bearer <token>
```

## Running the Migration

### Prerequisites
- Node.js installed
- PostgreSQL database running
- Environment variables configured

### Steps

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies (if not already done):**
```bash
npm install
```

3. **Run the migration:**
```bash
npm run migrate
```

Or manually run the migration file:
```bash
npx ts-node src/db/migrations/08_create_task_teams.ts
```

### Verify Migration

After running the migration, you can verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'task_%';

-- Check if enums exist
SELECT typname 
FROM pg_type 
WHERE typname LIKE 'task_%';
```

## Swagger Documentation

The API documentation is available at:
```
http://localhost:YOUR_PORT/api/docs
```

All endpoints are documented with:
- Request/response schemas
- Authentication requirements
- Query parameters
- Example requests

## Usage Examples

### Example 1: Create a Team and Add Members

```javascript
// 1. Create a team
const teamResponse = await fetch('http://localhost:3000/api/task-teams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Frontend Team',
    description: 'Frontend development team',
    color: '#3B82F6',
    created_by: 1
  })
});

const team = await teamResponse.json();

// 2. Add members to the team
await fetch(`http://localhost:3000/api/task-teams/${team.team.id}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 2,
    role: 'admin'
  })
});

await fetch(`http://localhost:3000/api/task-teams/${team.team.id}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 3,
    role: 'member'
  })
});
```

### Example 2: Create a Project and Add Members

```javascript
// 1. Create a project
const projectResponse = await fetch(`http://localhost:3000/api/task-teams/${teamId}/projects`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'User Dashboard',
    description: 'Build new user dashboard',
    status: 'planning',
    created_by: 1
  })
});

const project = await projectResponse.json();

// 2. Add members to the project
await fetch(`http://localhost:3000/api/task-teams/projects/${project.project.id}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 4,
    role: 'member'
  })
});
```

### Example 3: Get All Teams for a User

```javascript
const response = await fetch(`http://localhost:3000/api/task-teams?user_id=${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { teams } = await response.json();
console.log('User teams:', teams);
```

## Files Created/Modified

### New Files Created:
1. `backend/src/db/schema/task-teams.ts` - Database schema definitions
2. `backend/src/services/task-team.service.ts` - Business logic
3. `backend/src/controllers/task-team.controller.ts` - API controllers
4. `backend/src/routes/task-teams.route.ts` - Route definitions
5. `backend/src/db/migrations/08_create_task_teams.ts` - Database migration
6. `backend/TASK_TEAMS_IMPLEMENTATION.md` - This documentation

### Modified Files:
1. `backend/src/db/schema/enums.ts` - Added task team enums
2. `backend/src/db/schema/index.ts` - Exported task-teams schema
3. `backend/src/routes/index.ts` - Registered task-teams routes

## Testing

### Using cURL

```bash
# Create a team
curl -X POST http://localhost:3000/api/task-teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Team",
    "description": "Test team description",
    "created_by": 1
  }'

# List teams
curl http://localhost:3000/api/task-teams \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get team by ID
curl http://localhost:3000/api/task-teams/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the Swagger documentation into Postman
2. Set up authentication (Bearer token)
3. Test all endpoints

## Notes

- All endpoints require authentication
- Team creators are automatically added as owners
- Cascade deletes are configured for related records
- Unique constraints prevent duplicate memberships
- All timestamps are automatically managed

## Future Enhancements

Potential future features:
- Team templates
- Bulk member operations
- Team statistics and analytics
- Team activity logs
- Team permissions and roles customization
- Integration with task boards
- Team notifications

## Support

For issues or questions, please refer to:
- Swagger documentation: `/api/docs`
- Backend code comments
- This documentation

