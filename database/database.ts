import * as SQLite from 'expo-sqlite';
import { Exercise, NewExercise, Workout, NewWorkout, WorkoutExercise, NewWorkoutExercise } from './types';

class WorkoutDatabase {
    private db: SQLite.SQLiteDatabase;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            this.db = await SQLite.openDatabaseAsync('workout.db');

            // Set Write-Ahead Logging (WAL) mode for better performance
            await this.db.execAsync('PRAGMA journal_mode = WAL;');

            await this.setupTables();
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    private async setupTables(): Promise<void> {
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date TEXT NOT NULL,
                duration INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS workout_exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_id INTEGER NOT NULL,
                exercise_id INTEGER NOT NULL,
                sets INTEGER NOT NULL,
                reps INTEGER NOT NULL,
                weight REAL NOT NULL,
                FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
                FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
            );
        `);
    }

    /***********************
     * Exercise Operations *
     ***********************/
    public async addExercise(exercise: NewExercise): Promise<number> {
        const result = await this.db.runAsync('INSERT INTO exercises (name, category, instructions) VALUES (?, ?, ?)', [
            exercise.name,
            exercise.category,
        ]);
        return result.lastInsertRowId;
    }

    public async getExercise(id: number): Promise<Exercise | null> {
        return await this.db.getFirstAsync<Exercise>('SELECT * FROM exercises WHERE id = ?', [id]);
    }

    public async getExercises(): Promise<Exercise[]> {
        return await this.db.getAllAsync<Exercise>('SELECT * FROM exercises');
    }

    public async updateExercise(id: number, exercise: Partial<NewExercise>): Promise<void> {
        const currentExercise = await this.getExercise(id);
        if (!currentExercise) {
            throw new Error(`Exercise with id ${id} not found`);
        }

        const updatedExercise = {
            ...currentExercise,
            ...exercise,
        };

        await this.db.runAsync('UPDATE exercises SET name = ?, category = ? WHERE id = ?', [
            updatedExercise.name,
            updatedExercise.category,
            id,
        ]);
    }

    public async deleteExercise(id: number): Promise<void> {
        await this.db.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
    }

    /**********************
     * Workout Operations *
     **********************/
    public async addWorkout(workout: NewWorkout): Promise<number> {
        const result = await this.db.runAsync('INSERT INTO workouts (name, date, duration) VALUES (?, ?, ?)', [
            workout.name,
            workout.date,
            workout.duration,
        ]);
        return result.lastInsertRowId;
    }

    public async getWorkout(id: number): Promise<Workout | null> {
        return await this.db.getFirstAsync<Workout>('SELECT * FROM workouts WHERE id = ?', [id]);
    }

    public async getWorkouts(): Promise<Workout[]> {
        return await this.db.getAllAsync<Workout>('SELECT * FROM workouts ORDER BY date DESC');
    }

    public async deleteWorkout(id: number): Promise<void> {
        await this.db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
    }

    /******************************
     * WorkoutExercise Operations *
     ******************************/
    public async addExerciseToWorkout(workoutExercise: NewWorkoutExercise): Promise<number> {
        const result = await this.db.runAsync(
            `INSERT INTO workout_exercises
            (workout_id, exercise_id, sets, reps, weight)
            VALUES (?, ?, ?, ?, ?)`,
            [
                workoutExercise.workoutId,
                workoutExercise.exerciseId,
                workoutExercise.sets,
                workoutExercise.reps,
                workoutExercise.weight,
            ]
        );
        return result.lastInsertRowId;
    }

    public async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & Exercise)[]> {
        return await this.db.getAllAsync<WorkoutExercise & Exercise>(
            `SELECT we.*, e.name, e.category, e.instructions
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?`,
            [workoutId]
        );
    }
}

export const db = new WorkoutDatabase();
