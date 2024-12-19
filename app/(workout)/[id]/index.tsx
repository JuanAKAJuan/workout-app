import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutPage() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Workout {id}</Text>
        </View>
    );
}
