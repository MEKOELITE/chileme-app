import { Injectable, signal } from '@angular/core';
import { FoodHistory, UserSettings, MealType, FoodTag } from '../models/food.model';

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
    MEAL_TYPES: 'chileme_meal_types'
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

  constructor() {}

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
    // 只保留最近100条记录
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
