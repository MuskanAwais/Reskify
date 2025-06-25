import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File, dataUrl: string) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: string; // base64 data URL
  currentFilename?: string;
  className?: string;
  placeholder?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = "image/*",
  maxSize = 5,
  currentFile,
  currentFilename,
  className,
  placeholder = "Upload file"
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(`File type not supported. Please upload ${accept}`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onFileSelect(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    onFileRemove?.();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
          error ? "border-red-300 bg-red-50" : "",
          currentFile ? "border-green-300 bg-green-50" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        {currentFile ? (
          <div className="space-y-3">
            <img
              src={currentFile}
              alt="Uploaded file"
              className="max-h-32 max-w-full mx-auto rounded-lg shadow-sm"
            />
            <div className="flex items-center justify-center gap-2">
              <Image className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {currentFilename || 'Company Logo'}
              </span>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">{placeholder}</p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {accept} up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}