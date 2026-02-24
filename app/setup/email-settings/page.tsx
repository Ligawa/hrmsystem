'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

interface EmailSettings {
  id: string;
  domain: string;
  is_active: boolean;
  allowed_reply_tos: string[];
  created_at: string;
}

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('email_settings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSettings(data || []);
      } catch (err) {
        console.error('[v0] Error fetching email settings:', err);
        setError('Failed to load email settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleDomain = async (setting: EmailSettings) => {
    try {
      const { error } = await supabase
        .from('email_settings')
        .update({ is_active: !setting.is_active })
        .eq('id', setting.id);

      if (error) throw error;

      setSettings(settings.map(s => 
        s.id === setting.id ? { ...s, is_active: !s.is_active } : s
      ));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[v0] Error updating settings:', err);
      setError('Failed to update settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your email domains and settings</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings updated successfully!</AlertDescription>
        </Alert>
      )}

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h3 className="font-semibold text-blue-900 mb-2">Webhook Setup</h3>
            <p className="text-blue-800 mb-3">
              To receive incoming emails, add this webhook URL to your Resend dashboard:
            </p>
            <code className="block bg-white p-2 rounded border border-blue-200 text-xs break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/resend` : 'Loading...'}
            </code>
            <p className="text-blue-800 text-xs mt-3">
              Event type: <strong>email.received</strong>
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
            <h3 className="font-semibold text-amber-900 mb-2">Allowed Domains</h3>
            <p className="text-amber-800">
              Only emails from these domains can be replied to: <strong>unoedp.org, alghahim.co.ke</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Domains</CardTitle>
          <CardDescription>Manage your email domains</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No email domains configured</p>
          ) : (
            <div className="space-y-4">
              {settings.map(setting => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{setting.domain}</h3>
                    <p className="text-sm text-muted-foreground">
                      Configured on {new Date(setting.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                        {setting.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={setting.is_active ? 'destructive' : 'default'}
                    onClick={() => toggleDomain(setting)}
                  >
                    {setting.is_active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">1. Resend Dashboard</h4>
            <p className="text-muted-foreground">
              Go to your Resend dashboard and navigate to your API keys section to get your RESEND_API_KEY.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. Add Webhook</h4>
            <p className="text-muted-foreground">
              In Resend, add the webhook URL shown above for the &apos;email.received&apos; event to enable incoming email handling.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. Verify Domain</h4>
            <p className="text-muted-foreground">
              Ensure your domain (unoedp.org) is verified in Resend for sending emails.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">4. Start Using</h4>
            <p className="text-muted-foreground">
              Once configured, go to the Emails page to view incoming emails and send replies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
