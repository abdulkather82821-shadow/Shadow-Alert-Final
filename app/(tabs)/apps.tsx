import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { APP_CATALOG, APP_CATEGORIES } from '@/lib/appCatalog';
import { getMonitoredApps } from '@/lib/data';
import type { MonitoredApp } from '@/types/database';
import { Search, Check, Plus } from 'lucide-react-native';

export default function AppsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [monitored, setMonitored] = useState<Map<string, MonitoredApp>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMonitored = useCallback(async () => {
    try {
      const apps = await getMonitoredApps();
      const map = new Map<string, MonitoredApp>();
      for (const a of apps) map.set(a.package_name, a);
      setMonitored(map);
    } catch (e) {
      console.error('Apps load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMonitored();
  }, [loadMonitored]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMonitored();
  }, [loadMonitored]);

  const filteredApps = useMemo(() => {
    let result = APP_CATALOG;
    if (activeCategory) {
      result = result.filter(a => a.app_category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(a =>
        a.app_name.toLowerCase().includes(q) ||
        a.app_category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>Search and select apps to monitor</Text>
      </View>

      <View style={styles.searchWrap}>
        <Search size={18} color={colors.neutral[400]} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          placeholderTextColor={colors.neutral[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <Pressable
          style={[styles.categoryChip, activeCategory === null && styles.categoryChipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[styles.categoryChipText, activeCategory === null && styles.categoryChipTextActive]}>All</Text>
        </Pressable>
        {APP_CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Loading apps...</Text>
          </View>
        ) : filteredApps.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No apps found matching your search.</Text>
          </View>
        ) : (
          filteredApps.map(app => {
            const isMonitored = monitored.has(app.package_name);
            return (
              <Pressable
                key={app.package_name}
                style={({ pressed }) => [styles.appRow, pressed && styles.appRowPressed]}
                onPress={() => {
                  if (isMonitored) {
                    router.push(`/app-details?pkg=${encodeURIComponent(app.package_name)}`);
                  } else {
                    router.push(`/set-limit?pkg=${encodeURIComponent(app.package_name)}`);
                  }
                }}
              >
                <View style={styles.appIconWrap}>
                  <Text style={styles.appIcon}>{app.app_icon}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.app_name}</Text>
                  <Text style={styles.appCategory}>{app.app_category}</Text>
                </View>
                {isMonitored ? (
                  <View style={styles.monitoredBadge}>
                    <Check size={14} color={colors.success.main} strokeWidth={2.5} />
                    <Text style={styles.monitoredText}>
                      {monitored.get(app.package_name)?.limit_minutes}m limit
                    </Text>
                  </View>
                ) : (
                  <View style={styles.addBadge}>
                    <Plus size={14} color={colors.primary.main} strokeWidth={2.5} />
                    <Text style={styles.addText}>Set Limit</Text>
                  </View>
                )}
              </Pressable>
            );
          })
        )}
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
    header: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    title: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
    },
    subtitle: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      gap: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
      paddingVertical: Spacing.md,
    },
    categoryScroll: {
      maxHeight: 44,
      marginBottom: Spacing.sm,
    },
    categoryContent: {
      paddingHorizontal: Spacing.md,
      gap: Spacing.xs,
    },
    categoryChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.neutral.surface,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    categoryChipActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },
    categoryChipText: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[600],
    },
    categoryChipTextActive: {
      color: colors.primary.contrast,
    },
    listScroll: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    appRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    appRowPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    appIconWrap: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      backgroundColor: colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    appIcon: {
      fontSize: 22,
    },
    appInfo: {
      flex: 1,
    },
    appName: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    appCategory: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
    monitoredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.success.ultraLight,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      gap: 4,
    },
    monitoredText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeXs,
      color: colors.success.dark,
    },
    addBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary.ultraLight,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      gap: 4,
    },
    addText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeXs,
      color: colors.primary.main,
    },
    loadingWrap: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
    emptyWrap: {
      paddingVertical: Spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[400],
    },
  });
}
