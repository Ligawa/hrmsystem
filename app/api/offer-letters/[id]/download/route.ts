import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOfferLetterHTML } from '@/lib/offer-letter-pdf';

// Helper to convert HTML to PDF using Puppeteer (for server-side PDF generation)
async function convertHtmlToPdf(html: string): Promise<Uint8Array | Buffer | null> {
  try {
    // Dynamic import for Puppeteer (server-only)
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
    });
    
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.log('[v0] Puppeteer not available, will return HTML instead:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: offerId } = await params;

    if (!offerId) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch offer letter details
    const { data: offerLetter, error: fetchError } = await supabase
      .from('offer_letters')
      .select('*')
      .eq('id', offerId)
      .single();

    if (fetchError || !offerLetter) {
      console.error('[v0] Offer letter not found:', fetchError);
      return NextResponse.json(
        { error: 'Offer letter not found' },
        { status: 404 }
      );
    }

    // Check if offer is voided or status is not appropriate for download
    if (offerLetter.status === 'voided') {
      return NextResponse.json(
        { error: 'This offer letter has been voided' },
        { status: 403 }
      );
    }

    // Determine if this is a signed PDF or unsigned
    const isSigned = offerLetter.status === 'signed' || offerLetter.status === 'downloaded';

    // Generate HTML
    const html = generateOfferLetterHTML({
      applicantName: offerLetter.applicant_name,
      applicantEmail: offerLetter.applicant_email,
      jobTitle: offerLetter.job_title,
      reportingStation: offerLetter.reporting_station,
      contractType: offerLetter.contract_type,
      gradeLevel: offerLetter.grade_level,
      expectedStartDate: offerLetter.expected_start_date,
      contractDuration: offerLetter.contract_duration,
      acceptanceDeadline: offerLetter.acceptance_deadline,
      salaryNotes: offerLetter.salary_notes,
      customClauses: offerLetter.custom_clauses,
      includeSsafeIfak: offerLetter.include_ssafe_ifak,
      signerName: isSigned ? offerLetter.applicant_name : undefined,
      signatureDate: isSigned && offerLetter.signed_at ? new Date(offerLetter.signed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : undefined,
      signatureData: isSigned && offerLetter.signature_data ? offerLetter.signature_data : undefined,
      signatureType: isSigned && offerLetter.signature_type ? offerLetter.signature_type : undefined,
    }, isSigned);

    // Create a wrapper HTML document for PDF conversion
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    const filename = `offer-letter-${offerLetter.applicant_name.replace(/\s+/g, '-')}-${offerId}`;

    // Try to convert to PDF using Puppeteer
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await convertHtmlToPdf(wrappedHtml);
    } catch (error) {
      console.log('[v0] PDF conversion skipped:', error);
    }

    // If PDF conversion succeeded, return PDF
    if (pdfBuffer) {
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // Fallback: Return HTML document that can be printed to PDF by the browser
    // This allows the browser's native print dialog to handle PDF generation
    return new NextResponse(wrappedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('[v0] Error in offer letter download:', error);
    return NextResponse.json(
      { error: 'Failed to download offer letter' },
      { status: 500 }
    );
  }
}
