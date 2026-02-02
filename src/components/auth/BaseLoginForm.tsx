'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { LandingPageTemplate, getTemplateTheme, getTemplateContent } from '@/utils/templateUtils'

interface BaseLoginFormProps {
  template: LandingPageTemplate
  tenantSlug?: string | null
  leftSideContent?: React.ReactNode
  customStyling?: {
    containerClass?: string
    formCardClass?: string
    buttonClass?: string
  }
}

export default function BaseLoginForm({
  template,
  tenantSlug,
  leftSideContent,
  customStyling
}: BaseLoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)

  const redirectUrl = searchParams?.get('redirect')
  const theme = getTemplateTheme(template)
  const content = getTemplateContent(template)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(formData);
      console.log('Login response:', response);

      // Extract token and user from the correct location
      const token = response.data?.token || response.data?.data?.token;
      const user = response.data?.user || response.data?.data?.user;

      console.log('Extracted token:', token ? 'Found' : 'Not found');
      console.log('Extracted user:', user ? 'Found' : 'Not found');

      if (!token || !user) {
        throw new Error('Invalid login response - missing token or user data');
      }

      setAuth(user, token);

      // Show success message very briefly and dismiss quickly
      const successToast = toast.success('Login successful!', {
        duration: 800, // Show for only 800ms
      });

      // Dismiss success toast even more quickly for faster UX
      setTimeout(() => {
        toast.dismiss(successToast);
      }, 500);

      // Handle tenant-aware redirects
      let redirectPath: string;

      if (user.role === 'customer') {
        // For customers, check if we have a redirect URL and tenant context
        if (redirectUrl && tenantSlug) {
          // If redirect URL is provided and we're in tenant context, redirect to tenant-specific URL
          redirectPath = `/${tenantSlug}${redirectUrl}`;
          console.log(`🔄 Customer redirect with tenant context: ${redirectPath}`);
        } else if (tenantSlug) {
          // If no redirect URL but we have tenant context, go to tenant dashboard
          redirectPath = `/${tenantSlug}/dashboard`;
          console.log(`🔄 Customer redirect to tenant dashboard: ${redirectPath}`);
        } else {
          // Fallback to regular customer dashboard
          redirectPath = '/customer/dashboard';
          console.log(`🔄 Customer redirect to regular dashboard: ${redirectPath}`);
        }
      } else {
        // For non-customers, use role-based routing
        const roleRoutes: Record<string, string> = {
          admin: '/admin/dashboard',
          branch_admin: '/branch-admin/dashboard',
          center_admin: '/center-admin/dashboard',
          branch_manager: '/center-admin/dashboard',
          staff: '/staff/dashboard',
          superadmin: '/superadmin/dashboard',
          support: '/support/dashboard',
        };

        redirectPath = roleRoutes[user.role] || '/auth/login';
        console.log(`🔄 Non-customer redirect: ${redirectPath}`);
      }

      console.log(`🔄 Login successful - redirecting ${user.role} to: ${redirectPath}`);

      // Immediate redirect for faster UX
      router.push(redirectPath);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';

      if (error.response?.data?.requiresEmailVerification) {
        toast.error('Please verify your email address before logging in');
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const containerClass = customStyling?.containerClass || `min-h-screen bg-gradient-to-br ${theme.gradient}`;
  const formCardClass = customStyling?.formCardClass || 'bg-white rounded-2xl shadow-xl p-8 border border-gray-100';
  const buttonClass = customStyling?.buttonClass || `w-full bg-gradient-to-r ${theme.buttonGradient} hover:${theme.hoverGradient} text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className={containerClass}>
      {/* Back Button - Fixed Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href={tenantSlug ? `/${tenantSlug}` : "/"}
          className={`inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm text-${theme.primary}-600 hover:text-${theme.primary}-700 hover:bg-white transition-all duration-200`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="min-h-screen flex items-center justify-center">
        {/* Left Side - Custom Content */}
        {leftSideContent && (
          <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-12 xl:px-16">
            {leftSideContent}
          </div>
        )}

        {/* Right Side - Login Form */}
        <div className={`w-full ${leftSideContent ? 'lg:w-[45%]' : 'max-w-md'} flex items-start justify-start px-6 pt-24 lg:px-12`}>
          <div className="w-full max-w-md">
            {/* Login Form Card */}
            <div className={formCardClass}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {content.loginTitle}
                </h2>
                <p className="text-gray-600 mt-1" style={{ fontSize: '15px' }}>
                  {content.loginSubtitle}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent transition-all duration-200 bg-gray-50`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent transition-all duration-200 bg-gray-50`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className={`h-4 w-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500 border-gray-300 rounded`}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className={`text-sm text-${theme.primary}-600 hover:text-${theme.primary}-500 font-medium`}>
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={buttonClass}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600" style={{ fontSize: '15px' }}>
                  Don't have an account?{' '}
                  <Link href="/auth/register" className={`font-medium text-${theme.primary}-600 hover:text-${theme.primary}-500 transition-colors`}>
                    Create one now
                  </Link>
                </p>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Demo Login:</h3>
              <div className="space-y-2">
                {/* First row: 3 items */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="demoAccount"
                      className={`w-4 h-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500`}
                      onChange={() => setFormData({ email: 'testcustomer@demo.com', password: 'password123' })}
                    />
                    <span className="text-xs text-gray-600">Customer</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="demoAccount"
                      className={`w-4 h-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500`}
                      onChange={() => setFormData({ email: 'admin@gmail.com', password: 'password123' })}
                    />
                    <span className="text-xs text-gray-600">Admin</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="demoAccount"
                      className={`w-4 h-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500`}
                      onChange={() => setFormData({ email: 'supportadmin@laundrypro.com', password: 'deep2025' })}
                    />
                    <span className="text-xs text-gray-600">Support</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}