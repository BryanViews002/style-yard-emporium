import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  onRemove?: () => void;
}

const ImageUpload = ({ currentImage, onImageUploaded, onRemove }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);

      onImageUploaded(data.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Error uploading image");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      
      {currentImage && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img
            src={currentImage}
            alt="Product preview"
            className="w-full h-full object-cover"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP, GIF (Max 5MB)
      </p>
    </div>
  );
};

export default ImageUpload;