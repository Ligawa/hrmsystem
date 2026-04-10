export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Globe,
  Heart,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at World Vision",
  description:
    "Join World Vision and make a difference. Explore career opportunities to create lasting change in communities worldwide.",
};

const benefits = [
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Work on projects that transform lives in communities worldwide",
  },
  {
    icon: Users,
    title: "Diverse Team",
    description:
      "Collaborate with talented professionals from over 150 countries",
  },
  {
    icon: Heart,
    title: "Competitive Benefits",
    description: "Comprehensive health coverage, pension, and education grants",
  },
  {
    icon: Zap,
    title: "Growth Opportunities",
    description: "Continuous learning and career development programs",
  },
];

const typeColors: Record<string, string> = {
  "full-time": "bg-green-100 text-green-800",
  "part-time": "bg-blue-100 text-blue-800",
  contract: "bg-orange-100 text-orange-800",
  internship: "bg-purple-100 text-purple-800",
  consultant: "bg-cyan-100 text-cyan-800",
};

export default async function CareersPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const featuredJobs = jobs?.filter((job) => job.featured) || [];
  const regularJobs = jobs?.filter((job) => !job.featured) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/images/good-stories.png')] bg-cover bg-center opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl text-balance">
              Join Our Mission
            </h1>
            <p className="mt-6 text-lg text-white/90 md:text-xl leading-relaxed">
              Be part of a global team working to promote sustainable economic
              development and create lasting change in communities around the
              world.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#openings">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary"
                >
                  View Open Positions
                </Button>
              </a>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
                >
                  Learn About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Why Join UNEDP?</h2>
            <p className="mt-4 text-muted-foreground">
              At UNEDP, you will have the opportunity to contribute to
              meaningful work that shapes the future of sustainable development.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="bg-gradient-to-br from-slate-50 to-white py-20 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Featured Positions</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">High-Priority Opportunities</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                These positions are critical to our mission. We're actively seeking passionate professionals to join our team.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {featuredJobs.map((job) => (
                <Link key={job.id} href={`/careers/${job.slug}`}>
                  <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white overflow-hidden">
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <Badge className="mb-3 bg-primary/10 text-primary border-0">
                            Featured
                          </Badge>
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.department && (
                            <p className="mt-2 text-base text-muted-foreground font-medium">
                              {job.department}
                            </p>
                          )}
                        </div>
                        <Badge className={`${typeColors[job.type]} capitalize text-sm`}>
                          {job.type.replace("-", " ")}
                        </Badge>
                      </div>
                      
                      <div className="mt-6 space-y-3 flex-1">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{job.location}</span>
                        </div>
                        {job.level && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground capitalize">{job.level} Level</span>
                          </div>
                        )}
                        {job.salary_range && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{job.salary_range}</span>
                          </div>
                        )}
                      </div>

                      <p className="mt-6 text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      
                      {job.closing_date && (
                        <p className="mt-4 flex items-center gap-2 text-xs font-medium text-primary/70">
                          <Clock className="h-3 w-3" />
                          Closes {new Date(job.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                      
                      <div className="mt-6 pt-6 border-t flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                        View Details & Apply
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Openings */}
      <section id="openings" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">All Opportunities</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              {jobs?.length || 0} Open Positions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Explore all available roles and find the perfect opportunity to advance your career with UNEDF.
            </p>
          </div>

          {jobs && jobs.length > 0 ? (
            <div className="grid gap-4 lg:gap-6">
              {regularJobs.map((job) => (
                <Link key={job.id} href={`/careers/${job.slug}`}>
                  <Card className="group border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer bg-white hover:bg-slate-50">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <Badge className={`${typeColors[job.type]} text-xs capitalize`}>
                            {job.type.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary/60" />
                            {job.location}
                          </span>
                          {job.department && (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Briefcase className="h-4 w-4 text-primary/60" />
                              {job.department}
                            </span>
                          )}
                          {job.closing_date && (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4 text-primary/60" />
                              Closes {new Date(job.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                        Apply Now
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="mt-8 border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-2xl font-bold">
                  No Open Positions
                </h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  Check back later for new opportunities or subscribe to our newsletter to be notified when positions open.
                </p>
                <Link href="/#newsletter">
                  <Button className="mt-6">Subscribe for Updates</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Make an Impact?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">
            Join thousands of professionals who have chosen to build their
            careers at UNEDP and contribute to sustainable development
            worldwide.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#openings">
              <Button size="lg" variant="secondary" className="text-primary">
                Browse All Jobs
              </Button>
            </a>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                About UNEDP
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
