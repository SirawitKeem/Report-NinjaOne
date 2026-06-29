import fs from 'fs/promises';
import path from 'path';

// Max upload size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Magic bytes signatures for each image type
const MAGIC_SIGNATURES = [
  { type: 'PNG',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { type: 'JPEG', bytes: [0xFF, 0xD8, 0xFF] },
  { type: 'WEBP', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header (WEBP)
];

function detectImageType(buffer) {
  for (const sig of MAGIC_SIGNATURES) {
    const match = sig.bytes.every((byte, i) => buffer[i] === byte);
    if (match) return sig.type;
  }
  return null;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const org = formData.get('org');
    const type = formData.get('type');

    if (!file || !org || !type) {
      return new Response(JSON.stringify({ error: 'Missing file, org, or type parameter.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (org !== 'officemate' && org !== 'tracthai') {
      return new Response(JSON.stringify({ error: 'Invalid organization.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (type !== 'header_logo' && type !== 'cover_logo') {
      return new Response(JSON.stringify({ error: 'Invalid image type. Must be header_logo or cover_logo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate MIME type declared by browser
    const declaredMime = file.type || '';
    if (!ALLOWED_MIME.includes(declaredMime)) {
      return new Response(JSON.stringify({ error: `Invalid file type "${declaredMime}". Only PNG, JPEG, or WebP images are allowed.` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert file arrayBuffer to Node.js buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: `File too large. Maximum allowed size is 5 MB (uploaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB).` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate actual image magic bytes (prevent disguised files)
    const detectedType = detectImageType(buffer);
    if (!detectedType) {
      return new Response(JSON.stringify({ error: 'Invalid image file content. The file does not appear to be a valid PNG, JPEG, or WebP image.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build storage path
    const targetDir = path.join(process.cwd(), 'public', 'org', org);
    const targetPath = path.join(targetDir, `${type}.png`);

    // Overwrite the logo file on disk
    await fs.writeFile(targetPath, buffer);

    console.log(`[Upload API] Successfully updated ${type}.png for ${org} (${detectedType}, ${(buffer.length / 1024).toFixed(1)} KB)`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Upload Logo Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to upload logo file.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
