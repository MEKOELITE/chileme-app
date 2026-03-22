import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { MealType, FoodOption, FoodTag } from '../models/food.model';

/**
 * 食物服务
 * 提供随机选择功能
 */
@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private storageService = inject(StorageService);

  /**
   * 根据餐食类型获取随机食物
   */
  getRandomFood(mealType: MealType): FoodOption | null {
    const tags = this.storageService.getTagsByMealType(mealType);
    if (tags.length === 0) {
      return null;
    }

    // 随机选择一个标签
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    if (randomTag.items.length === 0) {
      return null;
    }

    // 从标签中随机选择一个食物
    const randomItem = randomTag.items[Math.floor(Math.random() * randomTag.items.length)];

    return {
      name: randomItem,
      tag: randomTag.name,
      isHealthy: randomTag.isHealthy
    };
  }

  /**
   * 获取所有可用标签
   */
  getAllTags(): FoodTag[] {
    return this.storageService.getUserTags();
  }

  /**
   * 根据健康分类获取食物
   */
  getFoodByHealthPreference(mealType: MealType, isHealthy: boolean): FoodOption | null {
    const tags = this.storageService.getTagsByMealType(mealType).filter(t => t.isHealthy === isHealthy);

    if (tags.length === 0) {
      return this.getRandomFood(mealType);
    }

    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    const randomItem = randomTag.items[Math.floor(Math.random() * randomTag.items.length)];

    return {
      name: randomItem,
      tag: randomTag.name,
      isHealthy: randomTag.isHealthy
    };
  }

  /**
   * 生成随机推荐列表
   */
  generateOptions(mealType: MealType, count: number = 3): FoodOption[] {
    const options: FoodOption[] = [];
    const tags = this.storageService.getTagsByMealType(mealType);

    if (tags.length === 0) {
      return options;
    }

    const usedItems = new Set<string>();

    while (options.length < count && usedItems.size < tags.reduce((sum, t) => sum + t.items.length, 0)) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      const availableItems = randomTag.items.filter(item => !usedItems.has(item));

      if (availableItems.length === 0) {
        continue;
      }

      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      usedItems.add(randomItem);

      options.push({
        name: randomItem,
        tag: randomTag.name,
        isHealthy: randomTag.isHealthy
      });
    }

    return options;
  }

  /**
   * 获取餐食类型的中文名称
   */
  getMealTypeName(mealType: MealType): string {
    const names: Record<MealType, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '夜宵'
    };
    return names[mealType];
  }

  /**
   * 获取当前餐食类型
   */
  getCurrentMealType(): MealType {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) {
      return 'breakfast';
    } else if (hour >= 10 && hour < 14) {
      return 'lunch';
    } else if (hour >= 17 && hour < 21) {
      return 'dinner';
    } else {
      return 'snack';
    }
  }
}
