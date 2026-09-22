import { SignedUrlConfig } from '../types';

export function generateS3PresignedUrl(
  bucket: string,
  fileKey: string,
  expiresInSeconds: number = 900 // 15 mins default
): SignedUrlConfig {
  const region = 'us-east-1';
  const now = Date.now();
  const expiresAt = now + expiresInSeconds * 1000;

  // Format ISO timestamp (e.g. 20260921T202300Z)
  const d = new Date(now);
  const amzDate = d.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  // Generate pseudo-deterministic signature
  const signatureEntropy = `${bucket}/${fileKey}/${now}/${expiresInSeconds}`;
  let hash = 0;
  for (let i = 0; i < signatureEntropy.length; i++) {
    hash = (hash << 5) - hash + signatureEntropy.charCodeAt(i);
    hash |= 0;
  }
  const hexSignature = Math.abs(hash).toString(16).padStart(64, 'a8b7c3d2e1f40956');

  const signedUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAI44QH8DHEXAMPLE%2F${dateStamp}%2F${region}%2Fs3%2Faws4_request&X-Amz-Date=${amzDate}&X-Amz-Expires=${expiresInSeconds}&X-Amz-SignedHeaders=host&X-Amz-Signature=${hexSignature}`;

  return {
    bucket,
    key: fileKey,
    region,
    expiresInSeconds,
    expiresAt,
    signedUrl,
    signature: hexSignature.substring(0, 16),
  };
}

export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return '00:00 (Expired)';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
