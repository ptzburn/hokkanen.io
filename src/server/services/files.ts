import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import env from "~/env.ts";

const client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function uploadUserAvatar(
  file: File,
  userId: string,
): Promise<string> {
  await removeUserAvatar(userId);

  const uniqueId = crypto.randomUUID();
  const fileKey = `users/${userId}/avatar/${uniqueId}.webp`;

  const buffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    Body: new Uint8Array(buffer),
    ContentType: file.type,
  });

  const result = await client.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new Error("Failed to upload avatar");
  }

  return fileKey;
}

export async function removeUserAvatar(
  userId: string,
): Promise<void> {
  const prefix = `users/${userId}/avatar/`;

  const listCommand = new ListObjectsCommand({
    Bucket: env.S3_BUCKET,
    Prefix: prefix,
  });

  const { Contents } = await client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    return;
  }

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: object.Key,
      });

      return client.send(deleteCommand);
    }),
  );
}
