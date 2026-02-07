'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface AdminTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

const defaultTheme: AdminTheme = {
  primaryColor: '#14b8a6', // teal
  secondaryColor: '#0d9488',
  accentColor: '#2dd4bf',
  fontFamily: 'Inter',
};

export function useAdminTheme() {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<AdminTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      // Only fetch for tenant admin roles
      const tenantRoles = [
        'admin',
        'tenant_owner',
        'tenant_admin',
        'tenant_ops_manager',
        'tenant_finance_manager',
        'branch_admin',
        'tenant_staff',
      ];

      if (!user || !tenantRoles.includes(user.role as string)) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/admin/tenancy/branding');

        if (response.data.success && response.data.data?.branding?.theme) {
          const brandingTheme = response.data.data.branding.theme;
          setTheme({
            primaryColor: brandingTheme.primaryColor || defaultTheme.primaryColor,
            secondaryColor: brandingTheme.secondaryColor || defaultTheme.secondaryColor,
            accentColor: brandingTheme.accentColor || defaultTheme.accentColor,
            fontFamily: brandingTheme.fontFamily || defaultTheme.fontFamily,
          });
        }
      } catch (error: any) {
        // Silently fail for 404/403 errors as they are expected for some users without full branding access
        if (error.response?.status !== 404 && error.response?.status !== 403) {
          console.error('Failed to fetch admin theme:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();

    // Listen for theme updates
    const handleThemeUpdate = () => {
      fetchTheme();
    };

    window.addEventListener('adminThemeUpdate', handleThemeUpdate);
    return () => window.removeEventListener('adminThemeUpdate', handleThemeUpdate);
  }, [user]);

  // Apply theme to CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Set CSS variables for admin theme
      root.style.setProperty('--admin-primary', theme.primaryColor);
      root.style.setProperty('--admin-secondary', theme.secondaryColor);
      root.style.setProperty('--admin-accent', theme.accentColor);
      root.style.setProperty('--admin-font', theme.fontFamily);

      // Also set as RGB values for opacity usage
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
          : '20, 184, 166'; // default teal
      };

      root.style.setProperty('--admin-primary-rgb', hexToRgb(theme.primaryColor));
      root.style.setProperty('--admin-secondary-rgb', hexToRgb(theme.secondaryColor));
      root.style.setProperty('--admin-accent-rgb', hexToRgb(theme.accentColor));
    }
  }, [theme]);

  return { theme, loading };
}
