export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { CountriesClient } from "@/components/countries/countries-client";

interface Country {
  id: string;
  name: string;
  slug: string;
  region: string;
  overview?: string | null;
  flag_url?: string | null;
}

const regions = [
  { id: "all", name: "All Regions" },
  { id: "Africa", name: "Africa" },
  { id: "Arab States", name: "Arab States" },
  { id: "Asia Pacific", name: "Asia Pacific" },
  { id: "Europe & CIS", name: "Europe & CIS" },
  { id: "Latin America & Caribbean", name: "Latin America & Caribbean" },
];

export default async function CountriesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("name");

  const countries = data as Country[] | null;

  if (error) {
    console.error("Error fetching countries:", error);
  }

  const countryCount: Record<string, number> = { all: countries?.length || 0 };
  regions.forEach((region) => {
    if (region.id !== "all") {
      countryCount[region.id] =
        countries?.filter((c) => c.region === region.id).length || 0;
    }
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-primary-foreground">
            <h1 className="text-4xl font-bold text-balance md:text-5xl lg:text-6xl">
              Where We Work
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-primary-foreground/90">
              UNEDF works in about 170 countries and territories, partnering
              with governments and communities to find their own solutions to
              global and national development challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary/90 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 text-center text-primary-foreground md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">170+</div>
              <div className="text-sm text-primary-foreground/80">
                Countries & Territories
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">5</div>
              <div className="text-sm text-primary-foreground/80">
                Regional Bureaus
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">130+</div>
              <div className="text-sm text-primary-foreground/80">
                Country Offices
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">17K+</div>
              <div className="text-sm text-primary-foreground/80">
                Staff Worldwide
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid - Client Component */}
      <CountriesClient
        countries={countries || []}
        regions={regions}
        countryCount={countryCount}
      />
    </div>
  );
}
