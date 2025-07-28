const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Set token for authentication
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Authentication endpoints
  async signup(userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getAuthStatus(): Promise<ApiResponse<{ user: any; status: any }>> {
    return this.request('/auth/status');
  }

  async refreshToken(): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Test endpoints
  async getTestQuestions(): Promise<ApiResponse<{ questions: any[]; totalQuestions: number }>> {
    return this.request('/test/questions');
  }

  async submitTest(answers: any[]): Promise<ApiResponse<{ testResult: any; analysis: any }>> {
    return this.request('/test/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getTestStatus(): Promise<ApiResponse<{ hasCompletedTest: boolean; lastTestDate: string; score: number }>> {
    return this.request('/test/status');
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<{ profile: any }>> {
    return this.request('/profile');
  }

  async updateProfile(profileData: any): Promise<ApiResponse<{ profile: any }>> {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async patchProfile(profileData: any): Promise<ApiResponse<{ profile: any }>> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async getProfileStatus(): Promise<ApiResponse<{ hasProfile: boolean; isCompleted: boolean; profileCreatedAt: string; profileUpdatedAt: string }>> {
    return this.request('/profile/status');
  }

  // Report endpoints
  async generateReport(): Promise<ApiResponse<{ report: any }>> {
    return this.request('/report/generate', {
      method: 'POST',
    });
  }

  async getReport(): Promise<ApiResponse<{ report: any }>> {
    return this.request('/report');
  }

  async regenerateReport(): Promise<ApiResponse<{ report: any }>> {
    return this.request('/report/regenerate', {
      method: 'POST',
    });
  }

  // Dashboard endpoints
  async getDashboard(): Promise<ApiResponse<{
    user: any;
    progress: any;
    testResult: any;
    report: any;
    careerPaths: any[];
    stats: any;
  }>> {
    return this.request('/dashboard');
  }

  async getDashboardStats(): Promise<ApiResponse<{ userStats: any; globalStats: any }>> {
    return this.request('/dashboard/stats');
  }

  async getRecentActivity(): Promise<ApiResponse<{ recentActivity: any[] }>> {
    return this.request('/dashboard/recent-activity');
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<ApiResponse<{ stats: any; recentUsers: any[]; recentReports: any[] }>> {
    return this.request('/admin/dashboard');
  }

  async getUsers(page = 1, limit = 20, search = ''): Promise<ApiResponse<{ users: any[]; pagination: any }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/admin/users?${params}`);
  }

  async getUserDetails(userId: string): Promise<ApiResponse<{ user: any }>> {
    return this.request(`/admin/users/${userId}`);
  }

  async getCareerPaths(page = 1, limit = 20, search = ''): Promise<ApiResponse<{ careerPaths: any[]; pagination: any }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return this.request(`/admin/careers?${params}`);
  }

  async createCareerPath(careerData: any): Promise<ApiResponse<{ careerPath: any }>> {
    return this.request('/admin/careers', {
      method: 'POST',
      body: JSON.stringify(careerData),
    });
  }

  async updateCareerPath(id: string, careerData: any): Promise<ApiResponse<{ careerPath: any }>> {
    return this.request(`/admin/careers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(careerData),
    });
  }

  async deleteCareerPath(id: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/careers/${id}`, {
      method: 'DELETE',
    });
  }

  async getReportByUserId(userId: string): Promise<ApiResponse<{ report: any }>> {
    return this.request(`/report/${userId}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export types for better TypeScript support
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  age?: number;
  gender?: string;
  education?: string;
  experience?: string;
  interests: string[];
  skills: string[];
  goals?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  id: string;
  userId: string;
  answers: any[];
  score: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  careerSuggestions: any[];
  skillGapAnalysis: any;
  recommendations: any[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string;
  growth?: string;
  demand?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthStatus {
  hasCompletedTest: boolean;
  hasCompletedProfile: boolean;
  hasReport: boolean;
  isFirstTime: boolean;
  nextStep: 'test' | 'profile' | 'generate-report' | 'dashboard';
} 