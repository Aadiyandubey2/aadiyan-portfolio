

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon, Sun, Moon, Menu, X, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const getActiveTab = () => {
    const currentItem = items.find(item => 
      item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
    )
    return currentItem?.name || items[0].name
  }
  
  const activeTab = getActiveTab()

  const toggleTheme = () => {
    setTheme(theme === "space" ? "water" : "space")
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "py-3" : "py-4 sm:py-5",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={cn(
            "flex items-center justify-between rounded-full px-4 sm:px-6 py-2.5 transition-all duration-300",
            "bg-background/70 border border-border/50 backdrop-blur-xl shadow-lg"
          )}>
            {/* Logo */}
            <Link to="/" className="font-heading font-bold text-xl hover:scale-105 transition-transform shrink-0 text-foreground">
              <svg width="44" height="44" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" className="sm:w-14 sm:h-14">
                <defs>
                  <filter id="glass3d-nav" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset dx="2" dy="3" result="offset" />
                    <feMerge>
                      <feMergeNode in="offset" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <text x="30" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill="currentColor" filter="url(#glass3d-nav)">
                  A
                </text>
                <text x="70" y="95" fontFamily="Inter, system-ui" fontWeight="900" fontSize="68" fill="currentColor" filter="url(#glass3d-nav)">
                  D
                </text>
              </svg>
            </Link>

            {/* Desktop Navigation - Tubelight Effect */}
            <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full p-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    className={cn(
                      "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
                      "hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={16} />
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="tubelight-desktop"
                        className="absolute inset-0 rounded-full bg-background shadow-md -z-0"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      >
                        {/* Tubelight glow effect */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full opacity-80" />
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-primary/40 rounded-full blur-sm" />
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-primary/20 rounded-full blur-md" />
                      </motion.div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Auth */}
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-primary/30",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all"
                >
                  Sign in
                </Link>
              </SignedOut>
              {/* Language Toggle */}
              <motion.button
                onClick={toggleLanguage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 sm:p-2.5 rounded-full border border-border/50 hover:border-primary/50 transition-colors",
                  language === "hi" ? "bg-primary/20 text-primary" : "bg-muted/50"
                )}
                aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
                title={language === "en" ? "हिंदी में देखें" : "Switch to English"}
              >
                <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 sm:p-2.5 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors"
                aria-label={theme === "space" ? "Switch to light theme" : "Switch to dark theme"}
              >
                {theme === "space" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                )}
              </motion.button>

              {/* CTA Button - Desktop */}
              <Link
                to="/contact"
                className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-heading font-semibold text-xs sm:text-sm text-primary-foreground bg-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
              >
                <span>{t("nav.lets_talk")}</span>
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden pt-24"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-background/90 backdrop-blur-xl" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative mx-4 sm:mx-6 p-4 sm:p-6 bg-background/80 border border-border/50 backdrop-blur-xl rounded-3xl shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                {items.map((item, index) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-medium transition-all duration-300",
                          isActive 
                            ? "text-primary bg-primary/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="tubelight-mobile"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Language Toggle in Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: items.length * 0.05 }}
                >
                  <button
                    onClick={toggleLanguage}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-medium transition-all duration-300",
                      language === "hi"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Languages size={20} />
                    <span>{language === "en" ? "हिंदी में बदलें" : "Switch to English"}</span>
                  </button>
                </motion.div>

                {/* Theme Toggle in Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (items.length + 1) * 0.05 }}
                >
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
                  >
                    {theme === "space" ? (
                      <>
                        <Sun size={20} />
                        <span>{t("nav.switch_light")}</span>
                      </>
                    ) : (
                      <>
                        <Moon size={20} />
                        <span>{t("nav.switch_dark")}</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* CTA Button in Mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (items.length + 2) * 0.05 }}
                  className="mt-2"
                >
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-heading font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <span>{t("nav.lets_talk")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
