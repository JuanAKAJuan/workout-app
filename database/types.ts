export interface Exercise {
    id: number;
    name: string;
    muscleGroup: string;
}
export type NewExercise = Omit<Exercise, 'id'>;

export interface Workout {
    id: number;
    name: string;
    date: string;
    duration: number;
}
export type NewWorkout = Omit<Workout, 'id'>;

export interface WorkoutExercise {
    id: number;
    workoutId: number;
    exerciseId: number;
    sets: number;
    reps: number;
    weight: number;
}
export type NewWorkoutExercise = Omit<WorkoutExercise, 'id'>;

export interface WorkoutTemplate {
    id: number;
    name: string;
}
export type NewWorkoutTemplate = Omit<WorkoutTemplate, 'id'>;

export interface TemplateExercise {
    id: number;
    templateId: number;
    exerciseId: number;
    setCount: number;
    targetReps: number;
    targetWeight: number | null;
    order: number;
}
export type NewTemplateExercise = Omit<TemplateExercise, 'id'>;
