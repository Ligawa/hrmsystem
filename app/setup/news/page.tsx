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
import { Plus, Pencil } from "lucide-react";
import { DeleteNewsButton } from "@/components/admin/delete-news-button";

export default async function NewsAdmin() {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching news:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">News & Stories</h1>
          <p className="mt-1 text-muted-foreground">Manage news articles</p>
        </div>
        <Link href="/setup/news/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news && news.length > 0 ? (
              news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>{article.category || "Uncategorized"}</TableCell>
                  <TableCell>
                    {new Date(article.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {article.featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/setup/news/${article.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteNewsButton
                        newsId={article.id}
                        newsTitle={article.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No articles found</p>
                  <Link href="/setup/news/new">
                    <Button variant="outline" className="mt-4 bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first article
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
