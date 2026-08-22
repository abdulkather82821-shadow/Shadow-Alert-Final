import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';
import { APP_CATALOG } from '@/lib/appCatalog';
import { addMonitoredApp, updateMonitoredApp, getMonitoredApp, getTodayUsageForApp } from '@/lib/data';
import { formatMinutes } from '@/lib/utils';
import { ArrowLeft, Save, Clock } from 'lucide-react-native';

const PRESET_MINUTES = [15, 30, 45, 60, 90, 120];

export default function SetLimitScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { pkg } = useLocalSearchParams<{ pkg: string }>();
  const packageName = decodeURIComponent(pkg || '');

  const catalogApp = APP_CATALOG.find(a => a.package_name === packageName);
  const [limitMinutes, setLimitMinutes] = useState('30');
  const [currentUsage, setCurrentUsage] = useState(0);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const existing = await getMonitoredApp(packageName);
        if (existing) {
          setExistingApp(existing);
          setLimitMinutes(String(existing.limit_minutes));
        }
        const usage = await getTodayUsageForApp(packageName);
        setCurrentUsage(usage);
      } catch (e) {
        console.error('SetLimit load error:', e);
      }
    })();
  }, [packageName]);

  const appName = existingApp?.app_name || catalogApp?.app_name || 'Unknown App';
  const appIcon = existingApp?.app_icon || catalogApp?.app_icon || '📱';
  const appCategory = existingApp?.app_category || catalogApp?.app_category || 'Other';

  const handleSave = async () => {
    const minutes = parseInt(limitMinutes, 10);
    if (!minutes || minutes <= 0) {
      Alert.alert('Invalid Limit', 'Please enter a valid number of minutes (at least 1).');
      return;
    }
    setSaving(true);
    try {
      if (existingApp) {
        await updateMonitoredApp(packageName, { limit_minutes: minutes, enabled: true });
      } else {
        await addMonitoredApp({
          package_name: packageName,
          app_name: appName,
          app_icon: appIcon,
          app_category: appCategory,
          limit_minutes: minutes,
          enabled: true,
        });
      }
      router.back();
    } catch (e) {
      console.error('Save limit error:', e);
      Alert.alert('Error', 'Failed to save the limit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={colors.neutral[700]} strokeWidth={2} />
        </Pressable>
        <Text style={styles.topBarTitle}>Set Time Limit</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.appInfoCard}>
          <View style={styles.appIconWrap}>
            <Text style={styles.appIcon}>{appIcon}</Text>
          </View>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.appCategory}>{appCategory}</Text>
          {currentUsage > 0 && (
            <View style={styles.currentUsageWrap}>
              <Clock size={14} color={colors.neutral[500]} strokeWidth={2} />
              <Text style={styles.currentUsageText}>
                Used today: {formatMinutes(currentUsage)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Intended Usage Duration</Text>
          <Text style={styles.inputHint}>How long do you plan to use this app?</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.minuteInput}
              value={limitMinutes}
              onChangeText={setLimitMinutes}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={colors.neutral[400]}
              maxLength={4}
            />
            <Text style={styles.minuteLabel}>minutes</Text>
          </View>

          <View style={styles.presetsWrap}>
            {PRESET_MINUTES.map(m => (
              <Pressable
                key={m}
                style={[
                  styles.presetChip,
                  limitMinutes === String(m) && styles.presetChipActive,
                ]}
                onPress={() => setLimitMinutes(String(m))}
              >
                <Text style={[
                  styles.presetText,
                  limitMinutes === String(m) && styles.presetTextActive,
                ]}>
                  {m}m
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.intentionCard}>
          <Text style={styles.intentionIcon}>💡</Text>
          <Text style={styles.intentionTitle}>Use With Intention</Text>
          <Text style={styles.intentionText}>
            Shadow Alert will monitor your usage and alert you when you reach this limit. You'll be guided to take a break and step away.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={18} color={colors.primary.contrast} strokeWidth={2} />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : existingApp ? 'Update Limit' : 'Save Limit'}
            </Text>
          </Pressable>
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
    appInfoCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    appIconWrap: {
      width: 72,
      height: 72,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary.ultraLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    appIcon: {
      fontSize: 36,
    },
    appName: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXl,
      color: colors.neutral[900],
    },
    appCategory: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    currentUsageWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      gap: 4,
    },
    currentUsageText: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
    },
    inputCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    inputLabel: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[900],
    },
    inputHint: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      marginTop: 2,
      marginBottom: Spacing.md,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    minuteInput: {
      flex: 1,
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeXxl,
      color: colors.neutral[900],
      borderWidth: 2,
      borderColor: colors.primary.main,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      textAlign: 'center',
    },
    minuteLabel: {
      fontFamily: Typography.fontFamilyMedium,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[500],
    },
    presetsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    presetChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.full,
      backgroundColor: colors.neutral[100],
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    presetChipActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },
    presetText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[600],
    },
    presetTextActive: {
      color: colors.primary.contrast,
    },
    intentionCard: {
      backgroundColor: colors.primary.ultraLight,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    intentionIcon: {
      fontSize: 24,
      marginBottom: Spacing.xs,
    },
    intentionTitle: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.primary.dark,
      marginBottom: Spacing.xs,
    },
    intentionText: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.primary[800],
      lineHeight: 20,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: colors.neutral[300],
      alignItems: 'center',
    },
    cancelButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.neutral[600],
    },
    saveButton: {
      flex: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radius.md,
      backgroundColor: colors.primary.main,
      gap: 8,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeMd,
      color: colors.primary.contrast,
    },
  });
}
