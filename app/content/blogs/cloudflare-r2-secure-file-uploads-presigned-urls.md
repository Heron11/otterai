---
title: Secure File Uploads to Cloudflare R2 with Presigned URLs
description: Learn two production-ready patterns for R2 uploads—Worker proxy uploads and presigned URLs—with validation, limits, and sample TypeScript code.
author: OtterAI Team
date: 2025-10-23
tags: [Tutorial, Cloudflare, R2, Security]
featured: false
coverImage: https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&h=600&fit=crop&q=80
---

# Secure File Uploads to Cloudflare R2 with Presigned URLs

Direct-to-storage uploads are faster and cheaper, but only when they’re safe. This guide covers two pragmatic patterns for Cloudflare R2:

1) Worker proxy uploads (simple and secure)  
2) Presigned URL uploads (client → R2 directly)

We’ll add validation, size limits, and metadata so you can ship with confidence.

Light nod to OtterAI (otterai.net): our vibe coding app uses the Worker proxy pattern by default because it’s ergonomic and easy to audit. You can switch to presigned URLs when you need client-direct throughput.

## Pattern A: Worker Proxy Uploads

Your Worker receives the file and writes to R2 using the bound `R2_BUCKET`. Keep keys structured and metadata helpful.

```ts
// routes/api.projects.$projectId.files.ts (example)
export async function action({ request, params, context }: ActionFunctionArgs) {
  const { R2_BUCKET } = context.cloudflare.env as Env;
  const projectId = params.projectId!;
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const userId = 'current-user-id';

  if (!file || file.size > 10 * 1024 * 1024) { // 10MB
    return json({ error: 'Invalid file' }, { status: 400 });
  }

  const filePath = `uploads/${crypto.randomUUID()}-${file.name}`;
  const key = `projects/${projectId}/${filePath}`;

  await R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
    customMetadata: { projectId, userId, filePath, uploadedAt: new Date().toISOString() },
  });

  return json({ ok: true, filePath });
}
```

Pros:
- Simple server code and auditing
- Easy to add anti-virus scanning or MIME checks
- One origin for access controls/logging

Cons:
- File data transits your Worker (bandwidth + CPU)

## Pattern B: Presigned URLs (Client → R2)

When files are large or frequent, presigned URLs push the upload directly to R2. The server creates a short-lived signed PUT URL that the browser can use once.

R2 supports S3-compatible signatures (SigV4). You can generate signatures in your Worker using a small helper (e.g., `aws4fetch`) or custom code.

Server: generate a presigned URL

```ts
// Minimal example (conceptual). Use a tested signer in production.
import { AwsClient } from 'aws4fetch';

export async function loader({ context }: LoaderFunctionArgs) {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID } = context.cloudflare.env as any;
  const aws = new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });

  const bucket = 'my-app-bucket';
  const key = `uploads/${crypto.randomUUID()}.bin`;
  const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucket}/${key}`;

  // Signed URL valid for ~5 minutes
  const signed = await aws.sign(url, { method: 'PUT', expires: 300 });
  return json({ uploadUrl: signed.url, key });
}
```

Client: upload directly to R2

```ts
const { uploadUrl, key } = await (await fetch('/api/get-upload-url')).json();
await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
```

Store the `key` and any derived public URL in your database, not on the client.

Security tips:
- Short expiry (≤5 minutes), one-time use
- Enforce size/type limits before signing
- Namespace keys by user/project
- Rotate access keys and monitor usage

## Choosing the Right Pattern

- Use proxy uploads for smaller files, tighter control, and simple auditing (great default).
- Use presigned URLs for large or frequent uploads to reduce origin load and latency.

Either way, keep keys structured (e.g., `projects/{projectId}/...`) and attach helpful metadata.

## Where OtterAI Fits (Light Touch)

OtterAI (otterai.net) uses the Worker proxy approach internally for its project file system—clear keys, useful metadata, and a simple API. If your use case grows, switch to presigned URLs without rewriting your app’s surface area.

## Related Reading

- /blog/stripe-payment-integration-guide
- /blog/website-deployment-guide-2025
- /blog/from-idea-to-deployment

