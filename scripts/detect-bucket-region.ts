#!/usr/bin/env ts-node

/**
 * Detect S3 Bucket Region
 *
 * Run this to find the correct region for your S3 bucket:
 * npx ts-node scripts/detect-bucket-region.ts
 */

import { S3Client, GetBucketLocationCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function detectBucketRegion() {
  console.log("\n🔍 Detecting S3 Bucket Region...\n");

  const bucketName = process.env.AWS_S3_BUCKET;

  if (!bucketName) {
    console.error("❌ AWS_S3_BUCKET not set in .env.local");
    return;
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("❌ AWS credentials not found in .env.local");
    return;
  }

  console.log(`Bucket: ${bucketName}`);
  console.log(`Current configured region: ${process.env.AWS_REGION || 'us-east-1'}\n`);

  // Try to get bucket location using us-east-1 as the initial region
  // (GetBucketLocation works from any region)
  const s3Client = new S3Client({
    region: "us-east-1", // Initial region to make the GetBucketLocation call
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const response = await s3Client.send(
      new GetBucketLocationCommand({ Bucket: bucketName })
    );

    // AWS returns null for us-east-1, otherwise returns the region
    const actualRegion = response.LocationConstraint || "us-east-1";

    console.log(`✅ Bucket found!`);
    console.log(`📍 Actual Region: ${actualRegion}\n`);

    if (actualRegion !== process.env.AWS_REGION) {
      console.log("⚠️  REGION MISMATCH DETECTED!\n");
      console.log("Your .env.local currently has:");
      console.log(`  AWS_REGION=${process.env.AWS_REGION || '(not set)'}\n`);
      console.log("But your bucket is actually in:");
      console.log(`  AWS_REGION=${actualRegion}\n`);
      console.log("🔧 To fix this, update your .env.local:");
      console.log(`  AWS_REGION=${actualRegion}\n`);
      console.log("Then restart your dev server!");
    } else {
      console.log("✅ Your AWS_REGION is correctly configured!");
    }

  } catch (error: any) {
    console.error("❌ Error detecting bucket region:");
    console.error(`   ${error.message}\n`);

    if (error.name === "NoSuchBucket") {
      console.log("💡 The bucket doesn't exist. You need to either:");
      console.log("   1. Create this bucket in AWS, OR");
      console.log("   2. Update AWS_S3_BUCKET in .env.local to an existing bucket");
    } else if (error.name === "AccessDenied" || error.name === "Forbidden") {
      console.log("💡 Your credentials don't have permission to access this bucket.");
    }
  }
}

detectBucketRegion().catch(console.error);
