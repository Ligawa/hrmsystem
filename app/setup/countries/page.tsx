export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DeleteCountryButton } from "@/components/admin/delete-country-button";
import { Country } from "@/lib/types/country";

export default async function CountriesAdmin() {
  const supabase = await createClient();

  const { data: countries, error } = await supabase
    .from("countries")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching countries:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Countries</h1>
          <p className="mt-1 text-muted-foreground">
            Manage country program pages
          </p>
        </div>
        <Link href="/setup/countries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Country
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries && countries.length > 0 ? (
              countries.map((country: Country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.region}</TableCell>
                  <TableCell>
                    {country.featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/setup/countries/${country.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteCountryButton
                        countryId={country.id}
                        countryName={country.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-muted-foreground">No countries found</p>
                  <Link href="/setup/countries/new">
                    <Button variant="outline" className="mt-4 bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first country
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
