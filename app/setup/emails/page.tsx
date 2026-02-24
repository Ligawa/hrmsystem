'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Mail,
  Archive,
  Reply,
  Trash2,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Email {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  body: string;
  html_body: string | null;
  received_at: string;
  read: boolean;
  archived: boolean;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  // Fetch emails
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('email_inbox')
          .select('*')
          .order('received_at', { ascending: false });

        if (error) throw error;
        setEmails(data || []);
      } catch (err) {
        console.error('[v0] Error fetching emails:', err);
        setError('Failed to load emails');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email);
    setReplySubject(`Re: ${email.subject}`);
    setReplyBody('');

    // Mark as read
    if (!email.read) {
      await supabase
        .from('email_inbox')
        .update({ read: true })
        .eq('id', email.id);

      setEmails(emails.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !replyBody.trim()) {
      setError('Please enter a reply message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboxId: selectedEmail.id,
          toEmail: selectedEmail.from_email,
          subject: replySubject,
          body: replyBody,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reply');
      }

      setSuccess(true);
      setShowReplyDialog(false);
      setReplyBody('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[v0] Error sending reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async (email: Email) => {
    try {
      await supabase
        .from('email_inbox')
        .update({ archived: true })
        .eq('id', email.id);

      setEmails(emails.filter(e => e.id !== email.id));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('[v0] Error archiving email:', err);
      setError('Failed to archive email');
    }
  };

  const handleDelete = async (email: Email) => {
    try {
      await supabase
        .from('email_inbox')
        .delete()
        .eq('id', email.id);

      setEmails(emails.filter(e => e.id !== email.id));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('[v0] Error deleting email:', err);
      setError('Failed to delete email');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
        <p className="text-muted-foreground mt-2">Manage incoming emails and send replies</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">Reply sent successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Email List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
            </CardTitle>
            <CardDescription>{emails.length} emails</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : emails.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No emails yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {emails.map(email => (
                  <button
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEmail?.id === email.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted border-transparent'
                    } ${!email.read ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{email.from_email}</p>
                        <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                      </div>
                      {!email.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Details */}
        <Card className="col-span-2">
          {selectedEmail ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{selectedEmail.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        {selectedEmail.from_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <Clock className="h-4 w-4" />
                        {new Date(selectedEmail.received_at).toLocaleString()}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant={selectedEmail.read ? 'secondary' : 'default'}>
                    {selectedEmail.read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Body */}
                <div>
                  <h3 className="font-semibold mb-2">Message</h3>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap break-words">
                    {selectedEmail.body}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => setShowReplyDialog(true)}
                    className="gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleArchive(selectedEmail)}
                    className="gap-2"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedEmail)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              Select an email to view details
            </CardContent>
          )}
        </Card>
      </div>

      {/* Reply Dialog */}
      {selectedEmail && (
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Email</DialogTitle>
              <DialogDescription>
                Replying to {selectedEmail.from_email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Email subject"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReply} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reply'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
