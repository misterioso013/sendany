import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Readable } from "stream";

export async function uploadFileToDrive(auth: OAuth2Client, options: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
  folderId?: string;
}) {
  const drive = google.drive({ version: "v3", auth });

  const stream = Readable.from(options.buffer);

  const res = await drive.files.create({
    requestBody: {
      name: options.filename,
      mimeType: options.mimeType,
      parents: options.folderId ? [options.folderId] : undefined,
    },
    media: {
      mimeType: options.mimeType,
      body: stream,
    }, 
    fields: "id, name, webViewLink, webContentLink",
  });

  return res.data;
}

export async function listFilesInDrive(auth: OAuth2Client, folderId?: string) {
  const drive = google.drive({ version: "v3", auth });

  const query = folderId ? `'${folderId}' in parents` : "trashed = false";

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name, mimeType, webViewLink, webContentLink, createdTime, modifiedTime)",
    orderBy: "modifiedTime desc",
  });

  return res.data.files || [];
}

export async function deleteFileFromDrive(auth: OAuth2Client, fileId: string) {
  const drive = google.drive({ version: "v3", auth });

  await drive.files.delete({ fileId });

  return { success: true };
}