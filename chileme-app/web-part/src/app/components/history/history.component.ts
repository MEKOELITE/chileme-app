import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { FoodHistory, MealType } from '../../models/food.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private storageService = inject(StorageService);

  // 历史记录
  history = signal<FoodHistory[]>([]);

  // 按日期分组
  groupedHistory = signal<Map<string, FoodHistory[]>>(new Map());

  ngOnInit(): void {
    this.loadHistory();
  }

  /**
   * 加载历史记录
   */
  loadHistory(): void {
    const allHistory = this.storageService.getFoodHistory();
    this.history.set(allHistory);

    // 按日期分组
    const grouped = new Map<string, FoodHistory[]>();
    allHistory.forEach(item => {
      const date = item.date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item);
    });

    // 按日期排序（最新在前）
    const sortedMap = new Map(
      Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    );

    this.groupedHistory.set(sortedMap);
  }

  /**
   * 获取餐食类型名称
   */
  getMealTypeName(type: MealType): string {
    const names: Record<MealType, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '夜宵'
    };
    return names[type];
  }

  /**
   * 格式化日期
   */
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

  /**
   * 获取星期几
   */
  getWeekday(dateStr: string): string {
    const date = new Date(dateStr);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return '周' + weekdays[date.getDay()];
  }

  /**
   * 获取统计数据
   */
  getStats(): { total: number; byMeal: Record<MealType, number> } {
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
  }
}
