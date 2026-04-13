'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface EmailDebugResults {
  lastSync?: string;
  syncResult?: any;
  [key: string]: any;
}

export default function EmailDebugPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailDebugResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testEmailService = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('[v0] Testing email service...');

      // Test 1: Health check
      console.log('[v0] Running health check...');
      const healthResponse = await fetch('/api/emails/sync');
      const healthData = await healthResponse.json();
      console.log('[v0] Health check result:', healthData);

      // Test 2: List emails
      console.log('[v0] Listing emails...');
      const listResponse = await fetch('/api/emails/list');
      const listData = await listResponse.json();
      console.log('[v0] List emails result:', listData);

      setResults({
        timestamp: new Date().toISOString(),
        healthCheck: healthData,
        emailList: listData,
      });
    } catch (err) {
      console.error('[v0] Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[v0] Triggering manual sync...');
      const response = await fetch('/api/emails/sync', { method: 'POST' });
      const data = await response.json();
      console.log('[v0] Sync result:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setResults(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        syncResult: data,
      }));
    } catch (err) {
      console.error('[v0] Sync error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Service Debug</h1>
        <p className="text-muted-foreground mt-2">Diagnose email system issues</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Tools</CardTitle>
            <CardDescription>Test email service connectivity and data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testEmailService}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Test Email Service'
              )}
            </Button>

            <Button
              onClick={manualSync}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Manual Sync'
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-2">If emails not showing:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click "Test Email Service" to check connectivity</li>
              <li>Verify Resend webhook is configured at: https://unoedp.org/api/webhooks/resend</li>
              <li>Check RESEND_WEBHOOK_SIGNING_KEY environment variable is set</li>
              <li>Ensure database email_inbox table has RLS policies allowing reads</li>
              <li>Test sending an email to verify webhook delivery</li>
              <li>Click "Manual Sync" to force a refresh</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quick Fixes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check browser console for errors (F12)</li>
              <li>Verify you're logged in as admin</li>
              <li>Try refreshing the page</li>
              <li>Clear browser cache if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
