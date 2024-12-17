import { Stack } from 'expo-router';
import { Colors } from '@/theme';

export default function CreateLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: 'modal',
            }}
        />
    );
}
