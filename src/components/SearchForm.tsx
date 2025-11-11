import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchFormProps {
  onSearch: (url: string, keywords: string) => void;
  isLoading: boolean;
}

export const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to search for images.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
      onSearch(url, keywords);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., https://example.com).",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-gallery-md p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
              Wibsite URL
            </label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          {/* <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-foreground mb-2">
              Keywords (optional)
            </label>
            <Input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="sunset, nature, city..."
              disabled={isLoading}
              className="w-full"
            />
          </div> */}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Images
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
