import React, { useCallback, useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { fileApi } from '../../services/api';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../utils/constants';
import { formatFileSize } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

interface Props {
  sessionId: string;
  onComplete: () => void;
}

export const FileUpload: React.FC<Props> = ({ sessionId, onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Supported: PDF, DOCX, PNG, JPG');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size is ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setIsUploading(true);
    setProgress(30);

    try {
      await fileApi.uploadFile(sessionId, file);
      setProgress(100);
      toast.success('File shared successfully');
      setTimeout(onComplete, 1000);
    } catch (error) {
      toast.error('Failed to upload file');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
        isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 bg-slate-800/30'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isUploading ? (
        <div className="w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">Uploading...</span>
            <span className="text-xs text-primary-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      ) : progress === 100 ? (
        <div className="flex flex-col items-center text-emerald-400">
          <CheckCircle size={32} className="mb-2" />
          <span className="text-sm font-medium">Shared!</span>
        </div>
      ) : (
        <>
          <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <UploadCloud size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-300 mb-1 text-center">Drag and drop a file</p>
          <p className="text-xs text-slate-500 mb-4 text-center">PDF, DOCX, PNG, JPG up to 10MB</p>
          
          <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
            Browse Files
            <input 
              type="file" 
              className="hidden" 
              accept={ALLOWED_FILE_TYPES.join(',')}
              onChange={(e) => {
                if (e.target.files?.[0]) handleUpload(e.target.files[0]);
              }} 
            />
          </label>
        </>
      )}
    </div>
  );
};
