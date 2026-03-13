import { describe, it, expect } from 'vitest';
import {
  MealType,
  FoodTag,
  FoodOption,
  Recommendation,
  FoodHistory,
  UserSettings
} from './food.model';

describe('Food Model', () => {
  describe('MealType', () => {
    it('should have all expected meal types', () => {
      const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      expect(mealTypes.length).toBe(4);
      expect(mealTypes).toContain('breakfast');
      expect(mealTypes).toContain('lunch');
      expect(mealTypes).toContain('dinner');
      expect(mealTypes).toContain('snack');
    });
  });

  describe('FoodTag', () => {
    it('should create a valid food tag', () => {
      const tag: FoodTag = {
        id: '1',
        name: '早餐清淡',
        category: 'breakfast',
        isHealthy: true,
        items: ['粥', '豆浆', '包子']
      };

      expect(tag.id).toBe('1');
      expect(tag.name).toBe('早餐清淡');
      expect(tag.category).toBe('breakfast');
      expect(tag.isHealthy).toBe(true);
      expect(tag.items).toHaveLength(3);
    });
  });

  describe('FoodOption', () => {
    it('should create a valid food option', () => {
      const option: FoodOption = {
        name: '粥',
        tag: '早餐清淡',
        isHealthy: true
      };

      expect(option.name).toBe('粥');
      expect(option.tag).toBe('早餐清淡');
      expect(option.isHealthy).toBe(true);
    });
  });

  describe('Recommendation', () => {
    it('should create a valid recommendation', () => {
      const rec: Recommendation = {
        food: '沙拉',
        reason: '健康又美味',
        isHealthy: true
      };

      expect(rec.food).toBe('沙拉');
      expect(rec.reason).toBe('健康又美味');
      expect(rec.isHealthy).toBe(true);
    });
  });

  describe('FoodHistory', () => {
    it('should create valid food history', () => {
      const history: FoodHistory = {
        id: '123',
        date: '2024-01-15',
        mealType: 'lunch',
        food: '炒饭',
        timestamp: 1705315200000
      };

      expect(history.id).toBe('123');
      expect(history.date).toBe('2024-01-15');
      expect(history.mealType).toBe('lunch');
      expect(history.food).toBe('炒饭');
      expect(history.timestamp).toBe(1705315200000);
    });
  });

  describe('UserSettings', () => {
    it('should create valid user settings', () => {
      const settings: UserSettings = {
        apiKey: 'test-key',
        mealTypes: ['breakfast', 'lunch'],
        customTags: []
      };

      expect(settings.apiKey).toBe('test-key');
      expect(settings.mealTypes).toHaveLength(2);
      expect(settings.customTags).toHaveLength(0);
    });
  });
});
