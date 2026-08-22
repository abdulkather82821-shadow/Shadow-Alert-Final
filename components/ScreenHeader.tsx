import { View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.md,
      backgroundColor: colors.neutral.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleWrap: {
      flex: 1,
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
  });
}
