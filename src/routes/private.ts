import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { STUDENT_USER_ROLE } from "../constant";
import StudentModel from "../models/Student";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const router = Router();

router.post("/isAuthenticated", async (req: Request, res: Response) => {
  try {
    const { authorization: token } = req.headers;
    if (!token) {
      return res.status(400).json({ code: "tokenNotReceived" });
    }

    const jwtSecret = process.env.SECRET_JWT_TOKEN;
    if (!jwtSecret) {
      console.error("SECRET_JWT_TOKEN environment variable is not set");
      return res.status(500).json({ code: "serverError", message: "Server configuration error" });
    }

    let verified = jwt.verify(token, jwtSecret) as {
      id: string;
      role: string;
      name?: string;
      class?: number;
    };
    
    if (verified.role === STUDENT_USER_ROLE) {
      try {
        const student = await StudentModel.findOne({ phone: verified.id });
        // append the student data to the verified object
        verified = { ...verified, name: student?.name, class: student?.class };
      } catch (dbError) {
        console.error("Database error in isAuthenticated:", dbError);
        // Continue without student data if DB fails
      }
    }
    
    res.status(200).json({ code: "tokenValid", message: verified });
  } catch (err) {
    console.error("Error in isAuthenticated:", err);
    res.status(400).json({ code: "tokenInvalid", message: "Invalid token" });
  }
});

router.get("/instagram-proxy", async (req: Request, res: Response) => {
  try {
    const { authorization: token } = req.headers;
    const { url } = req.query;

    // JWT token verification
    if (!token) {
      return res.status(401).send({ code: "tokenNotReceived", message: "Authorization token required" });
    }

    try {
      jwt.verify(token, process.env.SECRET_JWT_TOKEN);
    } catch (err) {
      return res.status(401).send({ code: "tokenInvalid", message: "Invalid token" });
    }

    // URL validation
    if (!url || typeof url !== 'string') {
      return res.status(400).send({ code: "urlRequired", message: "Instagram URL is required" });
    }

    // Validate Instagram URL and extract img_index
    const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/p\/[^\/]+\/?/;
    if (!instagramUrlPattern.test(url)) {
      return res.status(400).send({ code: "invalidUrl", message: "Invalid Instagram post URL" });
    }

    // Note: We'll return all available images instead of using img_index

    // Fetch Instagram page HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"'
      },
      timeout: 15000,
    });

    // Save HTML to file for analysis
    const timestamp = Date.now();
    const htmlFileName = `instagram_html_${timestamp}.txt`;
    const htmlFilePath = path.join(__dirname, '../../', htmlFileName);
    
    try {
      fs.writeFileSync(htmlFilePath, response.data);
      console.log(`HTML saved to: ${htmlFilePath}`);
    } catch (error) {
      console.error('Error saving HTML file:', error);
    }

    // Parse HTML to extract image URL
    const $ = cheerio.load(response.data);
    
    // Extract all HTTPS URLs from the HTML
    const allHttpsUrls = response.data.match(/https:\/\/[^\s"'<>]+/g) || [];
    
    // Filter for actual Instagram post images (scontent = user content)
    const instagramPostImages = allHttpsUrls.filter(url => 
      url.includes('scontent.cdninstagram.com') && 
      /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
    );
    
    // Also filter for other potential image URLs as fallback
    const otherImageUrls = allHttpsUrls.filter(url => 
      (url.includes('cdninstagram.com') || url.includes('fbcdn.net')) && 
      /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) &&
      !url.includes('static.cdninstagram.com') // Exclude UI elements
    );
    
    const potentialImageUrls = [...instagramPostImages, ...otherImageUrls];
    
    console.log(`Total HTTPS URLs found: ${allHttpsUrls.length}`);
    console.log(`Potential image URLs found: ${potentialImageUrls.length}`);
    console.log('Potential image URLs:', potentialImageUrls.slice(0, 10)); // Log first 10
    
    // Try multiple selectors to find all images
    let allImages: string[] = [];
    
    // Add potential image URLs found from HTTPS scan to allImages (decode HTML entities)
    potentialImageUrls.forEach(url => {
      const decodedUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      if (!allImages.includes(decodedUrl)) {
        allImages.push(decodedUrl);
      }
    });
    
    // Also try to extract from script tags (existing logic)
    const scriptTags = $('script:not([src])');
    
    scriptTags.each((i, script) => {
      const content = $(script).html() || '';
      if (content.includes('display_url')) {
        // Extract all display_url instances from script content
        const allDisplayUrls = content.match(/"display_url":"([^"]+)"/g);
        if (allDisplayUrls && allDisplayUrls.length > 0) {
          const urls = allDisplayUrls.map(match => {
            const url = match.match(/"display_url":"([^"]+)"/)?.[1];
            return url ? url.replace(/\\u0026/g, '&').replace(/\\/g, '') : '';
          }).filter(Boolean);
          
          // Remove duplicates and add to images array
          urls.forEach(url => {
            if (!allImages.includes(url)) {
              allImages.push(url);
            }
          });
        }
      }
    });
    
    // Fallback to meta tags if no images found in scripts
    if (allImages.length === 0) {
      // Try og:image meta tag
      let fallbackImage = $('meta[property="og:image"]').attr('content');
      
      // Try other variations of og:image
      if (!fallbackImage) {
        fallbackImage = $('meta[name="og:image"]').attr('content');
      }
      
      // Try twitter:image meta tag
      if (!fallbackImage) {
        fallbackImage = $('meta[property="twitter:image"]').attr('content');
      }
      
      // Try twitter:image:src meta tag
      if (!fallbackImage) {
        fallbackImage = $('meta[name="twitter:image:src"]').attr('content');
      }
      
      // Try to find image in JSON-LD structured data
      if (!fallbackImage) {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((i, script) => {
          try {
            const data = JSON.parse($(script).html() || '{}');
            if (data.image && typeof data.image === 'string') {
              fallbackImage = data.image;
            } else if (data.image && data.image.url) {
              fallbackImage = data.image.url;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        });
      }
      
      if (fallbackImage) {
        allImages.push(fallbackImage);
      }
    }

    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Return all images
    if (allImages.length > 0) {
      res.status(200).send({
        images: allImages,
        count: allImages.length,
        // For backward compatibility, include the first image as imageUrl
        imageUrl: allImages[0]
      });
    } else {
      res.status(404).send({
        code: "imageNotFound",
        message: "No images found in the Instagram post"
      });
    }

  } catch (error) {
    console.error('Instagram proxy error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).send({ code: "postNotFound", message: "Instagram post not found" });
      }
      if (error.code === 'ECONNABORTED') {
        return res.status(408).send({ code: "timeout", message: "Request timeout" });
      }
    }

    res.status(500).send({ code: "fetchError", message: "Failed to fetch Instagram post" });
  }
});

export default router;
