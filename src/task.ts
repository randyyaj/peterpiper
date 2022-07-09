import { AbstractTask } from "./abstract-task";
import { ErrorResponseInterface, TaskCallbackFunction, TaskInterface, TaskOptionsInterface, TaskState } from "./types";

/** 
 * Generic Task Class extending {@link AbstractTask}
 * @author Randy Yang <ryang.developer@gmail.com>
 */
export class Task extends AbstractTask {
    constructor(options?: TaskOptionsInterface) {
        super(options);
    }

    /** {@link TaskInterface.run} */
    override run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): TaskInterface | Promise<TaskInterface> {
        this.state = TaskState.RUNNING;
        let errorResponse: ErrorResponseInterface | undefined;

        try {
            if (this.fn) {
                this.fn(event, context, callback);
            }
        } catch (error: Error | any) {
            this.state = TaskState.FAILED;
            errorResponse = {
                requestId: context?.requestId,
                type: error?.type,
                message: error?.message ?? error,
                trace: error?.trace
            }
            if (this?.options?.exitOnFailure) {
                throw new Error(`${JSON.stringify(errorResponse)}`);
            }
        }

        if (callback) {
            callback(errorResponse);
        }

        this.state = TaskState.COMPLETED;
        return super.run(event, context, callback);
    }
}