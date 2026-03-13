import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { MinimaxService } from '../../services/minimax.service';
import { FoodTag, MealType } from '../../models/food.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private storageService = inject(StorageService);
  private minimaxService = inject(MinimaxService);

  // API Key
  apiKey = signal<string>('');

  // 验证状态
  isValidating = signal<boolean>(false);
  validationResult = signal<{ valid: boolean; message: string } | null>(null);

  // 标签管理
  tags = signal<FoodTag[]>([]);
  newTagName = signal<string>('');
  newTagItems = signal<string>('');
  selectedCategory = signal<MealType>('lunch');
  isHealthy = signal<boolean>(true);

  ngOnInit(): void {
    this.apiKey.set(this.storageService.getApiKey());
    this.tags.set(this.storageService.getUserTags());
  }

  /**
   * 保存 API Key
   */
  saveApiKey(): void {
    this.storageService.setApiKey(this.apiKey());
    alert('API Key 已保存');
  }

  /**
   * 验证 API Key
   */
  validateApiKey(): void {
    const key = this.apiKey();
    if (!key) {
      this.validationResult.set({ valid: false, message: '请输入 API Key' });
      return;
    }

    this.isValidating.set(true);
    this.minimaxService.testApiKey(key).subscribe(result => {
      this.isValidating.set(false);
      this.validationResult.set(result);

      if (result.valid) {
        this.saveApiKey();
      }
    });
  }

  /**
   * 添加自定义标签
   */
  addTag(): void {
    const name = this.newTagName().trim();
    const itemsStr = this.newTagItems().trim();

    if (!name || !itemsStr) {
      alert('请填写标签名称和食物列表');
      return;
    }

    const items = itemsStr.split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);

    const newTag: FoodTag = {
      id: Date.now().toString(),
      name,
      category: this.selectedCategory(),
      isHealthy: this.isHealthy(),
      items
    };

    this.storageService.addCustomTag(newTag);
    this.tags.set(this.storageService.getUserTags());

    // 重置表单
    this.newTagName.set('');
    this.newTagItems.set('');
    alert('标签添加成功');
  }

  /**
   * 删除标签
   */
  deleteTag(tagId: string): void {
    if (confirm('确定要删除这个标签吗？')) {
      this.storageService.removeTag(tagId);
      this.tags.set(this.storageService.getUserTags());
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData(): void {
    if (confirm('确定要清除所有数据吗？这将删除所有历史记录和自定义设置。')) {
      this.storageService.clearAll();
      this.tags.set(this.storageService.getUserTags());
      this.apiKey.set('');
      alert('数据已清除');
    }
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
}
