import Link from "next/link"
import { ArrowRight, Briefcase, Users, Globe, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <section className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/images/hero-background.png)'}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WHO%20logo%20full-9cnF9bVMNlZ8JGZXBp4fdUCiI4lrIV.jpg"
              alt="WHO Logo"
              className="h-24 w-auto mx-auto mb-8"
            />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight">
              Shape Global Health
            </h1>
            <p className="mt-8 text-lg md:text-xl text-white/90 leading-relaxed">
              Join the World Health Organization
            </p>
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg">
                <Link href="/careers/browse">
                  Browse Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg">
                <Link href="/careers/register">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose WHO - Compact */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Why Join WHO?</h2>
          
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {whyChooseWHO.map((item) => (
              <div key={item.title} className="bg-blue-50 rounded-lg p-6 text-center">
                <item.icon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
