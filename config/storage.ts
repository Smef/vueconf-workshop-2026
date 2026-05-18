import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3StorageConfig = {
    driver: "s3",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Access Key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Secret Access Key
    endpoint: process.env.AWS_ENDPOINT ?? undefined,
    bucket: process.env.AWS_BUCKET ?? null,
    region: process.env.AWS_DEFAULT_REGION ?? "us-east-1",
};

function storageConfig() {
    const disk = process.env.FILESYSTEM_DISK || "local";

    if (disk == "local") {
        return {
            private: {
                driver: "fs",
                base: "./server/storage/app",
                url: (path: string) => {
                    // if path begins with https:// or http://, return it as is
                    // This is for our seeder data which may have absolute URLs, and we don't want to break those by prefixing them with our APP_URL
                    if (isAbsoluteUrl(path)) {
                        return path;
                    }

                    return (process.env.APP_URL ?? "http://localhost:3000") + "/storage/private" + path;
                },
                temporaryUrl: async (path: string, _expiresAt?: Date) => {
                    // if path begins with https:// or http://, return it as is
                    // This is for our seeder data which may have absolute URLs, and we don't want to break those by prefixing them with our APP_URL
                    if (isAbsoluteUrl(path)) {
                        return path;
                    }
                    return (process.env.APP_URL ?? "http://localhost:3000") + "/storage/private" + path;
                },
            },
            public: {
                driver: "fs",
                base: "./server/storage/public",
                url: (path: string) => (process.env.APP_URL ?? "http://localhost:3000") + "/storage/public" + path,
                temporaryUrl: async (path: string, _expiresAt?: Date) =>
                    (process.env.APP_URL ?? "http://localhost:3000") + "/storage/public" + path,
            },
        };
    }
    if (disk == "s3") {
        return {
            private: {
                ...s3StorageConfig,
                bucket: process.env.AWS_BUCKET_PRIVATE ?? null,
                url: (path: string) =>
                    `https://${process.env.AWS_BUCKET_PRIVATE}.s3.${s3StorageConfig.region}.amazonaws.com${path}`,
                temporaryUrl: async (path: string, expiresAt?: Date) => {
                    if (!expiresAt) {
                        // now plus 1 hour
                        expiresAt = new Date(Date.now() + 1000 * 60 * 60);
                    }
                    return s3PresignedUrl(path, expiresAt, process.env.AWS_BUCKET_PRIVATE ?? "");
                },
            },
            public: {
                ...s3StorageConfig,
                bucket: process.env.AWS_BUCKET_PUBLIC ?? null,
                url: (path: string) =>
                    `https://${process.env.AWS_BUCKET_PUBLIC}.s3.${s3StorageConfig.region}.amazonaws.com${path}`,
                temporaryUrl: async (path: string, expiresAt?: Date) => {
                    if (!expiresAt) {
                        // now plus 1 hour
                        expiresAt = new Date(Date.now() + 1000 * 60 * 60);
                    }
                    return s3PresignedUrl(path, expiresAt, process.env.AWS_BUCKET_PUBLIC ?? "");
                },
            },
        };
    }

    throw new Error(`Unsupported FILESYSTEM_DISK value: ${disk}`);
}

export default storageConfig();

let s3PresignClient: S3Client | null = null;

function getS3PresignClient(): S3Client {
    if (!s3PresignClient) {
        const endpoint = process.env.AWS_ENDPOINT;
        s3PresignClient = new S3Client({
            region: process.env.AWS_DEFAULT_REGION ?? "us-east-1",
            endpoint: endpoint || undefined,
            credentials:
                process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
                    ? {
                          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                      }
                    : undefined,
            ...(endpoint ? { forcePathStyle: true } : {}),
        });
    }
    return s3PresignClient;
}

/** SigV4 presigned URLs support at most 7 days. */
function expiresInSeconds(expiresAt: Date): number {
    const raw = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    return Math.max(1, Math.min(604800, raw));
}

async function s3PresignedUrl(path: string, expiresAt: Date, bucket: string) {
    if (!bucket || bucket === "") {
        throw new Error("S3 bucket is required and cannot be empty");
    }
    const key = path.startsWith("/") ? path.slice(1) : path;
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(getS3PresignClient(), command, { expiresIn: expiresInSeconds(expiresAt) });
}

function isAbsoluteUrl(path: string): boolean {
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return true;
    }
    return false;
}
