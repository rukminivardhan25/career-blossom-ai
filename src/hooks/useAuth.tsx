import { createContext, useContext, useEffect, useState } from 'react';
import { apiService, User, Profile, AuthStatus } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  userProfile: Profile | null;
  authStatus: AuthStatus | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'USER' | 'ADMIN') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUserProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshAuthStatus = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getAuthStatus();
      if (response.success && response.data) {
        setAuthStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching auth status:', error);
    }
  };

  useEffect(() => {
    // Check for existing token and validate it
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await apiService.getAuthStatus();
          if (response.success && response.data) {
            setUser(response.data.user);
            setAuthStatus(response.data.status);
            await refreshUserProfile();
          } else {
            // Token is invalid, clear it
            apiService.clearToken();
            setUser(null);
            setUserProfile(null);
            setAuthStatus(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          apiService.clearToken();
          setUser(null);
          setUserProfile(null);
          setAuthStatus(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        apiService.setToken(response.data.token);
        setUser(response.data.user);
        setAuthStatus(response.data.user.status);
        await refreshUserProfile();
        
        toast({
          title: "Success",
          description: "Login successful!",
        });
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'USER' | 'ADMIN') => {
    try {
      const response = await apiService.signup({ email, password, fullName, role });
      
      if (response.success && response.data) {
        apiService.setToken(response.data.token);
        setUser(response.data.user);
        setAuthStatus(response.data.user.status);
        await refreshUserProfile();
        
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    apiService.clearToken();
    setUser(null);
    setUserProfile(null);
    setAuthStatus(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      authStatus,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUserProfile,
      refreshAuthStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};