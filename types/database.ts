export type MonitoredApp = {
  id: string;
  package_name: string;
  app_name: string;
  app_icon: string;
  app_category: string;
  limit_minutes: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type UsageSession = {
  id: string;
  package_name: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  created_at: string;
};

export type BlockEvent = {
  id: string;
  package_name: string;
  block_date: string;
  limit_minutes: number;
  actual_usage_minutes: number;
  created_at: string;
};

export type AppUsageSummary = {
  app: MonitoredApp;
  todayUsageMinutes: number;
  remainingMinutes: number;
  progress: number;
  status: 'within' | 'warning' | 'reached' | 'exceeded';
};

export type DayUsage = {
  date: string;
  dayName: string;
  totalMinutes: number;
};

export type WeeklyComparison = {
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  percentChange: number;
  trend: 'down' | 'up' | 'same';
};
