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
import { Colors, Spacing, Typography } from '../theme';
import { db } from '../database/database';
import { NewExercise } from '../database/types';
import { useRouter } from 'expo-router';

export const AddExercisePage = () => {
    const router = useRouter();

    const [exercise, setExercise] = useState<NewExercise>({
        name: '',
        muscleGroup: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!exercise.name.trim()) {
            Alert.alert('Error', 'Exercise name is required');
            return;
        }

        if (!exercise.muscleGroup.trim()) {
            Alert.alert('Error', 'Muscle Group is required');
            return;
        }

        try {
            setIsSubmitting(true);
            await db.addExercise(exercise);
            Alert.alert('Success', 'Exercise added successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Add New Exercise</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Exercise Name</Text>
                        <TextInput
                            style={styles.input}
                            value={exercise.name}
                            onChangeText={(text) => setExercise({ ...exercise, name: text })}
                            placeholder="e.g., Bench Press"
                            placeholderTextColor={Colors.input.placeholder}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Muscle Group</Text>
                        <TextInput
                            style={styles.input}
                            value={exercise.muscleGroup}
                            onChangeText={(text) => setExercise({ ...exercise, muscleGroup: text })}
                            placeholder="e.g., Chest"
                            placeholderTextColor={Colors.input.placeholder}
                            maxLength={30}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>{isSubmitting ? 'Adding...' : 'Add Exercise'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollContainer: {
        flexGrow: 1,
    },

    formContainer: {
        padding: Spacing.lg,
    },

    title: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.lg,
        textAlign: 'center',
        color: Colors.text.primary,
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    label: {
        fontSize: Typography.sizes.md,
        marginBottom: Spacing.sm,
        fontWeight: Typography.weights.medium,
        color: Colors.text.primary,
    },

    input: {
        borderWidth: 1,
        borderColor: Colors.input.border,
        borderRadius: 8,
        padding: Spacing.md,
        fontSize: Typography.sizes.md,
        backgroundColor: Colors.input.background,
        color: Colors.text.primary,
    },

    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },

    button: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 8,
        marginTop: Spacing.sm,
    },

    buttonDisabled: {
        backgroundColor: Colors.text.disabled,
    },

    buttonText: {
        color: Colors.text.primary,
        textAlign: 'center',
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
});
