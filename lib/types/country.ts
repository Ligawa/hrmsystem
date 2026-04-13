export interface Country {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string | null;
  featured: boolean;
}

export interface Region {
  id: string;
  name: string;
}

export interface CountryWithDetails extends Country {
  overview?: string | null;
  flag_url?: string | null;
}
