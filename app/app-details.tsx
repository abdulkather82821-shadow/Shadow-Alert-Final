import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import {
  getMonitoredApp,
  getTodayUsageForApp,
  getAppUsageHistory,
  updateMonitoredApp,
  deleteMonitoredApp,
  recordUsageSession,
  recordBlockEvent,
} from '@/lib/data';
import { formatMinutes, getAppStatus, getStatusLabel, getStatusColor, getProgress, getRemainingMinutes } from '@/lib/utils';
import type { MonitoredApp, DayUsage } from '@/types/database';
import { BarChart } from '@/components/BarChart';
import { ArrowLeft, Trash2, Play, Shield, Clock, TrendingUp } from 'lucide-react-native';

export default function AppDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { pkg } = useLocalSearchParams<{ pkg: string }>();
  const packageName = decodeURIComponent(pkg || '');

  const [app, setApp] = useState<MonitoredApp | null>(null);
  const [todayUsage, setTodayUsage] = useState(0);
  const [history, setHistory] = useState<DayUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [a, usage, hist] = await Promise.all([
        getMonitoredApp(packageName),
        getTodayUsageForApp(packageName),
        getAppUsageHistory(packageName, 7),
      ]);
      setApp(a);
      setTodayUsage(usage);
      setHistory(hist);
    } catch (e) {
      console.error('AppDetails load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [packageName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const status = app ? getAppStatus(todayUsage, app.limit_minutes) : 'within';
  const statusColor = getStatusColor(status, colors);
  const progress = app ? getProgress(todayUsage, app.limit_minutes) : 0;
  const remaining = app ? getRemainingMinutes(todayUsage, app.limit_minutes) : 0;

  const handleDelete = () => {
    Alert.alert(
      'Remove App',
      `Stop monitoring ${app?.app_name}? Your usage history will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMonitoredApp(packageName);
              router.back();
            } catch (e) {
              Alert.alert('Error', 'Failed to remove app.');
            }
          },
        },
      ]
    );
  };

  const handleSimulateUsage = async (minutes: number) => {
    if (!app) return;
    setSimulating(true);
    try {
      await recordUsageSession(packageName, minutes);
      const newUsage = todayUsage + minutes;
      setTodayUsage(newUsage);
      if (newUsage >= app.limit_minutes) {
        await recordBlockEvent(packageName, app.limit_minutes, newUsage);
        Alert.alert(
          'Limit Reached',
          `You've used ${formatMinutes(newUsage)} of your ${formatMinutes(app.limit_minutes)} limit for ${app.app_name}.`,
          [{ text: 'OK' }]
        );
      }
      await loadData();
    } catch (e) {
      console.error('Simulate usage error:', e);
      Alert.alert('Error', 'Failed to record usage.');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!app) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.neutral[700]} strokeWidth={2} />
          </Pressable>
          <Text style={styles.topBarTitle}>App Not Found</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>This app is no longer monitored.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[700]} strokeWidth={2} />
        </Pressable>
        <Text style={styles.topBarTitle}>App Details</Text>
        <Pressable style={styles.backButton} onPress={handleDelete}>
          <Trash2 size={20} color={colors.error.main} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        <View style={styles.appHeaderCard}>
          <View style={styles.appIconWrap}>
            <Text style={styles.appIcon}>{app.app_icon}</Text>
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>{app.app_name}</Text>
            <Text style={styles.appCategory}>{app.app_category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        <View style={styles.usageCard}>
          <Text style={styles.cardTitle}>Today's Usage</Text>
          <View style={styles.usageRow}>
            <View>
              <Text style={styles.usageBigValue}>{formatMinutes(todayUsage)}</Text>
              <Text style={styles.usageLimitText}>of {formatMinutes(app.limit_minutes)} intended</Text>
            </View>
            <View style={styles.usageRight}>
              {status === 'within' || status === 'warning' ? (
                <>
                  <Text style={[styles.remainingValue, { color: statusColor }]}>{formatMinutes(remaining)}</Text>
                  <Text style={styles.remainingLabel}>remaining</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.remainingValue, { color: statusColor }]}>{formatMinutes(todayUsage - app.limit_minutes)}</Text>
                  <Text style={styles.remainingLabel}>over limit</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: statusColor }]} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Usage History</Text>
          <BarChart data={history} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Limit Settings</Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Intended Duration</Text>
              <Text style={styles.settingValue}>{formatMinutes(app.limit_minutes)}</Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => router.push(`/set-limit?pkg=${encodeURIComponent(packageName)}`)}
            >
              <Text style={styles.editButtonText}>Edit Limit</Text>
            </Pressable>
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Monitoring</Text>
              <Text style={styles.settingValue}>{app.enabled ? 'Active' : 'Paused'}</Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={async () => {
                await updateMonitoredApp(packageName, { enabled: !app.enabled });
                loadData();
              }}
            >
              <Text style={styles.editButtonText}>{app.enabled ? 'Pause' : 'Resume'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Simulate Usage</Text>
          <Text style={styles.cardHint}>
            Record a usage session to test monitoring, alerts, and blocking.
          </Text>
          <View style={styles.simulateRow}>
            {[5, 10, 15, 30].map(m => (
              <Pressable
                key={m}
                style={[styles.simButton, simulating && styles.simButtonDisabled]}
                onPress={() => handleSimulateUsage(m)}
                disabled={simulating}
              >
                <Play size={14} color={colors.primary.contrast} strokeWidth={2} />
                <Text style={styles.simButtonText}>+{m}m</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {status === 'reached' || status === 'exceeded' ? (
          <Pressable
            style={styles.blockButton}
            onPress={() => router.push(`/block?pkg=${encodeURIComponent(packageName)}`)}
          >
            <Shield size={18} color={colors.error.contrast} strokeWidth={2} />
            <Text style={styles.blockButtonText}>View Block Screen</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: colors.neutral.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[200],
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    loadingWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
    appHeaderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    appIconWrap: {
      width: 56,
      height: 56,
      borderRadius: Radius.md,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    appIcon: {
      fontSize: 28,
    },
    appInfo: {
      flex: 1,
    },
    appName: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
    },
    appCategory: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
    },
    statusText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: 10,
    },
    usageCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    cardTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
      marginBottom: Spacing.sm,
    },
    usageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    usageBigValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
    },
    usageLimitText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    usageRight: {
      alignItems: 'flex-end',
    },
    remainingValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
    },
    remainingLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
    progressTrack: {
      height: 8,
      backgroundColor: colors.neutral[200],
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: 8,
      borderRadius: Radius.full,
    },
    card: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    cardHint: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginBottom: Spacing.sm,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },
    settingLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
    },
    settingValue: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
      marginTop: 2,
    },
    editButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      backgroundColor: colors.primary.ultraLight,
    },
    editButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeXs,
      color: colors.primary.main,
    },
    simulateRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      flexWrap: 'wrap',
    },
    simButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.main,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      gap: 6,
    },
    simButtonDisabled: {
      opacity: 0.5,
    },
    simButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.contrast,
    },
    blockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.error.main,
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      gap: 8,
      marginBottom: Spacing.md,
    },
    blockButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.error.contrast,
    },
  });
}
