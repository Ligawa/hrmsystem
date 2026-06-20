"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, Menu, X, ChevronDown, Globe, LogIn, UserPlus, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

const navigation = [
  { name: "About", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Browse Jobs", href: "/careers/browse" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "ar", name: "العربية" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
]

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState("en")
  const { user, isLoggedIn, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    // Redirect to home page
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Who-DLc16w1mVMIh5V1wglqTNECvigTNsg.png" 
              alt="World Health Organisation Logo" 
              className="h-14 w-auto"
            />
            <span className="hidden sm:inline text-xl font-bold text-white">WHO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-semibold text-white transition-colors hover:text-white/80"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {searchOpen ? (
              <div className="hidden items-center gap-2 lg:flex">
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-9 w-64 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="text-white hover:bg-white/20"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex text-white hover:bg-white/20"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              {isLoggedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{user.firstName} {user.lastName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/careers/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/careers/dashboard/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Link href="/careers/login" className="flex items-center gap-1">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-white text-blue-900 hover:bg-gray-100 font-semibold">
                    <Link href="/careers/register" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden gap-1 lg:flex text-white hover:bg-white/20">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={currentLang === lang.code ? "bg-secondary text-white" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/20" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex flex-col gap-6 pt-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search..."
                      className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <SheetClose asChild key={item.name}>
                        <Link
                          href={item.href}
                          className="rounded-md px-4 py-3 text-lg font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile Auth Buttons */}
                  <div className="border-t pt-4 flex gap-2">
                    {isLoggedIn && user ? (
                      <>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href="/careers/dashboard">Dashboard</Link>
                        </Button>
                        <Button onClick={handleLogout} className="flex-1 bg-red-600 hover:bg-red-700">
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href="/careers/login">Login</Link>
                        </Button>
                        <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Link href="/careers/register">Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Mobile Language */}
                  <div className="border-t pt-4">
                    <p className="mb-2 px-4 text-sm font-medium text-muted-foreground">Language</p>
                    <div className="grid grid-cols-2 gap-2 px-4">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setCurrentLang(lang.code)}
                          className={`rounded-md px-3 py-2 text-sm ${
                            currentLang === lang.code
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
