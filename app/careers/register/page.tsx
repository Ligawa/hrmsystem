'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerApplicant } from '@/lib/services/applicant-auth-service';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';

export default function ApplicantRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePictureUrl: '',
    resumeUrl: '',
    coverLetterUrl: '',
    identificationDocUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await registerApplicant({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setApplicantId(result.applicantId || null);
        setTimeout(() => {
          router.push(`/careers/login?email=${formData.email}`);
        }, 3000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Registration Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Thank you for registering! Your applicant ID is:
            </p>
            <p className="font-mono font-bold text-lg text-blue-600">
              {applicantId}
            </p>
            <p className="text-sm text-gray-600">
              You will be redirected to the login page shortly...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-4 py-12">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Who-DLc16w1mVMIh5V1wglqTNECvigTNsg.png"
            alt="WHO Logo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Join WHO</h1>
          <p className="text-blue-100 mt-2">Create your applicant account and start your career journey</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Fill in your information to get started with your WHO application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Application Documents</h3>
                <p className="text-sm text-gray-600 mb-4">Upload the following documents to complete your application:</p>
                
                <div className="space-y-4">
                  <FileUpload
                    label="Profile Picture"
                    accept="image/*"
                    maxSize={5}
                    acceptedFormats={['JPG', 'PNG', 'GIF']}
                    helperText="Upload a professional profile photo. Max 5MB."
                    onFileUpload={(url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }))}
                  />
                  
                  <FileUpload
                    label="Resume/CV"
                    accept=".pdf,.doc,.docx"
                    maxSize={10}
                    acceptedFormats={['PDF', 'DOC', 'DOCX']}
                    helperText="Upload your resume or CV. Max 10MB."
                    onFileUpload={(url) => setFormData(prev => ({ ...prev, resumeUrl: url }))}
                  />
                  
                  <FileUpload
                    label="Cover Letter"
                    accept=".pdf,.doc,.docx"
                    maxSize={5}
                    acceptedFormats={['PDF', 'DOC', 'DOCX']}
                    helperText="Upload a cover letter. Max 5MB."
                    onFileUpload={(url) => setFormData(prev => ({ ...prev, coverLetterUrl: url }))}
                  />
                  
                  <FileUpload
                    label="Identification Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={10}
                    acceptedFormats={['PDF', 'JPG', 'PNG']}
                    helperText="Upload a copy of your ID. Max 10MB."
                    onFileUpload={(url) => setFormData(prev => ({ ...prev, identificationDocUrl: url }))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/careers/login" className="text-blue-600 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
