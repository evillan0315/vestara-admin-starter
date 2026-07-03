import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../../.env') });

interface Config {
  nodeEnv: string;
  api: {
    port: number;
    host: string;
    url: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  s3: {
    endpoint: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    region: string;
  };
  logging: {
    level: string;
  };
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    port: parseInt(process.env.API_PORT || '5000', 10),
    host: process.env.API_HOST || 'localhost',
    url: process.env.API_URL || 'http://localhost:5000',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/vestara_admin',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@vestara.com',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    bucket: process.env.S3_BUCKET || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    region: process.env.S3_REGION || 'us-east-1',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
} as const;

export default config;
