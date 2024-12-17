import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { Colors } from '@/theme';

const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: Colors.primary,
        background: Colors.background,
        card: Colors.card,
        text: Colors.text.primary,
        border: Colors.border,
    },
    dark: true,
};

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
            <ThemeProvider value={DarkTheme}>
                <StatusBar backgroundColor={Colors.surface} barStyle="light-content" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'none',
                        contentStyle: { backgroundColor: Colors.background },
                        navigationBarColor: Colors.background,
                    }}
                >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(create)" options={{ presentation: 'modal', headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
