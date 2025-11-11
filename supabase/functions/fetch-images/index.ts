// Edge function for fetching images from websites

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchImagesRequest {
  url: string;
  keywords?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, keywords } = await req.json() as FetchImagesRequest;
    
    console.log('Fetching images from:', url);
    console.log('Keywords:', keywords || 'none');

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the webpage
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch webpage:', response.status);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch webpage' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Extract image URLs using regex
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const imageUrls = new Set<string>();
    
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      let imgUrl = match[1];
      
      // Convert relative URLs to absolute
      if (imgUrl.startsWith('//')) {
        imgUrl = targetUrl.protocol + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        imgUrl = targetUrl.origin + imgUrl;
      } else if (!imgUrl.startsWith('http')) {
        imgUrl = new URL(imgUrl, targetUrl.origin).toString();
      }
      
      // Filter out small images, icons, and common tracking pixels
      if (!imgUrl.includes('icon') && 
          !imgUrl.includes('logo') && 
          !imgUrl.includes('pixel') &&
          !imgUrl.includes('tracking') &&
          !imgUrl.endsWith('.svg')) {
        imageUrls.add(imgUrl);
      }
    }

    // Also check for images in data attributes and background images
    const bgRegex = /url\(["']?([^"')]+)["']?\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      let imgUrl = match[1];
      if (imgUrl.startsWith('http') && !imgUrl.endsWith('.svg')) {
        imageUrls.add(imgUrl);
      }
    }

    let images = Array.from(imageUrls);

    // Filter by keywords if provided
    if (keywords && keywords.trim()) {
      const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
      images = images.filter(img => 
        keywordList.some(keyword => img.toLowerCase().includes(keyword))
      );
    }

    console.log(`Found ${images.length} images`);

    return new Response(
      JSON.stringify({ images }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-images function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
