import { NextResponse } from "next/server";
import { chromium } from "playwright";
import ExifParser from "exif-parser";
import jsQR from "jsqr";
import dns from "dns";
import { promisify } from "util";

const resolveAny = promisify(dns.resolveAny);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveTxt = promisify(dns.resolveTxt);

async function googleSearch(query: string) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    console.warn("Google Search API credentials missing, falling back to DuckDuckGo");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Search API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error("Google Search failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { additionalData, query, mode, imageUrl, documentUrl } = await req.json();
    
    const browser = await chromium.launch({ headless: true });
    let combinedScrapedData = "";
    let imageMetadata = null;

    // Phase 1: Image Intelligence (EXIF) - AGGRESSIVE EXTRACTION
    if (imageUrl) {
      try {
        let buffer;
        if (imageUrl.startsWith("data:image")) {
          // BASE64 UPLOAD
          const base64Data = imageUrl.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else {
          // EXTERNAL URL
          const response = await fetch(imageUrl);
          if (response.ok) {
            buffer = Buffer.from(await response.arrayBuffer());
          }
        }

        if (buffer) {
          const parser = ExifParser.create(buffer);
          const result = parser.parse();
          
          // AGGRESSIVE METADATA EXTRACTION
          const tags = result.tags || {};
          const imageSize = result.imageSize || {};
          
          imageMetadata = {
            // GPS Data (Primary Target)
            gps: {
              latitude: tags.GPSLatitude || null,
              longitude: tags.GPSLongitude || null,
              altitude: tags.GPSAltitude || null,
              latitudeRef: tags.GPSLatitudeRef || null,
              longitudeRef: tags.GPSLongitudeRef || null,
              altitudeRef: tags.GPSAltitudeRef || null,
              speed: tags.GPSSpeed || null,
              speedRef: tags.GPSSpeedRef || null,
              imgDirection: tags.GPSImgDirection || null,
              imgDirectionRef: tags.GPSImgDirectionRef || null,
              destBearing: tags.GPSDestBearing || null,
              destBearingRef: tags.GPSDestBearingRef || null,
              dateStamp: tags.GPSDateStamp || null,
              timeStamp: tags.GPSTimeStamp || null,
              processingMethod: tags.GPSProcessingMethod || null,
              areaInformation: tags.GPSAreaInformation || null,
            },
            
            // Timestamps (Critical for Timeline)
            timestamps: {
              createDate: tags.CreateDate || null,
              dateTimeOriginal: tags.DateTimeOriginal || null,
              dateTimeDigitized: tags.DateTimeDigitized || null,
              modifyDate: tags.ModifyDate || null,
              offsetTime: tags.OffsetTime || null,
              offsetTimeOriginal: tags.OffsetTimeOriginal || null,
              offsetTimeDigitized: tags.OffsetTimeDigitized || null,
              subSecTime: tags.SubSecTime || null,
              subSecTimeOriginal: tags.SubSecTimeOriginal || null,
              subSecTimeDigitized: tags.SubSecTimeDigitized || null,
            },
            
            // Device Information (Identity)
            device: {
              make: tags.Make || null,
              model: tags.Model || null,
              software: tags.Software || null,
              lensModel: tags.LensModel || null,
              lensMake: tags.LensMake || null,
              serialNumber: tags.SerialNumber || null,
              internalSerialNumber: tags.InternalSerialNumber || null,
              bodySerialNumber: tags.BodySerialNumber || null,
              lensSerialNumber: tags.LensSerialNumber || null,
              imageUniqueID: tags.ImageUniqueID || null,
              cameraOwnerName: tags.CameraOwnerName || null,
              ownerName: tags.OwnerName || null,
            },
            
            // Camera Settings (Technical Forensics)
            settings: {
              fNumber: tags.FNumber || null,
              exposureTime: tags.ExposureTime || null,
              iso: tags.ISO || null,
              focalLength: tags.FocalLength || null,
              focalLengthIn35mmFormat: tags.FocalLengthIn35mmFormat || null,
              exposureProgram: tags.ExposureProgram || null,
              exposureMode: tags.ExposureMode || null,
              whiteBalance: tags.WhiteBalance || null,
              flash: tags.Flash || null,
              meteringMode: tags.MeteringMode || null,
              sceneCaptureType: tags.SceneCaptureType || null,
              contrast: tags.Contrast || null,
              saturation: tags.Saturation || null,
              sharpness: tags.Sharpness || null,
              digitalZoomRatio: tags.DigitalZoomRatio || null,
            },
            
            // Image Properties
            image: {
              width: imageSize.width || tags.ImageWidth || tags.ExifImageWidth || null,
              height: imageSize.height || tags.ImageHeight || tags.ExifImageHeight || null,
              orientation: tags.Orientation || null,
              xResolution: tags.XResolution || null,
              yResolution: tags.YResolution || null,
              resolutionUnit: tags.ResolutionUnit || null,
              colorSpace: tags.ColorSpace || null,
              compression: tags.Compression || null,
              bitsPerSample: tags.BitsPerSample || null,
            },
            
            // Copyright & Attribution
            attribution: {
              artist: tags.Artist || null,
              copyright: tags.Copyright || null,
              imageDescription: tags.ImageDescription || null,
              userComment: tags.UserComment || null,
              xpComment: tags.XPComment || null,
              xpAuthor: tags.XPAuthor || null,
              xpTitle: tags.XPTitle || null,
              xpSubject: tags.XPSubject || null,
              xpKeywords: tags.XPKeywords || null,
            },
            
            // Software & Processing
            processing: {
              software: tags.Software || null,
              processingMethod: tags.ProcessingMethod || null,
              hostComputer: tags.HostComputer || null,
              documentName: tags.DocumentName || null,
              pageNumber: tags.PageNumber || null,
              pageName: tags.PageName || null,
            },
            
            // Thumbnail Data
            thumbnail: {
              offset: result.thumbnailOffset || null,
              length: result.thumbnailLength || null,
              type: result.thumbnailType || null,
            },
            
            // Raw EXIF Tags (Everything else) - Sanitized for JSON
            rawTags: Object.fromEntries(
              Object.entries(tags).map(([key, value]) => {
                // Convert non-serializable values to strings
                if (value === undefined || value === null) return [key, null];
                if (typeof value === 'object' && value !== null) {
                  try {
                    JSON.stringify(value);
                    return [key, value];
                  } catch {
                    return [key, String(value)];
                  }
                }
                return [key, value];
              })
            ),
          };
          
          // Safely stringify with error handling
          let metadataString;
          try {
            metadataString = JSON.stringify(imageMetadata, null, 2);
          } catch (e) {
            // Fallback: remove rawTags if it causes issues
            const { rawTags, ...safeMetadata } = imageMetadata;
            metadataString = JSON.stringify(safeMetadata, null, 2);
          }
          
          combinedScrapedData += `\n[IMAGE INTELLIGENCE (AGGRESSIVE EXIF EXTRACTION)]:\n${metadataString}\n`;
        }
      } catch (e) {
        console.error("EXIF extraction failed", e);
        combinedScrapedData += `\n[EXIF EXTRACTION ERROR]: ${e}\n`;
      }
    }

    // QR Code Processing
    if (mode === "qrcode" && imageUrl) {
      try {
        let buffer;
        if (imageUrl.startsWith("data:image")) {
          const base64Data = imageUrl.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else {
          const response = await fetch(imageUrl);
          if (response.ok) {
            buffer = Buffer.from(await response.arrayBuffer());
          }
        }

        if (buffer) {
          // Use Jimp to process image for jsQR
          const Jimp = (await import("jimp")).default;
          const image = await Jimp.read(buffer);
          const { width, height, data } = image.bitmap;
          
          const code = jsQR(new Uint8ClampedArray(data), width, height);
          
          if (code) {
            combinedScrapedData += `\n[QR CODE DECODED]:\n`;
            combinedScrapedData += `Data: ${code.data}\n`;
            combinedScrapedData += `Format: QR Code\n`;
            combinedScrapedData += `Location: (${code.location.topLeftCorner.x}, ${code.location.topLeftCorner.y})\n`;
          } else {
            combinedScrapedData += `\n[QR CODE]: No QR code detected in image\n`;
          }
        }
      } catch (e) {
        console.error("QR code extraction failed", e);
        combinedScrapedData += `\n[QR CODE ERROR]: ${e}\n`;
      }
    }

    // Document Processing
    if (documentUrl) {
      try {
        let buffer;
        if (documentUrl.startsWith("data:")) {
          const base64Data = documentUrl.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else {
          const response = await fetch(documentUrl);
          if (response.ok) {
            buffer = Buffer.from(await response.arrayBuffer());
          }
        }

        if (buffer) {
          // Detect file type from base64 header
          const mimeType = documentUrl.match(/data:([^;]+);/)?.[1] || "application/pdf";
          
          if (mimeType.includes("pdf")) {
            // PDF Processing
            const pdfParse = (await import("pdf-parse")).default;
            const pdfData = await pdfParse(buffer);
            
            combinedScrapedData += `\n[DOCUMENT METADATA (PDF)]:\n`;
            combinedScrapedData += `Pages: ${pdfData.numpages}\n`;
            combinedScrapedData += `Info: ${JSON.stringify(pdfData.info, null, 2)}\n`;
            combinedScrapedData += `Text Preview: ${pdfData.text.substring(0, 500)}\n`;
          } else {
            // Other document types - basic metadata
            combinedScrapedData += `\n[DOCUMENT METADATA]:\n`;
            combinedScrapedData += `Type: ${mimeType}\n`;
            combinedScrapedData += `Size: ${buffer.length} bytes\n`;
          }
        }
      } catch (e) {
        console.error("Document extraction failed", e);
        combinedScrapedData += `\n[DOCUMENT ERROR]: ${e}\n`;
      }
    }

    let correlations: any[] = [];
    let breaches: any[] = [];

    if (mode === "search" && query) {
      // MODE: SEARCH DISCOVERY
      let results = await googleSearch(query);
      
      if (!results || results.length === 0) {
        console.log("No Google results or API failed, falling back to DuckDuckGo/Playwright");
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
          results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.result'));
            return items.slice(0, 5).map(item => ({
              title: item.querySelector('.result__title')?.textContent?.trim() || "",
              link: item.querySelector('.result__a')?.getAttribute('href') || "",
              snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
            }));
          });
        } catch (e: any) {
          console.error(`Search discovery failed for ${query}`, e);
        } finally {
          await context.close();
        }
      }

      combinedScrapedData += `\n--- SEARCH RESULTS FOR "${query}" ---\n`;
      if (results && results.length > 0) {
        results.forEach((r: any) => {
          combinedScrapedData += `SOURCE: ${r.link}\nTITLE: ${r.title}\nSNIPPET: ${r.snippet}\n\n`;
        });
      } else {
        combinedScrapedData += `No results found in indexed repositories.\n`;
      }
    } else if (mode === "shadow" && query) {
      // MODE: IDENTITY CORRELATION (Shadow Link) - AGGRESSIVE 100+ PLATFORM CHECK
      const platforms = [
        { name: "Instagram", url: "https://www.instagram.com/{}" },
        { name: "Twitter", url: "https://twitter.com/{}" },
        { name: "GitHub", url: "https://github.com/{}" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/{}" },
        { name: "Facebook", url: "https://www.facebook.com/{}" },
        { name: "Reddit", url: "https://www.reddit.com/user/{}" },
        { name: "YouTube", url: "https://www.youtube.com/@{}" },
        { name: "TikTok", url: "https://www.tiktok.com/@{}" },
        { name: "Pinterest", url: "https://www.pinterest.com/{}" },
        { name: "Snapchat", url: "https://www.snapchat.com/add/{}" },
        { name: "Twitch", url: "https://www.twitch.tv/{}" },
        { name: "Steam", url: "https://steamcommunity.com/id/{}" },
        { name: "SoundCloud", url: "https://soundcloud.com/{}" },
        { name: "Spotify", url: "https://open.spotify.com/user/{}" },
        { name: "Medium", url: "https://medium.com/@{}" },
        { name: "Dev.to", url: "https://dev.to/{}" },
        { name: "Hackernoon", url: "https://hackernoon.com/u/{}" },
        { name: "Behance", url: "https://www.behance.net/{}" },
        { name: "Dribbble", url: "https://dribbble.com/{}" },
        { name: "Tumblr", url: "https://{}.tumblr.com" },
        { name: "Vimeo", url: "https://vimeo.com/{}" },
        { name: "Patreon", url: "https://www.patreon.com/{}" },
        { name: "Substack", url: "https://{}.substack.com" },
        { name: "Flickr", url: "https://www.flickr.com/people/{}" },
        { name: "Last.fm", url: "https://www.last.fm/user/{}" },
        { name: "Letterboxd", url: "https://letterboxd.com/{}" },
        { name: "MyAnimeList", url: "https://myanimelist.net/profile/{}" },
        { name: "ProductHunt", url: "https://www.producthunt.com/@{}" },
        { name: "AngelList", url: "https://angel.co/u/{}" },
        { name: "About.me", url: "https://about.me/{}" },
        { name: "Codepen", url: "https://codepen.io/{}" },
        { name: "Bitbucket", url: "https://bitbucket.org/{}/" },
        { name: "GitLab", url: "https://gitlab.com/{}" },
        { name: "Kaggle", url: "https://www.kaggle.com/{}" },
        { name: "LeetCode", url: "https://leetcode.com/{}" },
        { name: "HackerRank", url: "https://www.hackerrank.com/{}" },
        { name: "DeviantArt", url: "https://www.deviantart.com/{}" },
        { name: "Etsy", url: "https://www.etsy.com/people/{}" },
        { name: "Houzz", url: "https://www.houzz.com/user/{}" },
        { name: "Imgur", url: "https://imgur.com/user/{}" },
        { name: "Linktree", url: "https://linktr.ee/{}" },
        { name: "Venmo", url: "https://venmo.com/{}" },
        { name: "CashApp", url: "https://cash.app/${}" },
        { name: "Discord", url: "https://discord.com/users/{}" },
        { name: "Telegram", url: "https://t.me/{}" },
        { name: "Signal", url: "https://signal.me/#p/{}" },
        { name: "Disqus", url: "https://disqus.com/by/{}" },
        { name: "WordPress", url: "https://{}.wordpress.com" },
        { name: "Blogger", url: "https://{}.blogspot.com" },
        { name: "DailyMotion", url: "https://www.dailymotion.com/{}" },
        { name: "Vimeoworld", url: "https://vimeoworld.com/user/{}" },
        { name: "Ask.fm", url: "https://ask.fm/{}" },
        { name: "Bandcamp", url: "https://bandcamp.com/{}" },
        { name: "Bitly", url: "https://bitly.com/u/{}" },
        { name: "Chess.com", url: "https://www.chess.com/member/{}" },
        { name: "Codeforces", url: "https://codeforces.com/profile/{}" },
        { name: "Docker", url: "https://hub.docker.com/u/{}" },
        { name: "Ello", url: "https://ello.co/{}" },
        { name: "Expo", url: "https://expo.dev/@{}" },
        { name: "EyeEm", url: "https://www.eyeem.com/u/{}" },
        { name: "Foursquare", url: "https://foursquare.com/{}" },
        { name: "Giphy", url: "https://giphy.com/{}" },
        { name: "Goodreads", url: "https://www.goodreads.com/{}" },
        { name: "Gumroad", url: "https://{}.gumroad.com" },
        { name: "Hey.com", url: "https://{}.hey.com" },
        { name: "Instructables", url: "https://www.instructables.com/member/{}" },
        { name: "Issuu", url: "https://issuu.com/{}" },
        { name: "Keybase", url: "https://keybase.io/{}" },
        { name: "Kongregate", url: "https://www.kongregate.com/accounts/{}" },
        { name: "Launchpad", url: "https://launchpad.net/~{}" },
        { name: "LiveJournal", url: "https://{}.livejournal.com" },
        { name: "Mixcloud", url: "https://www.mixcloud.com/{}/" },
        { name: "MySpace", url: "https://myspace.com/{}" },
        { name: "NameMC", url: "https://namemc.com/profile/{}" },
        { name: "Newgrounds", url: "https://{}.newgrounds.com" },
        { name: "OK", url: "https://ok.ru/{}" },
        { name: "OpenStreetMap", url: "https://www.openstreetmap.org/user/{}" },
        { name: "Pastebin", url: "https://pastebin.com/u/{}" },
        { name: "ReverbNation", url: "https://www.reverbnation.com/{}" },
        { name: "Scribd", url: "https://www.scribd.com/{}" },
        { name: "Sketchfab", url: "https://sketchfab.com/{}" },
        { name: "SlideShare", url: "https://www.slideshare.net/{}" },
        { name: "SourceForge", url: "https://sourceforge.net/u/{}/profile" },
        { name: "Strava", url: "https://www.strava.com/athletes/{}" },
        { name: "Trello", url: "https://trello.com/{}" },
        { name: "TripAdvisor", url: "https://www.tripadvisor.com/Profile/{}" },
        { name: "UNTappd", url: "https://untappd.com/user/{}" },
        { name: "Upwork", url: "https://www.upwork.com/freelancers/~{}" },
        { name: "Wattpad", url: "https://www.wattpad.com/user/{}" },
        { name: "WeHeartIt", url: "https://weheartit.com/{}" },
        { name: "Wix", url: "https://{}.wixsite.com" },
        { name: "Xbox", url: "https://www.xboxgamertag.com/search/{}" },
        { name: "Yelp", url: "https://{}.yelp.com" },
        { name: "Zhihu", url: "https://www.zhihu.com/people/{}" },
        { name: "AllMyLinks", url: "https://allmylinks.com/{}" },
        { name: "BuyMeACoffee", url: "https://www.buymeacoffee.com/{}" },
        { name: "Cointracker", url: "https://www.cointracker.io/user/{}" },
        { name: "Contently", url: "https://{}.contently.com" },
        { name: "Fiverr", url: "https://www.fiverr.com/{}" },
        { name: "Fuelrats", url: "https://fuelrats.com/user/{}" },
        { name: "Genius", url: "https://genius.com/{}" },
        { name: "Gitee", url: "https://gitee.com/{}" },
        { name: "Ifttt", url: "https://ifttt.com/p/{}" },
        { name: "Kojit", url: "https://ko-fi.com/{}" },
        { name: "Mastodon", url: "https://mastodon.social/@{}" },
        { name: "NPM", url: "https://www.npmjs.com/~{}" },
        { name: "OpenSea", url: "https://opensea.io/{}" },
        { name: "Polywork", url: "https://www.polywork.com/{}" },
        { name: "Rarible", url: "https://rarible.com/{}" },
        { name: "Roblox", url: "https://www.roblox.com/user.aspx?username={}" },
        { name: "RootMe", url: "https://www.root-me.org/{}" },
        { name: "SatoshiWallet", url: "https://satoshiwallet.io/u/{}" },
        { name: "TryHackMe", url: "https://tryhackme.com/p/{}" },
      ];

      combinedScrapedData += `\n--- IDENTITY CORRELATION (AGGRESSIVE) FOR "${query}" ---\n`;
      
      // Parallel execution with limited concurrency to avoid IP bans
      const CHUNK_SIZE = 15;
      for (let i = 0; i < platforms.length; i += CHUNK_SIZE) {
        const chunk = platforms.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(chunk.map(async (p) => {
          const url = p.url.replace("{}", query);
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            
            if (res.status === 200 || res.status === 301 || res.status === 302) {
              return { name: p.name, url, status: "found" };
            }
            return { name: p.name, url, status: "not_found" };
          } catch (e) {
            return { name: p.name, url, status: "error" };
          }
        }));

        results.forEach(r => {
          correlations.push(r);
          if (r.status === "found") {
            combinedScrapedData += `[FOUND] PLATFORM: ${r.name} | LINK: ${r.url}\n`;
          }
        });
      }

      // Also do a DuckDuckGo secondary sweep for "natural" results
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const topPlatforms = platforms.slice(0, 7).map(p => `site:${p.url.split('/')[2]} "${query}"`).join(" OR ");
        await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(topPlatforms)}`, { waitUntil: "domcontentloaded" });
        const searchResults = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('.result'));
          return items.slice(0, 5).map(item => ({
            title: item.querySelector('.result__title')?.textContent?.trim() || "",
            link: item.querySelector('.result__a')?.getAttribute('href') || "",
            snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
          }));
        });
        
        combinedScrapedData += `\n[SECONDARY SEARCH INTELLIGENCE]:\n`;
        searchResults.forEach(r => {
          combinedScrapedData += `CORRELATION: ${r.link}\nBIO: ${r.snippet}\n\n`;
        });
      } finally {
        await context.close();
      }
    } else if (mode === "nexus" && query) {
      // MODE: INFRASTRUCTURE MAPPING (Network Nexus)
      combinedScrapedData += `\n--- INFRASTRUCTURE MAP FOR "${query}" ---\n`;
      
      try {
        // 1. DNS Analysis
        const dnsInfo: any = {};
        try { dnsInfo.any = await resolveAny(query); } catch(e) {}
        try { dnsInfo.mx = await resolveMx(query); } catch(e) {}
        try { dnsInfo.ns = await resolveNs(query); } catch(e) {}
        try { dnsInfo.txt = await resolveTxt(query); } catch(e) {}
        
        combinedScrapedData += `[DNS RECORDS]:\n${JSON.stringify(dnsInfo, null, 2)}\n\n`;
        
        // 2. HTTP/SSL Analysis
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          const url = query.startsWith('http') ? query : `https://${query}`;
          const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
          const securityDetails = await response?.securityDetails();
          const headers = response?.headers();
          
          combinedScrapedData += `[SERVER HEADERS]:\n${JSON.stringify(headers, null, 2)}\n\n`;
          if (securityDetails) {
            combinedScrapedData += `[SSL/TLS SECURITY]:\n`;
            combinedScrapedData += `Protocol: ${securityDetails.protocol}\n`;
            combinedScrapedData += `Subject: ${securityDetails.subjectName}\n`;
            combinedScrapedData += `Issuer: ${securityDetails.issuer}\n`;
            combinedScrapedData += `Valid From: ${securityDetails.validFrom ? new Date(securityDetails.validFrom * 1000).toUTCString() : 'N/A'}\n`;
            combinedScrapedData += `Valid To: ${securityDetails.validTo ? new Date(securityDetails.validTo * 1000).toUTCString() : 'N/A'}\n\n`;
          }
        } catch (e: any) {
          combinedScrapedData += `[HTTP ANALYSIS ERROR]: ${e.message}\n`;
        } finally {
          await context.close();
        }
      } catch (e: any) {
        console.error(`Infrastructure mapping failed for ${query}`, e);
        combinedScrapedData += `[NEXUS ERROR]: ${e.message}\n`;
      }
    } else if (mode === "footprint" && query) {
      // MODE: BREACH DISCOVERY (AGGRESSIVE FOOTPRINT)
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const searchQueries = [
          `site:pastebin.com "${query}" leak`,
          `site:ghostbin.co "${query}" breach`,
          `site:leakcheck.io "${query}"`,
          `site:haveibeenpwned.com "${query}"`,
          `"${query}" database dump 2024`,
          `"${query}" credentials leaked`
        ];
        
        combinedScrapedData += `\n--- BREACH DISCOVERY (FOOTPRINT) FOR "${query}" ---\n`;
        
        for (const sQuery of searchQueries) {
          await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(sQuery)}`, { waitUntil: "domcontentloaded" });
          const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.result'));
            return items.slice(0, 3).map(item => ({
              title: item.querySelector('.result__title')?.textContent?.trim() || "",
              link: item.querySelector('.result__a')?.getAttribute('href') || "",
              snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
            }));
          });
          
          results.forEach(r => {
            breaches.push(r);
            combinedScrapedData += `BREACH INDICATOR: ${r.link}\nINTEL: ${r.snippet}\n\n`;
          });
        }
      } catch (e: any) {
        console.error(`Breach discovery failed for ${query}`, e);
      } finally {
        await context.close();
      }
    } else if (mode === "omni" && query) {
      // MODE: OMNI SEARCH (GLOBAL EVERYTHING)
      combinedScrapedData += `\n--- 🌐 OMNI INTELLIGENCE FEED FOR "${query}" ---\n`;
      
      // 1. General Search (Google/DuckDuckGo)
      const gResults = await googleSearch(query);
      if (gResults) {
        combinedScrapedData += `\n[WEB INTELLIGENCE (PRIMARY)]:\n`;
        gResults.forEach((r: any) => {
          combinedScrapedData += `TITLE: ${r.title}\nLINK: ${r.link}\nSNIPPET: ${r.snippet}\n\n`;
        });
      } else {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: "domcontentloaded" });
          const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.result'));
            return items.slice(0, 5).map(item => ({
              title: item.querySelector('.result__title')?.textContent?.trim() || "",
              link: item.querySelector('.result__a')?.getAttribute('href') || "",
              snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
            }));
          });
          combinedScrapedData += `\n[WEB INTELLIGENCE (FALLBACK)]:\n`;
          results.forEach(r => {
            combinedScrapedData += `TITLE: ${r.title}\nLINK: ${r.link}\nSNIPPET: ${r.snippet}\n\n`;
          });
        } finally {
          await context.close();
        }
      }

      // 2. Identity Correlation (Shadow) - Limit to top 30 platforms for Omni speed
      const topPlatforms = [
        { name: "GitHub", url: "https://github.com/{}" },
        { name: "Twitter/X", url: "https://twitter.com/{}" },
        { name: "Instagram", url: "https://www.instagram.com/{}/" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/{}/" },
        { name: "Reddit", url: "https://www.reddit.com/user/{}" },
        { name: "Facebook", url: "https://www.facebook.com/{}" },
        { name: "TikTok", url: "https://www.tiktok.com/@{}" },
        { name: "Telegram", url: "https://t.me/{}" },
        { name: "Snapchat", url: "https://www.snapchat.com/add/{}" },
        { name: "Twitch", url: "https://www.twitch.tv/{}" },
        { name: "Pinterest", url: "https://www.pinterest.com/{}/" },
        { name: "YouTube", url: "https://www.youtube.com/@{}" },
        { name: "Medium", url: "https://medium.com/@{}" },
        { name: "Behance", url: "https://www.behance.net/{}" },
        { name: "Dribbble", url: "https://dribbble.com/{}" },
        { name: "Dev.to", url: "https://dev.to/{}" },
        { name: "GitLab", url: "https://gitlab.com/{}" },
        { name: "Bitbucket", url: "https://bitbucket.org/{}/" },
        { name: "StackOverflow", url: "https://stackoverflow.com/users/search?q={}" },
        { name: "Patreon", url: "https://www.patreon.com/{}" },
        { name: "Substack", url: "https://{}.substack.com" },
        { name: "OnlyFans", url: "https://onlyfans.com/{}" },
        { name: "Discord", url: "https://discord.com/users/{}" },
        { name: "CashApp", url: "https://cash.app/${}" },
        { name: "Venmo", url: "https://venmo.com/{}" },
        { name: "Linktree", url: "https://linktr.ee/{}" },
        { name: "About.me", url: "https://about.me/{}" },
        { name: "WordPress", url: "https://{}.wordpress.com" },
        { name: "Blogger", url: "https://{}.blogspot.com" },
        { name: "OpenSea", url: "https://opensea.io/{}" },
      ];

      combinedScrapedData += `\n[IDENTITY PROFILE SCAN]:\n`;
      const CHUNK_SIZE = 10;
      for (let i = 0; i < topPlatforms.length; i += CHUNK_SIZE) {
        const chunk = topPlatforms.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(chunk.map(async (p) => {
          const url = p.url.replace("{}", query);
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.status === 200) return { name: p.name, url, status: "found" };
            return null;
          } catch (e) { return null; }
        }));
        results.filter(r => r !== null).forEach(r => {
          correlations.push(r as any);
          combinedScrapedData += `[FOUND] PLATFORM: ${r?.name} | LINK: ${r?.url}\n`;
        });
      }

      // 3. Breach Discovery (Footprint)
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const bQuery = `site:pastebin.com OR site:ghostbin.co "${query}" leak OR breach`;
        await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(bQuery)}`, { waitUntil: "domcontentloaded" });
        const bResults = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('.result'));
          return items.slice(0, 3).map(item => ({
            title: item.querySelector('.result__title')?.textContent?.trim() || "",
            link: item.querySelector('.result__a')?.getAttribute('href') || "",
            snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
          }));
        });
        combinedScrapedData += `\n[BREACH INTELLIGENCE]:\n`;
        bResults.forEach(r => {
          breaches.push(r);
          combinedScrapedData += `BREACH INDICATOR: ${r.link}\nINTEL: ${r.snippet}\n\n`;
        });
      } finally {
        await context.close();
      }
    } else if (mode === "breach" && query) {
      // MODE: ADVANCED BREACH WATCH
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        const breachQueries = [
          `site:intelx.io "${query}"`,
          `site:psbdmp.ws "${query}"`,
          `site:pastebin.com "${query}" password`,
          `site:ghostbin.co "${query}" leak`,
          `"${query}" comb breach`,
          `"${query}" database dump`
        ];
        
        combinedScrapedData += `\n--- ADVANCED BREACH INTELLIGENCE FOR "${query}" ---\n`;
        
        for (const bQuery of breachQueries) {
          await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(bQuery)}`, { waitUntil: "domcontentloaded" });
          const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.result'));
            return items.slice(0, 3).map(item => ({
              title: item.querySelector('.result__title')?.textContent?.trim() || "",
              link: item.querySelector('.result__a')?.getAttribute('href') || "",
              snippet: item.querySelector('.result__snippet')?.textContent?.trim() || ""
            }));
          });
          
          results.forEach((r: any) => {
            breaches.push(r);
            combinedScrapedData += `[BREACH] SOURCE: ${r.link} | DATA: ${r.snippet}\n\n`;
          });
        }
      } finally {
        await context.close();
      }
    } else if (additionalData) {
      // MODE: DIRECT SCRAPING
      const igMatch = additionalData.match(/(?:ig|instagram).*?@?(\w[\w\.\_]+)/i);
      const urlsToScrape = [];
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundUrls = additionalData.match(urlRegex) || [];
      urlsToScrape.push(...foundUrls);

      if (igMatch && igMatch[1]) {
        const cleanHandle = igMatch[1].replace('@', '');
        const igUrl = `https://www.instagram.com/${cleanHandle}/`;
        if (!urlsToScrape.some(u => u.includes(cleanHandle))) {
          urlsToScrape.push(igUrl);
        }
      }

      for (const url of urlsToScrape) {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
          await page.waitForTimeout(2000); 
          const title = await page.title();
          const metaDesc = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.getAttribute('content') : '';
          });
          const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1500));

          combinedScrapedData += `\n--- DIRECT SCRAPE FROM ${url} ---\n`;
          combinedScrapedData += `Title: ${title}\nMeta Bio/Stats: ${metaDesc}\nPage Content Snippet: ${bodyText}\n`;
        } catch (e: any) {
          console.error(`Failed to scrape ${url}`, e);
          combinedScrapedData += `\n--- FAILED TO ACCESS ${url} ---\n`;
        } finally {
          await context.close();
        }
      }
    }

    await browser.close();
    return NextResponse.json({ 
      scrapedText: combinedScrapedData, 
      imageMetadata,
      correlations,
      breaches
    });
  } catch (error: any) {
    console.error("Scrape API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
