import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FoodService } from '../../services/food.service';
import { MinimaxService } from '../../services/minimax.service';
import { StorageService } from '../../services/storage.service';
import { MealType, FoodOption, Recommendation } from '../../models/food.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private foodService = inject(FoodService);
  private minimaxService = inject(MinimaxService);
  private storageService = inject(StorageService);

  // 当前选择的餐食类型
  selectedMealType = signal<MealType>(this.foodService.getCurrentMealType());

  // 随机推荐
  randomFood = signal<FoodOption | null>(null);

  // AI 推荐
  aiRecommendation = signal<Recommendation | null>(null);

  // 选项列表
  foodOptions = signal<FoodOption[]>([]);

  // 健康偏好
  preferHealthy = signal<boolean>(true);

  // 选中项
  selectedFood = signal<string>('');

  // 加载状态
  isLoading = this.minimaxService.isLoading;

  constructor() {
    this.randomPick();
  }

  ngOnInit(): void {}

  /**
   * 切换餐食类型
   */
  selectMealType(type: MealType): void {
    this.selectedMealType.set(type);
    this.randomPick();
    this.aiRecommendation.set(null);
    this.selectedFood.set('');
  }

  /**
   * 随机选择
   */
  randomPick(): void {
    const food = this.foodService.getRandomFood(this.selectedMealType());
    this.randomFood.set(food);
    this.selectedFood.set(food?.name || '');
  }

  /**
   * 生成选项列表
   */
  generateOptions(): void {
    const options = this.foodService.generateOptions(this.selectedMealType(), 3);
    this.foodOptions.set(options);
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
      this.aiRecommendation.set(result);
      if (result.food) {
        this.selectedFood.set(result.food);
      }
    });
  }

  /**
   * 确认选择
   */
  confirmSelection(): void {
    const food = this.selectedFood();
    if (!food) {
      return;
    }

    // 保存到历史记录
    const history = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mealType: this.selectedMealType(),
      food,
      timestamp: Date.now()
    };

    this.storageService.addFoodHistory(history);
    alert(`已记录：${this.foodService.getMealTypeName(this.selectedMealType())} - ${food}`);
  }

  /**
   * 选择食物
   */
  selectOption(food: string): void {
    this.selectedFood.set(food);
  }

  /**
   * 获取餐食类型名称
   */
  getMealTypeName(type: MealType): string {
    return this.foodService.getMealTypeName(type);
  }
}
