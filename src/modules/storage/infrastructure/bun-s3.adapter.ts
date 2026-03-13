import type { S3ClientAdapter, S3Config } from "../application/types/s3.types";
import { S3Client } from "bun";

function getS3Config() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    throw new Error(
      "Missing S3 configuration. Required: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_ENDPOINT"
    );
  }

  return { accessKeyId, secretAccessKey, bucket, endpoint };
}

function createS3Client(): S3Client {
  const config = getS3Config();
  return new S3Client(config);
}

export class BunS3Adapter implements S3ClientAdapter, S3Config {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(client?: S3Client) {
    this.s3Client = client ?? createS3Client();
    this.bucketName = getS3Config().bucket;
  }

  file(key: string, options?: { type?: string }) {
    return this.s3Client.file(key, options);
  }

  getBucket(): string {
    return this.bucketName;
  }
}
