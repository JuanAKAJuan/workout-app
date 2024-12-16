import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { StatusBar } from 'react-native';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={DarkTheme}>
                <StatusBar backgroundColor={Colors.surface} barStyle="light-content" />
                <Tabs
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            const iconName: keyof typeof Ionicons.glyphMap = (() => {
                                switch (route.name) {
                                    case 'index':
                                        return focused ? 'home' : 'home-outline';
                                    case 'ExercisesScreen':
                                        return focused ? 'barbell' : 'barbell-outline';
                                    case 'SettingsScreen':
                                        return focused ? 'settings' : 'settings-outline';
                                    default:
                                        return 'help-circle';
                                }
                            })();

                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        headerStyle: {
                            backgroundColor: Colors.surface,
                        },
                        headerTintColor: Colors.text.primary,
                        tabBarStyle: {
                            backgroundColor: Colors.surface,
                            height: 55,
                        },
                        tabBarActiveTintColor: Colors.primary,
                        tabBarInactiveTintColor: 'gray',
                    })}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                        }}
                    />
                    <Tabs.Screen
                        name="ExercisesScreen"
                        options={{
                            title: 'Exercises',
                        }}
                    />
                    <Tabs.Screen
                        name="SettingsScreen"
                        options={{
                            title: 'Settings',
                        }}
                    />
                    <Tabs.Screen
                        name="AddExercisePage"
                        options={{
                            title: 'Add Exercise',
                            href: null, // Don't want to see this in the tab bar
                        }}
                    />
                </Tabs>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
