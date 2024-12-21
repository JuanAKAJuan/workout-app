import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { Colors, Spacing, Typography } from '@/theme';
import { db } from '@/database';
import { WorkoutTemplate } from '@/database/types';

export default function Home() {
    const router = useRouter();
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTemplates();
        }, [])
    );

    const loadTemplates = async () => {
        try {
            const data = await db.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const startWorkout = async (templateId: number) => {
        try {
            const workoutId = await db.startWorkoutFromTemplate(templateId);

            // Using just /workout since that's how Expo Router will expose the route
            router.push({
                pathname: '/workout',
                params: { id: workoutId.toString() },
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to start workout');
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTemplates();
        setRefreshing(false);
    }, []);

    const renderTemplate = ({ item }: { item: WorkoutTemplate }) => (
        <TouchableOpacity style={styles.templateCard} onPress={() => startWorkout(item.id)}>
            <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{item.name}</Text>
            </View>
            <Ionicons naem="play-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={templates}
                renderItem={renderTemplate}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No workout templates yet</Text>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/(create)/template')}>
                <Ionicons name="add" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    listContent: {
        padding: Spacing.md,
    },

    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: 8,
        marginBottom: Spacing.md,
    },

    templateInfo: {
        flex: 1,
    },

    templateName: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },

    templateDescription: {
        fontSize: Typography.sizes.sm,
        color: Colors.text.secondary,
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
});
