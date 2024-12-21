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
    ActivityIndicator,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { db } from '@/database';
import { Exercise } from '@/database';
import { Colors, Spacing, Typography } from '@/theme';
import ExerciseSelectionModal from '../components/modals/ExerciseSelectionModal';

export default function CreateTemplate() {
    const router = useRouter();
    const navigation = useNavigation();
    const [name, setName] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isExerciseModalVisible, setIsExerciseModalVisible] = useState<boolean>(false);

    const handleAddExercise = async () => {
        setIsExerciseModalVisible(true);
    };

    const handleExerciseSelect = (exercise: Exercise) => {
        setSelectedExercises((prev) => [...prev, exercise]);
        setIsExerciseModalVisible(false);
    };

    const removeExercise = (index: number) => {
        setSelectedExercises((exercises) => exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Template name is required');
            return;
        }

        if (selectedExercises.length === 0) {
            Alert.alert('Error', 'Please add at least one exercise');
            return;
        }

        try {
            setIsSubmitting(true);

            const templateId = await db.createTemplate({
                name: name.trim(),
            });

            for (let i = 0; i < selectedExercises.length; i++) {
                const exercise = selectedExercises[i];
                await db.addExerciseToTemplate({
                    templateId,
                    exerciseId: exercise.id,
                    setCount: 0,
                    targetReps: 0,
                    targetWeight: null,
                    order: i,
                });
            }

            Alert.alert('Success', 'Template created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)'),
                },
            ]);
        } catch (error) {
            console.error('Error creating template:', error);
            Alert.alert('Error', 'Failed to create template');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.title}>Create Workout Template</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Template Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Upper Body Day"
                            placeholderTextColor={Colors.input.placeholder}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.exercisesSection}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        {selectedExercises.map((exercise, index) => (
                            <View key={`${exercise.id}-${index}`} style={styles.exerciseItem}>
                                <View style={styles.exerciseContent}>
                                    <View>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeButton}>
                                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
                            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.addExerciseText}>Add Exercise</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.text.primary} />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Template</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <ExerciseSelectionModal
                visible={isExerciseModalVisible}
                onClose={() => setIsExerciseModalVisible(false)}
                onSelect={handleExerciseSelect}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollContent: {
        flexGrow: 1,
    },

    form: {
        padding: Spacing.lg,
    },

    title: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },

    inputGroup: {
        marginBottom: Spacing.lg,
    },

    label: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },

    input: {
        backgroundColor: Colors.input.background,
        borderColor: Colors.input.border,
        borderWidth: 1,
        borderRadius: 8,
        padding: Spacing.md,
        color: Colors.text.primary,
        fontSize: Typography.sizes.md,
    },

    exercisesSection: {
        marginTop: Spacing.lg,
    },

    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },

    exerciseItem: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },

    exerciseContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    exerciseName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
    },

    muscleGroup: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
    },

    removeButton: {
        padding: Spacing.xs,
    },

    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 8,
        borderStyle: 'dashed',
    },

    addExerciseText: {
        color: Colors.primary,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        marginLeft: Spacing.sm,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 8,
        marginTop: Spacing.xl,
    },

    submitButtonDisabled: {
        backgroundColor: Colors.text.disabled,
    },

    submitButtonText: {
        color: Colors.text.primary,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        textAlign: 'center',
    },
});
