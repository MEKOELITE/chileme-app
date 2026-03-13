/**
 * 餐食类型
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * 食物标签
 */
export interface FoodTag {
  id: string;
  name: string;
  category: MealType;
  isHealthy: boolean; // true: 清淡, false: 高热量
  items: string[]; // 食物列表
}

/**
 * 食物选项
 */
export interface FoodOption {
  name: string;
  tag: string;
  isHealthy: boolean;
}

/**
 * 推荐的回复
 */
export interface Recommendation {
  food: string;
  reason: string;
  isHealthy: boolean;
}

/**
 * 用户的饮食历史记录
 */
export interface FoodHistory {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  food: string;
  timestamp: number;
}

/**
 * 用户设置
 */
export interface UserSettings {
  apiKey: string;
  mealTypes: MealType[];
  customTags: FoodTag[];
}

/**
 * AI 请求配置
 */
export interface AIRequest {
  mealType: MealType;
  preferences: string[];
  isHealthy: boolean;
}
