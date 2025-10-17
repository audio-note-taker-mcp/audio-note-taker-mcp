#!/usr/bin/env ts-node

/**
 * S3 Connection Test Script
 *
 * Run this to verify your S3 configuration:
 * npx ts-node scripts/test-s3.ts
 */

import { S3Client, PutObjectCommand, ListBucketsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testS3Connection() {
  console.log("\n🔍 Testing S3 Configuration...\n");

  // Check environment variables
  console.log("1. Environment Variables Check:");
  const config = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  };

  console.log({
    hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
    accessKeyPrefix: config.AWS_ACCESS_KEY_ID?.substring(0, 8) + "...",
    hasSecretKey: !!config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION,
    bucketName: config.AWS_S3_BUCKET,
  });

  if (!config.AWS_ACCESS_KEY_ID || !config.AWS_SECRET_ACCESS_KEY) {
    console.error("\n❌ AWS credentials not found in .env.local");
    console.log("\nPlease add the following to your .env.local file:");
    console.log("AWS_ACCESS_KEY_ID=your_access_key");
    console.log("AWS_SECRET_ACCESS_KEY=your_secret_key");
    console.log("AWS_REGION=us-east-1");
    console.log("AWS_S3_BUCKET=your_bucket_name");
    return;
  }

  if (!config.AWS_S3_BUCKET) {
    console.error("\n❌ AWS_S3_BUCKET not configured in .env.local");
    return;
  }

  // Initialize S3 client
  console.log("\n2. Initializing S3 Client...");
  const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    // Test 1: List buckets
    console.log("\n3. Testing AWS Connection (List Buckets)...");
    const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    console.log(`✅ Connection successful! Found ${listBucketsResponse.Buckets?.length || 0} buckets`);

    if (listBucketsResponse.Buckets) {
      console.log("\nAvailable buckets:");
      listBucketsResponse.Buckets.forEach((bucket) => {
        console.log(`  - ${bucket.Name}`);
      });
    }

    // Test 2: Check if the configured bucket exists
    console.log(`\n4. Testing Bucket Access: ${config.AWS_S3_BUCKET}...`);
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: config.AWS_S3_BUCKET }));
      console.log(`✅ Bucket "${config.AWS_S3_BUCKET}" exists and is accessible`);
    } catch (bucketError: any) {
      if (bucketError.name === "NotFound") {
        console.error(`❌ Bucket "${config.AWS_S3_BUCKET}" does not exist`);
        console.log("\nYou need to either:");
        console.log("1. Create this bucket in AWS S3, OR");
        console.log("2. Update AWS_S3_BUCKET in .env.local to an existing bucket name");
        return;
      } else if (bucketError.name === "Forbidden") {
        console.error(`❌ Access denied to bucket "${config.AWS_S3_BUCKET}"`);
        console.log("\nYour AWS credentials don't have permission to access this bucket.");
        return;
      }
      throw bucketError;
    }

    // Test 3: Try to upload a test file
    console.log("\n5. Testing File Upload...");
    const testKey = `test/connection-test-${Date.now()}.json`;
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "S3 connection test successful",
    };

    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.AWS_S3_BUCKET,
        Key: testKey,
        Body: JSON.stringify(testData, null, 2),
        ContentType: "application/json",
      })
    );

    console.log(`✅ Successfully uploaded test file: s3://${config.AWS_S3_BUCKET}/${testKey}`);
    console.log("\n🎉 All tests passed! Your S3 configuration is working correctly.");
    console.log("\nYour notes will now be saved to S3 instead of local storage.");

  } catch (error: any) {
    console.error("\n❌ S3 Test Failed:");
    console.error("Error:", error.message);
    console.error("\nDetails:", {
      name: error.name,
      code: error.code,
      message: error.message,
    });

    if (error.code === "InvalidAccessKeyId") {
      console.log("\n💡 Your AWS_ACCESS_KEY_ID appears to be invalid.");
    } else if (error.code === "SignatureDoesNotMatch") {
      console.log("\n💡 Your AWS_SECRET_ACCESS_KEY appears to be invalid.");
    }
  }
}

// Run the test
testS3Connection().catch(console.error);
