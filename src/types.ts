/** The teask interface modeling a Task that can be executed */
export interface TaskInterface {
    /** Name of the Task */
    name: string;

    /** The next Task to run after this Task has completed */
    next?: TaskInterface;

    /** The execution state of the Task */
    state: TaskState;

    /** Can be used in place of the handler function */
    fn?: TaskFunctionInterface;

    /**
     * This function implements the business logic for a Task and process the arguments provided
     * @param event - Contains information from the invoker.
     * @param context - Contains information about the invocation, function, and execution environment.
     * @param callback - Callback function that you can call in non-async handlers to send a response. 
     *  For async handlers, you return a response, error, or promise to the runtime instead of using callback.
     * @returns {TaskInterface} - Returns a Task when function has completed
     */
    run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): void | TaskInterface | Promise<TaskInterface>;

    /**
     * Sets the next Task to run
     * @param Task - The next Task to run
     */
    pipe(Task: TaskInterface | TaskFunctionInterface): TaskInterface;

    /**
     * Sets the name of this Task
     * @param name - The name of this Task
     */
    setName(name: string): TaskInterface;
}

/** A function that models a Task's handler function */
export interface TaskFunctionInterface {
    /**
     * This function implements the business logic for a Task and process the arguments provided
     * @param event - Contains information from the invoker.
     * @param context - Contains information about the invocation, function, and execution environment.
     * @param callback - Callback function that you can call in non-async handlers to send a response. 
     *  For async handlers, you return a response, error, or promise to the runtime instead of using callback.
     * @returns {TaskInterface} - Returns a Task when function has completed
     */
    (event?: Record<string, any>, context?: Record<string, any>, callback?: Function): void;
};

/** The callback function interface */
export interface TaskCallbackFunction {
    /**
     * @param error - The error to return in the callback
     */
    (error?: ErrorResponseInterface): void
}

/** Interface for modeling Task options passed into the Task constructor */
export interface TaskOptionsInterface {
    name?: string;
    exitOnFailure?: boolean;
    fn?: TaskFunctionInterface;
}

/** Error Reponse object for reporting Task errors */
export interface ErrorResponseInterface {
    requestId?: string;  // context.id
    type?: string;       // type of error
    message?: string;    // err.message
    trace?: any;         // err.stack;
}

/** Enum state of Task*/
export enum TaskState {
    SCHEDULED,
    RUNNING,
    FAILED,
    STOPPED,
    COMPLETED,
}