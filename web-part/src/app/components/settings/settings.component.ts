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

  tags = signal<FoodTag[]>([]);
  isValidating = signal<boolean>(false);
  validationResult = signal<{ valid: boolean; message: string } | null>(null);
  isDarkMode = this.storageService.isDarkMode;

  // ngModel 双向绑定
  apiKeyValue = '';
  newTagNameValue = '';
  newTagItemsValue = '';
  selectedCategoryValue: MealType = 'lunch';
  isHealthyValue = true;

  ngOnInit(): void {
    this.apiKeyValue = this.storageService.getApiKey();
    this.tags.set(this.storageService.getUserTags());
  }

  validateApiKey(): void {
    if (!this.apiKeyValue) {
      this.validationResult.set({ valid: false, message: '请输入 API Key' });
      return;
    }

    this.isValidating.set(true);
    this.minimaxService.testApiKey(this.apiKeyValue).subscribe(result => {
      this.isValidating.set(false);
      this.validationResult.set(result);

      if (result.valid) {
        this.storageService.setApiKey(this.apiKeyValue);
        alert('API Key 已保存');
      }
    });
  }

  addTag(): void {
    const name = this.newTagNameValue.trim();
    const itemsStr = this.newTagItemsValue.trim();

    if (!name || !itemsStr) {
      alert('请填写标签名称和食物列表');
      return;
    }

    const items = itemsStr.split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);

    const newTag: FoodTag = {
      id: Date.now().toString(),
      name,
      category: this.selectedCategoryValue,
      isHealthy: this.isHealthyValue,
      items
    };

    this.storageService.addCustomTag(newTag);
    this.tags.set(this.storageService.getUserTags());

    this.newTagNameValue = '';
    this.newTagItemsValue = '';
    alert('标签添加成功');
  }

  deleteTag(tagId: string): void {
    if (confirm('确定要删除这个标签吗？')) {
      this.storageService.removeTag(tagId);
      this.tags.set(this.storageService.getUserTags());
    }
  }

  clearAllData(): void {
    if (confirm('确定要清除所有数据吗？这将删除所有历史记录和自定义设置。')) {
      this.storageService.clearAll();
      this.tags.set(this.storageService.getUserTags());
      this.apiKeyValue = '';
      alert('数据已清除');
    }
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

  /**
   * 切换深色模式
   */
  toggleDarkMode(): void {
    this.storageService.toggleDarkMode();
  }
}
