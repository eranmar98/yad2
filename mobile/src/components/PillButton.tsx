import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type PillButtonProps = {
  children: string;
  variant?: 'primary' | 'secondary' | 'inverse';
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
} & Omit<PressableProps, 'onPress' | 'disabled' | 'children'>;

const GRADIENT = ['#152A4E', '#0ea5e9', '#22406F'] as const;

export default function PillButton({
  children,
  variant = 'primary',
  onPress,
  className = '',
  disabled = false,
  loading = false,
  ...rest
}: PillButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`overflow-hidden rounded-pill active:opacity-80 ${isDisabled ? 'opacity-50' : ''} ${className}`}
        {...rest}
      >
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center justify-center gap-2 px-6 py-3.5"
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text className="font-sans text-base font-medium text-white">{children}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const variantClasses =
    variant === 'secondary'
      ? 'border-2 border-navy bg-white active:bg-navy/5'
      : 'bg-white active:bg-white/90';
  const textClasses = variant === 'secondary' ? 'text-navy' : 'text-navy';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-pill px-6 py-3.5 ${variantClasses} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      {loading && <ActivityIndicator color="#152A4E" size="small" />}
      <Text className={`font-sans text-base font-medium ${textClasses}`}>{children}</Text>
    </Pressable>
  );
}
