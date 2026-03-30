import "server-only";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ONE_HOUR = 60 * 60;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const R2_ACCOUNT_ID = getRequiredEnv("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = getRequiredEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = getRequiredEnv("R2_SECRET_ACCESS_KEY");
const R2_BUCKET_NAME = getRequiredEnv("R2_BUCKET_NAME");

export const r2BucketName = R2_BUCKET_NAME;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function createSignedObjectUrl(key: string, expiresIn = ONE_HOUR) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function listTiObjects() {
  return r2Client.send(
    new ListObjectsV2Command({
      Bucket: r2BucketName,
      Prefix: "ti/",
    })
  );
}

export async function uploadObjectToTi(params: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  return r2Client.send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );
}
