import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/theme';
import { Exercise } from '@/database/types';
import { db } from '@/database';

interface ExerciseSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSelectionModal({ visible, onClose, onSelect }: ExerciseSelectionModalProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        try {
            const data = await db.getExercises();
            setExercises(data);
        } catch (error) {
            console.error('Yikes. Error loading exercises', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExercises = exercises.filter(
        (exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.muscleGroup}>{item.muscleGroup}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Exercise</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.text.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search exercises..."
                            placeholderTextColor={Colors.text.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredExercises}
                            renderItem={renderExerciseItem}
                            keyExtractor={(item) => item.id.toString()}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        {searchQuery
                                            ? 'No exercises found matching your search'
                                            : 'No exercises available'}
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingTop: Spacing.lg,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },

    title: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },

    closeButton: {
        padding: Spacing.sm,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        margin: Spacing.lg,
        marginTop: 0,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
    },

    searchInput: {
        flex: 1,
        padding: Spacing.md,
        fontSize: Typography.sizes.md,
        color: Colors.text.primary,
    },

    loadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },

    listContent: {
        padding: Spacing.lg,
    },

    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: 8,
    },

    exerciseInfo: {
        flex: 1,
    },

    exerciseName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },

    muscleGroup: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
    },

    separator: {
        height: Spacing.md,
    },

    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },

    emptyText: {
        fontSize: Typography.sizes.md,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});
