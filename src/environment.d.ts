declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      // S3 Storage Configuration (Server-side)
      S3_BUCKET_NAME: string
      S3_REGION: string
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
      // S3 Storage Configuration (Client-side)
      NEXT_PUBLIC_S3_BUCKET_NAME: string
      NEXT_PUBLIC_S3_REGION: string
      // CloudFront Distribution
      CLOUDFRONT_DOMAIN: string
      // Database Configuration
      POSTGRES_URL: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
