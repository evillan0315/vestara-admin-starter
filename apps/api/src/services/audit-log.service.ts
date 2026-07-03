import type { AuditAction, EntityType } from '@vestara/types';
import { auditLogRepository } from '../repositories/index.js';

export class AuditLogService {
  /**
   * Get all audit logs with filtering and pagination.
   */
  async findAll(params: {
    page?: number;
    perPage?: number;
    userId?: string;
    action?: AuditAction;
    entity?: EntityType;
    entityId?: string;
    ipAddress?: string;
    startDate?: Date;
    endDate?: Date;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}) {
    const { page = 1, perPage = 20 } = params;

    const where: {
      userId?: string;
      action?: string;
      entity?: string;
      entityId?: string;
      ipAddress?: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.ipAddress) where.ipAddress = params.ipAddress;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (params.sort) {
      orderBy[params.sort] = params.order ?? 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * perPage;

    const [logs, total] = await Promise.all([
      auditLogRepository.findAll({
        where,
        orderBy,
        skip,
        take: perPage,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          userId: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      auditLogRepository.count({ where }),
    ]);

    return { data: logs, page, perPage, total };
  }

  /**
   * Get a specific audit log by ID.
   */
  async findById(id: string) {
    const log = await auditLogRepository.findById(id);

    if (!log) {
      throw new Error(`Audit log with ID ${id} not found`);
    }

    return log;
  }

  /**
   * Delete expired audit logs (cleanup).
   */
  async deleteExpired() {
    await auditLogRepository.deleteOlderThan(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  }
}