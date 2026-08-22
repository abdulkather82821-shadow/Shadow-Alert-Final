import { View, StyleSheet, Text } from 'react-native';
import { Spacing, Radius, Typography, type ThemeColors } from '@/lib/theme';
import { useTheme } from '@/components/ThemeProvider';

type Props = {
  icon: string;
  title: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, message, action }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {action}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.xxl,
      paddingHorizontal: Spacing.lg,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: Radius.full,
      backgroundColor: colors.primary.ultraLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    icon: {
      fontSize: 32,
    },
    title: {
      fontFamily: Typography.fontFamilySemiBold,
      fontSize: Typography.fontSizeLg,
      color: colors.neutral[900],
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    message: {
      fontFamily: Typography.fontFamilyRegular,
      fontSize: Typography.fontSizeSm,
      color: colors.neutral[500],
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: Spacing.lg,
    },
  });
}
