"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, Menu, X, ChevronDown, Globe } from "lucide-react"
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

const navigation = [
  { name: "About", href: "/about" },
  { name: "What We Do", href: "/what-we-do" },
  { name: "Issues", href: "/issues" },
  { name: "Countries", href: "/countries" },
  { name: "Resources", href: "/resources" },
  { name: "News", href: "/news" },
  { name: "Careers", href: "/careers" },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img 
              src="/images/wvi-logo-white.svg" 
              alt="World Vision International Logo" 
              className="h-10 w-auto flex-shrink-0"
            />
            <span className="hidden sm:inline text-sm font-bold text-white">World Vision International</span>
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
          <div className="flex items-center gap-2">
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

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden gap-1 lg:flex text-white hover:bg-white/20">
                  <Globe className="h-4 w-4" />
                  <span className="uppercase">{currentLang}</span>
                  <ChevronDown className="h-3 w-3" />
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
