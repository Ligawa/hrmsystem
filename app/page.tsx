import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Heart, Droplet, BookOpen, MapPin, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const impactStats = [
  { value: "100+", label: "Countries", icon: MapPin },
  { value: "1M+", label: "Children Sponsored", icon: Heart },
  { value: "600M", label: "People Reached Annually", icon: Users },
  { value: "70+", label: "Years of Impact", icon: Smile },
]

const focusAreas = [
  {
    title: "Child Protection",
    description: "Protecting children from violence, exploitation, and abuse in vulnerable communities.",
    icon: Heart,
    href: "/what-we-do#child-protection",
    color: "bg-red-500",
  },
  {
    title: "Education",
    description: "Ensuring every child has access to quality education and learning opportunities.",
    icon: BookOpen,
    href: "/what-we-do#education",
    color: "bg-yellow-500",
  },
  {
    title: "Health & Nutrition",
    description: "Providing health services, nutrition support, and maternal care for vulnerable families.",
    icon: Heart,
    href: "/what-we-do#health",
    color: "bg-green-500",
  },
  {
    title: "Water & Sanitation",
    description: "Delivering clean water and sanitation access to communities in need.",
    icon: Droplet,
    href: "/what-we-do#water",
    color: "bg-blue-500",
  },
]

const latestStories = [
  {
    title: "Hope Through Education: Transforming Lives in East Africa",
    excerpt: "Meet the children whose futures are being transformed through quality education and mentorship programs across Kenya and Uganda.",
    image: "/images/image-18-credit-undp-nigeria-amalachukwu-ibeneme-crop.jpg",
    date: "January 28, 2026",
    category: "Education",
    slug: "hope-education-east-africa",
  },
  {
    title: "Clean Water Changes Everything: A Village's Story",
    excerpt: "See how access to clean water and sanitation facilities is improving health outcomes for children and families in rural communities.",
    image: "/images/image-1-credit-undp-afghanistan.jpg",
    date: "January 25, 2026",
    category: "Water & Sanitation",
    slug: "clean-water-story",
  },
  {
    title: "Sponsorship Stories: Changing Lives One Child at a Time",
    excerpt: "Discover the powerful impact of child sponsorship and how supporters around the world are making a difference in children's lives.",
    image: "/images/undp-cu-diosmara-farm-2025.jpg",
    date: "January 22, 2026",
    category: "Sponsorship",
    slug: "sponsorship-stories",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/human-development-healthy-planet.jpg"
            alt="Children representing World Vision International's mission"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#CC4D3E]/85 via-[#CC4D3E]/65 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-balance">
              Protect. Empower. Transform.
            </h1>
            <p className="mt-6 text-lg text-white/95 md:text-xl leading-relaxed">
              World Vision International is a global humanitarian organization dedicated to protecting vulnerable children, 
              fighting poverty, and building a more just world where every child can thrive.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold">
                <Link href="/what-we-do">
                  Sponsor a Child
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                <Link href="/news">Our Stories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <stat.icon className="mx-auto h-10 w-10 mb-4 opacity-90" />
                <div className="text-4xl font-bold md:text-5xl">{stat.value}</div>
                <div className="mt-2 text-sm uppercase tracking-wide text-white/85">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl text-balance">
                Our Mission: Every Child's Full Potential
              </h2>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                At World Vision International, we believe that every child deserves a chance to fulfill their potential. 
                We work to protect children from harm, provide them with education and health care, 
                and help communities break the cycle of poverty.
              </p>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Our approach combines child protection, community development, and emergency relief to create lasting change 
                in the lives of the world's most vulnerable children and their families.
              </p>
              <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
                <Link href="/what-we-do">
                  Explore Our Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center rounded-lg overflow-hidden">
              <div className="w-full max-w-md h-96 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-24 h-24 text-primary mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Changing the world one child at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Our Focus Areas</h2>
            <p className="mt-4 text-lg text-gray-700">
              We focus on key areas that directly impact children's lives and futures, 
              working to ensure every child has the opportunity to thrive.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area) => (
              <Card key={area.title} className="group overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`${area.color} p-4`}>
                  <area.icon className="h-10 w-10 text-white" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{area.description}</CardDescription>
                  <Link 
                    href={area.href} 
                    className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                  >
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
              <Link href="/what-we-do">View All Focus Areas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Stories */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Latest Stories</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                News, features, and impact stories from around the world.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/news">View All Stories</Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestStories.map((story) => (
              <article key={story.slug} className="group overflow-hidden rounded-lg bg-card shadow-md transition-all hover:shadow-xl">
                <Link href={`/news/${story.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={story.image || "/placeholder.svg"}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                        {story.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <time className="text-sm text-muted-foreground">{story.date}</time>
                    <h3 className="mt-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors text-balance">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground line-clamp-2">{story.excerpt}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Initiative */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/mpi-2025-coverpage-crop.jpg"
                alt="Child-Centered Community Development"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-semibold text-primary">
                Featured Initiative
              </span>
              <h2 className="mt-4 text-2xl font-bold text-foreground md:text-3xl text-balance">
                Child-Centered Community Development
              </h2>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                We don&apos;t just give aid—we work alongside communities to create sustainable solutions where children thrive. 
                Our integrated approach addresses health, education, protection, and economic opportunity with every child&apos;s best interests at heart.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/what-we-do">
                    Learn Our Approach
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Link href="/resources">View Our Impact</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center text-white">
            <h2 className="text-3xl font-bold md:text-4xl">Join Our Community</h2>
            <p className="mt-4 text-lg text-white/90">
              Subscribe to our newsletter for the latest news, stories, and updates on our work around the world.
            </p>
            <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border-0 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <Button type="submit" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 font-semibold">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-sm text-white/75">
              By subscribing, you&apos;ll get stories of impact, updates on our programs, and ways you can help change children&apos;s lives.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Banner */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/good-stories.png"
            alt="Stories of children and families transformed by World Vision"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold md:text-5xl text-balance">Real Stories. Real Lives. Real Change.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Meet the children and families whose lives are being transformed through our programs. These are the stories that inspire us.
          </p>
          <Button asChild size="lg" className="mt-8 bg-white text-[#5a7247] hover:bg-white/90">
            <Link href="/news">
              Explore Good Stories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
