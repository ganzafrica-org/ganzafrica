# Quick Start: Task Teams

## 🚀 Quick Setup

### 1. Run the Migration
```bash
cd backend
npm run migrate
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Access Swagger Docs
```
http://localhost:YOUR_PORT/api/docs
```

## 📋 Common Operations

### Create a Team
```bash
POST /api/task-teams
{
  "name": "My Team",
  "created_by": 1
}
```

### Add Member to Team
```bash
POST /api/task-teams/{teamId}/members
{
  "user_id": 2,
  "role": "member"
}
```

### Create Project in Team
```bash
POST /api/task-teams/{teamId}/projects
{
  "name": "My Project",
  "created_by": 1
}
```

### Get All Teams
```bash
GET /api/task-teams
```

### Get Team Details
```bash
GET /api/task-teams/{teamId}
```

## 🎯 Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/task-teams` | POST | Create team |
| `/api/task-teams` | GET | List teams |
| `/api/task-teams/:id` | GET | Get team |
| `/api/task-teams/:id` | PUT | Update team |
| `/api/task-teams/:id` | DELETE | Delete team |
| `/api/task-teams/:id/members` | POST | Add member |
| `/api/task-teams/:id/members/:userId` | DELETE | Remove member |
| `/api/task-teams/:id/projects` | POST | Create project |
| `/api/task-teams/:id/projects` | GET | List projects |

## 📊 Database Tables

- `task_teams` - Teams
- `task_team_members` - Team membership
- `task_team_projects` - Projects
- `task_project_members` - Project membership

## 🔐 Roles

- **owner** - Full control
- **admin** - Manage members
- **member** - Regular access
- **viewer** - Read-only

## 📚 Full Documentation

See `TASK_TEAMS_IMPLEMENTATION.md` for complete details.

