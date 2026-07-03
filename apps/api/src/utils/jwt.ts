import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/index.js';

export class JwtService {
  /**
   * Generate JWT access token.
   */
  static generateAccessToken(userId: string): string {
    return jwt.sign(
      { id: userId, type: 'access' },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn, algorithm: 'HS256' },
    );
  }

  /**
   * Generate JWT refresh token.
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      config.jwt.refreshSecret as string,
      { expiresIn: config.jwt.refreshExpiresIn, algorithm: 'HS256' },
    );
  }

  /**
   * Validate JWT access token.
   */
  static validateAccessToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret as string) as JwtPayload;
      return { id: decoded.id };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Validate JWT refresh token.
   */
  static validateRefreshToken(token: string): { id: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret as string) as JwtPayload;
      return { id: decoded.id };
    } catch (_error) {
      return null;
    }
  }
}
