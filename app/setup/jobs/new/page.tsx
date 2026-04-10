"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "full-time",
    department: "",
    level: "",
    salary_range: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    closing_date: "",
    is_active: true,
    featured: false,
  });

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function generateWithAI() {
    if (!formData.title || !formData.level || !formData.location) {
      setError("Please fill in Job Title, Level, and Location before generating");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          level: formData.level,
          location: formData.location,
          department: formData.department,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate job details");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
        }
      }

      // Parse the generated JSON
      const generated = JSON.parse(fullResponse);
      
      setFormData(prev => ({
        ...prev,
        description: generated.description || "",
        requirements: (generated.requirements || []).join("\n"),
        responsibilities: (generated.responsibilities || []).join("\n"),
        benefits: (generated.benefits || []).join("\n"),
      }));
    } catch (err) {
      console.error("[v0] AI generation error:", err);
      setError("Failed to generate job details. Please try again or fill them manually.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const slug = generateSlug(formData.title);

    const { error: insertError } = await supabase.from("jobs").insert({
      title: formData.title,
      slug,
      location: formData.location,
      type: formData.type,
      department: formData.department || null,
      level: formData.level || null,
      salary_range: formData.salary_range || null,
      description: formData.description,
      requirements: formData.requirements
        ? formData.requirements.split("\n").filter(Boolean)
        : null,
      responsibilities: formData.responsibilities
        ? formData.responsibilities.split("\n").filter(Boolean)
        : null,
      benefits: formData.benefits
        ? formData.benefits.split("\n").filter(Boolean)
        : null,
      closing_date: formData.closing_date || null,
      is_active: formData.is_active,
      featured: formData.featured,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/setup/jobs");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setup/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Post New Job</h1>
          <p className="mt-1 text-muted-foreground">
            Create a new job posting for the careers page
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Senior Programme Officer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. New York, USA or Remote"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="e.g. Climate & Environment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_range: e.target.value })
                  }
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing_date">Application Deadline</Label>
                <Input
                  id="closing_date"
                  type="date"
                  value={formData.closing_date}
                  onChange={(e) =>
                    setFormData({ ...formData, closing_date: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Job Description</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateWithAI}
              disabled={generating || !formData.title || !formData.level || !formData.location}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Provide a detailed description of the role..."
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">
                Key Responsibilities (one per line)
              </Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData({ ...formData, responsibilities: e.target.value })
                }
                placeholder="Lead programme design and implementation&#10;Manage stakeholder relationships&#10;Oversee budget management"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                placeholder="Masters degree in relevant field&#10;5+ years of experience&#10;Fluency in English"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="Competitive salary&#10;Health insurance&#10;Professional development"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this job visible on the careers page
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Highlight this job at the top of listings
                </p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/setup/jobs">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Job Posting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
