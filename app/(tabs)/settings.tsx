import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { clearAllUsageData, resetAllLimits } from '@/lib/data';
import { Bell, Shield, Trash2, Info, ChevronRight, Moon, Eye, Heart } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Usage History',
      'Are you sure you want to clear all usage history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllUsageData();
              Alert.alert('Success', 'Usage history has been cleared.');
            } catch (e) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const handleResetLimits = () => {
    Alert.alert(
      'Reset All Limits',
      'This will remove all monitored apps and their limits. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllLimits();
              Alert.alert('Success', 'All limits have been reset.');
            } catch (e) {
              Alert.alert('Error', 'Failed to reset limits.');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your Shadow Alert experience</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.neutral[100] }]}>
                <Moon size={18} color={colors.neutral[700]} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDesc}>{mode === 'dark' ? 'Dark theme is active' : 'Light theme is active'}</Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.neutral[300], true: colors.primary.main }}
              thumbColor={colors.neutral.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.warning.ultraLight }]}>
                <Bell size={18} color={colors.warning.dark} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Limit Alerts</Text>
                <Text style={styles.settingDesc}>Get notified when limits are reached</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.neutral[300], true: colors.primary.main }}
              thumbColor={colors.neutral.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Monitoring</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary.ultraLight }]}>
                <Shield size={18} color={colors.primary.dark} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Usage Monitoring</Text>
                <Text style={styles.settingDesc}>Track app usage in real time</Text>
              </View>
            </View>
            <Switch
              value={monitoringEnabled}
              onValueChange={setMonitoringEnabled}
              trackColor={{ false: colors.neutral[300], true: colors.primary.main }}
              thumbColor={colors.neutral.surface}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Data Management</Text>
        <View style={styles.card}>
          <Pressable style={styles.settingRow} onPress={handleClearHistory}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.error.ultraLight }]}>
                <Trash2 size={18} color={colors.error.main} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Clear Usage History</Text>
                <Text style={styles.settingDesc}>Delete all recorded usage data</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.neutral[400]} strokeWidth={2} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingRow} onPress={handleResetLimits}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.error.ultraLight }]}>
                <Trash2 size={18} color={colors.error.main} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Reset All Limits</Text>
                <Text style={styles.settingDesc}>Remove all monitored apps</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.neutral[400]} strokeWidth={2} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Pressable style={styles.settingRow} onPress={() => setShowAbout(!showAbout)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary.ultraLight }]}>
                <Info size={18} color={colors.primary.dark} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>About Shadow Alert</Text>
                <Text style={styles.settingDesc}>Learn about the app</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.neutral[400]} strokeWidth={2} style={{ transform: [{ rotate: showAbout ? '90deg' : '0deg' }] }} />
          </Pressable>
          {showAbout && (
            <View style={styles.expandedContent}>
              <Text style={styles.aboutText}>
                Shadow Alert is an intent-based smart screen-time control application. It helps you control excessive usage of selected mobile applications by allowing you to define your intended usage duration before accessing an application.
              </Text>
              <Text style={styles.aboutTagline}>"Use with Intention. Live with Balance."</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>
          )}
          <View style={styles.divider} />
          <Pressable style={styles.settingRow} onPress={() => setShowPrivacy(!showPrivacy)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.success.ultraLight }]}>
                <Eye size={18} color={colors.success.dark} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Privacy Information</Text>
                <Text style={styles.settingDesc}>How your data is handled</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.neutral[400]} strokeWidth={2} style={{ transform: [{ rotate: showPrivacy ? '90deg' : '0deg' }] }} />
          </Pressable>
          {showPrivacy && (
            <View style={styles.expandedContent}>
              <Text style={styles.aboutText}>
                Shadow Alert prioritizes your privacy. All usage information stays on your device. We do not send your application usage history, installed application list, personal usage information, analytics, or behavioral data to any external server.
              </Text>
              <View style={styles.privacyItem}>
                <Heart size={14} color={colors.success.main} strokeWidth={2} />
                <Text style={styles.privacyText}>Local-only data processing</Text>
              </View>
              <View style={styles.privacyItem}>
                <Heart size={14} color={colors.success.main} strokeWidth={2} />
                <Text style={styles.privacyText}>No cloud synchronization</Text>
              </View>
              <View style={styles.privacyItem}>
                <Heart size={14} color={colors.success.main} strokeWidth={2} />
                <Text style={styles.privacyText}>No tracking or analytics sent out</Text>
              </View>
            </View>
          )}
        </View>
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
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: Spacing.md,
      paddingBottom: Spacing.xxl,
    },
    sectionLabel: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },
    card: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.md,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: Spacing.md,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    settingDesc: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.neutral[100],
      marginLeft: Spacing.lg * 2 + Spacing.md,
    },
    expandedContent: {
      padding: Spacing.md,
      paddingTop: 0,
    },
    aboutText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[600],
      lineHeight: 20,
    },
    aboutTagline: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.primary.dark,
      marginTop: Spacing.sm,
      fontStyle: 'italic',
    },
    aboutVersion: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[400],
      marginTop: Spacing.xs,
    },
    privacyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: Spacing.sm,
    },
    privacyText: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[700],
    },
  });
}
