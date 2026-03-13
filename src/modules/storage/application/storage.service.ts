import type {
  PresignUploadInput,
  PresignUploadOutput,
  PresignDownloadInput,
  PresignDownloadOutput,
  DeleteFileInput,
  GenerateKeyInput,
  CreateFileMetadataInput,
  CreateFileMetadataOutput,
} from "./types/storage.types";
import type { S3ClientAdapter } from "./types/s3.types";
import type { FileMetadata } from "@/shared/application/types/file-metadata.type";

const DEFAULT_EXPIRES_IN = 3600;
const DOWNLOAD_DEFAULT_EXPIRES_IN = 86400;

export class StorageService {
  constructor(private readonly s3: S3ClientAdapter) {}

  generateKey(input: GenerateKeyInput): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedFilename = input.filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");

    return `${input.organizationId}/${input.module}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
  }

  async presignUpload(input: PresignUploadInput): Promise<PresignUploadOutput> {
    const key = this.generateKey({
      organizationId: input.organizationId,
      module: input.module,
      filename: input.filename,
    });

    const file = this.s3.file(key, { type: input.contentType });
    const uploadUrl = file.presign({
      expiresIn: DEFAULT_EXPIRES_IN,
      method: "PUT",
      acl: "private",
    });

    return { uploadUrl, key };
  }

  presignDownload(input: PresignDownloadInput): PresignDownloadOutput {
    const expiresIn = input.expiresIn ?? DOWNLOAD_DEFAULT_EXPIRES_IN;
    const file = this.s3.file(input.key);

    const downloadUrl = file.presign({
      expiresIn,
      method: "GET",
    });

    return { downloadUrl, expiresIn };
  }

  async delete(input: DeleteFileInput): Promise<void> {
    const file = this.s3.file(input.key);
    await file.delete();
  }

  createFileMetadata(input: CreateFileMetadataInput): CreateFileMetadataOutput {
    const metadata: FileMetadata = {
      key: input.key,
      filename: input.filename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      uploadedAt: new Date().toISOString(),
      uploadedBy: input.uploadedBy,
    };

    return metadata;
  }

  async uploadJson<T>(
    key: string,
    data: T,
    options?: { contentType?: string }
  ): Promise<void> {
    const file = this.s3.file(key, {
      type: options?.contentType ?? "application/json",
    });
    await file.write(JSON.stringify(data));
  }

  async downloadJson<T>(key: string): Promise<T | undefined> {
    const file = this.s3.file(key);

    const exists = await file.exists();
    if (!exists) {
      return undefined;
    }

    const data = await file.json();
    return data as T;
  }
}
