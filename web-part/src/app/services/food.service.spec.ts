import { describe, it, expect } from 'vitest';
import { FoodService } from './food.service';
import { StorageService } from './storage.service';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('FoodService', () => {
  let service: FoodService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new FoodService();
  });

  describe('getMealTypeName', () => {
    it('should return correct Chinese name for breakfast', () => {
      expect(service.getMealTypeName('breakfast')).toBe('早餐');
    });

    it('should return correct Chinese name for lunch', () => {
      expect(service.getMealTypeName('lunch')).toBe('午餐');
    });

    it('should return correct Chinese name for dinner', () => {
      expect(service.getMealTypeName('dinner')).toBe('晚餐');
    });

    it('should return correct Chinese name for snack', () => {
      expect(service.getMealTypeName('snack')).toBe('夜宵');
    });
  });

  describe('getCurrentMealType', () => {
    it('should return a valid meal type', () => {
      const type = service.getCurrentMealType();
      const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      expect(validTypes).toContain(type);
    });
  });

  describe('getAllTags', () => {
    it('should return default tags', () => {
      const tags = service.getAllTags();
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('generateOptions', () => {
    it('should generate options for lunch', () => {
      const options = service.generateOptions('lunch', 3);
      expect(options.length).toBeGreaterThan(0);
      expect(options.length).toBeLessThanOrEqual(3);
    });

    it('should return options with required properties', () => {
      const options = service.generateOptions('breakfast', 2);
      options.forEach(opt => {
        expect(opt).toHaveProperty('name');
        expect(opt).toHaveProperty('tag');
        expect(opt).toHaveProperty('isHealthy');
      });
    });
  });
});
