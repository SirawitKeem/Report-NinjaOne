import fs from 'fs/promises';
import path from 'path';

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
      return new Response(JSON.stringify({ error: 'Invalid image type.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert file arrayBuffer to Node.js buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Build storage path
    const targetDir = path.join(process.cwd(), 'public', 'org', org);
    const targetPath = path.join(targetDir, `${type}.png`);

    // Overwrite the logo file on disk
    await fs.writeFile(targetPath, buffer);

    console.log(`[Upload API] Successfully updated ${type}.png for ${org}`);

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
