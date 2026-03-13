import { Elysia } from "elysia";
import { z } from "zod";
import { StorageService } from "../application/storage.service";
import { BunS3Adapter } from "../infrastructure/bun-s3.adapter";
import { authPlugin } from "@/server/middlewares/auth-middleware";
import {
  ALLOWED_STORAGE_MODULES,
} from "@/shared/application/constants/storage-modules";

const s3Adapter = new BunS3Adapter();
const storageService = new StorageService(s3Adapter);

const FileMetadataSchema = z.object({
  key: z.string(),
  filename: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
  uploadedAt: z.string(),
  uploadedBy: z.string(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
];

export const storageRoutes = new Elysia({ prefix: "/storage" })
  .use(authPlugin)
  .post(
    "/presign",
    async ({ body, organization, user }) => {
      const result = await storageService.presignUpload({
        organizationId: organization.id,
        module: body.module,
        filename: body.filename,
        contentType: body.contentType,
        uploadedBy: user.id,
      });

      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: z.object({
        module: z.enum(ALLOWED_STORAGE_MODULES),
        filename: z.string().min(1).max(255),
        contentType: z.enum(ALLOWED_CONTENT_TYPES as [string, ...string[]]),
      }),
      response: {
        200: z.object({
          uploadUrl: z.string(),
          key: z.string(),
        }),
      },
      detail: {
        tags: ["Storage"],
        summary: "Get presigned URL for file upload",
        description:
          "Returns a presigned URL for direct upload to S3. Upload flow: 1) Get presigned URL, 2) Upload file directly to S3, 3) Store returned key in your entity's JSONB column.",
      },
    }
  )
  .post(
    "/presign-download",
    async ({ body, organization, status }) => {
      if (!body.key.startsWith(organization.id + "/")) {
        return status(403, { error: "Access denied" });
      }

      const result = storageService.presignDownload({
        key: body.key,
        expiresIn: body.expiresIn,
      });

      return result;
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: z.object({
        key: z.string(),
        expiresIn: z.number().min(60).max(604800).optional(),
      }),
      response: {
        200: z.object({
          downloadUrl: z.string(),
          expiresIn: z.number(),
        }),
        403: ErrorSchema,
      },
      detail: {
        tags: ["Storage"],
        summary: "Get presigned URL for file download",
        description:
          "Returns a presigned URL for downloading a file. User must have access to the organization that owns the file.",
      },
    }
  )
  .post(
    "/metadata",
    async ({ body, organization, user, status }) => {
      if (!body.key.startsWith(organization.id + "/")) {
        return status(403, { error: "Access denied" });
      }

      const metadata = storageService.createFileMetadata({
        key: body.key,
        filename: body.filename,
        contentType: body.contentType,
        sizeBytes: body.sizeBytes,
        uploadedBy: user.id,
      });

      return metadata;
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: z.object({
        key: z.string(),
        filename: z.string().min(1).max(255),
        contentType: z.string(),
        sizeBytes: z.number().min(1),
      }),
      response: {
        200: FileMetadataSchema,
        403: ErrorSchema,
      },
      detail: {
        tags: ["Storage"],
        summary: "Create file metadata",
        description:
          "Creates a FileMetadata object for storing in your entity's JSONB column. Call this after successful upload to S3.",
      },
    }
  )
  .delete(
    "/",
    async ({ body, organization, status }) => {
      if (!body.key.startsWith(organization.id + "/")) {
        return status(403, { error: "Access denied" });
      }

      await storageService.delete({ key: body.key });
    },
    {
      requireAuth: true,
      requireOrg: true,
      body: z.object({
        key: z.string(),
      }),
      response: {
        200: z.void(),
        403: ErrorSchema,
      },
      detail: {
        tags: ["Storage"],
        summary: "Delete a file",
        description:
          "Deletes a file from S3. User must have access to the organization that owns the file.",
      },
    }
  );
