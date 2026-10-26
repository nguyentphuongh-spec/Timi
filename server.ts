import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'students_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StudentRecord {
  id: string; // google uid or generated student id
  email: string;
  name: string;
  picture?: string;
  avatar: string;
  university?: string;
  major?: string;
  studentCode?: string; // MSSV
  academicYear?: string;
  phone?: string;
  bio?: string;
  provider: 'google';
  isLoggedIn: boolean;
  linkedGoogle: boolean;
  createdAt: string;
  lastLoginAt: string;
  workspace?: {
    tasks?: any[];
    schedule?: any[];
    appointments?: any[];
    alarms?: any[];
    water?: number;
    pet?: any;
    settings?: any;
  };
}

interface DatabaseSchema {
  students: Record<string, StudentRecord>; // key by email or id
}

// Load DB from file safely
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading students_db.json:', err);
  }
  return { students: {} };
}

// Save DB to file safely
function saveDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving students_db.json:', err);
  }
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// BACKEND API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TIMI Student Management Backend',
    time: new Date().toISOString()
  });
});

// 1. GOOGLE LOGIN & SYNC ENDPOINT
// Links the individual student's Google account to their personal backend profile & data
app.post('/api/auth/google/login', (req, res) => {
  try {
    const { id, email, name, picture, university, major, studentCode, academicYear } = req.body;

    if (!email && !id) {
      return res.status(400).json({ success: false, error: 'Email hoặc ID người dùng là bắt buộc' });
    }

    const db = loadDatabase();
    const primaryKey = email ? email.toLowerCase().trim() : (id as string).trim();
    const existing = db.students[primaryKey];

    const now = new Date().toISOString();

    // Compute initials if no photo provided
    const getInitials = (n: string) => {
      const parts = (n || '').trim().split(/\s+/).filter(Boolean);
      if (parts.length === 0) return 'U';
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    if (existing) {
      // Update with authentic Google info while preserving user's customized university, major, MSSV
      existing.name = name || existing.name;
      existing.email = email || existing.email;
      if (picture !== undefined) {
        existing.picture = picture; // real photoURL or undefined
      }
      existing.avatar = getInitials(existing.name);
      existing.lastLoginAt = now;
      existing.isLoggedIn = true;
      existing.linkedGoogle = true;

      // If client explicitly passed university or major, update it
      if (university !== undefined) existing.university = university;
      if (major !== undefined) existing.major = major;
      if (studentCode !== undefined) existing.studentCode = studentCode;
      if (academicYear !== undefined) existing.academicYear = academicYear;

      db.students[primaryKey] = existing;
      saveDatabase(db);

      return res.json({
        success: true,
        message: 'Đăng nhập Google thành công, đã nạp hồ sơ sinh viên cá nhân',
        isNewUser: false,
        student: existing,
        workspace: existing.workspace || {}
      });
    }

    // New Student Profile linked to this Google account
    const newStudent: StudentRecord = {
      id: id || `google_${Date.now()}`,
      email: email ? email.toLowerCase().trim() : '',
      name: name || 'Sinh viên',
      picture: picture || undefined,
      avatar: getInitials(name || 'Sinh viên'),
      university: university || '', // No fake "Đại học Quốc gia"!
      major: major || '',
      studentCode: studentCode || '',
      academicYear: academicYear || '',
      provider: 'google',
      isLoggedIn: true,
      linkedGoogle: true,
      createdAt: now,
      lastLoginAt: now,
      workspace: {
        tasks: [],
        schedule: [],
        appointments: [],
        alarms: [],
        water: 0
      }
    };

    db.students[primaryKey] = newStudent;
    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Khởi tạo hồ sơ sinh viên mới liên kết Google thành công',
      isNewUser: true,
      student: newStudent,
      workspace: newStudent.workspace
    });
  } catch (error: any) {
    console.error('API /api/auth/google/login error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Lỗi xử lý đăng nhập' });
  }
});

// 2. GET STUDENT PROFILE
app.get('/api/student/profile', (req, res) => {
  try {
    const { userId, email } = req.query;
    if (!userId && !email) {
      return res.status(400).json({ success: false, error: 'Thiếu userId hoặc email' });
    }

    const db = loadDatabase();
    const primaryKey = email ? (email as string).toLowerCase().trim() : (userId as string).trim();
    
    // Look up directly or by student id
    let student: StudentRecord | undefined = db.students[primaryKey];
    if (!student && userId) {
      student = Object.values(db.students).find(s => s.id === userId);
    }

    if (!student) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy hồ sơ sinh viên' });
    }

    return res.json({
      success: true,
      student
    });
  } catch (error: any) {
    console.error('API /api/student/profile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. UPDATE STUDENT PROFILE (University, Major, Student ID, Bio, etc.)
app.put('/api/student/profile', (req, res) => {
  try {
    const { id, email, university, major, studentCode, academicYear, phone, bio, name, picture } = req.body;

    if (!id && !email) {
      return res.status(400).json({ success: false, error: 'Thiếu định danh sinh viên (id hoặc email)' });
    }

    const db = loadDatabase();
    const primaryKey = email ? email.toLowerCase().trim() : (id as string).trim();
    let student: StudentRecord | undefined = db.students[primaryKey];
    
    if (!student && id) {
      student = Object.values(db.students).find(s => s.id === id);
    }

    if (!student) {
      // Auto-create record if not exists
      student = {
        id: id || `student_${Date.now()}`,
        email: email || '',
        name: name || 'Sinh viên',
        avatar: 'SV',
        university: university || '',
        major: major || '',
        studentCode: studentCode || '',
        academicYear: academicYear || '',
        phone: phone || '',
        bio: bio || '',
        provider: 'google',
        isLoggedIn: true,
        linkedGoogle: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      db.students[primaryKey] = student;
    } else {
      if (university !== undefined) student.university = university.trim();
      if (major !== undefined) student.major = major.trim();
      if (studentCode !== undefined) student.studentCode = studentCode.trim();
      if (academicYear !== undefined) student.academicYear = academicYear.trim();
      if (phone !== undefined) student.phone = phone.trim();
      if (bio !== undefined) student.bio = bio.trim();
      if (name !== undefined) student.name = name.trim();
      if (picture !== undefined) student.picture = picture;
      student.lastLoginAt = new Date().toISOString();
    }

    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công',
      student
    });
  } catch (error: any) {
    console.error('API PUT /api/student/profile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET STUDENT WORKSPACE DATA
app.get('/api/student/data', (req, res) => {
  try {
    const { userId, email } = req.query;
    if (!userId && !email) {
      return res.status(400).json({ success: false, error: 'Thiếu userId hoặc email' });
    }

    const db = loadDatabase();
    const primaryKey = email ? (email as string).toLowerCase().trim() : (userId as string).trim();
    let student: StudentRecord | undefined = db.students[primaryKey];
    if (!student && userId) {
      student = Object.values(db.students).find(s => s.id === userId);
    }

    if (!student) {
      return res.status(404).json({ success: false, error: 'Chưa có dữ liệu sinh viên' });
    }

    return res.json({
      success: true,
      workspace: student.workspace || {}
    });
  } catch (error: any) {
    console.error('API /api/student/data error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. SAVE / SYNC STUDENT WORKSPACE DATA
app.put('/api/student/data', (req, res) => {
  try {
    const { userId, email, workspace } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ success: false, error: 'Thiếu userId hoặc email' });
    }

    const db = loadDatabase();
    const primaryKey = email ? email.toLowerCase().trim() : (userId as string).trim();
    let student: StudentRecord | undefined = db.students[primaryKey];
    if (!student && userId) {
      student = Object.values(db.students).find(s => s.id === userId);
    }

    if (student) {
      student.workspace = {
        ...student.workspace,
        ...workspace
      };
      saveDatabase(db);
    }

    return res.json({
      success: true,
      message: 'Đồng bộ dữ liệu sinh viên lên máy chủ thành công'
    });
  } catch (error: any) {
    console.error('API PUT /api/student/data error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. LOGOUT ENDPOINT
app.post('/api/auth/logout', (req, res) => {
  const { userId, email } = req.body;
  if (userId || email) {
    const db = loadDatabase();
    const primaryKey = email ? email.toLowerCase().trim() : (userId as string).trim();
    const student = db.students[primaryKey];
    if (student) {
      student.isLoggedIn = false;
      saveDatabase(db);
    }
  }
  return res.json({ success: true, message: 'Đăng xuất thành công khỏi máy chủ' });
});

// ==========================================
// STATIC / VITE INTEGRATION
// ==========================================
async function startServer() {
  if (!isProduction) {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TIMI Server running on http://0.0.0.0:${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TIMI server:', err);
  process.exit(1);
});
