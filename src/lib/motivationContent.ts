export interface MotivationMessage {
  title: string;
  message: string;
  emoji: string;
}

export interface BadgeConfig {
  key: string;
  name: string;
  description: string;
  emoji: string;
}

export const humorMessages: MotivationMessage[] = [
  {
    title: "销售真相",
    message: "Jordan Belfort 第一年被拒了 800 次。你还差得远呢。",
    emoji: "😏",
  },
  {
    title: "哲学思考",
    message: "Voicemail 是宇宙给你的礼物 — 至少没人跟你吵架。",
    emoji: "📞",
  },
  {
    title: "统计学",
    message: "No Answer = 他们在开会讨论是否需要你的产品。（可能）",
    emoji: "🤔",
  },
  {
    title: "概率论",
    message: "统计学上，下一通接的概率更高了。这是真的。",
    emoji: "📊",
  },
  {
    title: "换个角度",
    message: "没接电话说明他们很忙 = 他们是有钱人 = 更好的客户。",
    emoji: "💰",
  },
  {
    title: "销售秘密",
    message: "顶级销售员说：每个 Voicemail 都是在给他们留悬念。",
    emoji: "🎭",
  },
];

export const seriousMessages: MotivationMessage[] = [
  {
    title: "坚持",
    message: "每个 No 都让你离 Yes 更近一步。",
    emoji: "💪",
  },
  {
    title: "数据说话",
    message: "顶级销售员的成交率平均只有 20%。你在正常范围。",
    emoji: "📈",
  },
  {
    title: "差距",
    message: "你今天打的每一通电话，都是别人不敢打的。",
    emoji: "🏆",
  },
  {
    title: "复利",
    message: "今天的每一个 No，都在为明天的 Yes 铺路。",
    emoji: "🌱",
  },
];

export const darkDayMessages: MotivationMessage[] = [
  {
    title: "艰难的一天",
    message: "这是艰难的一天。但你还在打。这就是差距。",
    emoji: "⚡",
  },
  {
    title: "坚守",
    message: "最难的那天，恰好是最能体现你价值的一天。",
    emoji: "🔥",
  },
  {
    title: "真正的销售",
    message: "80% 的人在第五次拒绝后放弃。你现在在做那 20% 在做的事。",
    emoji: "🎯",
  },
];

export const badgeConfigs: Record<string, BadgeConfig> = {
  rejection_master_10: {
    key: "rejection_master_10",
    name: "拒绝新手",
    description: "已被拒绝 10 次。欢迎入门 — 这才是销售的起点。",
    emoji: "🥉",
  },
  rejection_master_50: {
    key: "rejection_master_50",
    name: "拒绝老手",
    description: "已被拒绝 50 次。你已经比 80% 的人更有韧性了。",
    emoji: "🥈",
  },
  rejection_master_100: {
    key: "rejection_master_100",
    name: "拒绝大师",
    description: "已被拒绝 100 次。欢迎加入精英俱乐部。大多数人连这个门槛都没迈过。",
    emoji: "🥇",
  },
  ghost_hunter_10: {
    key: "ghost_hunter_10",
    name: "Ghost Hunter",
    description: "连续 10 通无人接听。也许他们都在开同一个会？继续打。",
    emoji: "👻",
  },
  voicemail_king: {
    key: "voicemail_king",
    name: "Voicemail King",
    description: "连续 8 通进了语音信箱。你的声音现在已经住进他们脑子里了。",
    emoji: "👑",
  },
  dark_day: {
    key: "dark_day",
    name: "铁人",
    description: "今天特别难，但你没有停下来。这种韧性才是真正的竞争壁垒。",
    emoji: "⛈️",
  },
  resilience: {
    key: "resilience",
    name: "反弹王",
    description: "连续 10 通失败后，直接来一通成功。这就是销售的本质。",
    emoji: "🦅",
  },
};

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
