import * as SQLite from 'expo-sqlite';
import {
    Exercise,
    NewExercise,
    Workout,
    NewWorkout,
    WorkoutExercise,
    NewWorkoutExercise,
    WorkoutTemplate,
    NewWorkoutTemplate,
    NewTemplateExercise,
    TemplateExercise,
} from './types';

class WorkoutDatabase {
    private db: SQLite.SQLiteDatabase | null = null;
    private initialized = false;

    private async ensureInitialized() {
        if (this.initialized) return;

        try {
            this.db = await SQLite.openDatabaseAsync('workout.db');

            // Set Write-Ahead Logging (WAL) mode for better performance
            await this.db.execAsync('PRAGMA journal_mode = WAL;');

            await this.setupTables();
            this.initialized = true;
        } catch (error) {
            console.error('Yikes. Database initialization failed:', error);
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

            CREATE TABLE IF NOT EXISTS workout_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS template_exercises (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_id INTEGER NOT NULL,
                exercise_id INTEGER NOT NULL,
                set_count INTEGER NOT NULL,
                target_reps INTEGER NOT NULL,
                target_weight REAL,
                order_index INTEGER NOT NULL,
                FOREIGN KEY (template_id) REFERENCES workout_templates (id) ON DELETE CASCADE,
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
            `SELECT we.*, e.name, e.muscleGroup
            FROM workout_exercises we
            JOIN exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?`,
            [workoutId]
        );
    }

    public async createTemplate(template: NewWorkoutTemplate): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.runAsync('INSERT INTO workout_templates (name) VALUES (?)', [template.name]);
        return result.lastInsertRowId;
    }

    public async addExerciseToTemplate(exercise: NewTemplateExercise): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.runAsync(
            `INSERT INTO template_exercises
            (template_id, exercise_id, set_count, target_reps, target_weight, order_index)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                exercise.templateId,
                exercise.exerciseId,
                exercise.setCount,
                exercise.targetReps,
                exercise.targetWeight,
                exercise.order,
            ]
        );
        return result.lastInsertRowId;
    }

    public async getTemplates(): Promise<WorkoutTemplate[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getAllAsync<WorkoutTemplate>('SELECT * FROM workout_templates');
    }

    public async getTemplateExercises(templateId: number): Promise<(TemplateExercise & Exercise)[]> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        return await this.db.getAllAsync<TemplateExercise & Exercise>(
            `SELECT te.*, e.name, e.muscleGroup
            FROM template_exercises te
            JOIN exercises e ON te.exercise_id = e.id
            WHERE te.template_id = ?
            ORDER BY te.order_index`,
            [templateId]
        );
    }

    public async deleteTemplate(id: number): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        await this.db.runAsync('DELETE FROM workout_templates WHERE id = ?', [id]);
    }

    public async startWorkoutFromTemplate(templateId: number): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        const template = await this.db.getFirstAsync<WorkoutTemplate>('SELECT * FROM workout_templates WHERE id = ?', [
            templateId,
        ]);

        if (!template) {
            throw new Error('Template not found');
        }

        const workoutId = await this.addWorkout({
            name: template.name,
            date: new Date().toISOString(),
            duration: 0,
        });

        const templateExercises = await this.getTemplateExercises(templateId);

        for (const exercise of templateExercises) {
            await this.addExerciseToWorkout({
                workoutId,
                exerciseId: exercise.exerciseId,
                sets: exercise.setCount,
                reps: exercise.targetReps,
                weight: exercise.targetWeight || 0,
            });
        }

        return workoutId;
    }
}

export const db = new WorkoutDatabase();
