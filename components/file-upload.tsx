'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  onFileUpload?: (url: string, filename: string) => void;
  required?: boolean;
  helperText?: string;
  acceptedFormats?: string[];
}

export function FileUpload({
  label,
  accept = '*',
  maxSize = 10,
  onFileUpload,
  required = false,
  helperText,
  acceptedFormats = [],
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        setUploading(false);
        return;
      }

      // Validate file type
      if (accept !== '*' && !file.type.match(accept.replace(/\*/g, '.*'))) {
        setError(`File type not accepted. Please upload ${acceptedFormats.join(', ')}`);
        setUploading(false);
        return;
      }

      // Upload to Vercel Blob via FormData
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      setUploadedFile({
        name: file.name,
        url: data.url,
      });

      if (onFileUpload) {
        onFileUpload(data.url, file.name);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      console.error('[v0] File upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [accept, maxSize, onFileUpload, acceptedFormats]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedFile && !error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
            <p className="text-xs text-green-700">Successfully uploaded</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4 text-green-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={uploading ? undefined : handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
          required={required}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className={`h-6 w-6 ${uploading ? 'text-gray-400' : 'text-gray-400'}`} />
          {uploading ? (
            <>
              <p className="text-sm font-medium text-gray-700">Uploading...</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your file here, or click to browse
              </p>
              {acceptedFormats.length > 0 && (
                <p className="text-xs text-gray-500">
                  Accepted formats: {acceptedFormats.join(', ')}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
