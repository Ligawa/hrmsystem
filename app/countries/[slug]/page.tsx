import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, ExternalLink, Globe2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: country } = await supabase
    .from("countries")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!country) return { title: "Country Not Found | UNEDF" };

  return {
    title: `${country.name} | UNEDF`,
    description: country.description || `UNEDF programs in ${country.name}`,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: country, error } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !country) {
    notFound();
  }

  // Get related news for this country
  const { data: relatedNews } = await supabase
    .from("news")
    .select("title, slug, published_at")
    .eq("country_id", country.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] items-end bg-primary">
        <div className="absolute inset-0 z-0">
          {country.flag_url ? (
            <Image
              src={country.flag_url || "/placeholder.svg"}
              alt={country.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary">
              <Globe2 className="h-32 w-32 text-primary-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-12 lg:py-20">
          <Link
            href="/countries"
            className="mb-4 inline-flex items-center text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Countries
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Globe2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                {country.name}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                {country.region}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Results */}
      {country.key_results && country.key_results.length > 0 && (
        <section className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {country.key_results.map((result: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-primary-foreground"
                >
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0" />
                  <span className="text-lg">{result}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Overview */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Overview
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {country.overview ||
                  country.description ||
                  `UNEDF works in ${country.name} to support sustainable development, reduce poverty, and build resilient communities. Our programs focus on economic growth, climate action, and strengthening governance.`}
              </p>
            </div>
            {country.focus_areas && country.focus_areas.length > 0 && (
              <div>
                <h3 className="mb-4 text-xl font-semibold text-foreground">
                  Focus Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {country.focus_areas.map((area: string) => (
                    <span
                      key={area}
                      className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related News */}
      {relatedNews && relatedNews.length > 0 && (
        <section className="bg-muted/30 py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Latest from {country.name}
              </h2>
              <Button asChild variant="outline">
                <Link href="/news">View All News</Link>
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedNews.map((news) => (
                <Link
                  key={news.slug}
                  href={`/news/${news.slug}`}
                  className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary hover:shadow-lg"
                >
                  <time className="text-sm text-muted-foreground">
                    {new Date(news.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-3 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {news.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold md:text-4xl">Get Involved</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Learn more about our work in {country.name} and how you can support
            sustainable development.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="bg-background text-primary hover:bg-background/90"
            >
              <Link href="/resources">
                View Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/about">
                About UNEDF
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
