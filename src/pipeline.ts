import { AbstractTask } from "./abstract-task";
import { Task } from "./task";
import { TaskInterface, TaskFunctionInterface, TaskCallbackFunction } from "./types";

/**
 * Pipeline to chain {@link Task} and {@link Pipeline}
 * @author Randy Yang <ryang.developer@gmail.com>
 */
export class Pipeline extends AbstractTask {
    readonly tasks?: TaskInterface[];
    readonly timestamp: Date;
    private _pointer: TaskInterface | undefined;

    constructor(...args: (TaskFunctionInterface | TaskInterface)[]) {
        super();
        this.timestamp = new Date();
        let tasks: TaskInterface[] = [];

        if (args.length) {
            tasks = args.map((arg, index) => {
                if (typeof arg === 'function') {
                    const task = new Task({ fn: arg as TaskFunctionInterface });
                    task.setName(`${this.name}-${index}`)
                    return task;
                } else {
                    return arg;
                }
            });

            this.tasks = tasks;

            if (this.tasks.length) {
                this.tasks.forEach((task: TaskInterface) => {
                    if (!this._pointer) {
                        this._pointer = task;
                    } else {
                        this._pointer = this._pointer.pipe(task);
                    }
                    // account for jobs that have already been chained in the pipeline
                    while (this._pointer.next) {
                        this._pointer = this._pointer.pipe(this._pointer.next);
                    }
                })
            }
        }
    }

    /** {@link TaskInterface.run} */
    override async run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): Promise<TaskInterface> {
        if (this?.tasks?.length) {
            let task: TaskInterface = this.tasks[0];
            let process = true;
            while (process) {
                task = await task.run(event, context, callback) as TaskInterface;
                if (!task.next) {
                    process = false;
                }
            }
        }
        return super.run(event, context, callback);
    }

    /** Factory method for creating the pipeline */
    static pipe(...args: (TaskFunctionInterface | TaskInterface)[]) {
        return new Pipeline(...args);
    }
}