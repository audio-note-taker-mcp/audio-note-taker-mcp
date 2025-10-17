#!/usr/bin/env ts-node

/**
 * Find S3 Bucket Region by trying uploads
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const COMMON_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
];

async function testRegion(region: string, bucketName: string, accessKeyId: string, secretAccessKey: string) {
  const s3Client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  const testKey = `test/region-check-${Date.now()}.txt`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: "Region test",
        ContentType: "text/plain",
      })
    );
    return true;
  } catch (error: any) {
    if (error.name === "PermanentRedirect") {
      return false; // Wrong region
    }
    throw error; // Other error
  }
}

async function findBucketRegion() {
  console.log("\n🔍 Finding S3 Bucket Region by testing uploads...\n");

  const bucketName = process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucketName || !accessKeyId || !secretAccessKey) {
    console.error("❌ Missing AWS configuration in .env.local");
    return;
  }

  console.log(`Bucket: ${bucketName}`);
  console.log(`Testing regions: ${COMMON_REGIONS.join(", ")}\n`);

  for (const region of COMMON_REGIONS) {
    process.stdout.write(`Testing ${region}... `);

    try {
      const success = await testRegion(region, bucketName, accessKeyId, secretAccessKey);

      if (success) {
        console.log("✅ SUCCESS!\n");
        console.log(`🎉 Found it! Your bucket is in: ${region}\n`);
        console.log("Update your .env.local:");
        console.log(`AWS_REGION=${region}\n`);
        return;
      } else {
        console.log("❌ (wrong region)");
      }
    } catch (error: any) {
      console.log(`❌ (${error.name})`);
    }
  }

  console.log("\n❌ Could not find the correct region in common regions.");
  console.log("The bucket might be in an uncommon region or there's a permission issue.");
}

findBucketRegion().catch(console.error);
