# 🚨 Backend Integration Issues & Required Fixes

> **Critical issues found between backend implementation and frontend requirements**  
> Date: 2025-11-27  
> Priority: **HIGH** - Must fix before production deployment

---

## 📊 Issue Summary

| Priority | Issues | Status |
|----------|--------|--------|
| 🔴 **CRITICAL** | 4 issues | ❌ Blocking |
| 🟡 **HIGH** | 3 issues | ⚠️ Important |
| 🟢 **MEDIUM** | 2 issues | ✅ Nice to have |

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. Authentication Response Format Mismatch

**Problem:**  
Frontend expects `access_token`, but backend returns `token`.

**Current Backend Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Required Frontend Format:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Impact:** 🔴 **BREAKING** - Login/Signup will not work

**Fix Required:**
```typescript
// In AuthService (login & signup methods)
return {
  access_token: token,  // Change from 'token' to 'access_token'
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
};
```

**Files to Update:**
- `src/auth/auth.service.ts` - Change response format in `login()` and `signup()`

---

### 2. Blog Schema Field Names Mismatch

**Problem:**  
Backend uses arrays (`menus[]`, `submenus[]`), frontend expects single values (`menu`, `submenu`).

**Current Backend Schema:**
```typescript
{
  menus: string[],      // Array: ["beauty", "fashion"]
  submenus: string[],   // Array: ["hair", "makeup"]
}
```

**Required Frontend Schema:**
```typescript
{
  menu: string,         // Single: "beauty"
  submenu: string,      // Single: "hair"
}
```

**Impact:** 🔴 **BREAKING** - Blog creation/editing will fail

**Fix Required:**
```typescript
// In Blog Schema (blog.schema.ts)
@Prop({ required: true })
menu: string;  // Change from 'menus: string[]'

@Prop()
submenu: string;  // Change from 'submenus: string[]'
```

**Files to Update:**
- `src/blogs/schemas/blog.schema.ts`
- `src/blogs/blogs.service.ts` - Update all references
- `src/blogs/dto/create-blog.dto.ts`
- `src/blogs/dto/update-blog.dto.ts`

**Migration Required:** ✅ Yes - Existing data needs migration

---

### 3. Missing Author Endpoints

**Problem:**  
Frontend uses `/api/authors/:id` endpoints that don't exist in backend.

**Missing Endpoints:**

| Endpoint | Method | Used By | Purpose |
|----------|--------|---------|---------|
| `/api/authors/:id` | GET | Author Profile Page | Get author details |
| `/api/authors/:id/blogs` | GET | Author Profile Page | Get author's blog posts |

**Impact:** 🔴 **BREAKING** - Author profile pages will not work

**Fix Options:**

**Option 1: Create new Authors module (Recommended)**
```typescript
// Create src/authors/authors.controller.ts
@Controller('authors')
export class AuthorsController {
  @Get(':id')
  async getAuthor(@Param('id') id: string) {
    // Return user data (authors are users with role='author')
    return this.usersService.findOne(id);
  }

  @Get(':id/blogs')
  async getAuthorBlogs(@Param('id') id: string) {
    // Return all blogs where authors array contains this author
    return this.blogsService.findByAuthor(id);
  }
}
```

**Option 2: Use existing Users endpoints**
- Frontend changes `/api/authors/:id` → `/api/users/:id`
- Add new endpoint: `GET /api/users/:id/blogs`

**Recommended:** Option 1 (cleaner separation)

---

### 4. Menu Admin Response Format Mismatch

**Problem:**  
Response structure doesn't match frontend expectations.

**Current Backend Response:**
```json
[
  {
    "_id": "...",
    "name": "BEAUTY",
    "slug": "beauty",
    "submenus": [...]
  }
]
```

**Required Frontend Format:**
```json
[
  {
    "menu": {
      "_id": "...",
      "name": "BEAUTY",
      "slug": "beauty",
      "status": true
    },
    "submenus": [...]
  }
]
```

**Impact:** 🔴 **BREAKING** - Admin menu management will fail

**Fix Required:**
```typescript
// In MenuService.findAllWithSubmenus()
return menusWithSubmenus.map(item => ({
  menu: {
    _id: item._id,
    name: item.name,
    slug: item.slug,
    status: item.status
  },
  submenus: item.submenus
}));
```

**Files to Update:**
- `src/menu/menu.service.ts` - Update `findAllWithSubmenus()` method

---

## 🟡 HIGH PRIORITY ISSUES

### 5. Missing Search Functionality

**Problem:**  
Frontend uses `?search=query` parameter, but backend doesn't support it.

**Missing Search Endpoints:**
```
GET /api/blogs?search=beauty
GET /api/users?search=john
GET /api/menu?search=hair
```

**Impact:** 🟡 Admin navbar search will not work

**Fix Required:**

```typescript
// In BlogsService
async findAll(query: any) {
  const filter: any = {};
  
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { tags: { $regex: query.search, $options: 'i' } }
    ];
  }
  
  if (query.menu) filter.menu = query.menu;
  if (query.submenu) filter.submenu = query.submenu;
  
  return this.blogModel.find(filter).exec();
}
```

**Files to Update:**
- `src/blogs/blogs.service.ts` - Add search logic
- `src/users/users.service.ts` - Add search logic
- `src/menu/menu.service.ts` - Add search logic

---

### 6. Missing Avatar Upload Endpoint

**Problem:**  
Frontend tries to upload avatar to `/api/users/:id/avatar`, but endpoint doesn't exist.

**Missing Endpoint:**
```
POST /api/users/:id/avatar
```

**Impact:** 🟡 Profile avatar upload will fail

**Fix Required:**

```typescript
// In UsersController
@Post(':id/avatar')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadAvatar(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File
) {
  const url = await this.s3Service.uploadFile(file);
  await this.usersService.update(id, { image: url });
  return { url, message: 'Avatar uploaded successfully' };
}
```

**Files to Update:**
- `src/users/users.controller.ts` - Add avatar upload endpoint

---

### 7. Missing Blog by Slug Endpoint

**Problem:**  
Frontend uses `/api/blogs/slug/:slug` to fetch blogs by slug, but endpoint might not exist.

**Missing Endpoint:**
```
GET /api/blogs/slug/:slug
```

**Impact:** 🟡 Blog detail pages may not work properly

**Fix Required:**

```typescript
// In BlogsController
@Get('slug/:slug')
async findBySlug(@Param('slug') slug: string) {
  const blog = await this.blogsService.findBySlug(slug);
  if (!blog) {
    throw new NotFoundException('Blog not found');
  }
  return blog;
}

// In BlogsService
async findBySlug(slug: string) {
  return this.blogModel.findOne({ slug }).exec();
}
```

**Files to Update:**
- `src/blogs/blogs.controller.ts` - Add slug endpoint
- `src/blogs/blogs.service.ts` - Add findBySlug method

---

## 🟢 MEDIUM PRIORITY ISSUES

### 8. CORS Configuration Update

**Problem:**  
Backend CORS is configured for `https://dasalon-blogs.vercel.app`, but production frontend is at different domain.

**Current Configuration:**
```env
FRONTEND_URL=https://dasalon-blogs.vercel.app
```

**Required Configuration:**
```env
FRONTEND_URL=https://dasalon.com
```

**Impact:** 🟢 CORS errors in production

**Fix Required:**
- Update `.env` file with correct production frontend URL
- Update CORS configuration in `main.ts` to include both domains during transition

```typescript
// In main.ts
app.enableCors({
  origin: [
    'https://dasalon.com',
    'https://www.dasalon.com',
    'http://localhost:3000'  // Keep for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
});
```

---

### 9. Security - Unprotected Admin Endpoints

**Problem:**  
Some admin-only endpoints are public.

**Unprotected Endpoints:**
- `DELETE /api/users/:id` - Should require admin auth
- `GET /api/dashboard-stats` - Should require admin auth

**Impact:** 🟢 Security risk

**Fix Required:**

```typescript
// Add @UseGuards and @Roles decorators
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}

@Get('dashboard-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async getDashboardStats() {
  return this.dashboardService.getStats();
}
```

---

## ✅ Implementation Checklist

### Phase 1: Critical Fixes (Do First)
- [ ] Fix auth response format (`token` → `access_token`)
- [ ] Change blog schema (`menus[]` → `menu`, `submenus[]` → `submenu`)
- [ ] Create Authors module with endpoints
- [ ] Fix menu admin response format

### Phase 2: High Priority
- [ ] Implement search functionality (blogs, users, menus)
- [ ] Add avatar upload endpoint
- [ ] Add blog by slug endpoint

### Phase 3: Medium Priority
- [ ] Update CORS configuration
- [ ] Secure admin endpoints

### Phase 4: Testing
- [ ] Test all auth flows
- [ ] Test blog CRUD operations
- [ ] Test author profile pages
- [ ] Test search functionality
- [ ] Test file uploads
- [ ] Test admin menu management

---

## 📝 Database Migration Required

After fixing the blog schema, run this migration:

```javascript
// Migration script: migrate-blog-schema.js
db.blogs.updateMany(
  {},
  [
    {
      $set: {
        menu: { $arrayElemAt: ["$menus", 0] },      // Take first menu
        submenu: { $arrayElemAt: ["$submenus", 0] }  // Take first submenu
      }
    },
    {
      $unset: ["menus", "submenus"]  // Remove old fields
    }
  ]
);
```

---

## 🔗 Related Documents

- [BACKEND_COORDINATION.md](./BACKEND_COORDINATION.md) - Complete API requirements
- [FRONTEND_INTEGRATION.md](../dasalon-backend/FRONTEND_INTEGRATION.md) - Current backend docs

---

## 📞 Questions?

If you need clarification on any fix, please ask before implementing. These changes are critical for production deployment.

**Frontend Team Contact:** Available in workspace  
**Priority:** Fix Phase 1 issues before deployment  
**Timeline:** ASAP - blocking production launch

---

**Last Updated:** 2025-11-27  
**Status:** ⚠️ Awaiting backend fixes
