import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; status: 'uploading' | 'success' | 'error'; message?: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Upload failed' };
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf' || file.type === 'text/plain'
    );

    if (files.length === 0) {
      alert('Please upload PDF or TXT files only');
      return;
    }

    setIsUploading(true);
    const newFiles = files.map((f) => ({ name: f.name, status: 'uploading' as const }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i]);
      
      setUploadedFiles((prev) =>
        prev.map((f, idx) =>
          f.name === files[i].name
            ? { ...f, status: result.success ? 'success' : 'error', message: result.message }
            : f
        )
      );
    }

    setIsUploading(false);
    onUploadComplete?.();
  }, [onUploadComplete]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter(
      (file) => file.type === 'application/pdf' || file.type === 'text/plain'
    );

    if (fileArray.length === 0) {
      alert('Please upload PDF or TXT files only');
      return;
    }

    setIsUploading(true);
    const newFiles = fileArray.map((f) => ({ name: f.name, status: 'uploading' as const }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (const file of fileArray) {
      const result = await uploadFile(file);
      
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: result.success ? 'success' : 'error', message: result.message }
            : f
        )
      );
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  const clearFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.txt"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'}`} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            PDF or TXT files will be added to the knowledge base
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Documents are automatically chunked and vectorized
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Uploaded Documents ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    {file.message && (
                      <p className={`text-xs ${file.status === 'error' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {file.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    onClick={() => clearFile(file.name)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    disabled={file.status === 'uploading'}
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
