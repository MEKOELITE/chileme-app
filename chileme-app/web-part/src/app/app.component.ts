import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- 类型定义 ---
type MealType = '早餐' | '午餐' | '晚餐' | '宵夜';
type Category = '主食' | '菜品' | '甜点' | '饮料';

interface Tag { id: string; name: string; category: Category; }
interface FoodItem { id: string; name: string; categoryId: Category; tagIds: string[]; }
interface MealRecord { id: string; date: number; mealType: MealType; selections: { [key in Category]?: string }; aiAnalysis?: string; }

// --- API 配置 ---
const apiKey = ""; // ⚠️ 请在此填入你的 Gemini API Key

const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: '家常菜', category: '菜品' },
  { id: 't2', name: '高热量', category: '菜品' },
  { id: 't3', name: '清淡', category: '主食' },
  { id: 't4', name: '咖啡系', category: '饮料' },
  { id: 't5', name: '快乐水', category: '饮料' },
];

const INITIAL_FOODS: FoodItem[] = [
  { id: 'f1', name: '红烧肉', categoryId: '菜品', tagIds: ['t1', 't2'] },
  { id: 'f2', name: '清炒时蔬', categoryId: '菜品', tagIds: ['t1'] },
  { id: 'f3', name: '炸鸡', categoryId: '菜品', tagIds: ['t2'] },
  { id: 'f4', name: '米饭', categoryId: '主食', tagIds: ['t3'] },
  { id: 'f5', name: '馒头', categoryId: '主食', tagIds: ['t3'] },
  { id: 'f6', name: '牛肉面', categoryId: '主食', tagIds: [] },
  { id: 'f7', name: '冰美式', categoryId: '饮料', tagIds: ['t4'] },
  { id: 'f8', name: '可乐', categoryId: '饮料', tagIds: ['t5'] },
  { id: 'f9', name: '冰淇淋', categoryId: '甜点', tagIds: ['t2'] },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans select-none">
      <header class="bg-orange-500 text-white p-4 shadow-md flex justify-between items-center z-10 transition-colors duration-300" 
              [class.bg-purple-600]="isAiLoading()">
        <h1 class="text-xl font-bold tracking-wider flex items-center gap-2">
          {{ getTitle() }}
          <span *ngIf="isAiLoading()" class="text-xs bg-white/20 px-2 py-0.5 rounded animate-pulse">AI 思考中...</span>
        </h1>
        <button *ngIf="currentPage() === 'selection'" (click)="goBackToHome()" class="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">
          返回
        </button>
      </header>

      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24">
        <div *ngIf="currentTab() === 'home' && currentPage() === 'home'" class="flex flex-col h-full justify-center">
          <h2 class="text-2xl font-bold text-center mb-8 text-gray-700">今天吃什么？</h2>
          <div class="grid grid-cols-2 gap-4">
            <button *ngFor="let type of mealTypes" (click)="startSelection(type)"
              class="h-32 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-2 transition-transform active:scale-95 border-2 border-transparent hover:border-orange-300"
              [ngClass]="getMealTypeColor(type)">
              <span class="text-4xl">{{getMealIcon(type)}}</span>
              <span class="text-xl font-bold text-white">{{type}}</span>
            </button>
          </div>
        </div>

        <div *ngIf="currentTab() === 'home' && currentPage() === 'selection'" class="space-y-6">
          <div class="flex justify-between items-center bg-orange-100 p-3 rounded-lg text-orange-800 font-medium mb-4">
            <span>正在决定: {{selectedMealType()}}</span>
            <button (click)="aiSmartPick()" [disabled]="isAiLoading()"
                    class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 hover:brightness-110 active:scale-95 disabled:opacity-50">
              <span *ngIf="!isAiLoading()">✨ AI 帮我选</span>
              <span *ngIf="isAiLoading()">生成中...</span>
            </button>
          </div>

          <div *ngIf="aiSuggestionReason()" class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-xl shadow-sm animate-fade-in relative">
            <h4 class="text-purple-800 text-xs font-bold mb-1 flex items-center">✨ AI 推荐理由</h4>
            <p class="text-sm text-gray-700 leading-relaxed">{{ aiSuggestionReason() }}</p>
            <button (click)="aiSuggestionReason.set('')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          <div *ngFor="let cat of categories" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-bold text-lg flex items-center"><span class="mr-2">{{getCategoryIcon(cat)}}</span> {{cat}}</h3>
              <select [ngModel]="selectionState[cat].filterTagId" (ngModelChange)="setFilter(cat, $event)" class="text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50 outline-none">
                <option [ngValue]="null">全库随机</option>
                <option *ngFor="let tag of getTagsByCategory(cat)" [value]="tag.id">{{tag.name}}</option>
              </select>
            </div>
            <div class="flex items-center space-x-3">
              <div class="flex-1 bg-gray-100 h-12 rounded-lg flex items-center px-4 relative cursor-pointer" (click)="toggleManualSelect(cat)">
                <span class="font-bold text-gray-800 animate-fade-in">{{selectionState[cat].selectedItem || '点击手动选择或随机...'}}</span>
                <div class="absolute right-2 text-gray-400 text-xs">▼</div>
              </div>
              <button (click)="randomize(cat)" class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg shadow">🎲</button>
            </div>
            <div *ngIf="selectionState[cat].isManualOpen" class="mt-3 grid grid-cols-3 gap-2 animate-slide-down">
               <button (click)="selectItem(cat, null)" class="text-xs p-2 border border-dashed border-gray-300 rounded text-gray-500">清空</button>
               <button *ngFor="let food of getFoodsForSelection(cat)" (click)="selectItem(cat, food.name)" class="text-xs p-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 rounded truncate">{{food.name}}</button>
            </div>
          </div>

          <button (click)="saveRecord()" [disabled]="!hasAnySelection()" class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95">🍽️ 确认开吃</button>
        </div>

        <div *ngIf="currentTab() === 'calendar'" class="space-y-4">
          <div *ngIf="history().length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">📅 还没有记录</div>
          <div *ngFor="let group of historyGrouped()" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gray-100 px-4 py-2 font-bold flex justify-between items-center">
              <span>{{group.dateStr}}</span>
              <span class="text-xs font-normal">{{group.records.length}} 餐</span>
            </div>
            <div *ngFor="let record of group.records" class="p-4 border-b border-gray-100 relative">
              <div class="flex justify-between items-start mb-2">
                <span class="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold">{{record.mealType}}</span>
                <button *ngIf="!record.aiAnalysis" (click)="analyzeRecord(record)" [disabled]="isAiLoading()" class="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">✨ 营养点评</button>
              </div>
              <div class="grid grid-cols-2 gap-x-4 text-sm">
                <div *ngFor="let cat of categories"><span class="text-gray-400 text-xs">{{cat}}:</span> {{record.selections[cat] || '-'}}</div>
              </div>
              <div *ngIf="record.aiAnalysis" class="mt-3 bg-purple-50 p-2 rounded text-xs text-purple-800 flex gap-2 items-start animate-fade-in">
                <span>👩‍⚕️</span><span>{{ record.aiAnalysis }}</span>
              </div>
              <button (click)="deleteRecord(record.id)" class="absolute top-4 right-4 text-gray-300 hover:text-red-500">&times;</button>
            </div>
          </div>
        </div>

        <div *ngIf="currentTab() === 'settings'" class="space-y-6">
          <div class="bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl p-5 text-white shadow-lg">
            <h3 class="font-bold text-lg mb-1">我的数据库</h3>
            <div class="flex space-x-6 text-sm opacity-90">
              <span>🏷️ 标签: {{tags().length}}</span> <span>🍲 食物: {{foods().length}}</span>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex border-b border-gray-100">
              <button *ngFor="let cat of categories" (click)="settingsCategory.set(cat)" class="flex-1 py-3 text-sm font-medium relative" [class.text-orange-600]="settingsCategory() === cat">
                {{cat}}
                <div *ngIf="settingsCategory() === cat" class="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
              </button>
            </div>
            <div class="p-4">
              <div class="mb-6">
                <h4 class="text-sm font-bold mb-2">标签管理</h4>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span *ngFor="let tag of getTagsByCategory(settingsCategory())" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center">
                    {{tag.name}}<button (click)="deleteTag(tag.id)" class="ml-2 font-bold">&times;</button>
                  </span>
                </div>
                <div class="flex gap-2">
                  <input #newTagInput type="text" placeholder="新标签..." class="flex-1 text-sm border rounded px-3 py-2 outline-none">
                  <button (click)="addTag(newTagInput.value, settingsCategory()); newTagInput.value=''" class="bg-gray-800 text-white px-4 py-2 rounded text-sm">添加</button>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-bold mb-2">食物管理</h4>
                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                  <input #newFoodInput type="text" placeholder="食物名称..." class="w-full mb-2 text-sm border rounded px-3 py-2 outline-none">
                  <div class="flex flex-wrap gap-2 mb-2">
                     <label *ngFor="let tag of getTagsByCategory(settingsCategory())" class="flex items-center space-x-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 cursor-pointer">
                       <input type="checkbox" (change)="toggleNewFoodTag(tag.id)" [checked]="newFoodTags.has(tag.id)"><span>{{tag.name}}</span>
                     </label>
                  </div>
                  <button (click)="addFood(newFoodInput.value, settingsCategory()); newFoodInput.value=''" class="w-full bg-green-500 text-white py-2 rounded text-sm font-bold">添加食物</button>
                </div>
                <div class="max-h-60 overflow-y-auto space-y-2">
                  <div *ngFor="let food of getFoodsByCategory(settingsCategory())" class="flex justify-between items-center p-2 border border-gray-100 rounded text-sm">
                    <div><span class="font-medium mr-2">{{food.name}}</span><span class="text-xs text-gray-400">{{food.tagIds.length}}个标签</span></div>
                    <button (click)="deleteFood(food.id)" class="text-gray-300 hover:text-red-500">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button (click)="resetData()" class="w-full text-xs text-red-400 underline">重置所有数据</button>
        </div>
      </main>

      <nav class="bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe fixed bottom-0 w-full z-20 shadow-lg">
        <button (click)="switchTab('home')" class="flex flex-col items-center w-full" [class.text-orange-500]="currentTab() === 'home'" [class.text-gray-400]="currentTab() !== 'home'">
          <span>🍽️</span><span class="text-xs">吃什么</span>
        </button>
        <button (click)="switchTab('calendar')" class="flex flex-col items-center w-full" [class.text-orange-500]="currentTab() === 'calendar'" [class.text-gray-400]="currentTab() !== 'calendar'">
          <span>📅</span><span class="text-xs">日历</span>
        </button>
        <button (click)="switchTab('settings')" class="flex flex-col items-center w-full" [class.text-orange-500]="currentTab() === 'settings'" [class.text-gray-400]="currentTab() !== 'settings'">
          <span>⚙️</span><span class="text-xs">我的</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 200px; } }
    .animate-slide-down { animation: slideDown 0.3s ease-out forwards; overflow: hidden; }
    main::-webkit-scrollbar { width: 4px; }
    main::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 4px; }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  `]
})
export class AppComponent implements OnInit { // 关键：已更名为 AppComponent
  currentTab = signal<'home' | 'calendar' | 'settings'>('home');
  currentPage = signal<'home' | 'selection'>('home');
  selectedMealType = signal<MealType | null>(null);
  isAiLoading = signal(false);
  aiSuggestionReason = signal('');
  tags = signal<Tag[]>([]);
  foods = signal<FoodItem[]>([]);
  history = signal<MealRecord[]>([]);
  settingsCategory = signal<Category>('菜品');
  newFoodTags = new Set<string>();

  selectionState: { [key in Category]: { selectedItem: string | null; filterTagId: string | null; isManualOpen: boolean; } } = {
    '主食': { selectedItem: null, filterTagId: null, isManualOpen: false },
    '菜品': { selectedItem: null, filterTagId: null, isManualOpen: false },
    '甜点': { selectedItem: null, filterTagId: null, isManualOpen: false },
    '饮料': { selectedItem: null, filterTagId: null, isManualOpen: false },
  };

  mealTypes: MealType[] = ['早餐', '午餐', '晚餐', '宵夜'];
  categories: Category[] = ['主食', '菜品', '甜点', '饮料'];

  constructor() {
    effect(() => {
      localStorage.setItem('clm_tags', JSON.stringify(this.tags()));
      localStorage.setItem('clm_foods', JSON.stringify(this.foods()));
      localStorage.setItem('clm_history', JSON.stringify(this.history()));
    });
  }

  ngOnInit() { this.loadData(); }

  async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async aiSmartPick() {
    if (this.isAiLoading()) return;
    this.isAiLoading.set(true);
    const prompt = `为我从库存 ${JSON.stringify(this.foods().map(f => f.name))} 中选餐，餐别为 ${this.selectedMealType()}。返回JSON: {"selection":{"主食":"名","菜品":"名"...},"reason":"理由"}`;
    try {
      const res = await this.callGemini(prompt);
      const result = JSON.parse(res.replace(/```json/g, '').replace(/```/g, '').trim());
      this.categories.forEach(cat => {
        const name = result.selection[cat];
        if (this.foods().some(f => f.name === name)) this.selectionState[cat].selectedItem = name;
      });
      this.aiSuggestionReason.set(result.reason);
    } catch (e) { alert('AI连接失败'); } finally { this.isAiLoading.set(false); }
  }

  async analyzeRecord(record: MealRecord) {
    if (this.isAiLoading()) return;
    this.isAiLoading.set(true);
    try {
      const comment = await this.callGemini(`评价这顿饭: ${JSON.stringify(record.selections)}，30字以内。`);
      this.history.update(list => list.map(r => r.id === record.id ? { ...r, aiAnalysis: comment.trim() } : r));
    } catch (e) { alert('分析失败'); } finally { this.isAiLoading.set(false); }
  }

  loadData() {
    const t = localStorage.getItem('clm_tags');
    const f = localStorage.getItem('clm_foods');
    const h = localStorage.getItem('clm_history');
    this.tags.set(t ? JSON.parse(t) : INITIAL_TAGS);
    this.foods.set(f ? JSON.parse(f) : INITIAL_FOODS);
    this.history.set(h ? JSON.parse(h) : []);
  }

  getTitle() {
    if (this.currentTab() === 'home') return '吃了么';
    if (this.currentTab() === 'calendar') return '饮食日历';
    return '管理';
  }

  switchTab(tab: 'home' | 'calendar' | 'settings') { this.currentTab.set(tab); }
  startSelection(type: MealType) {
    this.selectedMealType.set(type);
    this.currentPage.set('selection');
    this.categories.forEach(cat => this.selectionState[cat] = { selectedItem: null, filterTagId: null, isManualOpen: false });
  }
  goBackToHome() { this.currentPage.set('home'); }
  getMealTypeColor(type: MealType) { return type === '早餐' ? 'bg-yellow-400' : type === '午餐' ? 'bg-orange-500' : type === '晚餐' ? 'bg-indigo-500' : 'bg-purple-600'; }
  getMealIcon(type: MealType) { return { '早餐': '🥐', '午餐': '🍱', '晚餐': '🍲', '宵夜': '🍢' }[type]; }
  getCategoryIcon(cat: Category) { return { '主食': '🍚', '菜品': '🍛', '甜点': '🍰', '饮料': '🥤' }[cat]; }
  getTagsByCategory(cat: Category) { return this.tags().filter(t => t.category === cat); }
  setFilter(cat: Category, tagId: any) { this.selectionState[cat].filterTagId = tagId; this.selectionState[cat].selectedItem = null; }
  toggleManualSelect(cat: Category) { this.selectionState[cat].isManualOpen = !this.selectionState[cat].isManualOpen; }
  getFoodsForSelection(cat: Category) {
    let items = this.foods().filter(f => f.categoryId === cat);
    const filterId = this.selectionState[cat].filterTagId;
    return filterId ? items.filter(f => f.tagIds.includes(filterId)) : items;
  }
  selectItem(cat: Category, name: string | null) { this.selectionState[cat].selectedItem = name; this.selectionState[cat].isManualOpen = false; }
  randomize(cat: Category) {
    const list = this.getFoodsForSelection(cat);
    if (list.length > 0) this.selectionState[cat].selectedItem = list[Math.floor(Math.random() * list.length)].name;
  }
  hasAnySelection() { return this.categories.some(cat => !!this.selectionState[cat].selectedItem); }
  saveRecord() {
    const sel: any = {};
    this.categories.forEach(cat => { if (this.selectionState[cat].selectedItem) sel[cat] = this.selectionState[cat].selectedItem; });
    this.history.update(old => [{ id: Date.now().toString(), date: Date.now(), mealType: this.selectedMealType()!, selections: sel, aiAnalysis: this.aiSuggestionReason() }, ...old]);
    this.switchTab('calendar'); this.goBackToHome();
  }
  historyGrouped = computed(() => {
    const groups: any[] = [];
    this.history().forEach(r => {
      const d = new Date(r.date);
      const ds = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      let g = groups.find(x => x.dateStr === ds);
      if (!g) { g = { dateStr: ds, records: [] }; groups.push(g); }
      g.records.push(r);
    });
    return groups;
  });
  deleteRecord(id: string) { if (confirm('删除吗？')) this.history.update(old => old.filter(r => r.id !== id)); }
  getFoodsByCategory(cat: Category) { return this.foods().filter(f => f.categoryId === cat); }
  deleteTag(id: string) { this.tags.update(old => old.filter(t => t.id !== id)); }
  addTag(name: string, cat: Category) { if (name.trim()) this.tags.update(old => [...old, { id: 't' + Date.now(), name: name.trim(), category: cat }]); }
  toggleNewFoodTag(tagId: string) { if (this.newFoodTags.has(tagId)) this.newFoodTags.delete(tagId); else this.newFoodTags.add(tagId); }
  addFood(name: string, cat: Category) {
    if (name.trim()) this.foods.update(old => [...old, { id: 'f' + Date.now(), name: name.trim(), categoryId: cat, tagIds: Array.from(this.newFoodTags) }]);
    this.newFoodTags.clear();
  }
  deleteFood(id: string) { this.foods.update(old => old.filter(f => f.id !== id)); }
  resetData() { if (confirm('确定重置？')) { localStorage.clear(); location.reload(); } }
}