# 📋 Comprehensive API Documentation for Frontend Development

**NestJS Project Management API**  
*Complete Reference for Building Frontend Applications*

---

## 🔗 **Base URL & General Information**

- **Base URL**: `http://localhost:3000`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token
- **Interactive Docs**: `http://localhost:3000/api/docs` (Swagger UI)

---

## 🔐 **Authentication & Authorization**

### **Authentication Flow**
1. Register/Login → Receive JWT token
2. Include token in `Authorization: Bearer <token>` header for protected endpoints
3. Token expires after 24 hours

### **Role-Based Access Control**
- **OWNER**: Full project control (create, update, delete, invite, manage)
- **CONTRIBUTOR**: Can create/edit tasks, view project, manage tags
- **VIEWER**: Read-only access to project and tasks
- **NON-MEMBER**: No access to project content

---

## 📚 **API Endpoints**

### 🔐 **Authentication Endpoints**

#### **POST /auth/signup**
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Request Schema (SignupDto):**
- `name` (string, required): User full name (2-50 characters)
- `email` (string, required): Valid email address (case insensitive, auto-trimmed)
- `password` (string, required): Password (6-100 chars, must contain uppercase, lowercase, and number)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-05-31T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email already registered

---

#### **POST /auth/login**
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Request Schema (LoginDto):**
- `email` (string, required): User email address
- `password` (string, required): User password

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid credentials

---

### 👤 **User Endpoints**

#### **GET /users/me**
Get current authenticated user profile.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Success Response (200):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "updatedAt": "2025-05-31T10:30:00.000Z"
}
```

**Error Responses:**
- `401`: Invalid or missing token

---

### 📂 **Project Endpoints**

#### **POST /projects**
Create a new project (user becomes owner).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "A modern e-commerce platform built with NestJS and React"
}
```

**Request Schema (CreateProjectDto):**
- `name` (string, required): Project name (3-100 characters, auto-trimmed)
- `description` (string, required): Project description (10-500 characters, auto-trimmed)

**Success Response (201):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "name": "E-commerce Platform",
  "description": "A modern e-commerce platform built with NestJS and React",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "owner": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h2",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "userRole": "OWNER",
  "memberCount": 1
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized

---

#### **GET /projects**
Get all projects for authenticated user.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Success Response (200):**
```json
[
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "E-commerce Platform",
    "description": "Modern e-commerce solution",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "owner": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h2",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "userRole": "OWNER",
    "memberCount": 3
  }
]
```

**Error Responses:**
- `401`: Unauthorized

---

#### **GET /projects/paginated**
Get paginated projects with filtering and sorting.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters (PaginationQueryDto):**
- `page` (number, optional): Page number (1-based, default: 1)
- `limit` (number, optional): Items per page (1-100, default: 10)
- `sort` (string, optional): Sort field (`name` | `createdAt` | `memberCount`, default: `createdAt`)
- `order` (string, optional): Sort order (`asc` | `desc`, default: `desc`)
- `search` (string, optional): Search term for name/description
- `tags` (string, optional): Comma-separated tag names filter

**Example Request:**
```
GET /projects/paginated?page=1&limit=10&sort=createdAt&order=desc&search=ecommerce&tags=web,api
```

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "clx1y2z3a4b5c6d7e8f9g0h1",
      "name": "E-commerce Platform",
      "description": "Modern e-commerce solution",
      "createdAt": "2025-05-31T10:30:00.000Z",
      "owner": {
        "id": "clx1y2z3a4b5c6d7e8f9g0h2",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "userRole": "OWNER",
      "memberCount": 3
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error Responses:**
- `401`: Unauthorized

---

#### **GET /projects/:id**
Get specific project details.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Success Response (200):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "name": "E-commerce Platform",
  "description": "Modern e-commerce solution",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "owner": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h2",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "userRole": "CONTRIBUTOR",
  "memberCount": 5
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Not a project member
- `404`: Project not found

---

#### **PATCH /projects/:id**
Update project details (OWNER only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Request Body:**
```json
{
  "name": "Updated E-commerce Platform",
  "description": "Updated modern e-commerce solution with new features"
}
```

**Request Schema (UpdateProjectDto):**
- `name` (string, optional): Project name (3-100 characters)
- `description` (string, optional): Project description (10-500 characters)

**Success Response (200):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "name": "Updated E-commerce Platform",
  "description": "Updated modern e-commerce solution with new features",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "owner": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h2",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "userRole": "OWNER",
  "memberCount": 5
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `403`: Only owner can update
- `404`: Project not found

---

#### **DELETE /projects/:id**
Delete project permanently (OWNER only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Success Response (200):**
```json
{
  "message": "Project \"E-commerce Platform\" deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Only owner can delete
- `404`: Project not found

---

#### **POST /projects/:id/invite**
Invite user to project (OWNER only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "role": "CONTRIBUTOR"
}
```

**Request Schema (InviteUserDto):**
- `email` (string, required): Valid email address of user to invite
- `role` (enum, required): Role to assign (`OWNER` | `CONTRIBUTOR` | `VIEWER`)

**Success Response (201):**
```json
{
  "message": "User invited successfully",
  "invitation": {
    "email": "jane.doe@example.com",
    "role": "CONTRIBUTOR"
  }
}
```

**Error Responses:**
- `400`: Validation failed or user already member
- `401`: Unauthorized
- `403`: Only owner can invite
- `404`: Project or user not found

---

#### **GET /projects/:id/members**
Get project members list.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Success Response (200):**
```json
[
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h2",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "OWNER",
    "joinedAt": "2025-05-31T10:30:00.000Z"
  },
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h3",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "CONTRIBUTOR",
    "joinedAt": "2025-06-01T14:15:00.000Z"
  }
]
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Not a project member
- `404`: Project not found

---

#### **POST /projects/:id/tags**
Add tags to project (OWNER, CONTRIBUTOR only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Request Body:**
```json
{
  "tagIds": [
    "clx1tag123456789abcdef",
    "clx2tag987654321fedcba"
  ]
}
```

**Request Schema (AddTagsToProjectDto):**
- `tagIds` (array, required): Array of existing tag IDs (minimum 1 item, unique items)

**Success Response (200):**
```json
{
  "id": "clx1y2z3a4b5c6d7e8f9g0h1",
  "name": "E-commerce Platform",
  "description": "Modern e-commerce solution",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "owner": {
    "id": "clx1y2z3a4b5c6d7e8f9g0h2",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "projectTags": [
    {
      "projectId": "clx1y2z3a4b5c6d7e8f9g0h1",
      "tagId": "clx1tag123456789abcdef",
      "tag": {
        "id": "clx1tag123456789abcdef",
        "name": "frontend",
        "color": "#3B82F6",
        "description": "Frontend development tasks"
      }
    }
  ],
  "_count": {
    "memberships": 3
  }
}
```

**Error Responses:**
- `400`: Invalid tag IDs or validation failed
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Project or tags not found

---

#### **GET /projects/:id/tags**
Get all tags associated with a project.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID

**Success Response (200):**
```json
[
  {
    "id": "clx1tag123456789abcdef",
    "name": "frontend",
    "color": "#3B82F6",
    "description": "Frontend development tasks",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "createdBy": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Not a project member
- `404`: Project not found

---

#### **DELETE /projects/:id/tags/:tagId**
Remove tag from project (OWNER, CONTRIBUTOR only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID
- `tagId` (string, required): Tag ID to remove

**Success Response (204):**
No content

**Error Responses:**
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Project or tag not found

---

### 📋 **Task Endpoints**

#### **POST /projects/:projectId/tasks**
Create a new task in project (OWNER, CONTRIBUTOR only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `projectId` (string, required): Project ID

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Create JWT-based authentication system with login and signup",
  "status": "TODO",
  "assignedToId": "clx1y2z3a4b5c6d7e8f9g0h2"
}
```

**Request Schema (CreateTaskDto):**
- `title` (string, required): Task title (3-100 characters)
- `description` (string, required): Task description (5-500 characters)
- `status` (enum, optional): Task status (`TODO` | `DOING` | `DONE`, default: `TODO`)
- `assignedToId` (string, optional): User ID to assign (must be project member)

**Success Response (201):**
```json
{
  "id": "clx1task456789abcdef012",
  "title": "Implement user authentication",
  "description": "Create JWT-based authentication system with login and signup",
  "status": "TODO",
  "projectId": "clx1y2z3a4b5c6d7e8f9g0h1",
  "assignedToId": "clx1y2z3a4b5c6d7e8f9g0h2",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "updatedAt": "2025-05-31T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Project not found

---

#### **GET /projects/:projectId/tasks**
Get all tasks for a project (project members only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `projectId` (string, required): Project ID

**Success Response (200):**
```json
[
  {
    "id": "clx1task456789abcdef012",
    "title": "Implement user authentication",
    "description": "Create JWT-based authentication system",
    "status": "DOING",
    "projectId": "clx1y2z3a4b5c6d7e8f9g0h1",
    "assignedToId": "clx1y2z3a4b5c6d7e8f9g0h2",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "updatedAt": "2025-06-01T15:20:00.000Z"
  }
]
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Not a project member
- `404`: Project not found

---

#### **PATCH /tasks/:id**
Update task (OWNER, CONTRIBUTOR only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Task ID

**Request Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "DOING",
  "assignedToId": "clx1y2z3a4b5c6d7e8f9g0h3"
}
```

**Request Schema (UpdateTaskDto):**
- `title` (string, optional): Task title (3-100 characters)
- `description` (string, optional): Task description (5-500 characters)
- `status` (enum, optional): Task status (`TODO` | `DOING` | `DONE`)
- `assignedToId` (string, optional): User ID to assign (must be project member)

**Success Response (200):**
```json
{
  "id": "clx1task456789abcdef012",
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "DOING",
  "projectId": "clx1y2z3a4b5c6d7e8f9g0h1",
  "assignedToId": "clx1y2z3a4b5c6d7e8f9g0h3",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "updatedAt": "2025-06-01T16:45:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Task not found

---

#### **DELETE /tasks/:id**
Delete task (OWNER, CONTRIBUTOR only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Task ID

**Success Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Insufficient permissions
- `404`: Task not found

---

### 🏷️ **Tag Endpoints**

#### **POST /tags**
Create a new tag.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "name": "urgent",
  "color": "#ff4444",
  "description": "Use for high-priority tasks that need immediate attention"
}
```

**Request Schema (CreateTagDto):**
- `name` (string, required): Tag name (1-50 characters, must be unique)
- `color` (string, optional): Hex color code (default: `#6366f1`)
- `description` (string, optional): Tag description (max 200 characters)

**Success Response (201):**
```json
{
  "id": "clx1tag123456789abcdef",
  "name": "urgent",
  "color": "#ff4444",
  "description": "Use for high-priority tasks that need immediate attention",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "createdBy": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400`: Tag name already exists or validation failed
- `401`: Unauthorized

---

#### **GET /tags**
Get all available tags (sorted by usage).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Success Response (200):**
```json
[
  {
    "id": "clx1tag123456789abcdef",
    "name": "urgent",
    "color": "#ff4444",
    "description": "Use for high-priority tasks",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "createdBy": {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

**Error Responses:**
- `401`: Unauthorized

---

#### **GET /tags/:id**
Get specific tag by ID.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Tag ID

**Success Response (200):**
```json
{
  "id": "clx1tag123456789abcdef",
  "name": "urgent",
  "color": "#ff4444",
  "description": "Use for high-priority tasks",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "createdBy": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Tag not found

---

#### **PATCH /tags/:id**
Update tag (creator only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Tag ID

**Request Body:**
```json
{
  "name": "high-priority",
  "color": "#ee4444",
  "description": "Updated description for high-priority tasks"
}
```

**Request Schema (UpdateTagDto):**
- `name` (string, optional): Tag name (1-50 characters)
- `color` (string, optional): Hex color code
- `description` (string, optional): Tag description (max 200 characters)

**Success Response (200):**
```json
{
  "id": "clx1tag123456789abcdef",
  "name": "high-priority",
  "color": "#ee4444",
  "description": "Updated description for high-priority tasks",
  "createdAt": "2025-05-31T10:30:00.000Z",
  "createdBy": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400`: Tag name already exists or validation failed
- `401`: Unauthorized
- `403`: Only creator can update
- `404`: Tag not found

---

#### **DELETE /tags/:id**
Delete tag (creator only).

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Tag ID

**Success Response (204):**
No content

**Error Responses:**
- `401`: Unauthorized
- `403`: Only creator can delete
- `404`: Tag not found

---

### 🤖 **AI Feature Endpoints**

#### **POST /ai/suggest-tags**
Get AI-powered tag suggestions for content.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "content": "Build a responsive landing page with React components and TypeScript",
  "projectId": "clx1y2z3a4b5c6d7e8f9g0h1"
}
```

**Request Schema (SuggestTagsDto):**
- `content` (string, required): Content to analyze for tag suggestions
- `projectId` (string, optional): Project ID for context-aware suggestions

**Success Response (200):**
```json
{
  "suggestions": ["frontend", "react", "typescript", "ui/ux", "responsive"],
  "confidence": 0.85
}
```

**Error Responses:**
- `400`: AI features not available or invalid input
- `401`: Unauthorized

---

#### **GET /ai/analyze-project/:id**
Get AI-powered project analysis and insights.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID to analyze

**Success Response (200):**
```json
{
  "healthScore": 78,
  "riskFactors": [
    "High number of overdue tasks",
    "Limited team size for project scope",
    "Complex dependencies between tasks"
  ],
  "recommendations": [
    "Consider breaking down large tasks into smaller chunks",
    "Prioritize fixing overdue tasks",
    "Add more team members or extend timeline",
    "Implement better task dependency management"
  ],
  "predictedCompletionDate": "2025-08-15",
  "bottlenecks": [
    "Frontend development tasks waiting for design approval",
    "Backend API development blocking frontend integration"
  ]
}
```

**Error Responses:**
- `400`: AI features not available or analysis failed
- `401`: Unauthorized
- `404`: Project not found

---

#### **GET /ai/project-summary/:id**
Generate AI-powered project summary.

**Headers Required:**
- `Authorization: Bearer <jwt_token>`

**Path Parameters:**
- `id` (string, required): Project ID to summarize

**Success Response (200):**
```json
{
  "summary": "E-commerce Platform is a modern web application focused on building a scalable online retail solution. The project utilizes React for frontend development and Node.js for backend services, with current progress showing 15 completed tasks and active development in authentication and payment systems.",
  "keyInsights": [
    "Strong technical foundation with modern tech stack",
    "Well-organized task structure and clear milestones",
    "Active development momentum with regular updates"
  ]
}
```

**Error Responses:**
- `400`: AI features not available or summary generation failed
- `401`: Unauthorized
- `404`: Project not found

---

## 📊 **Data Schemas & Types**

### **Enums**

#### **Role**
```typescript
enum Role {
  OWNER = "OWNER",
  CONTRIBUTOR = "CONTRIBUTOR",
  VIEWER = "VIEWER"
}
```

#### **TaskStatus**
```typescript
enum TaskStatus {
  TODO = "TODO",
  DOING = "DOING", 
  DONE = "DONE"
}
```

### **Core DTOs**

#### **User Response**
```typescript
{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Project Response (ProjectResponseDto)**
```typescript
{
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  userRole: Role;
  memberCount: number;
  tags?: {
    id: string;
    name: string;
    color: string;
    description?: string | null;
  }[];
}
```

#### **Task Response (TaskResponseDto)**
```typescript
{
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tag Response (TagResponseDto)**
```typescript
{
  id: string;
  name: string;
  color: string;
  description?: string | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}
```

#### **Pagination Metadata (PaginationMetaDto)**
```typescript
{
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

#### **Paginated Response Structure**
```typescript
{
  data: T[];
  meta: PaginationMetaDto;
}
```

---

## 🛡️ **Role-Based Permissions Matrix**

| **Operation** | **Endpoint** | **👑 Owner** | **👨‍💻 Contributor** | **👁️ Viewer** | **🚫 Non-Member** |
|---------------|--------------|:------------:|:-------------------:|:--------------:|:-----------------:|
| **🔓 Authentication** |
| Sign Up | `POST /auth/signup` | ✅ | ✅ | ✅ | ✅ |
| Login | `POST /auth/login` | ✅ | ✅ | ✅ | ✅ |
| Get Profile | `GET /users/me` | ✅ | ✅ | ✅ | ❌ |
| **📂 Project Management** |
| Create Project | `POST /projects` | ✅ | ✅ | ✅ | ❌ |
| List My Projects | `GET /projects` | ✅ | ✅ | ✅ | ❌ |
| View Project Details | `GET /projects/:id` | ✅ | ✅ | ✅ | ❌ |
| Update Project | `PATCH /projects/:id` | ✅ | ❌ | ❌ | ❌ |
| Delete Project | `DELETE /projects/:id` | ✅ | ❌ | ❌ | ❌ |
| **👥 Team Management** |
| Invite Users | `POST /projects/:id/invite` | ✅ | ❌ | ❌ | ❌ |
| View Members | `GET /projects/:id/members` | ✅ | ✅ | ✅ | ❌ |
| **📋 Task Management** |
| Create Task | `POST /projects/:id/tasks` | ✅ | ✅ | ❌ | ❌ |
| View Tasks | `GET /projects/:id/tasks` | ✅ | ✅ | ✅ | ❌ |
| Update Task | `PATCH /tasks/:id` | ✅ | ✅ | ❌ | ❌ |
| Delete Task | `DELETE /tasks/:id` | ✅ | ✅ | ❌ | ❌ |
| **🏷️ Tag Management** |
| Create Tag | `POST /tags` | ✅ | ✅ | ✅ | ❌ |
| View All Tags | `GET /tags` | ✅ | ✅ | ✅ | ❌ |
| Update Tag | `PATCH /tags/:id` | ✅ (creator) | ✅ (creator) | ✅ (creator) | ❌ |
| Delete Tag | `DELETE /tags/:id` | ✅ (creator) | ✅ (creator) | ✅ (creator) | ❌ |
| Add Tags to Project | `POST /projects/:id/tags` | ✅ | ✅ | ❌ | ❌ |
| Remove Tags from Project | `DELETE /projects/:id/tags/:tagId` | ✅ | ✅ | ❌ | ❌ |
| **🤖 AI Features** |
| Tag Suggestions | `POST /ai/suggest-tags` | ✅ | ✅ | ✅ | ❌ |
| Project Analysis | `GET /ai/analyze-project/:id` | ✅ | ✅ | ✅ | ❌ |
| Project Summary | `GET /ai/project-summary/:id` | ✅ | ✅ | ✅ | ❌ |

---

## ⚠️ **Error Handling**

### **Standard Error Response Format**
```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### **Common HTTP Status Codes**
- **200**: Success (GET, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation failed)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)

### **Validation Error Example**
```json
{
  "statusCode": 400,
  "message": [
    "Name must be at least 3 characters long",
    "Email must be a valid email address",
    "Password must contain uppercase, lowercase, and number"
  ],
  "error": "Bad Request"
}
```

### **Authentication Error Example**
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

---

## 🔧 **Development Notes**

### **JWT Token Management**
- Token expires after 24 hours
- Include in Authorization header: `Bearer <token>`
- Refresh tokens not implemented (re-login required)

### **Data Validation Rules**
- All string inputs are automatically trimmed
- Emails are automatically lowercased
- CUID format used for all IDs
- Comprehensive validation with class-validator

### **AI Features**
- Requires OpenAI API key configuration
- Returns 400 error if AI features unavailable
- Confidence scores provided for tag suggestions
- Context-aware suggestions when project ID provided

### **Pagination Best Practices**
- Use `GET /projects/paginated` for large datasets
- Default page size: 10 items
- Maximum page size: 100 items
- Includes metadata for frontend pagination controls

### **Database Relations**
- Cascade deletion for project → tasks, memberships
- Tag associations are many-to-many
- User assignments are optional (nullable)

---

## 📚 **Frontend Development Tips**

### **State Management Suggestions**
```typescript
// User authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Project management state
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  members: ProjectMember[];
  tasks: Task[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
}
```

### **API Client Setup**
```typescript
// Base API configuration
const API_BASE_URL = 'http://localhost:3000';

// Axios interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Form Validation Alignment**
```typescript
// Match backend validation rules
const ProjectSchema = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  }
};
```

---

## 🎯 **Quick Start Checklist**

### **Authentication Flow**
1. ✅ Implement signup/login forms
2. ✅ Store JWT token securely
3. ✅ Add token to API requests
4. ✅ Handle token expiration
5. ✅ Implement logout functionality

### **Core Features**
1. ✅ Project CRUD operations
2. ✅ Task management within projects
3. ✅ User invitation system
4. ✅ Role-based UI permissions
5. ✅ Tag management and filtering

### **Enhanced Features**
1. ✅ Pagination controls
2. ✅ Search and filtering
3. ✅ AI-powered suggestions
4. ✅ Project analytics
5. ✅ Real-time updates (optional)

---

This comprehensive API documentation provides all necessary information for building a complete frontend application that integrates seamlessly with the NestJS Project Management API. The role-based permissions, detailed schemas, and error handling guidelines ensure robust and secure frontend development.
