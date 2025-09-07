// Address Type
export interface Address {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

// Document Type
export interface Document {
  id: number;
  type: string;
  url: string;
}

// Common Person Type
export interface Person {
  id: number;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  address: Address;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  documents: Document[];
}

// Student Type
export interface Student extends Person {
  mothersName: string;
  enrollments: Enrollment[];
  grades: CourseGrades[];
  certificates: Certificate[];
}

// Time Clock Type
export interface TimeClockRecord {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  comments?: string;
}

// Teacher Type
export interface Teacher extends Person {
  bio: string;
  education: string;
  fullName:string;
  phone:string;
  specializations: string[];
  courses: number[];
  type: 'volunteer' | 'employee'; // Tipo do professor: voluntário ou funcionário
  timeClockRecords?: TimeClockRecord[];
}

// Course Type
export interface Course {
  id: number;
  name: string;
  description: string;
  workload: number;
  shifts: ('morning' | 'afternoon' | 'night')[];
  totalSpots: number;
  availableSpots: number;
  prerequisites: number[];
  schedule: Schedule[];
  teacherId: number;
  status: 'active' | 'inactive';
}

// Schedule Type
export interface Schedule {
  day: string;
  start: string;
  end: string;
}

// Enrollment Type
export interface Enrollment {
  id: number;
  courseId: number;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'canceled';
}

// Full Enrollment Type (for API)
export interface EnrollmentFull {
  id: number;
  studentId: number;
  courseId: number;
  studentName?: string; // Nome do aluno para facilitar a exibição sem precisar consultar a tabela de estudantes
  enrollmentDate: string;
  status: 'active' | 'completed' | 'canceled';
  attendance: Attendance[];
  evaluations: Evaluation[];
  averageGrade?: number; // Média das avaliações do aluno
}

// Evaluation Type
export interface Evaluation {
  id: number;
  moduleId: number;
  moduleName: string;
  evaluationType: string;
  evaluationDate: string;
  grade: number;
  comments?: string;
}

// Attendance Type
export interface Attendance {
  date: string;
  present: boolean;
}

// Module Grade Type
export interface ModuleGrade {
  module: string;
  grade: number;
}

// Course Grades Type
export interface CourseGrades {
  courseId: number;
  grades: ModuleGrade[];
}

// Certificate Type
export interface Certificate {
  id: number;
  courseId: number;
  issueDate: string;
  url: string;
}

// User Type
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  teacherId?: number;
  studentId?: number;
}

// Auth Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// State Types for Redux
export interface StudentsState {
  students: Student[];
  currentStudent: Student | null;
  loading: boolean;
  error: string | null;
}

export interface TeachersState {
  teachers: Teacher[];
  currentTeacher: Teacher | null;
  loading: boolean;
  error: string | null;
}

export interface CoursesState {
  courses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

export interface EnrollmentsState {
  enrollments: EnrollmentFull[];
  loading: boolean;
  error: string | null;
}

// App State
export interface AppState {
  auth: AuthState;
  students: StudentsState;
  teachers: TeachersState;
  courses: CoursesState;
  enrollments: EnrollmentsState;
}
