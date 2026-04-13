"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Globe2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Country, Region } from "@/lib/types/country";

interface CountriesClientProps {
  countries: Country[];
  regions: Region[];
  countryCount: Record<string, number>;
}

export function CountriesClient({
  countries,
  regions,
  countryCount,
}: CountriesClientProps) {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesRegion =
        selectedRegion === "all" || country.region === selectedRegion;
      const matchesSearch = country.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [countries, selectedRegion, searchQuery]);

  return (
    <>
      {/* Filter Section */}
      <section className="sticky top-16 z-40 border-b border-border bg-background py-8 lg:top-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Region Filter */}
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(region.id)}
                >
                  {region.name}
                  <span className="ml-1 text-xs opacity-70">
                    ({countryCount[region.id] || 0})
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {filteredCountries.length === 0 ? (
            <div className="py-16 text-center">
              <Globe2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No countries found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredCountries.map((country) => (
                <Link key={country.slug} href={`/countries/${country.slug}`}>
                  <Card className="h-full border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Globe2 className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{country.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {country.description || "UNEDF programs in this country."}
                      </CardDescription>
                      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {country.region}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Regional Bureaus */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            Regional Bureaus
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regions
              .filter((r) => r.id !== "all")
              .map((region) => (
                <Card key={region.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>{region.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">
                      {countryCount[region.id] || 0} countries and territories
                      with active UNEDF programs.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRegion(region.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      View Countries
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
