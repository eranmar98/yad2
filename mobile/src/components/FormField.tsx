import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export default function FormField({
  label,
  value,
  onChange,
  secureTextEntry,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FormFieldProps) {
  return (
    <View className="flex flex-col gap-1">
      <Text className="text-right font-sans text-sm text-ink/70">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlign="right"
        className="rounded-lg border border-ink/15 bg-white px-4 py-3 font-sans text-base text-ink"
      />
    </View>
  );
}
