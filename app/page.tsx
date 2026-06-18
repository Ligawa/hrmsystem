import Link from "next/link"
import { ArrowRight, Briefcase, Users, Globe, Award, CheckCircle2, Zap, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const whyChooseWHO = [
  {
    title: "Global Impact",
    description: "Work on health initiatives affecting over 8 billion people across 194 member states.",
    icon: Globe,
  },
  {
    title: "Career Growth",
    description: "Access mentorship from global experts and professional development opportunities.",
    icon: TrendingUp,
  },
  {
    title: "Mission-Driven",
    description: "Contribute to health equity and sustainable development goals worldwide.",
    icon: Target,
  },
  {
    title: "International Team",
    description: "Collaborate with professionals from diverse backgrounds and cultures.",
    icon: Users,
  },
]

const applicationFeatures = [
  {
    title: "Easy Application",
    description: "Simple, streamlined process to apply for positions that match your expertise.",
    icon: CheckCircle2,
  },
  {
    title: "Track Progress",
    description: "Real-time updates on your application status from submission to decision.",
    icon: Zap,
  },
  {
    title: "Manage Documents",
    description: "Upload, organize, and manage all your application materials securely.",
    icon: Briefcase,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Who-DLc16w1mVMIh5V1wglqTNECvigTNsg.png"
                alt="WHO Logo"
                className="h-20 w-auto mx-auto"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight mb-6">
              Shape Global Health
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-4">
              Join the World Health Organization and make a difference in global public health
            </p>
            
            <p className="text-blue-200 mb-12">
              Apply for positions, track your applications, and take the next step in your international career
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-lg px-8">
                <Link href="/careers/register" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold border-2 border-white/30 px-8">
                <Link href="/careers/login" className="flex items-center gap-2">
                  Login as Applicant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="mt-8 text-sm text-blue-200">
              Already have an account? <Link href="/careers/login" className="text-white font-semibold hover:underline">Sign in here</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Application Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Application Made Simple</h2>
            <p className="text-lg text-gray-600">
              Our streamlined portal makes it easy to apply for WHO positions, track your progress, and manage your career.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {applicationFeatures.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <feature.icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join WHO Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Join WHO?</h2>
            <p className="text-lg text-gray-600">
              Be part of the world's leading global health authority
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {whyChooseWHO.map((item) => (
              <div key={item.title} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-blue-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Start your journey with WHO today. Apply for positions, build your professional network, and contribute to global health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8">
                <Link href="/careers/browse" className="flex items-center gap-2">
                  Browse Open Positions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild size="lg" className="bg-blue-700 text-white hover:bg-blue-600 font-semibold border-2 border-white/20 px-8">
                <Link href="/careers/register" className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
