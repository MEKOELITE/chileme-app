import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FoodService } from '../../services/food.service';
import { MinimaxService } from '../../services/minimax.service';
import { StorageService } from '../../services/storage.service';
import { MealType, FoodOption } from '../../models/food.model';

/**
 * 推荐结果数据结构
 */
export interface RecommendationResult {
  name: string;
  emoji: string;
  tags: string[];
  description: string;
  isAi: boolean;
}

/**
 * 餐食类型配置
 */
interface MealTypeConfig {
  value: MealType;
  label: string;
  icon: string;
}

/**
 * 标签配置
 */
const TAG_CONFIG: Record<string, { label: string; priority: number }> = {
  healthy: { label: '健康', priority: 1 },
  calories: { label: '高热量', priority: 2 },
  quick: { label: '快速', priority: 3 },
};

/**
 * 食物 Emoji 映射
 */
const FOOD_EMOJI_MAP: Record<string, string> = {
  '火锅': '🍲',
  '烧烤': '🍖',
  '小龙虾': '🦞',
  '日料': '🍣',
  '汉堡': '🍔',
  '披萨': '🍕',
  '沙拉': '🥗',
  '面条': '🍜',
  '饺子': '🥟',
  '粤菜': '🦐',
  '川菜': '🌶️',
  '湘菜': '🥘',
  '西餐': '🥩',
  '咖啡': '☕',
  '奶茶': '🧋',
  '水果': '🍎',
  '酸奶': '🥛',
  '三明治': '🥪',
  '炒饭': '🍚',
  '盖饭': '🍛',
  '烤鱼': '🐟',
  '烤肉': '🥓',
  '甜点': '🍰',
  '冰激凌': '🍦',
  '粥': '🥣',
  '鸡蛋': '🥚',
  '豆浆': '🥤',
  '油条': '🍳',
  '包子': '🥮',
  '米粉': '🍝',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private foodService = inject(FoodService);
  private minimaxService = inject(MinimaxService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // 餐食类型配置
  mealTypes: MealTypeConfig[] = [
    { value: 'breakfast', label: '早餐', icon: '🌅' },
    { value: 'lunch', label: '午餐', icon: '☀️' },
    { value: 'dinner', label: '晚餐', icon: '🌙' },
    { value: 'snack', label: '夜宵', icon: '🍜' },
  ];

  // 当前选择的餐食类型
  selectedMealType = signal<MealType>(this.foodService.getCurrentMealType());

  // 健康偏好
  preferHealthy = signal<boolean>(true);

  // 推荐结果
  currentRecommendation = signal<RecommendationResult | null>(null);

  // 加载状态
  isLoading = this.minimaxService.isLoading;

  // 动画状态
  isCardEntering = signal(false);
  isCardExiting = signal(false);
  isNewRecommendation = signal(false);
  animationState = signal('idle');

  // 推荐计数
  recommendationCount = signal(0);

  // 确认弹窗
  showConfirmModal = signal(false);
  confirmedFood = signal('');

  // 是否有推荐
  hasRecommendation = computed(() => this.currentRecommendation() !== null);

  // 暗色模式
  isDarkMode = this.storageService.isDarkMode;

  constructor() {
    // 初始化时随机选择一个
    this.randomPick();
  }

  ngOnInit(): void {}

  /**
   * 切换餐食类型
   */
  selectMealType(type: MealType): void {
    this.selectedMealType.set(type);
    this.randomPick();
  }

  /**
   * 切换健康偏好
   */
  toggleHealthy(): void {
    this.preferHealthy.set(!this.preferHealthy());
  }

  /**
   * 获取食物 Emoji
   */
  private getFoodEmoji(foodName: string): string {
    for (const [key, emoji] of Object.entries(FOOD_EMOJI_MAP)) {
      if (foodName.includes(key)) {
        return emoji;
      }
    }
    return '🍽️';
  }

  /**
   * 生成标签列表
   */
  private generateTags(food: FoodOption | null): string[] {
    if (!food) return [];

    const tags: string[] = [];
    if (food.isHealthy) {
      tags.push('healthy');
    } else {
      tags.push('calories');
    }
    // 随机添加"快速"标签
    if (Math.random() > 0.5) {
      tags.push('quick');
    }
    return tags.sort((a, b) => (TAG_CONFIG[a]?.priority || 0) - (TAG_CONFIG[b]?.priority || 0));
  }

  /**
   * 生成描述
   */
  private generateDescription(food: FoodOption | null, mealType: MealType): string {
    if (!food) return '';

    const descriptions: Record<MealType, Record<string, string[]>> = {
      breakfast: {
        healthy: ['营养均衡，开启活力满满的一天', '清淡不腻，给肠胃一个轻松的早晨'],
        calories: ['能量炸弹，早餐就要吃好', '满足感十足，一上午都不会饿'],
      },
      lunch: {
        healthy: ['轻食午餐，下午保持好状态', '新鲜健康，工作更有精神'],
        calories: ['午餐就是要犒劳自己', '份量十足，下午不饿肚子'],
      },
      dinner: {
        healthy: ['轻盈晚餐，好消化易睡眠', '健康搭配，轻松无负担'],
        calories: ['丰盛大餐，犒劳一天的辛苦', '美味诱人，尽情享受'],
      },
      snack: {
        healthy: ['健康小食，深夜也要轻负担', '解馋不胖，夜宵首选'],
        calories: ['夜宵就是要过瘾', '深夜食堂，满足深夜的胃'],
      },
    };

    const tag = food.isHealthy ? 'healthy' : 'calories';
    const options = descriptions[mealType][tag];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 创建推荐结果
   */
  private createRecommendation(food: FoodOption | null, isAi: boolean = false): RecommendationResult | null {
    if (!food) return null;

    return {
      name: food.name,
      emoji: this.getFoodEmoji(food.name),
      tags: this.generateTags(food),
      description: this.generateDescription(food, this.selectedMealType()),
      isAi,
    };
  }

  /**
   * 随机选择（带动画）
   */
  randomPick(): void {
    this.animateCardTransition(() => {
      const food = this.foodService.getRandomFood(this.selectedMealType());
      this.currentRecommendation.set(this.createRecommendation(food, false));
      this.recommendationCount.update(c => c + 1);
    });
  }

  /**
   * 卡片切换动画
   */
  private animateCardTransition(callback: () => void): void {
    this.isCardExiting.set(true);
    this.animationState.set('exiting');

    setTimeout(() => {
      callback();
      this.isCardExiting.set(false);
      this.isCardEntering.set(true);
      this.isNewRecommendation.set(true);
      this.animationState.set('entering');

      setTimeout(() => {
        this.isCardEntering.set(false);
        this.animationState.set('idle');
        this.isNewRecommendation.set(false);
      }, 500);
    }, 300);
  }

  /**
   * AI 智能推荐
   */
  aiRecommend(): void {
    if (!this.storageService.hasApiKey()) {
      alert('请先在设置中配置 MiniMax API Key');
      return;
    }

    this.minimaxService.getRecommendation(
      this.selectedMealType(),
      [],
      this.preferHealthy()
    ).subscribe(result => {
      if (result.food) {
        const foodOption: FoodOption = {
          name: result.food,
          tag: result.reason || '',
          isHealthy: result.isHealthy ?? !this.preferHealthy(),
        };
        this.animateCardTransition(() => {
          this.currentRecommendation.set(this.createRecommendation(foodOption, true));
          this.recommendationCount.update(c => c + 1);
        });
      }
    });
  }

  /**
   * 确认选择
   */
  confirmSelection(): void {
    const recommendation = this.currentRecommendation();
    if (!recommendation) return;

    const history = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mealType: this.selectedMealType(),
      food: recommendation.name,
      timestamp: Date.now()
    };

    this.storageService.addFoodHistory(history);
    this.confirmedFood.set(recommendation.name);
    this.showConfirmModal.set(true);
  }

  /**
   * 关闭确认弹窗
   */
  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
  }

  /**
   * 获取标签显示文本
   */
  getTagLabel(tag: string): string {
    return TAG_CONFIG[tag]?.label || tag;
  }

  /**
   * 导航到历史页面
   */
  navigateToHistory(): void {
    this.router.navigate(['/history']);
  }

  /**
   * 导航到设置页面
   */
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * 获取餐食类型名称
   */
  getMealTypeName(type: MealType): string {
    return this.foodService.getMealTypeName(type);
  }
}
