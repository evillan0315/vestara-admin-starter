import bcrypt from 'bcryptjs';
import type { UserRole } from '@vestara/types';
import { ERROR_CODES } from '@vestara/constants';
import { JwtService } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { userRepository, sessionRepository, refreshTokenRepository, auditLogRepository } from '../repositories/index.js';

export class AuthService {
  /**
   * Register a new user with hashed password.
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) {
    const { email, password, firstName, lastName, role } = data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered', ERROR_CODES.USER_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
    });

    const tokens = await this.generateTokens(user.id);

    await this.logAudit('REGISTER', 'user', user.id, {
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  /**
   * Authenticate user and generate tokens.
   */
  async login(data: { email: string; password: string; ipAddress?: string; userAgent?: string }) {
    const { email, password, ipAddress, userAgent } = data;

    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS);
    }

    await userRepository.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user.id);

    await sessionRepository.create({
      userId: user.id,
      token: tokens.accessToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.logAudit('LOGIN', 'user', user.id, {
      ipAddress,
      userAgent: userAgent ? '***' : undefined,
    });

    return { user, ...tokens };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshToken(refreshToken: string) {
    const refreshTokenRecord = await refreshTokenRepository.findByToken(refreshToken);
    if (!refreshTokenRecord || refreshTokenRecord.revokedAt) {
      throw new UnauthorizedError('Invalid refresh token', ERROR_CODES.REFRESH_TOKEN_INVALID);
    }

    const tokenUser = JwtService.validateRefreshToken(refreshToken);
    if (!tokenUser) {
      throw new UnauthorizedError('Invalid refresh token', ERROR_CODES.REFRESH_TOKEN_INVALID);
    }

    const user = await userRepository.findByIdOrThrow(tokenUser.id);
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive', ERROR_CODES.ACCOUNT_DISABLED);
    }

    const tokens = await this.generateTokens(user.id);

    await refreshTokenRepository.revoke(refreshTokenRecord.id);
    await refreshTokenRepository.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await this.logAudit('REFRESH_TOKEN', 'user', user.id);

    return tokens;
  }

  /**
   * Logout user and invalidate tokens.
   */
  async logout(data: { userId: string; refreshToken?: string }) {
    const { userId, refreshToken } = data;

    if (refreshToken) {
      const refreshTokenRecord = await refreshTokenRepository.findByToken(refreshToken);
      if (refreshTokenRecord && !refreshTokenRecord.revokedAt) {
        await refreshTokenRepository.revoke(refreshTokenRecord.id);
      }
    }

    await refreshTokenRepository.revokeAllForUser(userId);
    await sessionRepository.deleteAllForUser(userId);

    await this.logAudit('LOGOUT', 'user', userId);

    return { success: true };
  }

  /**
   * Generate JWT access and refresh tokens.
   */
  private async generateTokens(userId: string) {
    const accessToken = JwtService.generateAccessToken(userId);
    const refreshToken = JwtService.generateRefreshToken(userId);

    await refreshTokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Log authentication-related audit entries.
   */
  private async logAudit(action: string, entity: string, entityId: string, metadata?: Record<string, unknown>) {
    await auditLogRepository.create({
      action,
      entity,
      entityId,
      userId: entityId,
      metadata,
    });
  }
}
