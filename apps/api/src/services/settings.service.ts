import type { AuditAction, UserRole } from '@vestara/types';
import { settingsRepository, auditLogRepository } from '../repositories/index.js';

export class SettingsService {
  /**
   * Get a setting by key.
   */
  async findByKey(key: string) {
    return settingsRepository.findByKeyOrThrow(key);
  }

  /**
   * Get all settings as key-value pairs.
   */
  async getAllAsMap(): Promise<Record<string, unknown>> {
    return settingsRepository.getAllAsMap();
  }

  /**
   * Create or update a setting.
   */
  async upsert(
    key: string,
    value: Record<string, unknown>,
    updatedBy?: string,
    action: AuditAction = 'settings_update',
  ) {
    const setting = await settingsRepository.upsert(key, value, updatedBy);

    await this.logAudit(action, 'setting', key, {
      value,
      updatedBy,
    });

    return setting;
  }

  /**
   * Delete a setting.
   */
  async delete(key: string, updatedBy?: string) {
    const setting = await this.findByKey(key);

    await settingsRepository.delete(key);

    await this.logAudit('settings_delete', 'setting', key, {
      previousValue: setting.value,
      updatedBy,
    });

    return { success: true };
  }

  /**
   * Log settings-related audit entries.
   */
  private async logAudit(action: AuditAction, entity: string, entityId: string, metadata?: Record<string, unknown>) {
    const userId = metadata?.updatedBy || 'system';

    await auditLogRepository.create({
      action,
      entity,
      entityId,
      userId,
      metadata,
      ipAddress: undefined,
      userAgent: undefined,
    });
  }
}