import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdf(buffer);
  return result.text.trim();
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPdf(buffer);
  }

  return extractTextFromDocx(buffer);
}
