import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileText, ExternalLink } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function FileUploadField({ value, onChange, disabled }: FileUploadFieldProps) {
  const { uploadFile, isUploading } = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const url = await uploadFile(file);
    if (url) {
      onChange(url);
    }
  };

  const handleRemove = () => {
    onChange("");
    setFileName("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />
      
      {value ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <FileText className="h-5 w-5 text-primary" />
          <span className="flex-1 truncate text-sm">
            {fileName || "ไฟล์แนบ"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => window.open(value, "_blank")}
            className="h-8 px-2"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 px-2 text-destructive hover:text-destructive"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "กำลังอัปโหลด..." : "เลือกไฟล์แนบ"}
        </Button>
      )}
    </div>
  );
}
