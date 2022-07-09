import { AbstractTask } from "./abstract-task";
import { TaskOptionsInterface, TaskInterface, TaskCallbackFunction } from "./types";

/** Mocks a custom Task implementation */
export class MockTask extends AbstractTask {
    timeout: number;
    constructor(options?: TaskOptionsInterface) {
        super(options);
        this.timeout = 0;
    }

    override async run(event?: Record<string, any>, context?: Record<string, any>, callback?: TaskCallbackFunction): Promise<TaskInterface> {
        await new Promise(resolve => setTimeout(resolve, this.timeout));
        if (event?.messages) { 
            event.messages.push(this.name) ;
        }
    
        return super.run(event, context, callback);
    }

    setTimeout(timeout: number): TaskInterface {
        this.timeout = timeout;
        return this;
    }
}