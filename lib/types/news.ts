export interface News {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published_at: string;
  featured: boolean;
  content?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
}