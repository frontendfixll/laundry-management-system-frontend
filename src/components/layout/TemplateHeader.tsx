'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, ChevronDown, ShoppingBag, MapPin, User, LogOut, Menu, X, 
  Phone, Waves, Mail, Clock
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Language, getTranslation } from '@/lib/translations'

type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange'
type TemplateType = 'original' | 'minimal' | 'freshspin' | 'starter'

const colorClasses = {
  teal: { 
    primary: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-teal-500', 
    border: 'border-teal-500', hoverText: 'hover:text-teal-500', lightBg: 'hover:bg-teal-50',
    light: 'bg-teal-50', accent: '#14b8a6'
  },
  blue: { 
    primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', 
    border: 'border-blue-500', hoverText: 'hover:text-blue-500', lightBg: 'hover:bg-blue-50',
    light: 'bg-blue-50', accent: '#3b82f6'
  },
  purple: { 
    primary: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-500', 
    border: 'border-purple-500', hoverText: 'hover:text-purple-500', lightBg: 'hover:bg-purple-50',
    light: 'bg-purple-50', accent: '#8b5cf6'
  },
  orange: { 
    primary: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', 
    border: 'border-orange-500', hoverText: 'hover:text-orange-500', lightBg: 'hover:bg-orange-50',
    light: 'bg-orange-50', accent: '#f97316'
  },
}

export default function TemplateHeader() {
  const { user, isAuthenticated } = useAuthStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [template, setTemplate] = useState<TemplateType>('original')
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Translation helper
  const t = (key: string) => getTranslation(language, key)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('landing_color') as ThemeColor
      const savedTemplate = localStorage.getItem('landing_template') as TemplateType
      const savedLanguage = localStorage.getItem('landing_language') as Language
      if (savedColor && ['teal', 'blue', 'purple', 'orange'].includes(savedColor)) {
        setThemeColor(savedColor)
      }
      if (savedTemplate) {
        setTemplate(savedTemplate)
      }
      if (savedLanguage && ['en', 'es', 'hi'].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
      setIsLoaded(true)
    }
  }, [])

  // Listen for theme color changes from PageThemeCustomizer
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ color: ThemeColor }>) => {
      setThemeColor(e.detail.color)
    }
    window.addEventListener('themeColorChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeColorChange', handleThemeChange as EventListener)
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<{ language: Language }>) => {
      setLanguage(e.detail.language)
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const colors = colorClasses[themeColor]
  const isActive = (path: string) => pathname === path

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return <div className="h-16 bg-white" />
  }

  // FreshSpin Template Header (Landing Page 3)
  if (template === 'freshspin') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar - Contact Info */}
        <div className="bg-white py-2 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Phone className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Mail className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">support@laundrypro.com</span>
                </div>
                <div className="hidden md:flex items-center gap-2 text-gray-700">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Clock className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">{t('about.feature2')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Header */}
        <header className="bg-white py-3 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Waves className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">LaundryPro</span>
              </Link>

              {/* Navigation - Rounded Pill Shape */}
              <div className="hidden md:flex items-center">
                <nav 
                  className="flex items-center gap-1 px-2 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                >
                <Link href="/" className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${isActive('/') ? 'bg-white/20' : ''}`}>{t('nav.home')}</Link>
                <Link href="/services" className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${isActive('/services') ? 'bg-white/20' : ''}`}>{t('nav.services')}</Link>
                <Link href="/pricing" className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${isActive('/pricing') ? 'bg-white/20' : ''}`}>{t('nav.pricing')}</Link>
                <Link href="/help" className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${isActive('/help') ? 'bg-white/20' : ''}`}>{t('nav.help')}</Link>
              </nav>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/customer/orders/new">
                    <Button 
                      className="text-white rounded-full px-4 h-8 text-sm"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 py-2 text-gray-700">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                      >
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className="my-2" />
                        <button 
                          onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }} 
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className={`${colors.border} ${colors.text} h-8 text-sm`}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth/login?redirect=/customer/orders/new">
                    <Button 
                      className="text-white rounded-full h-8 text-sm"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
      </div>
    )
  }

  // Starter/LaundryMaster Template Header (Landing Page 4)
  if (template === 'starter') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-10 h-10 border-2 ${colors.border} rounded-lg flex items-center justify-center`}>
                <Sparkles className={`w-5 h-5 ${colors.text}`} />
              </div>
              <span className="text-xl font-bold text-gray-800">LaundryPro</span>
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className={`font-medium ${isActive('/') ? colors.text : 'text-gray-700'} ${colors.hoverText}`}>{t('nav.home')}</Link>
              <Link href="/services" className={`font-medium ${isActive('/services') ? colors.text : 'text-gray-700'} ${colors.hoverText}`}>{t('nav.services')}</Link>
              <Link href="/pricing" className={`font-medium ${isActive('/pricing') ? colors.text : 'text-gray-700'} ${colors.hoverText}`}>{t('nav.pricing')}</Link>
              <Link href="/help" className={`font-medium ${isActive('/help') ? colors.text : 'text-gray-700'} ${colors.hoverText}`}>{t('nav.help')}</Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <Link href="/customer/orders/new">
                    <Button className={`${colors.primary} ${colors.hover} text-white px-5 py-2 rounded-md font-medium hidden sm:flex`}>
                      {t('hero.schedulePickup')}
                    </Button>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 py-2 text-gray-700">
                      <div className={`w-9 h-9 ${colors.primary} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className="my-2" />
                        <button 
                          onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }} 
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className={`${colors.border} ${colors.text}`}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className={`${colors.primary} ${colors.hover} text-white`}>
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
    )
  }

  // Minimal Template Header (Landing Page 2)
  if (template === 'minimal') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">LaundryPro</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className={`font-medium transition-colors hover:opacity-80 ${isActive('/') ? colors.text : 'text-gray-600'}`}>
                {t('nav.home')}
              </Link>
              <Link href="/services" className={`font-medium transition-colors hover:opacity-80 ${isActive('/services') ? colors.text : 'text-gray-600'}`}>
                {t('nav.services')}
              </Link>
              <Link href="/pricing" className={`font-medium transition-colors hover:opacity-80 ${isActive('/pricing') ? colors.text : 'text-gray-600'}`}>
                {t('nav.pricing')}
              </Link>
              <Link href="/help" className={`font-medium transition-colors hover:opacity-80 ${isActive('/help') ? colors.text : 'text-gray-600'}`}>
                {t('nav.help')}
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/customer/orders/new">
                    <Button 
                      className="text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 text-gray-600">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colors.accent }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50">
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50">
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50">
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className="my-2" />
                        <button 
                          onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }} 
                          className="flex items-center w-full px-4 py-2.5 text-red-500 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="font-medium text-gray-600 transition-colors hover:opacity-80">
                    {t('nav.login')}
                  </Link>
                  <Link href="/customer/orders/new">
                    <Button 
                      className="text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colors.accent }}
                    >
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col gap-4">
                <Link href="/" className="font-medium text-gray-600">{t('nav.home')}</Link>
                <Link href="/services" className="font-medium text-gray-600">{t('nav.services')}</Link>
                <Link href="/pricing" className="font-medium text-gray-600">{t('nav.pricing')}</Link>
                <Link href="/help" className="font-medium text-gray-600">{t('nav.help')}</Link>
                <hr />
                <Button 
                  className="text-white rounded-full font-medium w-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.accent }}
                >
                  {t('nav.bookNow')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
    )
  }

  // Default Header (for other templates)
  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 ${colors.primary} rounded-full flex items-center justify-center`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">LaundryPro</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${isActive('/') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}>{t('nav.home')}</Link>
            <Link href="/services" className={`${isActive('/services') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}>{t('nav.services')}</Link>
            <Link href="/pricing" className={`${isActive('/pricing') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}>{t('nav.pricing')}</Link>
            <Link href="/help" className={`${isActive('/help') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}>{t('nav.help')}</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/customer/dashboard">
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>
                    <User className="w-4 h-4 mr-2" />{t('nav.dashboard')}
                  </Button>
                </Link>
                <div className="relative group">
                  <button className={`flex items-center space-x-2 text-gray-700 ${colors.hoverText} py-2`}>
                    <div className={`w-8 h-8 ${colors.primary} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                      </Link>
                      <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                      </Link>
                      <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" className={`${colors.border} ${colors.text} ${colors.lightBg}`}>{t('nav.login')}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>{t('nav.signup')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
