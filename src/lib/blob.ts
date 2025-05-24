import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is not set in environment variables');
}

export async function uploadBlob(file: Blob) {
  try {
    const fileName = `${randomUUID()}.webm`;
    const { url } = await put(fileName, file, {
      access: "public", // anyone with the URL can stream
      contentType: "audio/webm",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return url; // e.g. https://blob.vercel-storage.com/<id>/<uuid>.webm
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload audio file. Please try again.');
  }
}
