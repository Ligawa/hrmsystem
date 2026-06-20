import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Globe2, FileText, Newspaper } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/images/who-logo.png"
            alt="World Health Organization"
            className="h-24 w-auto"
          />
        </div>

        {/* Organization Name */}
        <p className="text-sm font-semibold text-blue-600 mb-4">World Health Organization</p>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-blue-600">404</h1>

        {/* Message */}
        <h2 className="mt-4 text-2xl font-semibold text-gray-900 md:text-3xl">
          Page Not Found
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page may have been moved, deleted, or may never have existed.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/careers">
              <Search className="mr-2 h-4 w-4" />
              Browse Careers
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="mb-4 text-sm font-medium text-gray-600">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/careers"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <Globe2 className="h-4 w-4" />
              Career Opportunities
            </Link>
            <Link
              href="/careers/dashboard"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <FileText className="h-4 w-4" />
              Applicant Dashboard
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <Newspaper className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
