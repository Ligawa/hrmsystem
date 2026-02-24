"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, Shield } from "lucide-react"

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    reason: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Check if email domain is allowed for admin access
    const allowedDomains = ['unoedp.org', 'alghahim.co.ke']
    const emailDomain = formData.email.split('@')[1]?.toLowerCase()
    
    if (!allowedDomains.includes(emailDomain)) {
      setError(`Admin access is only available for ${allowedDomains.join(' and ')} email addresses.`)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/setup/login`,
          data: {
            full_name: formData.fullName,
            department: formData.department,
            access_reason: formData.reason,
            is_admin: true, // In production, this should be false and require approval
          },
        },
      })

      if (signUpError) {
        console.error("[v0] Signup error:", signUpError)
        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.")
        } else if (signUpError.message.includes("valid email")) {
          setError("Please enter a valid email address.")
        } else {
          setError(signUpError.message || "Failed to create account. Please try again.")
        }
        setIsLoading(false)
        return
      }

      // Check if user was created successfully
      if (!data?.user) {
        setError("Registration failed. Please try again or contact support.")
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error("[v0] Unexpected signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <img 
              src="/images/unedp-logo.jpg" 
              alt="UNEDP Logo"
                className="mx-auto h-16 w-auto"
              />
            </Link>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registration Submitted</CardTitle>
              <CardDescription>
                Please check your email to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>
                We&apos;ve sent a confirmation email to <strong>{formData.email}</strong>. 
                Please click the link in the email to verify your account and complete the registration process.
              </p>
              <p className="mt-4">
                Once verified, you&apos;ll be able to sign in to the admin portal.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" asChild>
                <Link href="/setup/login">Go to Sign In</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <img 
              src="/images/unedp-logo.jpg" 
              alt="UNEDP Logo" 
              className="mx-auto h-16 w-auto"
            />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Admin Portal</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Request Admin Access</CardTitle>
            <CardDescription>
              Fill out the form below to request administrator access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@unedp.org"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Communications, HR, etc."
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Access</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please describe why you need admin access..."
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have admin access?{" "}
              <Link href="/setup/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-center text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Return to main website
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
