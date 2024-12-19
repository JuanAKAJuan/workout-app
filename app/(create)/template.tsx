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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database';
import { Exercise, NewTemplateExercise } from '@/database';
import { Colors, Spacing, Typography } from '@/theme';

interface TemplateExerciseItem extends Exercise {
    setCount: number;
    targetReps: number;
    targetWeight: number | null;
}

export default function CreateTemplate() {
    const router = useRouter();
    const [name, setName] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<TemplateExerciseItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleAddExercise = async () => {
        try {
            router.push('../components/modals/ExerciseSelectionModal');
        } catch (error) {
            console.error('Error navigating to exercise selection', error);
        }
    };

    const updateExerciseDetails = (index: number, updates: Partial<TemplateExerciseItem>) => {};
}
