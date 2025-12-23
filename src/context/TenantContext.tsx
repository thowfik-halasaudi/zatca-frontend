"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { EgsListItem } from "@/lib/types";
import { useRouter } from "next/navigation";

type UserRole = "ADMIN" | "HOTEL" | null;

interface TenantContextType {
  userRole: UserRole;
  activeTenant: EgsListItem | null;
  login: (role: UserRole, tenant?: EgsListItem) => void;
  logout: () => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeTenant, setActiveTenant] = useState<EgsListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load from localStorage on mount
    const storedRole = localStorage.getItem("zatca_user_role") as UserRole;
    const storedTenant = localStorage.getItem("zatca_active_tenant");

    if (storedRole) {
      setUserRole(storedRole);
      if (storedRole === "HOTEL" && storedTenant) {
        try {
          setActiveTenant(JSON.parse(storedTenant));
        } catch (e) {
          console.error("Failed to parse stored tenant", e);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (role: UserRole, tenant?: EgsListItem) => {
    setUserRole(role);
    localStorage.setItem("zatca_user_role", role || "");

    if (role === "HOTEL" && tenant) {
      setActiveTenant(tenant);
      localStorage.setItem("zatca_active_tenant", JSON.stringify(tenant));
    } else {
      setActiveTenant(null);
      localStorage.removeItem("zatca_active_tenant");
    }
  };

  const logout = () => {
    setUserRole(null);
    setActiveTenant(null);
    localStorage.removeItem("zatca_user_role");
    localStorage.removeItem("zatca_active_tenant");
    router.push("/");
  };

  return (
    <TenantContext.Provider
      value={{ userRole, activeTenant, login, logout, isLoading }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
