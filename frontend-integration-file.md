# DaSalon Backend - Quick Reference for Frontend

> **Quick integration guide for frontend developers**

## 🚀 Getting Started

### 1. Backend Server
```bash
cd /Users/macbook/Desktop/dasalon/dasalon-backend
npm run start:dev
```
**Server:** `http://localhost:4000/api`

### 2. Frontend Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🔑 Authentication

### Headers for Protected Routes
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Quick Auth Flow
```javascript
// 1. Login
POST /api/auth/login
{ "email": "user@example.com", "password": "password" }
// Returns: { access_token, user }

// 2. Store token
localStorage.setItem('token', response.access_token);

// 3. Get current user
GET /api/auth/me
// Headers: Authorization: Bearer {token}
```

---

## 📡 API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| GET | `/me` | ✅ | Get current user |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Get all users |
| GET | `/:id` | ❌ | Get user by ID |
| POST | `/` | ❌ | Create user |
| PATCH | `/:id` | ✅ | Update user (admin or self) |
| DELETE | `/:id` | ❌ | Delete user |

### Blogs (`/api/blogs`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Get all posts (filter: ?menu=beauty&submenu=hair) |
| GET | `/:id` | ❌ | Get single post |
| POST | `/` | ❌ | Create post |
| PUT | `/:id` | ❌ | Update post |
| DELETE | `/:id` | ❌ | Delete post |

### Menu (`/api/menu`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menus` | ❌ | Get all menus (public) |
| GET | `/admin/all` | ✅ | Get menus with submenus |
| POST | `/menus` | ✅ | Create menu |
| PUT | `/menus/:id` | ✅ | Update menu |
| DELETE | `/menus/:id` | ✅ | Delete menu (cascades to submenus) |
| POST | `/submenus` | ✅ | Create submenu |
| DELETE | `/submenus/:id` | ✅ | Delete submenu |

### Settings (`/api/settings`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Get settings |
| GET | `/:id` | ❌ | Get settings by ID |
| POST | `/` | ✅ Admin | Create settings |
| PUT | `/:id` | ✅ Admin | Update settings |
| POST | `/upload` | ✅ Admin | Upload file to S3 |

### Dashboard (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard-stats` | ❌ | Get dashboard statistics |

---

## 📦 Key Data Structures

### User
```typescript
{
  _id: string,
  name: string,
  email: string,
  role: 'admin' | 'author' | 'user',
  createdAt: Date,
  updatedAt: Date
}
```

### Post/Blog
```typescript
{
  _id: string,
  title: string,
  slug: string,
  description: string,
  content: string, // HTML
  menu: string,
  submenu: string,
  thumbnail: string,
  authors: string[],
  status: string,
  tags: string[],
  featured: boolean,
  images: string[],
  views: number,
  createdAt: string,
  updatedAt: string
}
```

### Menu
```typescript
{
  _id: string,
  name: string,
  slug: string,
  description: string,
  status: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings
```typescript
{
  siteName: string,
  siteDescription: string,
  logo: string,
  favicon: string,
  contact: { email, phone, address },
  social: { facebook, twitter, instagram, linkedin },
  seo: { metaTitle, metaDescription, keywords[] },
  theme: 'light' | 'dark' | 'system',
  postsPerPage: number
}
```

---

## 🛠️ Frontend API Client Example

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Usage examples
export const api = {
  // Auth
  login: (data) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Blogs
  getBlogs: (filters) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/blogs?${params}`);
  },
  
  getBlog: (id) => apiCall(`/blogs/${id}`),
  
  createBlog: (data) => apiCall('/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Menu
  getMenus: () => apiCall('/menu/menus'),
  
  getMenusWithSubmenus: () => apiCall('/menu/admin/all'),
  
  // Settings
  getSettings: () => apiCall('/settings'),
  
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/settings/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    
    return response.json();
  },
  
  // Dashboard
  getDashboardStats: () => apiCall('/dashboard-stats'),
};
```

---

## 🎯 Common Use Cases

### 1. Fetch Blogs by Category
```javascript
// Get all beauty blogs
const beautyBlogs = await api.getBlogs({ menu: 'beauty' });

// Get hair-specific blogs
const hairBlogs = await api.getBlogs({ menu: 'beauty', submenu: 'hair' });
```

### 2. Create a New Blog Post
```javascript
const newPost = await api.createBlog({
  title: "10 Beauty Tips",
  slug: "10-beauty-tips",
  description: "Amazing beauty tips...",
  content: "<p>Full content here...</p>",
  menu: "beauty",
  submenu: "beauty-tips",
  thumbnail: "https://...",
  authors: ["John Doe"],
  status: "published",
  tags: ["beauty", "tips"],
  featured: true
});
```

### 3. Get Navigation Menu
```javascript
// For public navigation
const menus = await api.getMenus();

// For admin panel (includes submenus)
const fullMenuStructure = await api.getMenusWithSubmenus();
```

### 4. Upload Image
```javascript
const handleFileUpload = async (file) => {
  try {
    const result = await api.uploadFile(file);
    console.log('Uploaded URL:', result.url);
    // Use result.url in your blog post or settings
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

---

## ⚠️ Important Notes

1. **CORS**: Backend allows requests from `http://localhost:3000` by default
2. **Body Limit**: Maximum request size is `10MB`
3. **File Uploads**: Stored in AWS S3 (`dasalon-blog` bucket)
4. **JWT Tokens**: Store securely, include in Authorization header for protected routes
5. **User Roles**: 
   - `admin` - Full access
   - `author` - Can create/edit posts
   - `user` - Basic access

---

## 🔗 Full Documentation

For complete API documentation with all details, see:
[BACKEND_API_DOCUMENTATION.md](./BACKEND_API_DOCUMENTATION.md)

---

**Need Help?**
- Check MongoDB connection: Ensure `MONGO_URI` is set
- Verify JWT token is valid and not expired
- Check AWS S3 credentials for file uploads
- Ensure backend server is running on port 4000
