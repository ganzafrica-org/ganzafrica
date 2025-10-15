# Task Management System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Access Control](#user-access-control)
3. [System Architecture](#system-architecture)
4. [API Documentation](#api-documentation)
5. [Testing Guide](#testing-guide)
6. [Database Schema](#database-schema)
7. [Frontend Integration](#frontend-integration)

---

## Overview

The Task Management System is a comprehensive project and task tracking solution integrated into the Ganz Africa platform. It allows teams to:
- Create and manage teams with members
- Organize projects under teams
- Create, assign, and track tasks within projects
- Control access based on project membership and user roles

### Key Features
✅ Team-based organization
✅ Project management with member assignments
✅ Kanban board for task visualization
✅ Role-based access control
✅ Real-time task updates
✅ Comments and attachments support
✅ Task priority and status management

---

## User Access Control

### Authorization Model

The system implements a **two-tier access control** mechanism:

#### 1. **Project Membership Access**
Users can perform CRUD operations on tasks if they are assigned to that specific project.

**Implementation:**
```typescript
// Check if user is a project member
const [projectMember] = await db
  .select()
  .from(task_project_members)
  .where(
    and(
      eq(task_project_members.project_id, projectId),
      eq(task_project_members.user_id, userId)
    )
  )
  .limit(1);
```

#### 2. **Management Role Override**
Users with management roles (role_id < 1000) have universal access to all projects and tasks.

**Implementation:**
```typescript
// Check if user has management role
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

if (user && user.role_id && user.role_id < 1000) {
  return true; // Management access granted
}
```

### Access Control Matrix

| User Type | Create Task | View Task | Update Task | Delete Task | Comment |
|-----------|-------------|-----------|-------------|-------------|---------|
| **Project Member** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Management Role** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Non-Member** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Dashboard Access Settings

#### For Administrators:
1. **Global Access**: Management roles (role_id < 1000) can access all teams and projects
2. **Team Management**: Can create teams and assign any users
3. **Project Control**: Can modify any project settings
4. **Task Oversight**: Can view, edit, and delete any task

#### For Regular Users:
1. **Limited Access**: Only see projects they're assigned to
2. **Team Participation**: Can only work with assigned projects
3. **Task Management**: CRUD operations limited to their projects
4. **Cannot Access**: Other teams' projects unless explicitly added

### Security Features

1. **JWT Authentication**: All API endpoints require valid authentication token
2. **Per-Request Validation**: Authorization checked on every operation
3. **Database-Level Constraints**: Foreign key constraints ensure data integrity
4. **Transaction Safety**: Team/project creation uses database transactions

---

## System Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT + Cookie-based sessions

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Custom React components
- **State Management**: React hooks (useState, useEffect)

### Data Flow

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/HTTPS
       │ JWT Token
       ▼
┌─────────────┐
│   Backend   │
│  (Express)  │
├─────────────┤
│  Auth Check │ ◄── JWT Validation
├─────────────┤
│ Controllers │ ◄── Request Handling
├─────────────┤
│  Services   │ ◄── Business Logic + Authorization
├─────────────┤
│     ORM     │ ◄── Drizzle
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

---

## API Documentation

### Base URL
```
http://localhost:3002/api
```

### Authentication
All endpoints require authentication. Include JWT token in:
- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `token=<jwt_token>`

---

### Team Endpoints

#### `POST /task-teams`
Create a new team with members and projects.

**Request Body:**
```json
{
  "name": "Development Team",
  "description": "Core development team",
  "color": "#076297",
  "status": "active",
  "created_by": 1,
  "members": [
    {
      "user_id": 5,
      "name": "John Doe",
      "position": "Software Engineer"
    }
  ],
  "projects": [
    {
      "name": "Mobile App",
      "description": "iOS and Android development",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "color": "#10b981"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "message": "Task team created successfully",
  "team": {
    "id": 1,
    "name": "Development Team",
    "members": [...],
    "projects": [...]
  }
}
```

#### `GET /task-teams`
List all teams.

**Response:** `200 OK`
```json
{
  "teams": [
    {
      "id": 1,
      "name": "Development Team",
      "member_count": 5,
      "project_count": 3
    }
  ]
}
```

#### `GET /task-teams/:id`
Get team details with members and projects.

**Response:** `200 OK`

---

### Project Endpoints

#### `GET /task-teams/projects/:id`
Get project details.

#### `POST /task-teams/projects/:projectId/members`
Add member to project.

**Request Body:**
```json
{
  "user_id": 5,
  "role": "member"
}
```

#### `DELETE /task-teams/projects/:projectId/members/:userId`
Remove member from project.

---

### Task Endpoints

#### `POST /tasks`
Create a new task.

**Authorization**: Must be project member OR have management role.

**Request Body:**
```json
{
  "project_id": 1,
  "title": "Implement login feature",
  "description": "Create login page and authentication",
  "deliverables": "Working login page with tests",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-12-31T00:00:00Z",
  "assignees": [5, 7],
  "labels": [
    {"id": "1", "name": "Frontend", "color": "#3b82f6"}
  ],
  "created_by": 1
}
```

**Response:** `201 Created`

#### `GET /tasks/:id`
Get task details with assignees and comments.

**Authorization**: Must have access to task's project.

**Response:** `200 OK`
```json
{
  "task": {
    "id": 1,
    "title": "Implement login feature",
    "assignees": [
      {
        "user": {
          "id": 5,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "comments": [...]
  }
}
```

#### `GET /tasks/project/:projectId`
List all tasks in a project.

**Authorization**: Must have access to the project.

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Task 1",
      "status": "todo",
      "assignees": [5, 7]
    }
  ]
}
```

#### `PUT /tasks/:id`
Update task.

**Authorization**: Must have access to task's project.

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "status": "inprogress",
  "assignees": [5, 7, 9]
}
```

#### `DELETE /tasks/:id`
Delete task.

**Authorization**: Must have access to task's project.

**Response:** `200 OK`

#### `POST /tasks/:id/comments`
Add comment to task.

**Authorization**: Must have access to task's project.

**Request Body:**
```json
{
  "content": "Great progress on this task!"
}
```

**Response:** `201 Created`

---

## Testing Guide

### Prerequisites
1. Backend server running on `http://localhost:3002`
2. Frontend running on `http://localhost:3000` (or task app port)
3. PostgreSQL database configured
4. Valid user authentication

### Manual Testing Workflow

#### Test 1: Create Team with Members
1. Navigate to `/teams` in task management
2. Click "Add New Team"
3. Fill in team details:
   - Name: "QA Team"
   - Description: "Quality Assurance"
   - Color: Pick a color
4. Select team members from users list
5. Add a project
6. Click "Create Team"
7. **Expected**: Team appears in list with correct member count

#### Test 2: Add Project Members
1. Navigate to a team
2. Click on a project
3. Go to "Members" tab
4. Click "Add from Team" or "Add External"
5. Select users
6. Click "Add Selected"
7. **Expected**: Users appear in project members list

#### Test 3: Create Task (Authorization Test)
1. Navigate to project board
2. Click "+" on any column
3. Select a team from dropdown
4. **Expected**: Team members appear for selection
5. Fill in task details
6. Assign to team members
7. Click "Save Task"
8. **Expected**: Task appears on board

#### Test 4: Authorization - Non-Member Access
1. Log in as a user NOT in the project
2. Try to access project URL directly
3. **Expected**: Error 403 or empty task list
4. Try to create a task via API
5. **Expected**: Error 403 "You don't have permission"

#### Test 5: Management Role Override
1. Log in as user with management role (role_id < 1000)
2. Access any project (even if not a member)
3. **Expected**: Full access granted
4. Create/edit/delete tasks
5. **Expected**: All operations succeed

#### Test 6: Update Task Status (Drag & Drop)
1. On project board, drag a task to different column
2. **Expected**: Task moves and status updates in database
3. Refresh page
4. **Expected**: Task remains in new column

#### Test 7: Team Selection in Task Creation
1. Create new task
2. Select team from "Assign Team" dropdown
3. **Expected**: Only members from selected team appear
4. Change team selection
5. **Expected**: Assignee list clears, new team members appear

---

### API Testing with cURL

#### Create Task
```bash
curl -X POST http://localhost:3002/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "title": "Test Task",
    "status": "todo",
    "priority": "medium",
    "created_by": 1,
    "assignees": [5]
  }'
```

#### List Project Tasks
```bash
curl -X GET http://localhost:3002/api/tasks/project/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Task
```bash
curl -X PUT http://localhost:3002/api/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

---

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES task_team_projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverables TEXT,
  status VARCHAR(20) DEFAULT 'backlog',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  labels JSONB,
  attachments JSONB,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Task Assignees Table
```sql
CREATE TABLE task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);
```

### Task Comments Table
```sql
CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
- `tasks_project_id_idx` on `tasks(project_id)`
- `tasks_status_idx` on `tasks(status)`
- `tasks_priority_idx` on `tasks(priority)`
- `task_assignees_task_id_idx` on `task_assignees(task_id)`
- `task_comments_task_id_idx` on `task_comments(task_id)`

---

## Frontend Integration

### Task Modal - Team Selection Flow

1. **Open Task Modal** → Loads all teams from backend
2. **Select Team** → Fetches team members for that team
3. **Assign Members** → Only shows members from selected team
4. **Save Task** → Sends task with selected assignees to backend

### Component Structure

```
project/[projectId]/page.tsx
├── PageLayout
├── Project Overview
├── Tabs (Board, Members, Workload, Progress)
├── KanbanBoard
│   └── TaskCard (click to edit)
└── TaskModal
    ├── Team Selection (management mode)
    ├── Member Assignment
    ├── Task Details
    └── Comments & Attachments
```

### State Management

```typescript
// Main project state
const [tasks, setTasks] = useState<Task[]>([]);
const [team, setTeam] = useState<TaskTeam | null>(null);
const [project, setProject] = useState<TaskProject | null>(null);

// Load data on mount
useEffect(() => {
  loadProjectData();
  loadTasks();
}, [projectId]);

// Authorization is handled by backend
// Frontend only displays appropriate UI
```

---

## Error Handling

### Backend Error Responses

#### 401 Unauthorized
```json
{
  "error": "Authentication Error",
  "message": "Token not provided or invalid"
}
```

#### 403 Forbidden
```json
{
  "error": "Authorization Error",
  "message": "You don't have permission to access this project"
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

#### 500 Server Error
```json
{
  "error": "Server Error",
  "message": "Failed to create task"
}
```

### Frontend Error Handling

All errors are displayed in modal dialogs (no browser alerts):
```typescript
setErrorModal({
  isOpen: true,
  title: 'Error Creating Task',
  message: error.response?.data?.message || 'Failed to create task.'
});
```

---

## Best Practices

### For Developers

1. **Always Check Authorization**: Use `canAccessProject()` before any task operation
2. **Use Transactions**: Wrap multi-step operations in database transactions
3. **Validate Input**: Check required fields before database operations
4. **Handle Errors**: Return appropriate HTTP status codes
5. **Log Operations**: Use Logger for debugging and monitoring

### For Users

1. **Team Structure**: Organize users into teams before creating projects
2. **Project Members**: Add members to projects before assigning tasks
3. **Task Assignment**: Select team first, then assign from team members
4. **Status Updates**: Use drag-and-drop on Kanban board for quick updates
5. **Comments**: Use task comments for collaboration and updates

---

## Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] JWT secret set securely
- [ ] Database indexes created
- [ ] Backend server running
- [ ] Frontend build completed
- [ ] Authentication working
- [ ] Authorization rules tested
- [ ] Role IDs configured correctly (< 1000 for management)
- [ ] Test user accounts created
- [ ] Production error logging configured

---

## Support and Maintenance

### Common Issues

**Issue**: "You don't have permission to access this project"
- **Solution**: Ensure user is added to project members OR has management role

**Issue**: "No team members appear after selecting team"
- **Solution**: Verify team has members assigned in team management

**Issue**: Tasks not loading
- **Solution**: Check backend logs, verify user has project access

**Issue**: Cannot create task
- **Solution**: Ensure user is authenticated and has access to the project

---

## Version History

- **v1.0** - Initial release with team, project, and task management
- Features: CRUD operations, authorization, Kanban board, team selection

---

## Contact

For issues or questions, contact the development team or refer to the main project documentation.

