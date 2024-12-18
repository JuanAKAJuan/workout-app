import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { db } from '@/database';
import { Exercise } from '@/database/types';
import { Colors, Spacing, Typography } from '@/theme';

export default function Exercises() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const scrollRef = useRef(null);

    const loadExercises = async () => {
        try {
            const data = await db.getExercises();
            setExercises(data);
        } catch (error) {
            console.error('Yikes. Error loading exercises:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteExercise = async (id: number) => {
        try {
            await db.deleteExercise(id);
            setExercises(exercises.filter((exercise) => exercise.id !== id));
        } catch (error) {
            console.error('Yikes. Error deleting exercise:', error);
            Alert.alert('Error', 'Failed to delete exercise');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Delete Exercise', 'Are you really trying to delete this exercise guy?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteExercise(id) },
        ]);
    };

    const renderRightActions = (id: number) => {
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(id)}>
                <Ionicons name="trash" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
        );
    };

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
            friction={2}
            rightThreshold={60}
            simultaneousHandlers={scrollRef}
        >
            <View style={styles.exerciseItem}>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.muscleGroup}>{item.muscleGroup}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
            </View>
        </Swipeable>
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadExercises();
        setRefreshing(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadExercises();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={scrollRef}
                data={exercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No exercises added yet</Text>
                    </View>
                )}
            />
            <Link href="/(create)/exercise" asChild>
                <TouchableOpacity style={styles.fab}>
                    <Ionicons name="add" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },

    listContent: {
        padding: Spacing.md,
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

    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },

    deleteAction: {
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 8,
    },
});
