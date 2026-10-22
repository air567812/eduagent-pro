import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const currentKey = process.env.OPENAI_API_KEY || '';
  const isConfigured = currentKey.startsWith('sk-') && !currentKey.includes('placeholder');
  const maskedKey = isConfigured
    ? `${currentKey.slice(0, 7)}...${currentKey.slice(-4)}`
    : '';

  return NextResponse.json({
    configured: isConfigured,
    maskedKey
  });
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'Valid OpenAI API Key is required.' }, { status: 400 });
    }

    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid key format. OpenAI API keys typically begin with "sk-".' },
        { status: 400 }
      );
    }

    // Test live connection to OpenAI with this key
    let verified = false;
    try {
      const client = new OpenAI({ apiKey: trimmedKey });
      const models = await client.models.list();
      verified = Boolean(models && models.data?.length > 0);
    } catch (apiErr: any) {
      return NextResponse.json(
        {
          error: `OpenAI connection test failed: ${apiErr.message || 'Authentication error'}. Please check that your key is valid and has active billing.`
        },
        { status: 401 }
      );
    }

    // Persist to .env file
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('OPENAI_API_KEY=')) {
      envContent = envContent.replace(
        /OPENAI_API_KEY=.*(?:\r?\n|$)/,
        `OPENAI_API_KEY="${trimmedKey}"\n`
      );
    } else {
      envContent += `\nOPENAI_API_KEY="${trimmedKey}"\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    process.env.OPENAI_API_KEY = trimmedKey;

    return NextResponse.json({
      success: true,
      message: 'Real OpenAI API key verified and saved successfully!',
      maskedKey: `${trimmedKey.slice(0, 7)}...${trimmedKey.slice(-4)}`
    });
  } catch (error: any) {
    console.error('Save API key error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save API key' }, { status: 500 });
  }
}
