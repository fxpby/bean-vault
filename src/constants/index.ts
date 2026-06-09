import type {
  CountryOption,
  BeanCategory,
  ProcessMethod,
  RoastLevel,
  BeanStatus,
  WishlistPriority,
} from "../types/bean";

export const COUNTRIES: CountryOption[] = [
  { name: "埃塞俄比亚", code: "ET", flag: "🇪🇹" },
  { name: "哥伦比亚", code: "CO", flag: "🇨🇴" },
  { name: "巴西", code: "BR", flag: "🇧🇷" },
  { name: "巴拿马", code: "PA", flag: "🇵🇦" },
  { name: "肯尼亚", code: "KE", flag: "🇰🇪" },
  { name: "印尼", code: "ID", flag: "🇮🇩" },
  { name: "哥斯达黎加", code: "CR", flag: "🇨🇷" },
  { name: "危地马拉", code: "GT", flag: "🇬🇹" },
  { name: "洪都拉斯", code: "HN", flag: "🇭🇳" },
  { name: "也门", code: "YE", flag: "🇾🇪" },
  { name: "中国", code: "CN", flag: "🇨🇳" },
  { name: "秘鲁", code: "PE", flag: "🇵🇪" },
  { name: "卢旺达", code: "RW", flag: "🇷🇼" },
  { name: "布隆迪", code: "BI", flag: "🇧🇮" },
  { name: "坦桑尼亚", code: "TZ", flag: "🇹🇿" },
  { name: "厄瓜多尔", code: "EC", flag: "🇪🇨" },
  { name: "玻利维亚", code: "BO", flag: "🇧🇴" },
  { name: "尼加拉瓜", code: "NI", flag: "🇳🇮" },
  { name: "萨尔瓦多", code: "SV", flag: "🇸🇻" },
  { name: "墨西哥", code: "MX", flag: "🇲🇽" },
  { name: "印度", code: "IN", flag: "🇮🇳" },
  { name: "越南", code: "VN", flag: "🇻🇳" },
  { name: "泰国", code: "TH", flag: "🇹🇭" },
  { name: "巴布亚新几内亚", code: "PG", flag: "🇵🇬" },
  { name: "牙买加", code: "JM", flag: "🇯🇲" },
  { name: "多米尼加", code: "DO", flag: "🇩🇴" },
  { name: "马拉维", code: "MW", flag: "🇲🇼" },
  { name: "乌干达", code: "UG", flag: "🇺🇬" },
  { name: "赞比亚", code: "ZM", flag: "🇿🇲" },
  { name: "喀麦隆", code: "CM", flag: "🇨🇲" },
];

export const CATEGORY_LABELS: Record<BeanCategory, string> = {
  pourover: "手冲",
  espresso: "意式",
  subscription: "订阅卡",
};

export const CATEGORY_OPTIONS: { value: BeanCategory; label: string }[] = [
  { value: "pourover", label: "手冲" },
  { value: "espresso", label: "意式" },
  { value: "subscription", label: "订阅卡" },
];

export const STATUS_LABELS: Record<BeanStatus, string> = {
  shelf: "架子上",
  fridge: "冰箱",
  drinking: "正在喝",
  finished: "已喝完",
};

export const STATUS_OPTIONS: { value: BeanStatus; label: string }[] = [
  { value: "shelf", label: "架子上" },
  { value: "fridge", label: "冰箱" },
  { value: "drinking", label: "正在喝" },
];

export const PROCESS_LABELS: Record<ProcessMethod, string> = {
  washed: "水洗",
  natural: "日晒",
  honey: "蜜处理",
  anaerobic: "厌氧发酵",
  decaf: "脱因",
  other: "其他",
};

export const PROCESS_OPTIONS: { value: ProcessMethod; label: string }[] = [
  { value: "washed", label: "水洗" },
  { value: "natural", label: "日晒" },
  { value: "honey", label: "蜜处理" },
  { value: "anaerobic", label: "厌氧发酵" },
  { value: "decaf", label: "脱因" },
  { value: "other", label: "其他" },
];

export const ROAST_LABELS: Record<RoastLevel, string> = {
  "ultra-light": "极浅烘",
  light: "浅烘",
  "light-medium": "浅中烘",
  medium: "中烘",
  "medium-dark": "中深烘",
  dark: "深烘",
};

export const ROAST_OPTIONS: { value: RoastLevel; label: string }[] = [
  { value: "ultra-light", label: "极浅烘" },
  { value: "light", label: "浅烘" },
  { value: "light-medium", label: "浅中烘" },
  { value: "medium", label: "中烘" },
  { value: "medium-dark", label: "中深烘" },
  { value: "dark", label: "深烘" },
];

export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
  low: "随缘看看",
  normal: "想买",
  high: "优先买",
  must: "必买",
};

export const WISHLIST_PRIORITY_OPTIONS: { value: WishlistPriority; label: string }[] = [
  { value: "low", label: "随缘看看" },
  { value: "normal", label: "想买" },
  { value: "high", label: "优先买" },
  { value: "must", label: "必买" },
];

export const FLAVOR_SUGGESTIONS: string[] = [
  "花香",
  "茉莉花",
  "柑橘",
  "柠檬",
  "橙子",
  "葡萄柚",
  "莓果",
  "蓝莓",
  "草莓",
  "樱桃",
  "黑莓",
  "热带水果",
  "芒果",
  "菠萝",
  "百香果",
  "荔枝",
  "核果",
  "桃子",
  "杏子",
  "李子",
  "坚果",
  "杏仁",
  "榛子",
  "核桃",
  "可可",
  "焦糖",
  "巧克力",
  "黑巧克力",
  "牛奶巧克力",
  "蜂蜜",
  "红糖",
  "枫糖",
  "太妃糖",
  "葡萄酒",
  "红酒",
  "朗姆酒",
  "香料",
  "肉桂",
  "丁香",
  "肉豆蔻",
  "草本",
  "薄荷",
  "绿茶",
  "烟熏",
  "木质",
  "泥土",
  "皮革",
];

export const DEFAULT_RESTING_DAYS = 14;

export const TAB_LABELS: Record<string, string> = {
  all: "全部",
  drinking: "正在喝",
  shelf: "架子上",
  fridge: "冰箱",
  finished: "已喝完",
  trash: "回收站",
};
