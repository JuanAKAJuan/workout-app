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
    Modal,
    FlatList,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { db } from '../database';
import { NewExercise } from '../database/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MUSCLE_GROUPS = [
    'Chest',
    'Back',
    'Triceps',
    'Biceps',
    'Shoulders',
    'Quads',
    'Glutes',
    'Hamstrings',
    'Calves',
    'Traps',
    'Forearms',
    'Abs',
];

export default function AddExercisePage() {
    const router = useRouter();

    const [exercise, setExercise] = useState<NewExercise>({
        name: '',
        muscleGroup: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showMuscleGroupModal, setShowMuscleGroupModal] = useState<boolean>(false);

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
                    onPress: () => router.navigate('/ExercisesScreen'),
                },
            ]);
            setExercise({ name: '', muscleGroup: '' });
        } catch (error) {
            Alert.alert('Error', 'Failed to add exercise');
            console.error('Error adding exercise:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectMuscleGroup = (muscleGroup: string) => {
        setExercise((prev) => ({ ...prev, muscleGroup }));
        setShowMuscleGroupModal(false);
    };

    const renderMuscleGroupItem = ({ item }: { item: string }) => (
        <TouchableOpacity style={styles.muscleGroupItem} onPress={() => selectMuscleGroup(item)}>
            <Text style={styles.muscleGroupText}>{item}</Text>
            {exercise.muscleGroup === item && <Ionicons name="checkmark" size={24} color={Colors.primary} />}
        </TouchableOpacity>
    );

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
                        <TouchableOpacity
                            style={styles.muscleGroupSelector}
                            onPress={() => setShowMuscleGroupModal(true)}
                        >
                            <Text style={[styles.muscleGroupSelectorText, !exercise.muscleGroup && styles.placeholder]}>
                                {exercise.muscleGroup || 'Select Muscle Group'}
                            </Text>
                            <View style={styles.muscleGroupIcon}>
                                <Ionicons name="chevron-down" size={24} color={Colors.text.secondary} />
                            </View>
                        </TouchableOpacity>
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

            <Modal
                visible={showMuscleGroupModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMuscleGroupModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Muscle Group</Text>
                            <TouchableOpacity onPress={() => setShowMuscleGroupModal(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={MUSCLE_GROUPS}
                            renderItem={renderMuscleGroupItem}
                            keyExtractor={(item) => item}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </View>
            </Modal>
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

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '70%',
    },

    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },

    modalTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },

    closeButton: {
        padding: Spacing.sm,
    },

    muscleGroupItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },

    muscleGroupText: {
        fontSize: Typography.sizes.md,
        color: Colors.text.primary,
    },

    muscleGroupSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.input.border,
        borderRadius: 8,
        paddingLeft: Spacing.md,
        paddingRight: 0,
        backgroundColor: Colors.input.background,
    },

    muscleGroupIcon: {
        padding: Spacing.md,
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderLeftColor: Colors.input.border,
    },

    muscleGroupSelectorText: {
        fontSize: Typography.sizes.md,
        color: Colors.text.primary,
        paddingVertical: 0,
    },

    placeholder: {
        color: Colors.input.placeholder,
    },

    separator: {
        height: 1,
        backgroundColor: Colors.border,
    },
});
