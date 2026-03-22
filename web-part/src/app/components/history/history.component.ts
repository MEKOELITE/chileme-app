import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { FoodHistory, MealType } from '../../models/food.model';

/**
 * 餐食类型配置
 */
interface MealTypeConfig {
  value: MealType;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private storageService = inject(StorageService);

  // 餐食类型配置
  mealTypes: MealTypeConfig[] = [
    { value: 'breakfast', label: '早餐', emoji: '🌅' },
    { value: 'lunch', label: '午餐', emoji: '☀️' },
    { value: 'dinner', label: '晚餐', emoji: '🌙' },
    { value: 'snack', label: '夜宵', emoji: '🍜' },
  ];

  private history = signal<FoodHistory[]>([]);

  groupedHistory = computed(() => {
    const allHistory = this.history();
    const grouped = new Map<string, FoodHistory[]>();
    allHistory.forEach(item => {
      const date = item.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item);
    });

    const sortedMap = new Map(
      Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    );
    return sortedMap;
  });

  stats = computed(() => {
    const all = this.history();
    const byMeal: Record<MealType, number> = {
      'breakfast': 0,
      'lunch': 0,
      'dinner': 0,
      'snack': 0
    };

    all.forEach(h => {
      byMeal[h.mealType]++;
    });

    return { total: all.length, byMeal };
  });

  ngOnInit(): void {
    const allHistory = this.storageService.getFoodHistory();
    this.history.set(allHistory);
  }

  getMealEmoji(type: MealType): string {
    const config = this.mealTypes.find(m => m.value === type);
    return config?.emoji || '🍽️';
  }

  getMealTypeName(type: MealType): string {
    const names: Record<MealType, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '夜宵'
    };
    return names[type];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }

  getWeekday(dateStr: string): string {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return '周' + weekdays[date.getDay()];
  }
}
