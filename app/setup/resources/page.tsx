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
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import { Resource } from "@/lib/types/resource";

export default async function ResourcesAdmin() {
  const supabase = await createClient();

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching resources:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="mt-1 text-muted-foreground">
            Manage publications and downloads
          </p>
        </div>
        <Link href="/setup/resources/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
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
              <TableHead>Downloads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources && resources.length > 0 ? (
              resources.map((resource: Resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {resource.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{resource.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(resource.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{resource.download_count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/setup/resources/${resource.id}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeleteResourceButton
                        resourceId={resource.id}
                        resourceTitle={resource.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No resources found</p>
                  <Link href="/setup/resources/new">
                    <Button variant="outline" className="mt-4 bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first resource
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
