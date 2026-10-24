import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

async function extractTextWithPdfJs(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true
    });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageStrings = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      if (pageStrings.length > 0) {
        fullText += `[Page ${i}]\n` + pageStrings.join(' ') + '\n\n';
      }
    }
    return fullText.trim();
  } catch (err) {
    console.warn('pdfjs-dist extraction fallback trigger:', err);
    // Fallback to pdf-parse if pdfjs-dist throws in edge environments
    const pdfParse = (await import('pdf-parse')).default;
    const parsed = await pdfParse(buffer);
    return parsed.text || '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    let extractedText = '';

    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        extractedText = await extractTextWithPdfJs(buffer);
      } catch (pdfErr: any) {
        console.warn('PDF parsing error:', pdfErr.message);
        extractedText = `[PDF Document: ${file.name}]`;
      }
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docErr: any) {
        console.warn('Word doc parsing error:', docErr.message);
        extractedText = `[Word Document: ${file.name}]`;
      }
    } else {
      // Plain text or markdown
      extractedText = buffer.toString('utf-8');
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      textLength: extractedText.length,
      text: extractedText.trim()
    });
  } catch (error: any) {
    console.error('Extraction API error:', error);
    return NextResponse.json(
      { error: error.message || 'File extraction failed.' },
      { status: 500 }
    );
  }
}
