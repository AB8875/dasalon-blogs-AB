# Backend Coordination - DaSalon Blogs Production

> **Frontend to Backend Integration Guide for Production Deployment**  
> Frontend: Next.js 15.5.3 | Backend: NestJS + MongoDB + AWS S3  
> Production API: `https://api-blog.dasalon.com`

---

## 📋 Table of Contents

- [Production Environment](#production-environment)
- [Required Backend Endpoints](#required-backend-endpoints)
- [Environment Variables](#environment-variables)
- [CORS Configuration](#cors-configuration)
- [Authentication Flow](#authentication-flow)
- [API Endpoints Used by Frontend](#api-endpoints-used-by-frontend)
- [Data Models & Schemas](#data-models--schemas)
- [File Upload Requirements](#file-upload-requirements)
- [Critical Production Requirements](#critical-production-requirements)

---

## 🌐 Production Environment

### Frontend Configuration

```env
# Production API Base URL
NEXT_PUBLIC_API_URL=https://api-blog.dasalon.com

# AWS S3 Configuration (Frontend needs for direct uploads)
AWS_REGION=ap-south-1
S3_BUCKET=dasalon-blog
AWS_ACCESS_KEY_ID=AKIAVRUVWY65BC2HGKNZ
AWS_SECRET_ACCESS_KEY=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

# MongoDB (if needed for any server-side rendering)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dasalon
```

### Backend Requirements

The backend **MUST** be deployed and accessible at:
- **Production URL**: `https://api-blog.dasalon.com`
- **API Prefix**: All endpoints should be prefixed with `/api`
- **Example**: `https://api-blog.dasalon.com/api/blogs`

---

## 🔐 Authentication Flow

### JWT Token-Based Authentication

The frontend uses JWT tokens stored in `localStorage` and sends them in the `Authorization` header:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

### Authentication Endpoints Required

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/auth/login` | POST | User login | `{ access_token, user }` |
| `/api/auth/signup` | POST | User registration | `{ access_token, user }` |
| `/api/auth/me` | GET | Get current user (protected) | `User` object |

### User Roles

```typescript
enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  USER = 'user'
}
```

---

## 🌍 CORS Configuration

### Required CORS Settings

The backend **MUST** allow requests from the production frontend domain:

```javascript
// Backend CORS Configuration
{
  origin: [
    'https://dasalon.com',           // Production frontend
    'https://www.dasalon.com',       // Production frontend (www)
    'http://localhost:3000'          // Development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

> **CRITICAL**: Without proper CORS configuration, the frontend will not be able to make API requests.

---

## 📡 API Endpoints Used by Frontend

### 1. Authentication Module (`/api/auth`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| POST | `/api/auth/login` | ❌ | Login Page | User authentication |
| POST | `/api/auth/signup` | ❌ | Signup Page | User registration |
| GET | `/api/auth/me` | ✅ | Profile Page | Get current user info |

### 2. Users Module (`/api/users`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/users` | ❌ | Admin Panel, Author Select | Get all users/authors |
| GET | `/api/users?search={query}` | ❌ | Admin Navbar Search | Search users |
| GET | `/api/users/:id` | ❌ | User Profile | Get user by ID |
| POST | `/api/users` | ✅ | Author Creation | Create new user/author |
| PATCH | `/api/users/:id` | ✅ | Profile Edit | Update user profile |
| POST | `/api/users/:id/avatar` | ✅ | Profile Page | Upload user avatar |
| DELETE | `/api/users/:id` | ✅ | Admin Panel | Delete user |

**Expected Response Format for GET `/api/users`:**
```json
{
  "items": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "admin | author | user",
      "image": "string (optional)",
      "education": "string (optional)",
      "address": "string (optional)",
      "description": "string (optional)",
      "instagram": "string (optional)",
      "linkedin": "string (optional)",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 3. Blogs Module (`/api/blogs`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/blogs` | ❌ | Blog List, Admin Panel | Get all blogs |
| GET | `/api/blogs?search={query}` | ❌ | Admin Navbar Search | Search blogs |
| GET | `/api/blogs?category={slug}` | ❌ | Category Pages | Filter by category |
| GET | `/api/blogs?menu={slug}` | ❌ | Menu Pages | Filter by menu |
| GET | `/api/blogs?menu={menu}&submenu={submenu}` | ❌ | Submenu Pages | Filter by menu+submenu |
| GET | `/api/blogs/:id` | ❌ | Blog Detail, Admin Edit | Get blog by ID |
| GET | `/api/blogs/slug/:slug` | ❌ | Blog Detail Page | Get blog by slug |
| POST | `/api/blogs` | ✅ | Create Post | Create new blog |
| PUT | `/api/blogs/:id` | ✅ | Edit Post | Update blog |
| DELETE | `/api/blogs/:id` | ✅ | Admin Panel | Delete blog |

**Expected Response Format for GET `/api/blogs`:**
```json
[
  {
    "_id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "content": "string (HTML)",
    "menu": "string",
    "submenu": "string",
    "thumbnail": {
      "url": "string",
      "alt": "string (optional)"
    },
    "authors": [
      {
        "_id": "string",
        "name": "string",
        "image": "string (optional)"
      }
    ],
    "status": "draft | published",
    "tags": ["string"],
    "featured": "boolean",
    "images": ["string"],
    "views": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### 4. Authors Module (`/api/authors`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/authors/:id` | ❌ | Author Profile Page | Get author details |
| GET | `/api/authors/:id/blogs` | ❌ | Author Profile Page | Get author's blogs |

**Expected Response Format for GET `/api/authors/:id`:**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "image": "string (optional)",
  "education": "string (optional)",
  "address": "string (optional)",
  "description": "string (optional)",
  "instagram": "string (optional)",
  "linkedin": "string (optional)"
}
```

### 5. Menu Module (`/api/menu`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/menu` | ❌ | Public Navigation | Get all menus (public) |
| GET | `/api/menu/menus` | ❌ | Public Navigation | Get all menus |
| GET | `/api/menu?search={query}` | ❌ | Admin Navbar Search | Search menus |
| GET | `/api/menu/admin/all` | ✅ | Admin Menu Management | Get menus with submenus |
| POST | `/api/menu/menus` | ✅ | Admin Menu Management | Create menu |
| PUT | `/api/menu/menus/:id` | ✅ | Admin Menu Management | Update menu |
| DELETE | `/api/menu/menus/:id` | ✅ | Admin Menu Management | Delete menu (cascade) |
| POST | `/api/menu/submenus` | ✅ | Admin Menu Management | Create submenu |
| DELETE | `/api/menu/submenus/:id` | ✅ | Admin Menu Management | Delete submenu |

**Expected Response Format for GET `/api/menu/admin/all`:**
```json
[
  {
    "menu": {
      "_id": "string",
      "name": "string",
      "slug": "string",
      "description": "string (optional)",
      "status": "boolean"
    },
    "submenus": [
      {
        "_id": "string",
        "name": "string",
        "slug": "string",
        "parent_id": "string",
        "status": "boolean"
      }
    ]
  }
]
```

### 6. Settings Module (`/api/settings`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/settings` | ❌ | Site-wide Settings | Get site settings |
| GET | `/api/settings/:id` | ❌ | Settings Page | Get settings by ID |
| POST | `/api/settings` | ✅ Admin | Settings Page | Create settings |
| PUT | `/api/settings/:id` | ✅ Admin | Settings Page | Update settings |
| POST | `/api/settings/upload` | ✅ Admin | Image Upload | Upload file to S3 |

**Expected Response Format for POST `/api/settings/upload`:**
```json
{
  "url": "https://dasalon-blog.s3.ap-south-1.amazonaws.com/path/to/file.jpg",
  "message": "File uploaded successfully to AWS S3"
}
```

### 7. Dashboard Module (`/api`)

| Method | Endpoint | Auth Required | Used By | Description |
|--------|----------|---------------|---------|-------------|
| GET | `/api/dashboard-stats` | ❌ | Admin Dashboard | Get dashboard statistics |

**Expected Response Format:**
```json
{
  "totalPosts": "number",
  "totalCategories": "number",
  "totalUsers": "number",
  "totalViews": "number"
}
```

---

## 📊 Data Models & Schemas

### User/Author Schema

```typescript
{
  _id: string,
  name: string (required),
  email: string (required, unique),
  password: string (hashed, required),
  role: 'admin' | 'author' | 'user',
  image?: string,              // Profile image URL
  education?: string,          // Author education
  address?: string,            // Author location
  description?: string,        // Author bio
  instagram?: string,          // Social link
  linkedin?: string,           // Social link
  createdAt: Date,
  updatedAt: Date
}
```

### Blog/Post Schema

```typescript
{
  _id: string,
  title: string (required),
  slug: string (required, unique),
  description: string,
  content: string (HTML),
  menu: string (required),
  submenu?: string,
  thumbnail: {
    url: string,
    alt?: string
  },
  authors: [                   // Array of author references
    {
      _id: string,
      name: string,
      image?: string
    }
  ],
  status: 'draft' | 'published',
  tags: string[],
  featured: boolean,
  images: string[],            // Additional images in content
  views: number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Menu Schema

```typescript
{
  _id: string,
  name: string (required),
  slug: string (required, unique, lowercase),
  description?: string,
  status: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Submenu Schema

```typescript
{
  _id: string,
  name: string (required),
  slug: string (required, unique, lowercase),
  parent_id: string (references Menu._id),
  description?: string,
  status: boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📤 File Upload Requirements

### AWS S3 Configuration

The backend **MUST** support file uploads to AWS S3 with the following configuration:

```env
AWS_REGION=ap-south-1
S3_BUCKET=dasalon-blog
AWS_ACCESS_KEY_ID=AKIAVRUVWY65BC2HGKNZ
AWS_SECRET_ACCESS_KEY=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
```

### Upload Endpoint

**Endpoint**: `POST /api/settings/upload`

**Request**:
- Content-Type: `multipart/form-data`
- Field name: `file`
- Authorization: Required (Admin only)

**Response**:
```json
{
  "url": "https://dasalon-blog.s3.ap-south-1.amazonaws.com/uploads/filename-timestamp.ext",
  "message": "File uploaded successfully to AWS S3"
}
```

### Supported File Types

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Maximum file size: `10MB`

---

## ⚠️ Critical Production Requirements

### 1. CORS Configuration

```javascript
// Backend must allow these origins
const allowedOrigins = [
  'https://dasalon.com',
  'https://www.dasalon.com',
  'http://localhost:3000'  // for development
];
```

### 2. Environment Variables

The backend **MUST** have these environment variables configured:

```env
# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://dasalon.com

# Database
MONGO_URI=mongodb://your-production-mongodb-uri
MONGODB_DB=dasalon

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=ap-south-1
S3_BUCKET=dasalon-blog
AWS_ACCESS_KEY_ID=AKIAVRUVWY65BC2HGKNZ
AWS_SECRET_ACCESS_KEY=URt4Jqqtk+xqQ6LWpb2wc88KQB1yj/+8lZZyXmG9
```

### 3. API Response Format

All API responses should follow this format:

**Success Response**:
```json
{
  // Direct data or object
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Bad Request"
}
```

### 4. HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, slug, etc.) |
| 500 | Internal Server Error |

### 5. Search Functionality

The backend should support search query parameters:

```
GET /api/blogs?search=beauty
GET /api/users?search=john
GET /api/menu?search=hair
```

Search should be case-insensitive and search across relevant fields:
- **Blogs**: title, description, tags
- **Users**: name, email
- **Menus**: name, slug

### 6. Pagination (Optional but Recommended)

```
GET /api/blogs?page=1&limit=10
```

Response should include:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 7. Slug Generation

The backend should auto-generate slugs from titles if not provided:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Ensure uniqueness

### 8. Cascading Deletes

When deleting a menu, all associated submenus **MUST** be deleted automatically.

### 9. Author Population

When returning blog posts, the `authors` field should be populated with author details (name, image) instead of just IDs.

### 10. View Count Increment

The backend should provide an endpoint to increment blog view counts:

```
POST /api/blogs/:id/view
```

---

## 🔗 API Client Implementation

The frontend uses two API clients:

### 1. Axios Client (`src/service/AxiosClient.ts`)

```typescript
// Base URL: process.env.NEXT_PUBLIC_API_URL
// Automatically adds Authorization header from localStorage
```

### 2. Fetch Client (`src/lib/api.ts`)

```typescript
// apiFetch() helper function
// Handles 401 errors by clearing localStorage token
// Used for server-side rendering compatible calls
```

---

## 📝 Testing Checklist

Before deployment, ensure the backend supports:

- [ ] All authentication endpoints work
- [ ] CORS is configured for production domain
- [ ] JWT tokens are generated and validated correctly
- [ ] All CRUD operations for blogs work
- [ ] All CRUD operations for users work
- [ ] All CRUD operations for menus/submenus work
- [ ] File upload to S3 works and returns correct URL
- [ ] Search functionality works across all modules
- [ ] Author population in blog responses works
- [ ] Cascading delete for menus works
- [ ] Dashboard stats endpoint returns correct data
- [ ] Error responses follow the standard format
- [ ] 401 errors are returned for invalid/missing tokens

---

## 🚀 Deployment Notes

### Backend Deployment

1. Deploy backend to production server
2. Ensure it's accessible at `https://api-blog.dasalon.com`
3. Configure SSL certificate for HTTPS
4. Set all environment variables
5. Test all endpoints using Postman/Thunder Client

### Database Setup

1. Ensure MongoDB is accessible from backend server
2. Create indexes for frequently queried fields:
   - `blogs.slug` (unique)
   - `users.email` (unique)
   - `menus.slug` (unique)
   - `submenus.slug` (unique)

### AWS S3 Setup

1. Ensure S3 bucket `dasalon-blog` exists
2. Configure bucket policy for public read access
3. Enable CORS on S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://dasalon.com", "https://www.dasalon.com"],
    "ExposeHeaders": []
  }
]
```

---

## 📞 Support & Contact

If you need clarification on any endpoint or data structure, please contact the frontend team.

**Frontend Repository**: `/Users/macbook/dasalon-blogs`  
**Frontend Framework**: Next.js 15.5.3  
**Frontend Port**: 3000 (development)

---

**Last Updated**: 2025-11-27  
**Version**: 1.0.0
