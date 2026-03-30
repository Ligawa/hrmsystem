'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, Download, Eye } from "lucide-react";
import Link from "next/link";

interface Contract {
  id: string;
  offer_letter_id: string;
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  reporting_station: string | null;
  grade_level: string | null;
  contract_type: string | null;
  expected_start_date: string;
  contract_duration: string | null;
  acceptance_deadline: string | null;
  salary_notes: string | null;
  custom_clauses: string | null;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  token_expires_at: string | null;
  created_at: string;
}

interface ContractDetails {
  contract_id: string;
  account_holder_name: string | null;
  bank_name: string | null;
  account_number: string | null;
  swift_code: string | null;
  iban: string | null;
  visa_status: string | null;
  visa_notes: string | null;
  needs_assistance: boolean;
  ifaq_status: string | null;
  ssafe_status: string | null;
}

interface BsafeUpload {
  id: string;
  contract_id: string;
  file_name: string;
  file_size: number;
  file_url: string | null;
  uploaded_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-800",
  sent: "bg-purple-100 text-purple-800",
  viewed: "bg-cyan-100 text-cyan-800",
  signed: "bg-blue-100 text-blue-800",
  details_pending: "bg-amber-100 text-amber-800",
  bsafe_pending: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
};

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [contract, setContract] = useState<Contract | null>(null);
  const [details, setDetails] = useState<ContractDetails | null>(null);
  const [bsafeUpload, setBsafeUpload] = useState<BsafeUpload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const contractId = params.id as string;

        // Fetch contract
        const { data: contractData, error: contractError } = await supabase
          .from('employment_contracts')
          .select('*')
          .eq('id', contractId)
          .single();

        if (contractError || !contractData) {
          console.error('[v0] Contract not found:', contractError);
          router.push('/setup/contracts');
          return;
        }

        setContract(contractData);

        // Fetch contract details
        const { data: detailsData } = await supabase
          .from('employment_contracts')
          .select('account_holder_name, bank_name, account_number, swift_code, iban, visa_status, visa_notes, needs_assistance, ifaq_status, ssafe_status')
          .eq('id', contractId)
          .single();

        if (detailsData) {
          setDetails(detailsData as any);
        }

        // Fetch BSAFE upload if exists
        const { data: bsafeData } = await supabase
          .from('bsafe_uploads')
          .select('*')
          .eq('contract_id', contractId)
          .single();

        if (bsafeData) {
          setBsafeUpload(bsafeData);
        }
      } catch (error) {
        console.error('[v0] Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-4">
        <Link href="/setup/contracts">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Contract not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/setup/contracts">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{contract.applicant_name}</h1>
            <p className="text-muted-foreground">{contract.job_title}</p>
          </div>
        </div>
        <Badge className={statusColors[contract.status] || "bg-gray-100"}>
          {contract.status.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Contract Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{contract.applicant_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Job Title</p>
              <p className="font-medium">{contract.job_title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reporting Station</p>
              <p className="font-medium">{contract.reporting_station || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade Level</p>
              <p className="font-medium">{contract.grade_level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Type</p>
              <p className="font-medium capitalize">{contract.contract_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Start Date</p>
              <p className="font-medium">
                {new Date(contract.expected_start_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      {details && (details.bank_name || details.account_holder_name) && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account Holder Name</p>
                <p className="font-medium">{details.account_holder_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{details.bank_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">{details.account_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SWIFT Code</p>
                <p className="font-medium">{details.swift_code || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">IBAN</p>
                <p className="font-medium">{details.iban || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visa Status */}
      {details && details.visa_status && (
        <Card>
          <CardHeader>
            <CardTitle>Visa Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Visa Status</p>
                <p className="font-medium capitalize">{details.visa_status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Assistance</p>
                <p className="font-medium">{details.needs_assistance ? 'Yes' : 'No'}</p>
              </div>
              {details.visa_notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{details.visa_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Status */}
      {details && (details.ifaq_status || details.ssafe_status) && (
        <Card>
          <CardHeader>
            <CardTitle>Security Confirmations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">IFAQ Status</p>
                <p className="font-medium capitalize">{details.ifaq_status || 'Not submitted'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SSAFE Status</p>
                <p className="font-medium capitalize">{details.ssafe_status || 'Not submitted'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BSAFE Upload */}
      {bsafeUpload && (
        <Card>
          <CardHeader>
            <CardTitle>BSAFE Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">File Name</p>
              <p className="font-medium">{bsafeUpload.file_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-medium">{(bsafeUpload.file_size / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uploaded At</p>
              <p className="font-medium">
                {new Date(bsafeUpload.uploaded_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contract.created_at && (
            <div className="text-sm">
              <span className="text-muted-foreground">Created: </span>
              <span className="font-medium">
                {new Date(contract.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
          {contract.sent_at && (
            <div className="text-sm">
              <span className="text-muted-foreground">Sent: </span>
              <span className="font-medium">
                {new Date(contract.sent_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
          {contract.viewed_at && (
            <div className="text-sm">
              <span className="text-muted-foreground">Viewed: </span>
              <span className="font-medium">
                {new Date(contract.viewed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
          {contract.signed_at && (
            <div className="text-sm">
              <span className="text-muted-foreground">Signed: </span>
              <span className="font-medium">
                {new Date(contract.signed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
