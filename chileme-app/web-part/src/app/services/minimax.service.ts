import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, catchError, of, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { MealType, Recommendation } from '../models/food.model';

/**
 * MiniMax AI 服务
 * 基于 MiniMax API 提供智能美食推荐
 */
@Injectable({
  providedIn: 'root'
})
export class MinimaxService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  // MiniMax API 配置
  private readonly API_BASE = 'https://api.minimax.chat/v1';
  private readonly MODEL = 'abab6.5s-chat';

  // 信号量
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * 获取 AI 推荐
   */
  getRecommendation(
    mealType: MealType,
    preferences: string[] = [],
    isHealthy: boolean = false
  ): Observable<Recommendation> {
    const apiKey = this.storageService.getApiKey();

    if (!apiKey) {
      this.error.set('请先在设置中配置 API Key');
      return of({
        food: '',
        reason: '未配置 API Key',
        isHealthy: false
      });
    }

    this.isLoading.set(true);
    this.error.set(null);

    const prompt = this.buildPrompt(mealType, preferences, isHealthy);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: this.MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的美食推荐助手，根据用户的需求推荐合适的食物。要求简洁、有趣、健康。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    return this.http.post<any>(`${this.API_BASE}/text/chatcompletion_v2`, body, { headers }).pipe(
      map(response => {
        this.isLoading.set(false);
        return this.parseResponse(response, mealType, isHealthy);
      }),
      catchError(err => {
        this.isLoading.set(false);
        this.error.set(err.message || 'API 调用失败');
        return of({
          food: '',
          reason: 'API 调用失败: ' + (err.message || '未知错误'),
          isHealthy: false
        });
      })
    );
  }

  /**
   * 构建 prompt
   */
  private buildPrompt(mealType: MealType, preferences: string[], isHealthy: boolean): string {
    const mealNames: Record<MealType, string> = {
      'breakfast': '早餐',
      'lunch': '午餐',
      'dinner': '晚餐',
      'snack': '夜宵'
    };

    const mealName = mealNames[mealType];
    const healthTip = isHealthy ? '希望吃得健康清淡' : '无所谓，可以吃放纵一点';

    let prompt = `现在是${mealName}时间，${healthTip}。`;

    if (preferences.length > 0) {
      prompt += `用户的偏好是：${preferences.join('、')}。`;
    }

    prompt += `请推荐一种食物，直接给出食物名称和简短理由，格式如下：\n食物：[食物名]\n理由：[一句话理由]`;

    return prompt;
  }

  /**
   * 解析 API 响应
   */
  private parseResponse(response: any, mealType: MealType, isHealthy: boolean): Recommendation {
    try {
      const content = response.choices?.[0]?.message?.content || '';

      // 解析食物名和理由
      const foodMatch = content.match(/食物[：:]\s*(.+)/);
      const reasonMatch = content.match(/理由[：:]\s*(.+)/);

      const food = foodMatch ? foodMatch[1].trim() : this.getDefaultFood(mealType);
      const reason = reasonMatch ? reasonMatch[1].trim() : 'AI 推荐';

      return {
        food,
        reason,
        isHealthy
      };
    } catch {
      return {
        food: this.getDefaultFood(mealType),
        reason: 'AI 推荐',
        isHealthy
      };
    }
  }

  /**
   * 获取默认食物
   */
  private getDefaultFood(mealType: MealType): string {
    const defaults: Record<MealType, string> = {
      'breakfast': '粥',
      'lunch': '沙拉',
      'dinner': '炒菜',
      'snack': '水果'
    };
    return defaults[mealType];
  }

  /**
   * 测试 API Key 是否有效
   */
  testApiKey(apiKey: string): Observable<{ valid: boolean; message: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: this.MODEL,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 10
    };

    return this.http.post<any>(`${this.API_BASE}/text/chatcompletion_v2`, body, { headers }).pipe(
      map(() => ({ valid: true, message: 'API Key 验证成功' })),
      catchError(err => {
        const message = err.error?.error?.message || 'API Key 无效';
        return of({ valid: false, message });
      })
    );
  }
}
