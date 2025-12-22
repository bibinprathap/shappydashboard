"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useLazyQuery, useMutation, gql } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";

const STAFF_USER_LOGIN = gql`
  mutation StaffUserLogin($email: String!, $password: String!) {
    staffUserLogin(email: $email, password: $password) {
      token
      staffUser {
        id
        email
        first_name
        last_name
        is_active
        role_id
        role {
          id
          name
          is_system_role
        }
        permissions
        created_at
        updated_at
      }
    }
  }
`;

const STAFF_USER_ME = gql`
  query StaffUserMe {
    staffUserMe {
      id
      email
      first_name
      last_name
      is_active
      role_id
      role {
        id
        name
        is_system_role
      }
      permissions
      created_at
      updated_at
    }
  }
`;

export interface StaffUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role_id: string;
  role: {
    id: string;
    name: string;
    is_system_role: boolean;
  };
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: StaffUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // User stored in memory only (not localStorage)
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [loginMutation] = useMutation(STAFF_USER_LOGIN);
  const [fetchMe] = useLazyQuery(STAFF_USER_ME, {
    fetchPolicy: "network-only",
  });

  // On mount, check if we have a token and fetch user data
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("staffUserToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await fetchMe();

        if (error || !data?.staffUserMe) {
          // Token is invalid, clear it
          localStorage.removeItem("staffUserToken");
          setUser(null);
        } else {
          // Store user in memory only
          setUser(data.staffUserMe);
        }
      } catch {
        localStorage.removeItem("staffUserToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await loginMutation({
          variables: { email: email.trim(), password: password.trim() },
        });

        if (data?.staffUserLogin) {
          // Store token in localStorage (for persistence)
          localStorage.setItem("staffUserToken", data.staffUserLogin.token);
          // Store user in memory only (not localStorage)
          setUser(data.staffUserLogin.staffUser);
          return { success: true };
        }

        return { success: false, error: "Login failed" };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Invalid credentials",
        };
      }
    },
    [loginMutation]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("staffUserToken");
    setUser(null);
    apolloClient.clearStore();
    router.push("/login");
  }, [router]);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
