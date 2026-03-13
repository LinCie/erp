type S3Acl =
  | "private"
  | "public-read"
  | "public-read-write"
  | "aws-exec-read"
  | "authenticated-read"
  | "bucket-owner-read"
  | "bucket-owner-full-control"
  | "log-delivery-write";

export interface S3FileAdapter {
  presign(options: { expiresIn: number; method: "PUT" | "GET"; acl?: S3Acl }): string;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
  write(data: string): Promise<number>;
  json(): Promise<unknown>;
}

export interface S3ClientAdapter {
  file(key: string, options?: { type?: string }): S3FileAdapter;
}

export interface S3Config {
  getBucket(): string;
}
