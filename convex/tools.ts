import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

// 1. THE ORACLE: General Reconnaissance
export const intelOracle_v2 = action({
  args: {
    query: v.string(),
    location: v.optional(v.string()),
    keywords: v.optional(v.string()),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()), 
    syncTime: v.optional(v.number()), // Force sync
  },
  handler: async (ctx, args) => {
    // Enhanced system prompt for deeper analysis
    const systemPrompt = `You are 'Oracle', an elite OSINT analyst with expertise in digital forensics, social engineering, and intelligence gathering.

CRITICAL RULES:
- NO HALLUCINATIONS: Only use information from the provided data
- Cross-reference all findings across multiple sources
- Identify patterns, connections, and anomalies
- Assess credibility and confidence levels for each finding
- Highlight gaps in intelligence that require further investigation

ANALYSIS FRAMEWORK:
1. IDENTITY VERIFICATION
   - Confirm target identity across multiple platforms
   - Identify aliases, usernames, and variations
   - Assess authenticity and potential impersonation

2. DIGITAL FOOTPRINT MAPPING
   - Social media presence and activity patterns
   - Professional affiliations and employment history
   - Educational background and credentials
   - Geographic locations and movement patterns

3. NETWORK ANALYSIS
   - Key associates and relationships
   - Organizational connections
   - Community involvement and affiliations

4. BEHAVIORAL PATTERNS
   - Communication style and language patterns
   - Activity timestamps and timezone indicators
   - Interests, hobbies, and lifestyle indicators

5. RISK ASSESSMENT
   - Public exposure level
   - Potential security concerns
   - Data breach involvement
   - Reputation indicators

6. INTELLIGENCE GAPS
   - Missing information requiring further investigation
   - Contradictions or inconsistencies in data
   - Recommended next steps

FORMAT: Use clear markdown with sections, bullet points, and confidence indicators (HIGH/MEDIUM/LOW) for each finding.`;

    const userPrompt = `TARGET: ${args.query}
${args.location ? `LOCATION FOCUS: ${args.location}` : ''}
${args.keywords ? `CONTEXTUAL KEYWORDS: ${args.keywords}` : ''}

COLLECTED INTELLIGENCE:
${args.scrapedData || "No data collected. Provide analysis based on target name only and indicate data limitations."}

Provide a comprehensive OSINT analysis following the framework above.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
      }

      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId, 
          caseId: args.caseId as any,
          query: args.query, 
          name: "Oracle Search",
          location: args.location,
          keywords: args.keywords,
          dossier, 
          tool: "oracle",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("Oracle fetch failed:", error);
      const errorDossier = `### ❌ ORACLE PIPELINE ERROR\n\n**Error:** ${error.message}\n\n**Troubleshooting:**\n1. Verify \`GROQ_API_KEY\` is set in Convex dashboard\n2. Check network connectivity to api.groq.com\n3. Ensure the target query is not triggering safety filters`;
      
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId, 
          caseId: args.caseId as any,
          query: args.query, 
          name: "Oracle Search",
          dossier: errorDossier, 
          tool: "oracle",
          status: "failed",
        });
        return { dossier: errorDossier, searchId };
      }
      return { dossier: errorDossier };
    }
  },
});

// 2. EXIF HUNTER: Image Forensics (NO AI - Local Processing Only)
// Updated: Enhanced JSON parsing with brace counting algorithm
export const exifHunter = action({
  args: {
    imageUrl: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()), 
  },
  handler: async (ctx, args) => {
    // NO AI PROCESSING - Parse EXIF data locally to protect sensitive information
    let dossier = "# 🔒 EXIF HUNTER - AGGRESSIVE LOCAL ANALYSIS (NO AI)\n\n";
    dossier += "*Your image metadata is processed locally and never sent to any AI service.*\n\n";
    dossier += "---\n\n";

    try {
      if (!args.scrapedData || args.scrapedData === "No EXIF data found.") {
        dossier += "## ❌ NO EXIF DATA FOUND\n\n";
        dossier += "The uploaded image does not contain EXIF metadata. This could mean:\n\n";
        dossier += "- The image was processed by a social media platform that strips metadata\n";
        dossier += "- The image was edited with software that removes EXIF data\n";
        dossier += "- The image format doesn't support EXIF (e.g., PNG, WebP)\n";
        dossier += "- The camera/device doesn't embed metadata\n\n";
        dossier += "**Recommendation:** Try uploading the original, unedited image file (JPG/JPEG format preferred).\n";
      } else {
        // Parse the EXIF data from scrapedData with robust error handling
        // Extract JSON more carefully - find the complete object
        const startMarker = '[IMAGE INTELLIGENCE (AGGRESSIVE EXIF EXTRACTION)]:';
        const startIdx = args.scrapedData.indexOf(startMarker);
        
        if (startIdx === -1) {
          dossier += "## ❌ NO EXIF DATA MARKER FOUND\n\n";
          dossier += "The scraped data doesn't contain the expected EXIF marker.\n\n";
          dossier += "**Raw Data:**\n```\n" + args.scrapedData.substring(0, 1000) + "\n```\n";
        } else {
          // Find the JSON object starting after the marker
          const jsonStart = args.scrapedData.indexOf('{', startIdx);
          if (jsonStart === -1) {
            dossier += "## ❌ NO JSON OBJECT FOUND\n\n";
            dossier += "Could not locate JSON data in the scraped content.\n";
          } else {
            // Extract JSON by counting braces
            let braceCount = 0;
            let jsonEnd = jsonStart;
            let inString = false;
            let escapeNext = false;
            
            for (let i = jsonStart; i < args.scrapedData.length; i++) {
              const char = args.scrapedData[i];
              
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              
              if (char === '\\') {
                escapeNext = true;
                continue;
              }
              
              if (char === '"') {
                inString = !inString;
                continue;
              }
              
              if (!inString) {
                if (char === '{') braceCount++;
                if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    jsonEnd = i + 1;
                    break;
                  }
                }
              }
            }
            
            const jsonString = args.scrapedData.substring(jsonStart, jsonEnd);
            
            let metadata;
            try {
              metadata = JSON.parse(jsonString);
            } catch (parseError: any) {
              dossier += "## ⚠️ JSON PARSE ERROR\n\n";
              dossier += `Unable to parse EXIF data: ${parseError.message}\n\n`;
              
              // Check if all values are null (no EXIF data)
              if (jsonString.includes('"latitude": null') && jsonString.includes('"width":')) {
                dossier += "## ℹ️ NO EXIF METADATA FOUND\n\n";
                dossier += "This image does not contain EXIF metadata. Possible reasons:\n\n";
                dossier += "- Image was processed by social media (Instagram, Facebook, etc.) which strips metadata\n";
                dossier += "- Image was edited with software that removes EXIF data\n";
                dossier += "- Image format doesn't support EXIF (PNG, WebP, GIF)\n";
                dossier += "- Screenshot or generated image (not from a camera)\n\n";
                
                // Try to extract image dimensions
                const widthMatch = jsonString.match(/"width":\s*(\d+)/);
                const heightMatch = jsonString.match(/"height":\s*(\d+)/);
                
                if (widthMatch && heightMatch) {
                  dossier += "### 🖼️ IMAGE PROPERTIES\n\n";
                  dossier += `**Dimensions:** ${widthMatch[1]} × ${heightMatch[1]} pixels\n\n`;
                }
                
                dossier += "**Privacy Status:** ✅ Good - No sensitive metadata found\n";
              } else {
                dossier += "**Debug Info:**\n```\n" + jsonString.substring(0, 500) + "\n```\n";
              }
              
              if (args.clerkId) {
                await ctx.runMutation(internal.searches.saveSearch, {
                  clerkId: args.clerkId, 
                  query: "Image Analysis", 
                  name: "Image Forensics",
                  dossier, 
                  tool: "exif",
                  status: "completed",
                });
              }
              return dossier;
            }
            
            dossier += "## 🎯 COMPREHENSIVE METADATA EXTRACTION\n\n";
          
          // GPS LOCATION - CRITICAL INTELLIGENCE
          if (metadata.gps && (metadata.gps.latitude || metadata.gps.longitude)) {
            dossier += "### 📍 LOCATION INTELLIGENCE (🔴 CRITICAL)\n\n";
            
            if (metadata.gps.latitude && metadata.gps.longitude) {
              dossier += `**Coordinates:**\n`;
              dossier += `- Latitude: ${metadata.gps.latitude}° ${metadata.gps.latitudeRef || ''}\n`;
              dossier += `- Longitude: ${metadata.gps.longitude}° ${metadata.gps.longitudeRef || ''}\n`;
              dossier += `- [📌 View on Google Maps](https://www.google.com/maps?q=${metadata.gps.latitude},${metadata.gps.longitude})\n`;
              dossier += `- [🗺️ View on OpenStreetMap](https://www.openstreetmap.org/?mlat=${metadata.gps.latitude}&mlon=${metadata.gps.longitude}&zoom=15)\n\n`;
            }
            
            if (metadata.gps.altitude) {
              dossier += `**Altitude:** ${metadata.gps.altitude}m ${metadata.gps.altitudeRef === 1 ? 'below' : 'above'} sea level\n\n`;
            }
            
            if (metadata.gps.speed) {
              dossier += `**Speed:** ${metadata.gps.speed} ${metadata.gps.speedRef || 'km/h'}\n\n`;
            }
            
            if (metadata.gps.imgDirection) {
              dossier += `**Camera Direction:** ${metadata.gps.imgDirection}° ${metadata.gps.imgDirectionRef || ''}\n\n`;
            }
            
            if (metadata.gps.dateStamp || metadata.gps.timeStamp) {
              dossier += `**GPS Timestamp:**\n`;
              if (metadata.gps.dateStamp) dossier += `- Date: ${metadata.gps.dateStamp}\n`;
              if (metadata.gps.timeStamp) dossier += `- Time: ${metadata.gps.timeStamp}\n`;
              dossier += "\n";
            }
            
            if (metadata.gps.areaInformation) {
              dossier += `**Area Information:** ${metadata.gps.areaInformation}\n\n`;
            }
            
            dossier += "⚠️ **PRIVACY ALERT:** This image contains precise GPS coordinates revealing the exact location where it was captured.\n\n";
          } else {
            dossier += "### 📍 LOCATION INTELLIGENCE\n\n";
            dossier += "✅ No GPS coordinates found - Location privacy preserved\n\n";
          }
          
          // TIMESTAMPS - TEMPORAL INTELLIGENCE
          if (metadata.timestamps && Object.values(metadata.timestamps).some(v => v !== null)) {
            dossier += "### 🕐 TEMPORAL INTELLIGENCE\n\n";
            
            if (metadata.timestamps.dateTimeOriginal) {
              const date = new Date(metadata.timestamps.dateTimeOriginal * 1000);
              dossier += `**Original Capture Time:**\n`;
              dossier += `- ${date.toUTCString()}\n`;
              dossier += `- Unix: ${metadata.timestamps.dateTimeOriginal}\n`;
              if (metadata.timestamps.offsetTimeOriginal) {
                dossier += `- Timezone Offset: ${metadata.timestamps.offsetTimeOriginal}\n`;
              }
              dossier += "\n";
            }
            
            if (metadata.timestamps.createDate && metadata.timestamps.createDate !== metadata.timestamps.dateTimeOriginal) {
              const date = new Date(metadata.timestamps.createDate * 1000);
              dossier += `**File Creation Time:** ${date.toUTCString()}\n\n`;
            }
            
            if (metadata.timestamps.dateTimeDigitized) {
              const date = new Date(metadata.timestamps.dateTimeDigitized * 1000);
              dossier += `**Digitization Time:** ${date.toUTCString()}\n\n`;
            }
            
            if (metadata.timestamps.modifyDate) {
              const date = new Date(metadata.timestamps.modifyDate * 1000);
              dossier += `**Last Modified:** ${date.toUTCString()}\n\n`;
            }
            
            if (metadata.timestamps.subSecTimeOriginal) {
              dossier += `**Sub-second Precision:** ${metadata.timestamps.subSecTimeOriginal}\n\n`;
            }
          } else {
            dossier += "### 🕐 TEMPORAL INTELLIGENCE\n\n";
            dossier += "No timestamp data found\n\n";
          }
          
          // DEVICE FINGERPRINT - IDENTITY INTELLIGENCE
          if (metadata.device && Object.values(metadata.device).some(v => v !== null)) {
            dossier += "### 📱 DEVICE FINGERPRINT (🔴 IDENTITY)\n\n";
            
            if (metadata.device.make || metadata.device.model) {
              dossier += `**Camera/Device:**\n`;
              if (metadata.device.make) dossier += `- Manufacturer: ${metadata.device.make}\n`;
              if (metadata.device.model) dossier += `- Model: ${metadata.device.model}\n`;
              dossier += "\n";
            }
            
            if (metadata.device.serialNumber || metadata.device.bodySerialNumber || metadata.device.internalSerialNumber) {
              dossier += `**🚨 SERIAL NUMBERS (UNIQUE IDENTIFIER):**\n`;
              if (metadata.device.serialNumber) dossier += `- Serial: ${metadata.device.serialNumber}\n`;
              if (metadata.device.bodySerialNumber) dossier += `- Body Serial: ${metadata.device.bodySerialNumber}\n`;
              if (metadata.device.internalSerialNumber) dossier += `- Internal Serial: ${metadata.device.internalSerialNumber}\n`;
              dossier += "\n⚠️ **CRITICAL:** Serial numbers can uniquely identify the device owner!\n\n";
            }
            
            if (metadata.device.lensModel || metadata.device.lensMake) {
              dossier += `**Lens Information:**\n`;
              if (metadata.device.lensMake) dossier += `- Lens Make: ${metadata.device.lensMake}\n`;
              if (metadata.device.lensModel) dossier += `- Lens Model: ${metadata.device.lensModel}\n`;
              if (metadata.device.lensSerialNumber) dossier += `- Lens Serial: ${metadata.device.lensSerialNumber}\n`;
              dossier += "\n";
            }
            
            if (metadata.device.software) {
              dossier += `**Software:** ${metadata.device.software}\n\n`;
            }
            
            if (metadata.device.cameraOwnerName || metadata.device.ownerName) {
              dossier += `**🚨 OWNER NAME:** ${metadata.device.cameraOwnerName || metadata.device.ownerName}\n\n`;
              dossier += "⚠️ **CRITICAL:** Owner name directly identifies the photographer!\n\n";
            }
            
            if (metadata.device.imageUniqueID) {
              dossier += `**Unique Image ID:** ${metadata.device.imageUniqueID}\n\n`;
            }
          } else {
            dossier += "### 📱 DEVICE FINGERPRINT\n\n";
            dossier += "No device information found\n\n";
          }
          
          // CAMERA SETTINGS - TECHNICAL FORENSICS
          if (metadata.settings && Object.values(metadata.settings).some(v => v !== null)) {
            dossier += "### ⚙️ CAMERA SETTINGS\n\n";
            
            const settings = [];
            if (metadata.settings.fNumber) settings.push(`f/${metadata.settings.fNumber}`);
            if (metadata.settings.exposureTime) settings.push(`${metadata.settings.exposureTime}s`);
            if (metadata.settings.iso) settings.push(`ISO ${metadata.settings.iso}`);
            if (metadata.settings.focalLength) settings.push(`${metadata.settings.focalLength}mm`);
            
            if (settings.length > 0) {
              dossier += `**Exposure:** ${settings.join(' • ')}\n\n`;
            }
            
            if (metadata.settings.flash) {
              dossier += `**Flash:** ${metadata.settings.flash === 0 ? 'Off' : 'On'}\n`;
            }
            if (metadata.settings.whiteBalance) {
              dossier += `**White Balance:** ${metadata.settings.whiteBalance === 0 ? 'Auto' : 'Manual'}\n`;
            }
            if (metadata.settings.exposureMode) {
              dossier += `**Exposure Mode:** ${metadata.settings.exposureMode}\n`;
            }
            dossier += "\n";
          }
          
          // IMAGE PROPERTIES
          if (metadata.image && (metadata.image.width || metadata.image.height)) {
            dossier += "### 🖼️ IMAGE PROPERTIES\n\n";
            if (metadata.image.width && metadata.image.height) {
              dossier += `**Dimensions:** ${metadata.image.width} × ${metadata.image.height} pixels\n`;
            }
            if (metadata.image.orientation) {
              const orientations = ['', 'Normal', 'Flipped horizontally', 'Rotated 180°', 'Flipped vertically', 'Rotated 90° CCW and flipped', 'Rotated 90° CW', 'Rotated 90° CW and flipped', 'Rotated 90° CCW'];
              dossier += `**Orientation:** ${orientations[metadata.image.orientation] || metadata.image.orientation}\n`;
            }
            if (metadata.image.colorSpace) {
              dossier += `**Color Space:** ${metadata.image.colorSpace === 1 ? 'sRGB' : metadata.image.colorSpace}\n`;
            }
            dossier += "\n";
          }
          
          // COPYRIGHT & ATTRIBUTION
          if (metadata.attribution && Object.values(metadata.attribution).some(v => v !== null)) {
            dossier += "### ©️ COPYRIGHT & ATTRIBUTION\n\n";
            
            if (metadata.attribution.artist) {
              dossier += `**Artist:** ${metadata.attribution.artist}\n`;
            }
            if (metadata.attribution.copyright) {
              dossier += `**Copyright:** ${metadata.attribution.copyright}\n`;
            }
            if (metadata.attribution.imageDescription) {
              dossier += `**Description:** ${metadata.attribution.imageDescription}\n`;
            }
            if (metadata.attribution.userComment) {
              dossier += `**User Comment:** ${metadata.attribution.userComment}\n`;
            }
            if (metadata.attribution.xpKeywords) {
              dossier += `**Keywords:** ${metadata.attribution.xpKeywords}\n`;
            }
            dossier += "\n";
          }
          
          // PROCESSING INFORMATION
          if (metadata.processing && Object.values(metadata.processing).some(v => v !== null)) {
            dossier += "### 🖥️ PROCESSING INFORMATION\n\n";
            
            if (metadata.processing.software) {
              dossier += `**Software:** ${metadata.processing.software}\n`;
            }
            if (metadata.processing.hostComputer) {
              dossier += `**Host Computer:** ${metadata.processing.hostComputer}\n`;
            }
            if (metadata.processing.documentName) {
              dossier += `**Document Name:** ${metadata.processing.documentName}\n`;
            }
            dossier += "\n";
          }
          
          // THUMBNAIL DATA
          if (metadata.thumbnail && metadata.thumbnail.offset) {
            dossier += "### 🖼️ EMBEDDED THUMBNAIL\n\n";
            dossier += `**Status:** Thumbnail found (${metadata.thumbnail.length} bytes at offset ${metadata.thumbnail.offset})\n\n`;
          }
          
          // SECURITY ASSESSMENT
          dossier += "## 🔐 PRIVACY & SECURITY ASSESSMENT\n\n";
          
          const risks = [];
          let riskLevel = "🟢 LOW";
          
          if (metadata.gps && (metadata.gps.latitude || metadata.gps.longitude)) {
            risks.push("🔴 **CRITICAL:** GPS coordinates expose exact location");
            riskLevel = "🔴 CRITICAL";
          }
          
          if (metadata.device?.serialNumber || metadata.device?.bodySerialNumber) {
            risks.push("🔴 **CRITICAL:** Device serial number can identify owner");
            riskLevel = "🔴 CRITICAL";
          }
          
          if (metadata.device?.cameraOwnerName || metadata.device?.ownerName) {
            risks.push("🔴 **CRITICAL:** Owner name directly identifies photographer");
            riskLevel = "🔴 CRITICAL";
          }
          
          if (metadata.timestamps?.dateTimeOriginal) {
            risks.push("🟡 **MEDIUM:** Timestamp reveals when photo was taken");
            if (riskLevel === "🟢 LOW") riskLevel = "🟡 MEDIUM";
          }
          
          if (metadata.device?.make || metadata.device?.model) {
            risks.push("🟡 **MEDIUM:** Device information can narrow down owner");
            if (riskLevel === "🟢 LOW") riskLevel = "🟡 MEDIUM";
          }
          
          if (metadata.attribution?.artist || metadata.attribution?.copyright) {
            risks.push("🟡 **MEDIUM:** Attribution data may identify creator");
            if (riskLevel === "🟢 LOW") riskLevel = "🟡 MEDIUM";
          }
          
          dossier += `**Overall Risk Level:** ${riskLevel}\n\n`;
          
          if (risks.length > 0) {
            dossier += "**Identified Risks:**\n";
            risks.forEach(risk => dossier += `- ${risk}\n`);
            dossier += "\n";
            
            dossier += "**Recommendations:**\n";
            dossier += "- ⚠️ Remove ALL EXIF data before sharing images publicly\n";
            dossier += "- Use ExifTool: `exiftool -all= image.jpg`\n";
            dossier += "- Or use online tools like exifremove.com\n";
            dossier += "- Disable GPS/location services on camera/phone for sensitive photos\n";
            dossier += "- Be aware that some platforms strip metadata, but not all\n";
            dossier += "- Consider the implications of serial numbers and owner names in metadata\n";
          } else {
            dossier += "✅ **Good news:** This image has minimal privacy-sensitive metadata.\n";
          }
          
          // RAW DATA DUMP (only if there's actual data)
          const hasAnyData = 
            (metadata.gps && Object.values(metadata.gps).some(v => v !== null)) ||
            (metadata.timestamps && Object.values(metadata.timestamps).some(v => v !== null)) ||
            (metadata.device && Object.values(metadata.device).some(v => v !== null)) ||
            (metadata.attribution && Object.values(metadata.attribution).some(v => v !== null));
          
          if (hasAnyData) {
            dossier += "\n## 📊 RAW METADATA DUMP\n\n";
            dossier += "```json\n";
            dossier += JSON.stringify(metadata, null, 2);
            dossier += "\n```\n";
          }
          
          } // Close the else block for jsonStart check
        } // Close the else block for startIdx check
      }
    } catch (error: any) {
      dossier += "## ❌ ERROR\n\n";
      dossier += `An error occurred while processing the image metadata: ${error.message}\n`;
    }

    if (args.clerkId) {
      let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
        clerkId: args.clerkId, 
        caseId: args.caseId as any,
        query: "Image Analysis", 
        name: "Image Forensics",
        dossier, 
        tool: "exif",
        status: "completed",
      });

      // Auto-save to Evidence Vault
      await ctx.runMutation(api.evidence.addEvidence, {
        clerkId: args.clerkId,
        caseId: args.caseId as any,
        searchId,
        type: "image",
        url: args.imageUrl,
        name: "EXIF Evidence",
        tags: ["exif", "forensics"],
      });
      return { dossier, searchId };
    }
    return { dossier };
  },
});

// 3. FOOTPRINT FINDER: Breach Discovery
export const footprintFinder_v2 = action({
  args: {
    handle: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
    syncTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Leak Synthesis
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are 'Footprint Finder', an elite breach intelligence analyst. Your mission is to identify exposing leaks, database dumps, and credential exposures for a given handle or email. Cross-reference the provided breach indicators and assess the risk level for each exposure. Provide a detailed report on specific breaches (name, date, data leaked)." },
            { role: "user", content: `TARGET: ${args.handle}\n\nRECONNAISSANCE INTELLIGENCE:\n${args.scrapedData || "No breach indicators found in indexed repositories."}\n\nProvide a comprehensive assessment of this target's digital footprint and credential exposure.` }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
      
      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId, 
          caseId: args.caseId as any,
          query: args.handle, 
          name: args.handle,
          dossier, 
          tool: "footprint",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("Footprint Finder failed:", error);
      const errorDossier = `### ❌ BREACH ANALYSIS FAILED\nThe leak synthesis pipeline encountered an error: ${error.message}`;
      
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId, 
          caseId: args.caseId as any,
          query: args.handle, 
          name: args.handle,
          dossier: errorDossier, 
          tool: "footprint",
          status: "failed",
        });
        return { dossier: errorDossier, searchId };
      }
      return { dossier: errorDossier };
    }
  },
});

// 4. FACE RECOGNITION: Facial Analysis & Matching
export const faceRecognition = action({
  args: {
    imageUrl: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = `You are 'Face Recognition Expert', an AI specialized in facial analysis and biometric intelligence.

Analyze this facial image in detail and provide:

1. FACIAL FEATURES
   - Age estimation (provide range with confidence level)
   - Gender identification
   - Ethnicity/ancestry indicators
   - Distinctive features (scars, tattoos, piercings, glasses, facial hair)
   - Facial structure analysis
   - Expression and emotion

2. CONTEXTUAL ANALYSIS
   - Background environment clues
   - Clothing and accessories
   - Time period indicators
   - Social context
   - Photo quality and lighting

3. REVERSE IMAGE SEARCH GUIDANCE
   - Recommend search strategies
   - Suggest platforms to check (Google Images, TinEye, Yandex, PimEyes)
   - Profile discovery techniques
   - Social media platform recommendations

4. PRIVACY & ETHICS
   - Biometric data sensitivity
   - Consent considerations
   - Legal implications

${args.scrapedData ? `\nADDITIONAL CONTEXT:\n${args.scrapedData}\n` : ''}

Provide a comprehensive professional analysis with confidence levels (HIGH/MEDIUM/LOW) for each finding.`;

    try {
      // Convert base64 image to proper format for Gemini
      let imageData = args.imageUrl;
      if (imageData.startsWith('data:image')) {
        imageData = imageData.split(',')[1];
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }]
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error?.message || "API request failed");
      }
      
      const dossier = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "### ❌ ANALYSIS FAILED\nUnable to process facial recognition data.";

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "Facial Analysis",
          name: "Facial Intelligence",
          dossier,
          tool: "face",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      const errorDossier = `### ❌ FACIAL ANALYSIS ERROR\n\n**Error:** ${error.message}\n\n**Note:** This tool requires Google Gemini API access.\n\n**Setup Instructions:**\n1. Get API key from https://makersuite.google.com/app/apikey\n2. Add to Convex: \`npx convex env set GEMINI_API_KEY your_key\`\n\n**Recommendations:**\n- Try using the EXIF Hunter tool to extract image metadata\n- Use reverse image search manually (Google Images, TinEye, Yandex)\n- Consider using specialized facial recognition services like PimEyes\n\n**Privacy Note:** Facial recognition should only be used for legitimate investigative purposes with proper authorization.`;
      
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "Facial Analysis",
          name: "Facial Intelligence",
          dossier: errorDossier,
          tool: "face",
          status: "completed",
        });
        return { dossier: errorDossier, searchId };
      }
      return { dossier: errorDossier };
    }
  },
});

// 7. PHONE NUMBER LOOKUP: Carrier & Location Intelligence
export const phoneNumberLookup = action({
  args: {
    phoneNumber: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let dossier = "# 📱 PHONE NUMBER INTELLIGENCE\n\n";

    try {
      const prompt = `Analyze this phone number and provide comprehensive OSINT intelligence: ${args.phoneNumber}

Provide detailed analysis including (if possible):
1. VALIDATION: International/National format, E.164.
2. CARRIER: Mobile carrier, Network operator, MVNO.
3. LOCATION: Country, Region/State, Area code, Timezone.
4. TYPE: Mobile vs Landline vs VoIP.
5. SOCIAL: WhatsApp/Telegram/Signal presence techniques.
6. OSINT: Google dorks, Social search, Data breach leads.

Provide professional intelligence report with actionable recommendations.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a phone number intelligence expert specializing in OSINT and telecommunications analysis." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
      const responseData = await response.json();
      dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.phoneNumber,
          name: "Phone Lookup",
          dossier,
          tool: "phone",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      dossier = `### ❌ PHONE LOOKUP ERROR\n\n**Error:** ${error.message}`;
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.phoneNumber,
          name: "Phone Lookup",
          dossier,
          tool: "phone",
          status: "failed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    }
  },
});

// 8. ID COLLECTOR: Analytics & Infrastructure Reversing
export const idCollector = action({
  args: {
    url: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are 'ID Collector', an elite technical OSINT specialist. Your expertise is in 'Infrastructure Reversing'—linking seemingly unrelated websites through shared tracking IDs, analytics codes, and server fingerprints.

CRITICAL ANALYTICAL FRAMEWORK:
1. TRACKING ID ANALYSIS:
   - Identify unique strings (UA-XXXX, G-XXXX, pub-XXXX).
   - Explain the significance of each ID (e.g., UA- IDs often belong to a single account).
   - Suggest reverse-search techniques for these IDs.

2. INFRASTRUCTURE FINGERPRINTING:
   - Analyze server headers (Server, X-Powered-By).
   - Identify CMS indicators or specific tech stacks.

3. PIVOT STRATEGIES:
   - Provide concrete next steps for the investigator.
   - Suggest which ID is the 'strongest' link for a reverse search.

FORMAT: Use a clinical, high-tech report style with clear sections and risk assessments.`;

    const userPrompt = `TARGET URL: ${args.url}

EXTRACTED DATA:
${args.scrapedData || "No tracking IDs or unique fingerprints detected in the initial scan."}

Provide a detailed infrastructure reversing report based on this data.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.url,
          name: "ID Collector Scan",
          dossier,
          tool: "idcollector",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("ID Collector failed:", error);
      const errorDossier = `### ❌ ID COLLECTOR PIPELINE FAILED\n\n**Error:** ${error.message}`;
      return { dossier: errorDossier };
    }
  },
});



// 8. DOCUMENT ANALYSIS: Metadata & Hidden Data Extraction
export const documentAnalysis = action({
  args: {
    documentUrl: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let dossier = "# 📄 DOCUMENT FORENSICS ANALYSIS\n\n";

    try {
      const prompt = `Analyze this document and provide comprehensive forensic intelligence.

${args.scrapedData ? `DOCUMENT METADATA:\n${args.scrapedData}\n\n` : ''}

Provide detailed analysis including:

1. METADATA EXTRACTION
   - Author information
   - Creation date and time
   - Modification history
   - Software used
   - Document properties

2. HIDDEN DATA DETECTION
   - Comments and annotations
   - Track changes
   - Hidden text
   - Embedded objects
   - Macros and scripts

3. FORENSIC INDICATORS
   - Document authenticity
   - Editing patterns
   - Template identification
   - Version history

4. PRIVACY ASSESSMENT
   - PII exposure
   - Sensitive information
   - Metadata risks
   - Recommendations

5. ANALYSIS TOOLS
   - ExifTool (metadata extraction)
   - PDF Analyzer
   - Office document inspectors
   - Hex editors

Provide professional forensic report with security recommendations.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a document forensics expert specializing in metadata analysis and hidden data detection." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      const responseData = await response.json();
      dossier = responseData.choices?.[0]?.message?.content || "### ❌ ANALYSIS FAILED\nUnable to process document data.";

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "Document Analysis",
          name: "Document Intelligence",
          dossier,
          tool: "document",
          status: "completed",
        });

        await ctx.runMutation(api.evidence.addEvidence, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          searchId,
          type: "document",
          url: args.documentUrl,
          name: "Captured Document",
          tags: ["document", "metadata"],
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      dossier = `### ❌ DOCUMENT ANALYSIS ERROR\n\n**Error:** ${error.message}\n\n**Manual Analysis Tools:**\n- ExifTool: Comprehensive metadata extraction\n- PDF Analyzer: PDF-specific analysis\n- Office Inspector: Built-in Office tool\n- Hex Editor: Low-level analysis\n\n**Analysis Steps:**\n1. Extract all metadata\n2. Check for hidden content\n3. Review modification history\n4. Identify author information\n5. Document findings`;
      
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "Document Analysis",
          name: "Document Intelligence",
          dossier,
          tool: "document",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    }
  },
});

// 9. QR CODE ANALYZER: Decode & Safety Check
export const qrCodeAnalyzer = action({
  args: {
    imageUrl: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let dossier = "# 🔍 QR CODE ANALYSIS\n\n";

    try {
      const prompt = `Analyze this QR code image and provide comprehensive security intelligence.

${args.scrapedData ? `QR CODE DATA:\n${args.scrapedData}\n\n` : ''}

Provide detailed analysis including:

1. QR CODE DECODING
   - Decoded content
   - Data type (URL, text, contact, etc.)
   - Encoding format
   - Error correction level

2. URL SAFETY ANALYSIS (if URL)
   - Domain reputation
   - SSL certificate status
   - Phishing indicators
   - Malware detection
   - Redirect chain analysis

3. SECURITY ASSESSMENT
   - Risk level (HIGH/MEDIUM/LOW)
   - Suspicious patterns
   - Known malicious indicators
   - Safe browsing status

4. EMBEDDED DATA EXTRACTION
   - Contact information
   - WiFi credentials
   - Payment information
   - Location data
   - Custom data fields

5. OSINT TECHNIQUES
   - Domain WHOIS lookup
   - Historical data
   - Related domains
   - Reputation databases

6. RECOMMENDATIONS
   - Safety verdict
   - Precautions to take
   - Alternative verification methods

Provide professional security assessment with clear risk indicators.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a QR code security expert specializing in malicious link detection and data extraction." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 3000,
        }),
      });

      const responseData = await response.json();
      dossier = responseData.choices?.[0]?.message?.content || "### ❌ ANALYSIS FAILED\nUnable to process QR code data.";

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "QR Code Analysis",
          name: "QR Code Scanner",
          dossier,
          tool: "qrcode",
          status: "completed",
        });

        await ctx.runMutation(api.evidence.addEvidence, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          searchId,
          type: "qr",
          url: args.imageUrl,
          name: "QR Discovery",
          tags: ["qr", "scanner"],
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      dossier = `### ❌ QR CODE ANALYSIS ERROR\n\n**Error:** ${error.message}\n\n**Manual Analysis Tools:**\n- ZXing Decoder: Online QR decoder\n- VirusTotal: URL safety check\n- URLScan.io: URL analysis\n- Google Safe Browsing: Malware check\n\n**Safety Steps:**\n1. Decode QR code content\n2. Check URL reputation\n3. Verify SSL certificate\n4. Scan for malware\n5. Document findings`;
      
      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: "QR Code Analysis",
          name: "QR Code Scanner",
          dossier,
          tool: "qrcode",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    }
  },
});

// 10. SHADOW LINK: Identity Correlation Engine
export const shadowLink = action({
  args: {
    username: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are 'Shadow Link', an elite identity correlation engine. Your mission is to link disparate digital personas to a single identity.

ANALYSIS PROTOCOL:
1. HANDLE VALIDATION: Analyze the list of discovered profiles (marked as [FOUND]) to confirm identity presence.
2. BIO CORRELATION: Cross-reference interests, locations, and personal details across recovered bios.
3. LINGUISTIC FINGERPRINTING: Analyze writing style, emoji usage, and language patterns.
4. VISUAL CONSISTENCY: Compare profile picture themes or specific avatar descriptions.
5. ACTIVITY MAPPING: Look for overlapping activity timestamps or platform-specific patterns.
6. NETWORK OVERLAP: Identify common followers or professional associates.

VERDICT SCORING:
- CONFIRMED: 90-100% confidence
- HIGH PROBABILITY: 70-89% confidence
- POSSIBLE: 40-69% confidence
- UNLIKELY: <40% confidence

FORMAT: Use professional markdown with detailed profile status cards, evidence points, and a final identity verdict.`;

    const userPrompt = `TARGET USERNAME: ${args.username}

SCRAPED DATA FROM MULTIPLE PLATFORMS:
${args.scrapedData || "No data collected. Perform analysis based on username patterns only."}

Provide a comprehensive identity correlation report.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.username,
          name: "Shadow Link Correlation",
          dossier,
          tool: "shadow",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("Shadow Link failed:", error);
      return { dossier: "### ❌ CORRELATION FAILED\nThe identity correlation engine is offline." };
    }
  },
});

// 11. NETWORK NEXUS: Infrastructure Mapper
export const networkNexus = action({
  args: {
    target: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are 'Network Nexus', an elite infrastructure forensics expert. Your mission is to map out the digital architecture behind a target.

FORENSIC PROTOCOL:
1. INFRASTRUCTURE RECON: Analyze DNS records, IP ownership, and hosting providers.
2. SECURITY POSTURE: Evaluate SSL/TLS certificates, headers (CSP, HSTS), and server signatures.
3. GEOGRAPHIC ORIGIN: Map server locations and CDN distribution.
4. TECHNOLOGY STACK: Identify CMS, frameworks, and backend systems from headers and signatures.
5. VULNERABILITY INDICATORS: Highlight outdated software versions or misconfigurations.

FORMAT: Use technical markdown with infrastructure diagrams (text-based), property tables, and security risk assessments.`;

    const userPrompt = `TARGET DOMAIN/IP: ${args.target}

INFRASTRUCTURE SIGNATURES:
${args.scrapedData || "No data collected. Provide general reconnaissance strategies for this target type."}

Provide a comprehensive infrastructure topology and security analysis.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.target,
          name: "Network Nexus Map",
          dossier,
          tool: "nexus",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("Network Nexus failed:", error);
      return { dossier: "### ❌ MAPPING FAILED\nThe infrastructure mapper encountered a protocol error." };
    }
  },
});

// 12. OMNI SEARCH: Global Intelligence Synthesis (EVERYTHING TOOL)
export const omniSearch = action({
  args: {
    query: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are 'OmniSearch', the ultimate intelligence synthesis engine. Your mission is to provide a 'Master Intelligence Report' by cross-referencing ALL available OSINT vectors.

ANALYSIS FRAMEWORK:
1. EXECUTIVE SUMMARY: High-level overview of the target's digital footprint and risk profile.
2. IDENTITY MAP: Linked personas, confirmed handles, and professional affiliations.
3. DIGITAL VULNERABILITIES: Credential exposures, data breaches, and security gaps.
4. BEHAVIORAL PATTERNS: Activity timestamps, communication style, and interests.
5. GEOGRAPHIC FOOTPRINT: Location indicators and movement patterns.
6. VERDICT & CONFIDENCE: A final assessment of the target's online presence with a weighted confidence score.

CRITICAL PROTOCOL:
- Link DISPARATE data points (e.g., equate a breach email to a social profile).
- Identify contradictions between platforms.
- Assess total exposure risk.

FORMAT: Use a premium, structured markdown format with clarity and depth.`;

    const userPrompt = `GLOBAL TARGET: ${args.query}

AGGREGATED OSINT DATA (MULTI-VECTOR):
${args.scrapedData || "No combined data collected. Synthesize based on target name heuristics and common patterns."}

Provide a Master Intelligence Report.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
      
      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.query,
          name: "Omni Master Report",
          dossier,
          tool: "omni",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      console.error("OmniSearch failed:", error);
      return { dossier: "### ❌ OMNI SYNTHESIS FAILED\nThe global intelligence engine encountered a critical processing error." };
    }
  },
});

// 13. BREACH WATCH: Deep Web Monitoring
export const breachWatch = action({
  args: {
    query: v.string(),
    clerkId: v.optional(v.string()),
    caseId: v.optional(v.string()),
    scrapedData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are 'Breach Watch', an AI specialized in deep web forensics and data leak analysis.
    
    Your mission is to analyze the provided breach indicators and synthesize a report on potential exposures.
    
    ANALYSIS PROTOCOL:
    1. EXPOSURE VERIFICATION: Confirm if the target appears in known breach databases.
    2. SENSITIVITY ASSESSMENT: Identify what types of data were leaked (passwords, PII, financial).
    3. RISK LEVEL: Assign a risk score (CRITICAL/HIGH/MEDIUM/LOW).
    4. MITIGATION: Provide actionable steps for the target to secure their identity.
    
    FORMAT: Use a structured markdown report with clear risk headers.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `TARGET: ${args.query}\n\nBREACH DATA:\n${args.scrapedData || "No data provided."}` }
          ],
          temperature: 0.1,
        }),
      });

      const responseData = await response.json();
      const dossier = responseData.choices[0].message.content;

      if (args.clerkId) {
        let searchId: any = await ctx.runMutation(internal.searches.saveSearch, {
          clerkId: args.clerkId,
          caseId: args.caseId as any,
          query: args.query,
          name: "Breach Watch Report",
          dossier,
          tool: "breach",
          status: "completed",
        });
        return { dossier, searchId };
      }
      return { dossier };
    } catch (error: any) {
      return { dossier: `### ❌ BREACH WATCH FAILED\n${error.message}` };
    }
  },
});

