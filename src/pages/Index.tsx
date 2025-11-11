import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ImageGallery } from "@/components/ImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (url: string, keywords: string) => {
    setIsLoading(true);
    setImages([]);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-images', {
        body: { url, keywords },
      });

      if (error) {
        console.error('Error fetching images:', error);
        toast({
          title: "Error",
          description: "Failed to fetch images. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.images && data.images.length > 0) {
        setImages(data.images);
        toast({
          title: "Success",
          description: `Found ${data.images.length} images!`,
        });
      } else {
        toast({
          title: "No Images Found",
          description: "No images were found on this website.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Image Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and explore images from any website. Enter a URL and optional keywords to start searching.
          </p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        <ImageGallery images={images} />
      </div>
    </main>
  );
};

export default Index;
