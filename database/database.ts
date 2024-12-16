import * as SQLite from 'expo-sqlite';
import { Exercise, NewExercise, Workout, NewWorkout, WorkoutExercise, NewWorkoutExercise } from './types';

class WorkoutDatabase {
    private db: SQLite.SQLiteDatabase | null = null;
    private initialized = false;

    constructor() {}

    private async ensureInitialized() {
        if (this.initialized) return;

        try {
            this.db = await SQLite.openDatabaseAsync('workout.db');

            // Set Write-Ahead Logging (WAL) mode for better performance
            await this.db.execAsync('PRAGMA journal_mode = WAL;');

            await this.setupTables();
            this.initialized = true;
        } catch (error) {
            console.error('Yikes, database initialization failed:', error);
            throw error;
        }
    }

    private async setupTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                muscleGroup TEXT NOT NULL
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
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.runAsync('INSERT INTO exercises (name, muscleGroup) VALUES (?, ?)', [
            exercise.name,
            exercise.muscleGroup,
        ]);
        return result.lastInsertRowId;
    }

    public async getExercise(id: number): Promise<Exercise | null> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getFirstAsync<Exercise>('SELECT * FROM exercises WHERE id = ?', [id]);
    }

    public async getExercises(): Promise<Exercise[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getAllAsync<Exercise>('SELECT * FROM exercises');
    }

    public async updateExercise(id: number, exercise: Partial<NewExercise>): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const currentExercise = await this.getExercise(id);
        if (!currentExercise) {
            throw new Error(`Exercise with id ${id} not found`);
        }

        const updatedExercise = {
            ...currentExercise,
            ...exercise,
        };

        await this.db.runAsync('UPDATE exercises SET name = ?, muscleGroup = ? WHERE id = ?', [
            updatedExercise.name,
            updatedExercise.muscleGroup,
            id,
        ]);
    }

    public async deleteExercise(id: number): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
    }

    /**********************
     * Workout Operations *
     **********************/
    public async addWorkout(workout: NewWorkout): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.runAsync('INSERT INTO workouts (name, date, duration) VALUES (?, ?, ?)', [
            workout.name,
            workout.date,
            workout.duration,
        ]);
        return result.lastInsertRowId;
    }

    public async getWorkout(id: number): Promise<Workout | null> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getFirstAsync<Workout>('SELECT * FROM workouts WHERE id = ?', [id]);
    }

    public async getWorkouts(): Promise<Workout[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getAllAsync<Workout>('SELECT * FROM workouts ORDER BY date DESC');
    }

    public async deleteWorkout(id: number): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
    }

    /******************************
     * WorkoutExercise Operations *
     ******************************/
    public async addExerciseToWorkout(workoutExercise: NewWorkoutExercise): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

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
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getAllAsync<WorkoutExercise & Exercise>(
            `SELECT we.*, e.name, e.muscleGroup, e.instructions
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?`,
            [workoutId]
        );
    }
}

export const db = new WorkoutDatabase();
