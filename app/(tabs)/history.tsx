import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/theme';
import { db } from '@/database';
import { Workout, Exercise } from '@/database';

interface WorkoutWithExercises extends Workout {
    exercises?: (Exercise & { sets: number; reps: number; weight: number })[];
}

export default function History() {
    const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const loadWorkouts = async () => {
        try {
            const workoutData = await db.getWorkouts();
            const workoutsWithExercises = await Promise.all(
                workoutData.map(async (workout) => {
                    const exercises = await db.getWorkoutExercises(workout.id);
                    return {
                        ...workout,
                        exercises,
                    };
                })
            );
            setWorkouts(workoutsWithExercises);
        } catch (error) {
            console.error('Yikes. Error loading workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadWorkouts();
        setRefreshing(false);
    };

    useEffect(() => {
        loadWorkouts();
    }, []);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    const renderWorkoutItem = ({ item }: { item: WorkoutWithExercises }) => (
        <View style={styles.workoutItem}>
            <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{item.name}</Text>
                <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.workoutInfo}>
                <View style={styles.workoutStat}>
                    <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
                    <Text style={styles.workoutStatText}>{formatDuration(item.duration)}</Text>
                </View>
            </View>

            {item.exercises && item.exercises.length > 0 && (
                <View style={styles.exerciseList}>
                    {item.exercises.map((exercise, index) => (
                        <Text key={index} style={styles.exerciseItem}>
                            {exercise.name} - {exercise.sets}×{exercise.reps} @ {exercise.weight}lbs
                        </Text>
                    ))}
                </View>
            )}
        </View>
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
                data={workouts}
                renderItem={renderWorkoutItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No workouts recorded yet</Text>
                        <Text style={styles.emptySubText}>Start tracking your progress guy</Text>
                    </View>
                )}
            />
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

    workoutItem: {
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: 8,
    },

    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },

    workoutName: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.text.primary,
    },

    workoutDate: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
    },

    workoutInfo: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },

    workoutStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },

    workoutStatText: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
        marginLeft: Spacing.xs,
    },

    exerciseList: {
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },

    exerciseItem: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },

    separator: {
        height: Spacing.md,
    },

    emptyContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },

    emptyText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    emptySubText: {
        fontSize: Typography.sizes.md,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
});
