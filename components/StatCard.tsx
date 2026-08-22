import { View, StyleSheet, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  label: string;
  value: string;
  subtext?: string;
  icon?: string;
  accentColor?: string;
};

export function StatCard({ label, value, subtext, icon, accentColor }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const color = accentColor || colors.primary.main;
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.neutral.surface,
      borderRadius: Radius.md,
      padding: Spacing.md,
      flex: 1,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      borderLeftWidth: 3,
    },
    icon: {
      fontSize: 20,
      marginBottom: Spacing.xs,
    },
    label: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[500],
      marginBottom: 4,
    },
    value: {
      fontFamily: Typography.fontFamilyBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
    },
    subtext: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeXs,
      color: colors.neutral[400],
      marginTop: 2,
    },
  });
}
