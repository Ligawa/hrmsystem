import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Briefcase, Users, Globe, CheckCircle2, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const jobBenefits = [
  { icon: Globe, label: "Global Impact", description: "Work with international teams making a difference worldwide" },
  { icon: Users, label: "Diverse Teams", description: "Collaborate with talented professionals from 100+ countries" },
  { icon: Award, label: "Professional Growth", description: "Access to training, mentorship, and career development programs" },
  { icon: CheckCircle2, label: "Meaningful Work", description: "Contribute directly to WHO's mission of global health" },
]

const applicationSteps = [
  {
    number: "1",
    title: "Create Your Profile",
    description: "Register as an applicant and build your professional profile with education and work experience.",
  },
  {
    number: "2",
    title: "Browse Open Positions",
    description: "Explore job opportunities across different roles, locations, and career levels.",
  },
  {
    number: "3",
    title: "Submit Application",
    description: "Apply to positions that match your skills and interests with a personalized cover letter.",
  },
  {
    number: "4",
    title: "Complete Assessments",
    description: "Participate in technical assessments and evaluations relevant to the position.",
  },
  {
    number: "5",
    title: "Interview Process",
    description: "Engage with our recruitment team through multiple interview rounds.",
  },
  {
    number: "6",
    title: "Get Hired",
    description: "Receive your offer and join the WHO family to make global health impact.",
  },
]

const whyChooseWHO = [
  {
    title: "Mission-Driven Work",
    description: "Be part of the world's leading global health authority working to achieve better health for all.",
    icon: Globe,
  },
  {
    title: "International Career",
    description: "Access opportunities across 150+ countries with exposure to diverse healthcare systems.",
    icon: Briefcase,
  },
  {
    title: "Professional Development",
    description: "Invest in your growth with training, conferences, and mentorship from global experts.",
    icon: Award,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Who%20logo%20transaparent-s8tFTJQHbsixX7kvCoojO0zQUpjsmV.png"
                alt="WHO Logo"
                className="h-16 w-16"
              />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Careers at WHO</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl text-gray-900 text-balance">
              Shape Global Health. Make an Impact.
            </h1>
            <p className="mt-6 text-xl text-gray-700 md:text-2xl leading-relaxed max-w-2xl">
              Join the World Health Organization and work at the forefront of global health challenges. 
              Build your career with a mission to achieve better health for all.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold">
                <Link href="/careers/browse">
                  Browse Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="/careers/register">Start Your Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose WHO */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 lg:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold">Why Join WHO?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Work with the world's leading global health authority on meaningful projects that save lives.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {whyChooseWHO.map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <item.icon className="h-12 w-12 mb-4 text-blue-200" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How to Apply</h2>
            <p className="mt-4 text-xl text-gray-600">
              A straightforward process to help you join our global health mission.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {applicationSteps.map((step) => (
              <div key={step.number} className="bg-blue-50 rounded-lg p-8 border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/careers/register">
                Start Your Application Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Job Benefits */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900">What We Offer</h2>
            <p className="mt-4 text-xl text-gray-600">
              Competitive benefits and a supportive environment for your professional growth.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {jobBenefits.map((benefit) => (
              <Card key={benefit.label} className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <benefit.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.label}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-gray-600">
              Find answers to common questions about working at WHO.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "What qualifications do I need to apply?",
                a: "Qualifications vary by position. Most roles require relevant education and professional experience. Check the specific job description for detailed requirements.",
              },
              {
                q: "How long does the recruitment process take?",
                a: "The timeline varies by position, typically ranging from 2-4 months from application to hiring decision, including interviews and assessments.",
              },
              {
                q: "Can I apply for multiple positions?",
                a: "Yes, you can apply for multiple positions that match your qualifications. Create one profile and apply to as many open positions as you&apos;d like.",
              },
              {
                q: "Is there a language requirement?",
                a: "Fluency requirements depend on the role and location. Most positions require English proficiency; some may require additional language skills.",
              },
              {
                q: "Do you offer remote work opportunities?",
                a: "Yes, many positions offer remote or flexible work arrangements. Position details will specify the work location and flexibility options.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold md:text-5xl">Ready to Make a Global Health Impact?</h2>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed">
              Explore our current openings and take the first step toward a rewarding career with the World Health Organization. 
              Your expertise and passion can help us achieve better health for all.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                <Link href="/careers/browse">
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/careers/register">Create Your Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
