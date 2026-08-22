import { supabase } from './supabase';
import type { MonitoredApp, UsageSession, BlockEvent, AppUsageSummary, DayUsage, WeeklyComparison } from '@/types/database';
import { getAppStatus, getProgress, getRemainingMinutes, getTodayDateString, getWeekDates, getDayName } from './utils';

export async function getMonitoredApps(): Promise<MonitoredApp[]> {
  const { data, error } = await supabase
    .from('monitored_apps')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as MonitoredApp[];
}

export async function getMonitoredApp(packageName: string): Promise<MonitoredApp | null> {
  const { data, error } = await supabase
    .from('monitored_apps')
    .select('*')
    .eq('package_name', packageName)
    .maybeSingle();
  if (error) throw error;
  return data as MonitoredApp | null;
}

export async function addMonitoredApp(app: Omit<MonitoredApp, 'id' | 'created_at' | 'updated_at'>): Promise<MonitoredApp> {
  const { data, error } = await supabase
    .from('monitored_apps')
    .insert(app)
    .select()
    .single();
  if (error) throw error;
  return data as MonitoredApp;
}

export async function updateMonitoredApp(packageName: string, updates: Partial<MonitoredApp>): Promise<void> {
  const { error } = await supabase
    .from('monitored_apps')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('package_name', packageName);
  if (error) throw error;
}

export async function deleteMonitoredApp(packageName: string): Promise<void> {
  const { error } = await supabase
    .from('monitored_apps')
    .delete()
    .eq('package_name', packageName);
  if (error) throw error;
}

export async function getTodayUsageForApp(packageName: string): Promise<number> {
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('duration_minutes')
    .eq('package_name', packageName)
    .eq('session_date', today);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
}

export async function getTodayTotalUsage(): Promise<number> {
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('duration_minutes')
    .eq('session_date', today);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
}

export async function getWeekTotalUsage(offset: number = 0): Promise<number> {
  const dates = getWeekDates(offset);
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('session_date, duration_minutes')
    .in('session_date', dates);
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
}

export async function getDailyUsageForWeek(offset: number = 0): Promise<DayUsage[]> {
  const dates = getWeekDates(offset);
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('session_date, duration_minutes')
    .in('session_date', dates);
  if (error) throw error;
  const map = new Map<string, number>();
  for (const d of dates) {
    map.set(d, 0);
  }
  if (data) {
    for (const row of data) {
      const cur = map.get(row.session_date) || 0;
      map.set(row.session_date, cur + (row.duration_minutes || 0));
    }
  }
  return dates.map(d => ({
    date: d,
    dayName: getDayName(d),
    totalMinutes: map.get(d) || 0,
  }));
}

export async function getWeeklyComparison(): Promise<WeeklyComparison> {
  const thisWeek = await getWeekTotalUsage(0);
  const lastWeek = await getWeekTotalUsage(1);
  let percentChange = 0;
  if (lastWeek > 0) {
    percentChange = ((thisWeek - lastWeek) / lastWeek) * 100;
  }
  const trend: 'down' | 'up' | 'same' = percentChange < -0.5 ? 'down' : percentChange > 0.5 ? 'up' : 'same';
  return { thisWeekMinutes: thisWeek, lastWeekMinutes: lastWeek, percentChange, trend };
}

export async function getAppUsageSummaries(): Promise<AppUsageSummary[]> {
  const apps = await getMonitoredApps();
  if (apps.length === 0) return [];
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('package_name, duration_minutes')
    .eq('session_date', today);
  if (error) throw error;
  const usageMap = new Map<string, number>();
  if (data) {
    for (const row of data) {
      const cur = usageMap.get(row.package_name) || 0;
      usageMap.set(row.package_name, cur + (row.duration_minutes || 0));
    }
  }
  return apps.map(app => {
    const used = usageMap.get(app.package_name) || 0;
    const status = getAppStatus(used, app.limit_minutes);
    return {
      app,
      todayUsageMinutes: used,
      remainingMinutes: getRemainingMinutes(used, app.limit_minutes),
      progress: getProgress(used, app.limit_minutes),
      status,
    };
  });
}

export async function getAppUsageHistory(packageName: string, days: number = 7): Promise<DayUsage[]> {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  const { data, error } = await supabase
    .from('usage_sessions')
    .select('session_date, duration_minutes')
    .eq('package_name', packageName)
    .in('session_date', dates);
  if (error) throw error;
  const map = new Map<string, number>();
  for (const d of dates) map.set(d, 0);
  if (data) {
    for (const row of data) {
      const cur = map.get(row.session_date) || 0;
      map.set(row.session_date, cur + (row.duration_minutes || 0));
    }
  }
  return dates.map(d => ({
    date: d,
    dayName: getDayName(d),
    totalMinutes: map.get(d) || 0,
  }));
}

export async function getBlockEventsForDate(date: string): Promise<BlockEvent[]> {
  const { data, error } = await supabase
    .from('block_events')
    .select('*')
    .eq('block_date', date)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as BlockEvent[];
}

export async function getTotalBlockEvents(): Promise<number> {
  const { count, error } = await supabase
    .from('block_events')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

export async function recordUsageSession(packageName: string, durationMinutes: number): Promise<void> {
  const today = getTodayDateString();
  const { error } = await supabase
    .from('usage_sessions')
    .insert({
      package_name: packageName,
      session_date: today,
      start_time: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: durationMinutes,
    });
  if (error) throw error;
}

export async function recordBlockEvent(packageName: string, limitMinutes: number, actualUsage: number): Promise<void> {
  const today = getTodayDateString();
  const { error } = await supabase
    .from('block_events')
    .insert({
      package_name: packageName,
      block_date: today,
      limit_minutes: limitMinutes,
      actual_usage_minutes: actualUsage,
    });
  if (error) throw error;
}

export async function clearAllUsageData(): Promise<void> {
  const { error: e1 } = await supabase.from('usage_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('block_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) throw e2;
}

export async function resetAllLimits(): Promise<void> {
  const { error } = await supabase.from('monitored_apps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export async function getAppUsageByCategory(): Promise<{ category: string; minutes: number }[]> {
  const today = getTodayDateString();
  const { data: apps, error: e1 } = await supabase.from('monitored_apps').select('package_name, app_category');
  if (e1) throw e1;
  const { data: sessions, error: e2 } = await supabase
    .from('usage_sessions')
    .select('package_name, duration_minutes')
    .eq('session_date', today);
  if (e2) throw e2;
  const catMap = new Map<string, number>();
  const pkgToCat = new Map<string, string>();
  if (apps) {
    for (const a of apps) pkgToCat.set(a.package_name, a.app_category);
  }
  if (sessions) {
    for (const s of sessions) {
      const cat = pkgToCat.get(s.package_name) || 'Other';
      catMap.set(cat, (catMap.get(cat) || 0) + (s.duration_minutes || 0));
    }
  }
  return Array.from(catMap.entries()).map(([category, minutes]) => ({ category, minutes })).sort((a, b) => b.minutes - a.minutes);
}

export async function getLimitPerformance(): Promise<{ within: number; reached: number; exceeded: number }> {
  const summaries = await getAppUsageSummaries();
  let within = 0, reached = 0, exceeded = 0;
  for (const s of summaries) {
    if (s.status === 'exceeded') exceeded++;
    else if (s.status === 'reached') reached++;
    else within++;
  }
  return { within, reached, exceeded };
}
