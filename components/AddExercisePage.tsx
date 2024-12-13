import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { db } from '../database/database';
import { NewExercise } from '../database/types';

export const AddExercisePage = ({ navigation }: { navigation: any }) => {
    const [exercise, setExercise] = useState<NewExercise>({
        name: '',
        category: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!exercise.name.trim()) {
            Alert.alert('Error', 'Exercise name is required');
            return;
        }

        if (!exercise.category.trim()) {
            Alert.alert('Error', 'Category is required');
            return;
        }

        try {
            setIsSubmitting(true);
            await db.addExercise(exercise);
            Alert.alert('Success', 'Exercise added successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        navigation.goBack();
                        // Could also navigate to the exercise list:
                        // ex) navigation.navigate('ExerciseList');
                    },
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to add exercise');
            console.error('Error adding exercise:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        ></KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '',
    },
});
