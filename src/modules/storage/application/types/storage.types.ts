import type { FileMetadata } from "@/shared/application/types/file-metadata.type";

export type PresignUploadInput = {
  organizationId: string;
  module: string;
  filename: string;
  contentType: string;
  uploadedBy: string;
};

export type PresignUploadOutput = {
  uploadUrl: string;
  key: string;
};

export type PresignDownloadInput = {
  key: string;
  expiresIn?: number;
};

export type PresignDownloadOutput = {
  downloadUrl: string;
  expiresIn: number;
};

export type DeleteFileInput = {
  key: string;
};

export type GenerateKeyInput = {
  organizationId: string;
  module: string;
  filename: string;
};

export type CreateFileMetadataInput = {
  key: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
};

export type CreateFileMetadataOutput = FileMetadata;
