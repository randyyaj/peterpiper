import { Task } from "./task";
import { TaskInterface, TaskFunctionInterface, TaskOptionsInterface, TaskState, TaskCallbackFunction } from "./types";

/** 
 * The base abstract task implemnting the {@link TaskInterface} interface 
 * @author Randy Yang <ryang.developer@gmail.com>
 */
export abstract class AbstractTask implements TaskInterface {
    name: string;
    next?: TaskInterface | undefined;
    state: TaskState;
    options?: TaskOptionsInterface;
    fn?: TaskFunctionInterface | undefined;

    constructor(options: TaskOptionsInterface = {}) {
        this.options = options;
        this.name = options?.name ?? this.constructor.name;
        this.state = TaskState.SCHEDULED;
        this.fn = options?.fn;
    }

    /** {@link TaskInterface.run} */
    run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): TaskInterface | Promise<TaskInterface> {
        if (this.next) {
            return this.next.run(event, context, callback) as TaskInterface;
        }
        return this;
    }

    /** {@link TaskInterface.pipe} */
    pipe(task: TaskInterface | TaskFunctionInterface): TaskInterface {
        if (typeof task === 'function') {
            const t = new Task({ fn: task as TaskFunctionInterface });
            t.setName(`${this.name}-${task.name}`)
            return this.next = t;
        } else {
            return this.next = task;
        }
    }

    /** {@link TaskInterface.setName} */
    setName(name: string): TaskInterface {
        this.name = name;
        return this;
    }
}
