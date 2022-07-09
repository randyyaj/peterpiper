import { AbstractTask } from "./abstract-task";
import { Task } from "./task";
import { TaskInterface, TaskFunctionInterface, TaskCallbackFunction } from "./types";

/** 
 * Pipeline for running {@link Task} and other {@link Pipeline} in parallel 
 * @author Randy Yang <ryang.developer@gmail.com>
 */
export class AsyncPipeline extends AbstractTask {
    readonly tasks?: TaskInterface[];

    constructor(...args: (TaskFunctionInterface | TaskInterface)[]) {
        super();
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
        }
    }

    /** {@link TaskInterface.run} */
    override async run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): Promise<TaskInterface> {
        if (this?.tasks?.length) {
            await Promise.all(this.tasks.map(async (task) => {
                await task.run(event, context, callback);
            }));
        }

        return super.run(event, context, callback);
    }

    /** Factory method for creating the pipeline */
    static pipe(...args: (TaskFunctionInterface | TaskInterface)[]) {
        return new AsyncPipeline(...args);
    }
}