/**
 * Config API - Get API configuration and user info
 */

import type { UserInfo } from '../types/config.js';
import { HttpClient } from './http.js';

export interface ConversionConfig {
  type: string;
  title: string;
  options: string[];
}

export interface ApiConfig {
  error: string | null;
  conversions: ConversionConfig[];
}

export class ConfigAPI {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get authenticated user info
   */
  async getUserInfo(): Promise<UserInfo> {
    const response = await this.http.get<UserInfo>('/auth');

    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  }

  /**
   * Get API configuration (available conversion types)
   */
  async getConfig(): Promise<ApiConfig> {
    const response = await this.http.get<ApiConfig>('/config');

    if (response.error) {
      throw new Error(response.error);
    }

    return response;
  }
}
