import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { getMonitoredApp, getTodayUsageForApp } from '@/lib/data';
import { formatMinutes } from '@/lib/utils';
import type { MonitoredApp } from '@/types/database';
import { AlertTriangle, Home, Clock } from 'lucide-react-native';

export default function BlockScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { pkg } = useLocalSearchParams<{ pkg: string }>();
  const packageName = decodeURIComponent(pkg || '');

  const [app, setApp] = useState<MonitoredApp | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [a, u] = await Promise.all([
          getMonitoredApp(packageName),
          getTodayUsageForApp(packageName),
        ]);
        setApp(a);
        setUsage(u);
      } catch (e) {
        console.error('Block screen load error:', e);
      }
    })();
  }, [packageName]);

  if (!app) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overBy = Math.max(usage - app.limit_minutes, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>Shadow Alert</Text>
        </View>

        <View style={styles.warningIconWrap}>
          <AlertTriangle size={48} color={colors.error.main} strokeWidth={2} fill={colors.error.ultraLight} />
        </View>

        <Text style={styles.blockTitle}>Time Limit Exceeded</Text>

        <View style={styles.appInfoCard}>
          <Text style={styles.appIcon}>{app.app_icon}</Text>
          <Text style={styles.appName}>{app.app_name}</Text>
        </View>

        <View style={styles.usageRow}>
          <View style={styles.usageItem}>
            <Text style={styles.usageLabel}>Intended</Text>
            <Text style={styles.usageValue}>{formatMinutes(app.limit_minutes)}</Text>
          </View>
          <View style={styles.usageDivider} />
          <View style={styles.usageItem}>
            <Text style={styles.usageLabel}>Actual</Text>
            <Text style={[styles.usageValue, { color: colors.error.main }]}>{formatMinutes(usage)}</Text>
          </View>
          {overBy > 0 && (
            <>
              <View style={styles.usageDivider} />
              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Over By</Text>
                <Text style={[styles.usageValue, { color: colors.error.main }]}>{formatMinutes(overBy)}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.message}>
          Your planned usage time is complete.{'\n'}
          Take a break and return later.
        </Text>

        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Home size={20} color={colors.primary.contrast} strokeWidth={2} />
          <Text style={styles.homeButtonText}>Go to Home Screen</Text>
        </Pressable>

        <View style={styles.intentionReminder}>
          <Clock size={14} color={colors.neutral[400]} strokeWidth={2} />
          <Text style={styles.intentionText}>Decide before you scroll. Use technology intentionally.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral.background,
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
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.xl,
    },
    logoWrap: {
      backgroundColor: colors.primary.main,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
      marginBottom: Spacing.xl,
    },
    logoText: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeMd,
      color: colors.primary.contrast,
      letterSpacing: 0.5,
    },
    warningIconWrap: {
      width: 96,
      height: 96,
      borderRadius: Radius.full,
      backgroundColor: colors.error.ultraLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    blockTitle: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    appInfoCard: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    appIcon: {
      fontSize: 48,
      marginBottom: Spacing.sm,
    },
    appName: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXl,
      color: colors.neutral[900],
    },
    usageRow: {
      flexDirection: 'row',
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    usageItem: {
      flex: 1,
      alignItems: 'center',
    },
    usageDivider: {
      width: 1,
      backgroundColor: colors.neutral[200],
    },
    usageLabel: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginBottom: 4,
    },
    usageValue: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
    },
    message: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: Spacing.xl,
    },
    homeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary.main,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: Radius.full,
      gap: 8,
    },
    homeButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.primary.contrast,
    },
    intentionReminder: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: Spacing.xl,
    },
    intentionText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[400],
      fontStyle: 'italic',
    },
  });
}
