import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { File, X, FileText, Image, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  folder: string;
  onUploadComplete: (url: string, path: string, fileName: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  folder,
  onUploadComplete,
  maxSizeMB = 5,
  allowedTypes = ['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size should be less than ${maxSizeMB}MB`);
      return;
    }
    
    // Check file type
    let validType = false;
    for (const type of allowedTypes) {
      if (type.includes('*')) {
        const mainType = type.split('/')[0];
        if (file.type.startsWith(mainType)) {
          validType = true;
          break;
        }
      } else if (file.type === type) {
        validType = true;
        break;
      }
    }
    
    if (!validType) {
      setError('File type not supported');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      
      // Listen for state changes, errors, and completion
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          setError('Upload failed: ' + error.message);
          setUploading(false);
          
          toast({
            title: 'Upload Failed',
            description: 'There was an error uploading your file.',
            variant: 'destructive',
          });
        },
        async () => {
          // Get download URL after successful upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const filePath = `${folder}/${fileName}`;
          
          onUploadComplete(downloadURL, filePath, selectedFile.name);
          
          toast({
            title: 'Upload Complete',
            description: 'Your file has been uploaded successfully.',
          });
          
          setUploading(false);
          setSelectedFile(null);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An unexpected error occurred');
      setUploading(false);
      
      toast({
        title: 'Upload Failed',
        description: 'There was an unexpected error uploading your file.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Paperclip />;
    
    const fileType = selectedFile.type;
    
    if (fileType.startsWith('image/')) {
      return <Image />;
    } else if (fileType === 'application/pdf') {
      return <FileText />;
    } else {
      return <File />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          {selectedFile ? 'Change File' : 'Select File'}
        </Button>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="text-destructive text-sm">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex items-center space-x-2">
              {getFileIcon()}
              <span className="text-sm font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            </div>
            {!uploading && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="text-right text-xs text-muted-foreground">
                {uploadProgress}% uploaded
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="default"
                size="sm"
                onClick={handleUpload}
              >
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
