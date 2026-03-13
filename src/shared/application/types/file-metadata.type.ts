export type FileMetadata = {
  key: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
};

export type PresignedUploadUrl = {
  uploadUrl: string;
  key: string;
};

export type PresignedDownloadUrl = {
  downloadUrl: string;
  key: string;
  expiresIn: number;
};
