import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageGalleryUploaderProps {
  productId: string;
  images: Array<{ id: string; image_url: string; is_primary: boolean; display_order: number }>;
  onImagesChange: () => void;
}

export const ImageGalleryUploader = ({ productId, images, onImagesChange }: ImageGalleryUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            display_order: images.length + i,
            is_primary: images.length === 0 && i === 0,
          });

        if (insertError) throw insertError;
      }

      toast({ title: "Images uploaded successfully" });
      onImagesChange();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
      await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
      toast({ title: "Primary image updated" });
      onImagesChange();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('product-images').remove([fileName]);
      }
      await supabase.from('product_images').delete().eq('id', imageId);
      toast({ title: "Image deleted" });
      onImagesChange();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="gallery-upload"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('gallery-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Add Images"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.image_url}
              alt="Product"
              className="w-full h-32 object-cover rounded border"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                onClick={() => handleSetPrimary(image.id)}
              >
                <Star className={`h-3 w-3 ${image.is_primary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-6 w-6"
                onClick={() => handleDelete(image.id, image.image_url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {image.is_primary && (
              <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
