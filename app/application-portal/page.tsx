'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime',
];

export default function ApplicationPortal() {
  const [email, setEmail] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [videoLink, setVideoLink] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setAuthenticated(true);
      setMessage(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setMessage({
          type: 'error',
          text: `File ${file.name} is too large. Maximum size is 50MB.`,
        });
        hasError = true;
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        setMessage({
          type: 'error',
          text: `File type ${file.type} not allowed. Please upload PDF, images, Word documents, or videos.`,
        });
        hasError = true;
        return;
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toLocaleString(),
      });
    });

    if (!hasError && newFiles.length > 0) {
      setDocuments([...documents, ...newFiles]);
      setMessage({
        type: 'success',
        text: `Successfully added ${newFiles.length} file(s).`,
      });
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setUploadedVideo(null);
    setVideoLink('');
  };

  const handleVideoLinkSubmit = () => {
    if (!videoLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter a video link.' });
      return;
    }

    if (
      !videoLink.includes('loom.com') &&
      !videoLink.includes('youtube.com') &&
      !videoLink.includes('youtu.be') &&
      !videoLink.includes('drive.google.com') &&
      !videoLink.includes('vimeo.com')
    ) {
      setMessage({
        type: 'error',
        text: 'Please provide a valid link from Loom, YouTube, Google Drive, or Vimeo.',
      });
      return;
    }

    setUploadedVideo({
      name: videoLink,
      size: 0,
      type: 'video',
      uploadedAt: new Date().toLocaleString(),
    });
    setMessage({
      type: 'success',
      text: 'Video link added successfully.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (!uploadedVideo && !videoLink) {
      setMessage({
        type: 'error',
        text: 'Please provide your video interview link.',
      });
      setSubmitting(false);
      return;
    }

    if (documents.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please upload at least one document.',
      });
      setSubmitting(false);
      return;
    }

    try {
      // Simulate submission to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMessage({
        type: 'success',
        text: 'Your application has been successfully submitted! Our HR team will review your materials and contact you shortly.',
      });

      // Reset form after successful submission
      setTimeout(() => {
        setEmail('');
        setAuthenticated(false);
        setDocuments([]);
        setVideoLink('');
        setUploadedVideo(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while submitting your application. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>World Vision Application Portal</CardTitle>
            <CardDescription>
              Enter your email address to access the secure document upload portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Portal
              </Button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-700">
                <strong>Note:</strong> Your documents are securely stored and only accessible by World
                Vision HR team members.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Documents Portal</h1>
          <p className="text-slate-600">
            Signed in as: <span className="font-medium">{email}</span>
          </p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Interview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📹</span> Video Interview
              </CardTitle>
              <CardDescription>
                Share a link to your 5-7 minute video interview answering the required questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="videoLink" className="mb-2">
                  Video Link
                </Label>
                <p className="text-sm text-slate-500 mb-3">
                  Paste your link from Loom, YouTube, Google Drive, or Vimeo
                </p>
                <div className="flex gap-2">
                  <Input
                    id="videoLink"
                    type="url"
                    placeholder="https://loom.com/share/..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    disabled={!!uploadedVideo}
                  />
                  <Button
                    type="button"
                    onClick={handleVideoLinkSubmit}
                    disabled={!!uploadedVideo || !videoLink.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {uploadedVideo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Video link added</p>
                      <p className="text-xs text-green-700 truncate">{uploadedVideo.name}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Supporting Documents
              </CardTitle>
              <CardDescription>
                Upload your ID, educational certificates, and any professional certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              >
                <Upload className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Drag and drop your files here
                </p>
                <p className="text-xs text-slate-500 mb-3">or</p>
                <label>
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                    browse files
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4,.mov"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-3">
                  Max 50MB per file. Accepted: PDF, images, Word docs, videos
                </p>
              </div>

              {/* Uploaded Documents */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Uploaded Documents ({documents.length})
                  </p>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Documents Checklist */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">Required Documents Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-slate-700">
                    Valid government-issued ID (Passport, National ID, or Driver&apos;s License)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-slate-700">
                    Educational certificates/qualifications relevant to the position
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span className="text-slate-700">
                    Professional certifications or credentials (if applicable)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || (!uploadedVideo && !videoLink) || documents.length === 0}
              className="flex-1"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setAuthenticated(false);
                setEmail('');
                setDocuments([]);
                setVideoLink('');
                setUploadedVideo(null);
              }}
            >
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            All documents are encrypted and securely stored. Only World Vision HR team members can
            access your materials.
          </p>
        </form>
      </div>
    </div>
  );
}
