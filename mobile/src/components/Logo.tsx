import { Text } from 'react-native';

export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <Text className="font-display font-extrabold text-navy" style={{ fontSize: size }}>
      Pickit
    </Text>
  );
}
