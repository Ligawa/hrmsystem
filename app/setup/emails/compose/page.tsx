'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComposeEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    subject: '',
    fromName: 'UNEDF Team',
    body: '',
    htmlBody: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.to.trim()) {
      setError('Recipient email is required');
      setLoading(false);
      return;
    }

    if (!formData.subject.trim()) {
      setError('Subject is required');
      setLoading(false);
      return;
    }

    if (!formData.body.trim() && !formData.htmlBody.trim()) {
      setError('Email body is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.to,
          cc: formData.cc || undefined,
          subject: formData.subject,
          fromName: formData.fromName,
          body: formData.body,
          htmlBody: formData.htmlBody,
          type: 'admin_compose',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setFormData({
        to: '',
        cc: '',
        subject: '',
        fromName: 'UNEDF Team',
        body: '',
        htmlBody: '',
      });

      setTimeout(() => {
        router.push('/setup/emails');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setup/emails">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Compose Email</h1>
          <p className="text-sm text-muted-foreground">Send email from @unoedp.org</p>
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex-1">
            <p className="font-medium text-green-900">Email sent successfully!</p>
            <p className="text-sm text-green-800">Redirecting to inbox...</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            {/* From Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Name</label>
              <div className="flex items-center gap-2">
                <Input
                  name="fromName"
                  value={formData.fromName}
                  onChange={handleChange}
                  placeholder="e.g., John Smith, HR Team, Recruitment"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">@unoedp.org</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The name that will appear as the sender (e.g., "John Smith &lt;noreply@unoedp.org&gt;")
              </p>
            </div>

            {/* To Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To (Recipient Email) *</label>
              <Input
                type="email"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="recipient@example.com"
                required
              />
            </div>

            {/* CC Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">CC (Optional)</label>
              <Input
                type="email"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                placeholder="cc@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple emails with commas
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Email subject"
                required
              />
            </div>

            {/* Body - Plain Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Plain Text)</label>
              <Textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Write your email message here..."
                rows={8}
              />
            </div>

            {/* Body - HTML */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (HTML - Optional)</label>
              <Textarea
                name="htmlBody"
                value={formData.htmlBody}
                onChange={handleChange}
                placeholder="Paste HTML for formatted email (optional)..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                If provided, this HTML will be used instead of plain text. Leave empty to use plain text only.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
              <Link href="/setup/emails">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground mb-1">From Name</p>
            <p>You can customize how your email appears. Examples: "John Smith", "HR Team", "Recruitment Manager"</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">HTML Support</p>
            <p>Use HTML body for formatted emails with links, images, styling. Leave blank for simple plain text emails.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Security</p>
            <p>All emails are sent from noreply@unoedp.org with your custom name in the display field.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
