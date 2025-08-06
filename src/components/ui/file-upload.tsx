import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  className?: string;
  selectedFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ".csv",
  className,
  selectedFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-md shadow-card">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-muted/50",
            dragOver && "border-primary bg-muted/50"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            Drop your CSV file here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <Button variant="outline" size="sm">
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;