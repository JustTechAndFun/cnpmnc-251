# API Documentation - Frontend & Backend Mapping

## 📋 Tổng quan
Tài liệu này liệt kê tất cả các API endpoints từ backend và cách chúng được ánh xạ vào frontend.

---

## 🔐 Authentication APIs (`/api/auth`)

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| POST | `/api/auth/google/callback` | `AuthController.handleGoogleCallback()` | `authApi.handleGoogleCallback()` | `authApi.ts` |
| GET | `/api/auth/user` | `AuthController.getCurrentUser()` | `authApi.getCurrentUser()` | `authApi.ts` |
| POST | `/api/auth/logout` | `AuthController.logout()` | `authApi.logout()` | `authApi.ts` |

**Mô tả:**
- Xử lý OAuth2 với Google
- Quản lý session người dùng
- Đăng xuất và xóa session

---

## 👤 Profile APIs (`/api/profile`)

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| GET | `/api/profile` | `ProfileApiController.getProfile()` | `profileApi.getProfile()` | `profileApi.ts` |

**Mô tả:**
- Lấy thông tin profile của user hiện tại
- Bao gồm thông tin cá nhân và school

---

## 👨‍💼 Admin APIs (`/api/admin`)

### User Management

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| GET | `/api/admin/users` | `AdminController.getAllUsers()` | `adminApi.getAllUsers()` | `adminApi.ts` |
| GET | `/api/admin/users/teachers` | `AdminController.getAllTeacher()` | `adminApi.getAllTeachers()` | `adminApi.ts` |
| POST | `/api/admin/users/teachers` | `AdminController.createTeacherAccount()` | `adminApi.createTeacherAccount()` | `adminApi.ts` |

**Query Parameters:**
- `mail`: Search by email (partial match, case-insensitive)
- `activate`: Filter by activation status (true/false)

**Mô tả:**
- Quản lý danh sách users
- Lọc users theo email và trạng thái
- Tạo và quản lý tài khoản giáo viên

### Class Management

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| POST | `/api/admin/classes` | `AdminController.createClass()` | `adminApi.createClass()` | `adminApi.ts` |
| GET | `/api/admin/classes` | `AdminController.getAllClasses()` | `adminApi.getAllClasses()` | `adminApi.ts` |
| DELETE | `/api/admin/classes/{id}` | `AdminController.deleteClass()` | `adminApi.deleteClass()` | `adminApi.ts` |

**Mô tả:**
- Admin tạo và quản lý các lớp học
- Gán giáo viên cho lớp học
- Xóa lớp học

---

## 👨‍🏫 Teacher APIs (`/api/classes`)

### Class Management

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| GET | `/api/classes/my-classes` | `ClassController.getMyClasses()` | `teacherApi.getMyClasses()` | `teacherApi.ts` |
| GET | `/api/classes/{id}` | `ClassController.getClassInfo()` | `teacherApi.getClassInfo()` | `teacherApi.ts` |

**Mô tả:**
- Giáo viên xem các lớp được phân công
- Xem thông tin chi tiết lớp học

### Student Management

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| GET | `/api/classes/{id}/students` | `ClassController.getClassStudents()` | `teacherApi.getClassStudents()` | `teacherApi.ts` |
| POST | `/api/classes/{id}/students` | `ClassController.addStudentToClass()` | `teacherApi.addStudentToClass()` | `teacherApi.ts` |

**Request Body (Add Student):**
```json
{
  "email": "student@example.com",
  "studentId": "ST001"
}
```

**Mô tả:**
- Xem danh sách sinh viên trong lớp
- Thêm sinh viên vào lớp (bằng email hoặc studentId)

### Test Management

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| POST | `/api/classes/{id}/tests` | `TestController.addTestToClass()` | `teacherApi.addTestToClass()` | `teacherApi.ts` |
| GET | `/api/classes/{id}/tests` | `TestController.getTestClass()` | `teacherApi.getTestsInClass()` | `teacherApi.ts` |
| GET | `/api/classes/{classId}/tests/{id}` | `TestController.getTestDetails()` | `teacherApi.getTestDetail()` | `teacherApi.ts` |

**Request Body (Add Test):**
```json
{
  "name": "Kiểm tra giữa kỳ",
  "description": "Bài kiểm tra về lập trình web",
  "duration": 90,
  "passcode": "TEST123"
}
```

**Mô tả:**
- Tạo bài kiểm tra cho lớp
- Xem danh sách bài kiểm tra
- Xem chi tiết bài kiểm tra

---

## 👨‍🎓 Student APIs (`/api/classes`)

| Method | Endpoint | Backend Controller | Frontend Function | File |
|--------|----------|-------------------|-------------------|------|
| GET | `/api/classes/my-classes` | `ClassController.getMyClasses()` | `studentApi.getMyClasses()` | `studentApi.ts` |
| GET | `/api/classes/{id}/tests` | `TestController.getTestClass()` | `studentApi.getTestsInClass()` | `studentApi.ts` |
| GET | `/api/classes/{classId}/tests/{id}` | `TestController.getTestDetails()` | `studentApi.getTestDetail()` | `studentApi.ts` |

**Mô tả:**
- Sinh viên xem các lớp đã đăng ký
- Xem bài kiểm tra trong lớp
- Xem chi tiết bài kiểm tra

**Note:** Một số endpoints cần được thêm vào backend cho student-specific features (grades, assignments submission, etc.)

---

## 🔒 Authentication & Authorization

### Cookie-based Authentication
Tất cả API requests sử dụng cookie-based authentication:
```typescript
// axiosConfig.ts
axios.create({
    withCredentials: true  // Tự động gửi cookies
})
```

### Role-based Access Control

| Role | Permissions |
|------|------------|
| **ADMIN** | - Quản lý tất cả users<br>- Tạo/xóa classes<br>- Tạo teacher accounts<br>- Full access |
| **TEACHER** | - Xem classes được phân công<br>- Quản lý students trong class<br>- Tạo và quản lý tests<br>- Chấm điểm |
| **STUDENT** | - Xem classes đã đăng ký<br>- Xem tests<br>- Nộp bài<br>- Xem điểm |

---

## 📊 Data Models

### UserDto
```typescript
{
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  activate: boolean;
}
```

### ClassDto
```typescript
{
  id: string;
  className: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  semester: string;
  year: number;
  studentCount?: number;
}
```

### TestDTO
```typescript
{
  id: string;
  name: string;
  description?: string;
  duration: number;
  passcode?: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
}
```

### StudentDto
```typescript
{
  id: string;
  email: string;
  name: string;
  studentId?: string;
  picture?: string;
}
```

---

## 🛠️ Error Handling

### Standard Error Response
```json
{
  "error": true,
  "data": null,
  "message": "Error message here"
}
```

### Success Response
```json
{
  "error": false,
  "data": { ... },
  "message": "Success message"
}
```

### Common HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notes

### Missing Endpoints (To be implemented)
1. **Student Assignments**
   - Submit assignment
   - View assignment grades
   
2. **Grading System**
   - Grade management
   - Grade calculations
   
3. **User Profile Update**
   - Update personal information
   - Change password

### Environment Variables
Backend requires:
```env
SPRING_DATASOURCE_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ALLOWED_ORIGINS=...
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

Frontend requires:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_REDIRECT_URI=...
```

---

## 🔄 API Update History

**Latest Update:** November 8, 2025
- ✅ Added teacher management APIs
- ✅ Added email configuration
- ✅ Organized all APIs into role-based files
- ✅ Implemented cookie-based authentication

---

**Total APIs:** 17 endpoints
- Authentication: 3
- Profile: 1  
- Admin: 6
- Teacher: 5
- Student: 3
