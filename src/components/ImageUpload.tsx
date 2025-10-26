import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  productId?: string; // Add productId prop
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onRemove,
  currentImage,
  disabled = false,
  className = "",
  productId = "temp",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `products/${productId}/${timestamp}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName);

      onImageUploaded(publicUrl);
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={triggerFileSelect}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer ${
            disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={!disabled && !isUploading ? triggerFileSelect : undefined}
        >
          <div className="p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isUploading ? "Uploading..." : "Upload Product Image"}
              </p>
              <p className="text-sm text-gray-500">
                Click to select an image or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
