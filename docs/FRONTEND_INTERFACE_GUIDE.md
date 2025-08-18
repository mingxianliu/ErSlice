# ErSlice 前端介面設計指南

## 🎯 概述

本文檔詳細說明 ErSlice 前端介面的設計原則、佈局功能和資料介面設計，為開發團隊提供統一的設計標準和實現指南。

## 🏗️ 整體架構設計

### 1. 應用層次結構
```
ErSlice 應用
├── 佈局層 (Layout Layer)
│   ├── 主佈局 (MainLayout)
│   ├── 側邊欄 (Sidebar)
│   ├── 頂部導航 (Header)
│   └── 內容區域 (Content Area)
├── 頁面層 (Page Layer)
│   ├── 儀表板 (Dashboard)
│   ├── 設計資產管理 (DesignAssets)
│   ├── 模板生成器 (TemplateGenerator)
│   └── AI 說明生成器 (AISpecGenerator)
├── 組件層 (Component Layer)
│   ├── 基礎組件 (Basic Components)
│   ├── 複合組件 (Composite Components)
│   └── 業務組件 (Business Components)
└── 數據層 (Data Layer)
    ├── 狀態管理 (State Management)
    ├── API 調用 (API Calls)
    └── 本地存儲 (Local Storage)
```

### 2. 響應式設計原則
- **移動優先 (Mobile First)**: 從最小螢幕開始設計
- **斷點系統**: 320px, 768px, 1024px, 1280px, 1536px
- **流體佈局**: 使用相對單位和彈性佈局
- **內容優先**: 確保核心內容在所有設備上可訪問

## 🎨 佈局功能設計

### 1. 主佈局系統 (MainLayout)

#### 1.1 佈局結構
```tsx
// 主佈局組件結構
<MainLayout>
  <Sidebar />           {/* 左側導航 */}
  <div className="flex-1 flex flex-col">
    <Header />          {/* 頂部導航 */}
    <main className="flex-1">
      <Outlet />        {/* 頁面內容 */}
    </main>
  </div>
</MainLayout>
```

#### 1.2 響應式行為
- **桌面版 (≥1024px)**: 側邊欄固定顯示，內容區域自適應
- **平板版 (768px-1023px)**: 側邊欄可收合，觸控優化
- **手機版 (<768px)**: 側邊欄隱藏，使用漢堡菜單

#### 1.3 佈局組件特性
```tsx
interface LayoutProps {
  sidebarCollapsed?: boolean;    // 側邊欄收合狀態
  sidebarWidth?: number;         // 側邊欄寬度
  headerHeight?: number;         // 頂部導航高度
  contentPadding?: number;       // 內容區域內邊距
  onSidebarToggle?: () => void;  // 側邊欄切換回調
}
```

### 2. 側邊欄設計 (Sidebar)

#### 2.1 導航結構
```tsx
<Sidebar>
  <SidebarHeader>      {/* Logo 和品牌 */}
  <SidebarNav>         {/* 主要導航 */}
    <NavItem icon={HomeIcon} label="儀表板" to="/" />
    <NavItem icon={FolderIcon} label="設計資產" to="/design-assets" />
    <NavItem icon={TemplateIcon} label="模板生成" to="/template-generator" />
    <NavItem icon={SparklesIcon} label="AI 說明" to="/ai-spec-generator" />
  </SidebarNav>
  <SidebarFooter>      {/* 用戶資訊和設定 */}
</Sidebar>
```

#### 2.2 響應式特性
- **展開狀態**: 顯示圖標和文字標籤
- **收合狀態**: 只顯示圖標，懸停顯示工具提示
- **觸控優化**: 手機版使用全屏覆蓋式側邊欄

#### 2.3 導航項目設計
```tsx
interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  badge?: string | number;        // 通知徽章
  children?: NavItemProps[];      // 子導航項目
  isActive?: boolean;             // 當前活動狀態
  onClick?: () => void;           // 點擊回調
}
```

### 3. 頂部導航設計 (Header)

#### 3.1 頂部導航結構
```tsx
<Header>
  <div className="flex items-center justify-between h-full px-4">
    <HeaderLeft>       {/* 左側：頁面標題和麵包屑 */}
    <HeaderCenter>     {/* 中間：搜尋和快速操作 */}
    <HeaderRight>      {/* 右側：通知、用戶、設定 */}
  </div>
</Header>
```

#### 3.2 麵包屑導航
```tsx
<Breadcrumb>
  <BreadcrumbItem to="/">首頁</BreadcrumbItem>
  <BreadcrumbItem to="/design-assets">設計資產</BreadcrumbItem>
  <BreadcrumbItem>用戶管理模組</BreadcrumbItem>
</Breadcrumb>
```

#### 3.3 快速操作區域
```tsx
<QuickActions>
  <SearchBar placeholder="搜尋設計資產..." />
  <ActionButton icon={PlusIcon} label="新增" />
  <ActionButton icon={FilterIcon} label="篩選" />
</QuickActions>
```

## 📊 資料介面設計

### 1. 數據表格設計 (DataTable)

#### 1.1 表格結構
```tsx
<DataTable>
  <TableHeader>
    <TableRow>
      <TableHead>名稱</TableHead>
      <TableHead>類型</TableHead>
      <TableHead>狀態</TableHead>
      <TableHead>更新時間</TableHead>
      <TableHead>操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell>{formatDate(item.updatedAt)}</TableCell>
        <TableCell>
          <ActionMenu item={item} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</DataTable>
```

#### 1.2 表格功能特性
- **排序**: 點擊列標題進行升序/降序排序
- **篩選**: 每列支援文字搜尋和條件篩選
- **分頁**: 支援頁面大小選擇和頁碼導航
- **選擇**: 支援單選、多選和批量操作
- **響應式**: 小螢幕上自動隱藏次要列

#### 1.3 表格配置選項
```tsx
interface DataTableConfig {
  columns: ColumnConfig[];        // 列配置
  pagination: PaginationConfig;   // 分頁配置
  sorting: SortingConfig;         // 排序配置
  filtering: FilteringConfig;     // 篩選配置
  selection: SelectionConfig;     // 選擇配置
  actions: ActionConfig[];        // 操作配置
}
```

### 2. 表單設計 (Form)

#### 2.1 表單結構
```tsx
<Form onSubmit={handleSubmit}>
  <FormSection title="基本信息">
    <FormField name="name" label="名稱" required>
      <Input placeholder="輸入模組名稱" />
    </FormField>
    
    <FormField name="description" label="描述">
      <Textarea placeholder="輸入模組描述" rows={3} />
    </FormField>
    
    <FormField name="category" label="分類" required>
      <Select>
        <option value="">選擇分類</option>
        <option value="data-display">數據展示</option>
        <option value="data-input">數據輸入</option>
        <option value="navigation">導航</option>
      </Select>
    </FormField>
  </FormSection>
  
  <FormSection title="進階設定">
    <FormField name="complexity" label="複雜度">
      <RadioGroup>
        <Radio value="simple">簡單</Radio>
        <Radio value="medium">中等</Radio>
        <Radio value="complex">複雜</Radio>
      </RadioGroup>
    </FormField>
  </FormSection>
  
  <FormActions>
    <Button type="submit" variant="primary">保存</Button>
    <Button type="button" variant="secondary">取消</Button>
  </FormActions>
</Form>
```

#### 2.2 表單驗證
```tsx
const formSchema = z.object({
  name: z.string().min(1, "名稱不能為空").max(50, "名稱不能超過50個字符"),
  description: z.string().max(200, "描述不能超過200個字符").optional(),
  category: z.string().min(1, "請選擇分類"),
  complexity: z.enum(["simple", "medium", "complex"]),
  tags: z.array(z.string()).min(1, "至少選擇一個標籤")
});
```

#### 2.3 表單狀態管理
```tsx
const [formState, setFormState] = useState({
  values: initialValues,
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: false
});

const handleFieldChange = (name: string, value: any) => {
  setFormState(prev => ({
    ...prev,
    values: { ...prev.values, [name]: value },
    errors: { ...prev.errors, [name]: undefined }
  }));
};
```

### 3. 卡片佈局設計 (CardLayout)

#### 3.1 卡片網格佈局
```tsx
<CardGrid>
  {items.map(item => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
        <StatusBadge status={item.status} />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <InfoRow label="類型" value={item.type} />
          <InfoRow label="複雜度" value={item.complexity} />
          <InfoRow label="更新時間" value={formatDate(item.updatedAt)} />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm">查看詳情</Button>
        <Button variant="primary" size="sm">編輯</Button>
      </CardFooter>
    </Card>
  ))}
</CardGrid>
```

#### 3.2 響應式網格配置
```tsx
const gridConfig = {
  sm: 1,      // 手機版：1列
  md: 2,      // 平板版：2列
  lg: 3,      // 小桌面：3列
  xl: 4,      // 大桌面：4列
  '2xl': 5    // 超大桌面：5列
};

<CardGrid columns={gridConfig} gap={4}>
  {/* 卡片內容 */}
</CardGrid>
```

### 4. 列表佈局設計 (ListLayout)

#### 4.1 列表項目結構
```tsx
<ListLayout>
  {items.map(item => (
    <ListItem key={item.id} className="border-b last:border-b-0">
      <ListItemContent>
        <div className="flex items-center space-x-4">
          <Avatar src={item.avatar} alt={item.name} />
          <div className="flex-1 min-w-0">
            <ListItemTitle>{item.name}</ListItemTitle>
            <ListItemDescription>{item.description}</ListItemDescription>
            <div className="flex items-center space-x-2 mt-1">
              <Tag>{item.category}</Tag>
              <Tag variant="outline">{item.complexity}</Tag>
            </div>
          </div>
        </div>
      </ListItemContent>
      
      <ListItemActions>
        <Button variant="ghost" size="sm">查看</Button>
        <Button variant="ghost" size="sm">編輯</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>複製</DropdownMenuItem>
            <DropdownMenuItem>分享</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">刪除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ListItemActions>
    </ListItem>
  ))}
</ListLayout>
```

## 🔧 組件設計原則

### 1. 組件 API 設計
```tsx
// 好的組件 API 設計
interface ComponentProps {
  // 必需的屬性
  children: React.ReactNode;
  
  // 可選的屬性，提供合理的預設值
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  
  // 事件回調
  onClick?: () => void;
  onChange?: (value: any) => void;
  
  // 樣式自定義
  className?: string;
  style?: React.CSSProperties;
  
  // 無障礙支援
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

### 2. 組件狀態管理
```tsx
// 組件內部狀態管理
const [internalState, setInternalState] = useState({
  isOpen: false,
  isFocused: false,
  isHovered: false,
  selectedValue: null
});

// 受控組件模式
const isControlled = value !== undefined && onChange !== undefined;
const displayValue = isControlled ? value : internalState.selectedValue;
```

### 3. 組件組合模式
```tsx
// 使用組合模式而非配置對象
<Card>
  <CardHeader>
    <CardTitle>標題</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>內容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>

// 而不是
<Card
  title="標題"
  description="描述"
  content="內容"
  footer="底部"
/>
```

## 📱 響應式設計實現

### 1. 斷點系統
```tsx
// Tailwind CSS 斷點
const breakpoints = {
  sm: '640px',    // 小手機
  md: '768px',    // 大手機/小平板
  lg: '1024px',   // 平板/小桌面
  xl: '1280px',   // 桌面
  '2xl': '1536px' // 大桌面
};

// 響應式 Hook
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
};
```

### 2. 響應式佈局組件
```tsx
// 響應式容器組件
const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={clsx(
      'mx-auto px-4',
      'sm:px-6 lg:px-8',
      'max-w-7xl',
      className
    )}>
      {children}
    </div>
  );
};

// 響應式網格組件
const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: Record<string, number>;
  gap?: number;
}> = ({ children, columns = { sm: 1, md: 2, lg: 3, xl: 4 }, gap = 4 }) => {
  const gridClasses = Object.entries(columns).map(([breakpoint, cols]) => {
    return `${breakpoint}:grid-cols-${cols}`;
  }).join(' ');
  
  return (
    <div className={clsx(
      'grid gap-4',
      gridClasses
    )}>
      {children}
    </div>
  );
};
```

## 🎨 主題和樣式系統

### 1. 設計令牌 (Design Tokens)
```tsx
// 顏色系統
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827'
  }
};

// 間距系統
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem'    // 48px
};

// 字體系統
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem'   // 24px
  }
};
```

### 2. 主題切換器
```tsx
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## ♿ 無障礙設計

### 1. 鍵盤導航
```tsx
// 可聚焦組件
const FocusableComponent: React.FC<{
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ children, onFocus, onBlur }) => {
  return (
    <div
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // 執行點擊操作
        }
      }}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </div>
  );
};
```

### 2. 螢幕閱讀器支援
```tsx
// ARIA 標籤和描述
<button
  aria-label="關閉對話框"
  aria-describedby="dialog-description"
  onClick={onClose}
>
  <XIcon className="h-4 w-4" />
</button>

<div id="dialog-description" className="sr-only">
  這是一個重要的對話框，包含用戶需要確認的信息
</div>
```

## 📊 性能優化

### 1. 虛擬滾動
```tsx
// 大型列表的虛擬滾動
import { FixedSizeList as List } from 'react-window';

const VirtualizedList: React.FC<{ items: any[] }> = ({ items }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  );
  
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 2. 懶加載
```tsx
// 圖片懶加載
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <img
      ref={imgRef}
      src={isInView ? src : ''}
      alt={alt}
      className={clsx(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
```

## 🔍 測試策略

### 1. 組件測試
```tsx
// 使用 React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('應該正確渲染按鈕文字', () => {
    render(<Button>點擊我</Button>);
    expect(screen.getByRole('button', { name: '點擊我' })).toBeInTheDocument();
  });
  
  it('應該在點擊時調用 onClick 回調', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>點擊我</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. 整合測試
```tsx
// 測試完整的用戶流程
describe('設計資產創建流程', () => {
  it('應該能夠成功創建新的設計模組', async () => {
    render(<CreateDesignModule />);
    
    // 填寫表單
    fireEvent.change(screen.getByLabelText('名稱'), {
      target: { value: '測試模組' }
    });
    
    fireEvent.change(screen.getByLabelText('描述'), {
      target: { value: '這是一個測試模組' }
    });
    
    // 提交表單
    fireEvent.click(screen.getByRole('button', { name: '創建' }));
    
    // 驗證結果
    await waitFor(() => {
      expect(screen.getByText('模組創建成功')).toBeInTheDocument();
    });
  });
});
```

## 📝 開發規範

### 1. 命名規範
- **組件**: PascalCase (如 `DataTable`, `FormField`)
- **檔案**: PascalCase (如 `DataTable.tsx`, `FormField.tsx`)
- **函數**: camelCase (如 `handleSubmit`, `validateForm`)
- **常數**: UPPER_SNAKE_CASE (如 `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`)
- **類型**: PascalCase (如 `TableProps`, `FormData`)

### 2. 檔案組織
```
src/
├── components/           # 組件目錄
│   ├── ui/              # 基礎 UI 組件
│   ├── forms/           # 表單相關組件
│   ├── tables/          # 表格相關組件
│   └── layout/          # 佈局相關組件
├── hooks/               # 自定義 Hooks
├── utils/               # 工具函數
├── types/               # TypeScript 類型定義
├── services/            # 業務邏輯服務
└── pages/               # 頁面組件
```

### 3. 代碼風格
- 使用 TypeScript 嚴格模式
- 優先使用函數組件和 Hooks
- 使用 ESLint 和 Prettier 保持代碼一致性
- 所有組件必須包含 PropTypes 或 TypeScript 類型
- 使用 Traditional Chinese (繁體中文) 註解

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
