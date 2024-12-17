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
    FlatList,
    TouchableNativeFeedbackBase,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/theme';
import { db } from '@/database';
import { Exercise, NewWorkout, NewWorkoutExercise } from '@/database/types';
import { Ionicons } from '@expo/vector-icons';
import ExerciseSelectionModal from '../components/modals/ExerciseSelectionModal';

interface WorkoutExerciseInput extends Exercise {
    sets: string;
    reps: string;
    weight: string;
}

export default function CreateWorkout() {
    const router = useRouter();
    const [workoutName, setWorkoutName] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<WorkoutExerciseInput[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const handleAddExercise = async () => {
        setModalVisible(true);
    };

    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercises((prev) => [
            ...prev,
            {
                ...exercise,
                sets: '',
                reps: '',
                weight: '',
            },
        ]);
    };

    const handleRemoveExercise = (index: number) => {
        setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!workoutName.trim()) {
            Alert.alert('Error', 'Workout name is required');
            return;
        }

        if (selectedExercises.length === 0) {
            Alert.alert('Error', 'Please add at least one exercise');
            return;
        }

        const isValid = selectedExercises.every(
            (exercise) => exercise.sets.trim() && exercise.reps.trim() && exercise.weight.trim()
        );

        if (!isValid) {
            Alert.alert('Error', 'Please fill in all exercise details');
            return;
        }

        try {
            setIsSubmitting(true);

            const workout: NewWorkout = {
                name: workoutName,
                date: new Date().toISOString(),
                duration: 0,
            };

            const workoutId = await db.addWorkout(workout);

            for (const exercise of selectedExercises) {
                const workoutExercise: NewWorkoutExercise = {
                    workoutId,
                    exerciseId: exercise.id,
                    sets: parseInt(exercise.sets),
                    reps: parseInt(exercise.reps),
                    weight: parseFloat(exercise.weight),
                };
                await db.addExerciseToWorkout(workoutExercise);
            }

            Alert.alert('Success', 'Workout created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error creating workout:', error);
            Alert.alert('Error', 'Failed to create workout');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create New Workout</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Workout Name</Text>
                        <TextInput
                            style={styles.input}
                            value={workoutName}
                            onChangeText={setWorkoutName}
                            placeholder="e.g., Monday Upper Body"
                            placeholderTextColor={Colors.input.placeholder}
                        />
                    </View>

                    <View style={styles.exerciseSection}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        {selectedExercises.map((exercise, index) => (
                            <View key={`${exercise.id}-${index}`} style={styles.exerciseItem}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveExercise(index)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.muscleGroup}>{exercise.muscleGroup}</Text>
                                <View style={styles.exerciseInputs}>
                                    <View style={styles.inputColumn}>
                                        <Text style={styles.inputLabel}>Sets</Text>
                                        <TextInput
                                            style={styles.numberInput}
                                            value={exercise.sets}
                                            onChangeText={(text) => {
                                                const newExercises = [...selectedExercises];
                                                newExercises[index].sets = text;
                                                setSelectedExercises(newExercises);
                                            }}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={Colors.input.placeholder}
                                        />
                                    </View>
                                    <View style={styles.inputColumn}>
                                        <Text style={styles.inputLabel}>Reps</Text>
                                        <TextInput
                                            style={styles.numberInput}
                                            value={exercise.reps}
                                            onChangeText={(text) => {
                                                const newExercises = [...selectedExercises];
                                                newExercises[index].reps = text;
                                                setSelectedExercises(newExercises);
                                            }}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={Colors.input.placeholder}
                                        />
                                    </View>
                                    <View style={styles.inputColumn}>
                                        <Text style={styles.inputLabel}>Weight</Text>
                                        <TextInput
                                            style={styles.numberInput}
                                            value={exercise.weight}
                                            onChangeText={(text) => {
                                                const newExercises = [...selectedExercises];
                                                newExercises[index].weight = text;
                                                setSelectedExercises(newExercises);
                                            }}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={Colors.input.placeholder}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
                            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.addExerciseText}>Add Exercise</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Create Workout'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ExerciseSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleSelectExercise}
            />
        </KeyboardAvoidingView>
    );
}

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

    exerciseSection: {
        marginTop: Spacing.lg,
    },

    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.md,
        color: Colors.text.primary,
    },

    exerciseItem: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },

    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },

    exerciseName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        flex: 1,
    },

    muscleGroup: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
    },

    removeButton: {
        padding: Spacing.xs,
    },

    exerciseInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    inputColumn: {
        flex: 1,
        marginHorizontal: Spacing.xs,
    },

    inputLabel: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },

    numberInput: {
        borderWidth: 1,
        borderColor: Colors.input.border,
        borderRadius: 8,
        padding: Spacing.md,
        fontSize: Typography.sizes.md,
        backgroundColor: Colors.input.background,
        color: Colors.text.primary,
        textAlign: 'center',
    },

    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        marginTop: Spacing.md,
    },

    addExerciseText: {
        color: Colors.primary,
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        marginLeft: Spacing.sm,
    },

    button: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 8,
        marginTop: Spacing.xl,
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
