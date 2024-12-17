import { Colors, Spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { View, Text, Touchable, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Home() {
    return (
        <Link href="/(create)/workout" asChild>
            <TouchableOpacity>
                <Ionicons name="add" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
        </Link>
    );
}
