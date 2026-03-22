import { Injectable, signal } from '@angular/core';
import { FoodHistory, MealType, FoodTag } from '../models/food.model';

/**
 * 本地存储服务
 * 使用 localStorage 保存用户数据和设置
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEYS = {
    API_KEY: 'chileme_api_key',
    FOOD_HISTORY: 'chileme_food_history',
    USER_TAGS: 'chileme_user_tags',
  };

  // 旧版存储 key（用于数据迁移）
  private readonly LEGACY_KEYS = {
    API_KEY: 'clm_api_key',
    FOOD_HISTORY: 'clm_history',
    USER_TAGS: 'clm_tags',
    FOODS: 'clm_foods',
  };

  // 默认食物标签
  private readonly defaultTags: FoodTag[] = [
    { id: '1', name: '早餐清淡', category: 'breakfast', isHealthy: true, items: ['粥', '豆浆', '包子', '油条', '鸡蛋', '牛奶', '面包'] },
    { id: '2', name: '早餐丰盛', category: 'breakfast', isHealthy: false, items: ['煎饼', '油条', '手抓饼', '炒饭', '炒面'] },
    { id: '3', name: '午餐清淡', category: 'lunch', isHealthy: true, items: ['沙拉', '轻食', '水果', '酸奶', '全麦面包'] },
    { id: '4', name: '午餐快餐', category: 'lunch', isHealthy: false, items: ['汉堡', '披萨', '炸鸡', '炒饭', '盖浇饭'] },
    { id: '5', name: '中餐正餐', category: 'lunch', isHealthy: true, items: ['炒菜', '蒸鱼', '炖肉', '青菜', '豆腐'] },
    { id: '6', name: '晚餐清淡', category: 'dinner', isHealthy: true, items: ['粥', '水果', '酸奶', '沙拉', '蒸菜'] },
    { id: '7', name: '晚餐丰盛', category: 'dinner', isHealthy: false, items: ['火锅', '烧烤', '小龙虾', '炒菜', '炖肉'] },
    { id: '8', name: '夜宵', category: 'snack', isHealthy: false, items: ['烧烤', '小龙虾', '炸鸡', '泡面', '炒饭'] },
    { id: '9', name: '夜宵健康', category: 'snack', isHealthy: true, items: ['水果', '坚果', '酸奶', '牛奶'] }
  ];

  // 信号量
  readonly apiKey = signal<string>(this.getApiKey());
  readonly foodHistory = signal<FoodHistory[]>(this.getFoodHistory());
  readonly userTags = signal<FoodTag[]>(this.getUserTags());

  constructor() {
    this.migrateLegacyData();
  }

  /**
   * 迁移旧版数据到新版存储 key
   */
  private migrateLegacyData(): void {
    const hasNewKeys = localStorage.getItem(this.STORAGE_KEYS.API_KEY) !== null;
    if (hasNewKeys) return;

    const legacyApiKey = localStorage.getItem(this.LEGACY_KEYS.API_KEY);
    if (legacyApiKey) {
      localStorage.setItem(this.STORAGE_KEYS.API_KEY, legacyApiKey);
      this.apiKey.set(legacyApiKey);
    }

    const legacyHistory = localStorage.getItem(this.LEGACY_KEYS.FOOD_HISTORY);
    if (legacyHistory) {
      try {
        const parsed = JSON.parse(legacyHistory);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((r: any) => ({
            id: r.id || Date.now().toString(),
            date: typeof r.date === 'number' ? new Date(r.date).toISOString().split('T')[0] : r.date,
            mealType: this.normalizeMealType(r.mealType),
            food: r.selections ? Object.values(r.selections).join(' ') : r.food || '',
            timestamp: r.date || Date.now()
          }));
          localStorage.setItem(this.STORAGE_KEYS.FOOD_HISTORY, JSON.stringify(migrated));
        }
      } catch { /* ignore */ }
    }

    const legacyTags = localStorage.getItem(this.LEGACY_KEYS.USER_TAGS);
    if (legacyTags) {
      try {
        const parsed = JSON.parse(legacyTags);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((t: any) => ({
            ...t,
            category: this.normalizeMealType(t.category),
          }));
          localStorage.setItem(this.STORAGE_KEYS.USER_TAGS, JSON.stringify(migrated));
        }
      } catch { /* ignore */ }
    }
  }

  /**
   * 将中文餐食类型或旧格式转换为标准英文类型
   */
  private normalizeMealType(type: string): MealType {
    const map: Record<string, MealType> = {
      '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '宵夜': 'snack',
      'breakfast': 'breakfast', 'lunch': 'lunch', 'dinner': 'dinner', 'snack': 'snack',
    };
    return map[type] || 'lunch';
  }

  // ============ API Key ============

  getApiKey(): string {
    return localStorage.getItem(this.STORAGE_KEYS.API_KEY) || '';
  }

  setApiKey(key: string): void {
    localStorage.setItem(this.STORAGE_KEYS.API_KEY, key);
    this.apiKey.set(key);
  }

  hasApiKey(): boolean {
    return this.getApiKey().trim().length > 0;
  }

  // ============ 食物标签 ============

  getUserTags(): FoodTag[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.USER_TAGS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.defaultTags;
      }
    }
    return this.defaultTags;
  }

  setUserTags(tags: FoodTag[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USER_TAGS, JSON.stringify(tags));
    this.userTags.set(tags);
  }

  getTagsByMealType(mealType: MealType): FoodTag[] {
    return this.getUserTags().filter(tag => tag.category === mealType);
  }

  addCustomTag(tag: FoodTag): void {
    const tags = this.getUserTags();
    tags.push(tag);
    this.setUserTags(tags);
  }

  removeTag(tagId: string): void {
    const tags = this.getUserTags().filter(t => t.id !== tagId);
    this.setUserTags(tags);
  }

  // ============ 历史记录 ============

  getFoodHistory(): FoodHistory[] {
    const stored = localStorage.getItem(this.STORAGE_KEYS.FOOD_HISTORY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  }

  addFoodHistory(history: FoodHistory): void {
    const historyList = this.getFoodHistory();
    historyList.push(history);
    const trimmed = historyList.slice(-100);
    localStorage.setItem(this.STORAGE_KEYS.FOOD_HISTORY, JSON.stringify(trimmed));
    this.foodHistory.set(trimmed);
  }

  getTodayHistory(): FoodHistory[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getFoodHistory().filter(h => h.date === today);
  }

  getHistoryByDate(date: string): FoodHistory[] {
    return this.getFoodHistory().filter(h => h.date === date);
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEYS.FOOD_HISTORY);
    this.foodHistory.set([]);
  }

  // ============ 通用方法 ============

  clearAll(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.apiKey.set('');
    this.foodHistory.set([]);
    this.userTags.set(this.defaultTags);
  }
}
