export interface Resource {
  id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string;
  download_count: number;
  description?: string | null;
  file_url?: string | null;
  file_size?: number | null;
}