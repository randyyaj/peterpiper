import { Task } from './task';
import { Pipeline } from './pipeline';
import { AsyncPipeline } from './async-pipeline';
import { MockTask } from './mocks'
import { TaskFunctionInterface } from './types';

describe('test add function', () => {
    it('should run chained Task', async () => {
        const event = { messages: [] };
        // const context = { requestId: '', pipelineName: '', timestamp: '' };
        const tasks = new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task1') } } });
        tasks
            .pipe(new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task2') } } }))
            .pipe(new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task3') } } }));

        await tasks.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3'] });
    });


    it('should run chained Task in pipeline', async () => {
        const chainedJob = new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task1') } } });
        chainedJob.pipe(new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task2') } } }))
            .pipe(new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task3') } } }));
        const pipeline = Pipeline.pipe(chainedJob);
        const event = { messages: [] };
        await pipeline.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3'] });
    });

    it('should run pipeline of Task', async () => {
        const pipeline = Pipeline.pipe(
            new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task1') } } }),
            new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task2') } } }),
            new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task3') } } }),
        );

        const event = { messages: [] };
        await pipeline.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3'] });
    });

    it('should run pipeline of JobFunction', async () => {
        const fn: TaskFunctionInterface = function(event, context, callback) {
            if (event?.messages) { event.messages.push('job4') }
        }

        const fnPipeline = new Pipeline(
            (event) => { if (event?.messages) { event.messages.push('task1') } },
            (event) => { if (event?.messages) { event.messages.push('task2') } },
            (event) => { if (event?.messages) { event.messages.push('task3') } },
            fn
        );

        const event = { messages: [] };
        await fnPipeline.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3', 'job4'] });
    });

    it('should run pipeline of JobPipeline', async () => {
        const pipeline = Pipeline.pipe(
            Pipeline.pipe(
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task1') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task2') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task3') } } }),
            ),
            Pipeline.pipe(
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job4') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job5') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job6') } } }),
            ),
            Pipeline.pipe(
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job7') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job8') } } }),
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job9') } } }),
            ),
        );

        const event = { messages: [] };
        await pipeline.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3', 'job4', 'job5', 'job6', 'job7', 'job8', 'job9'] });
    });

    it('should run pipeline of Task, JobFunction, chained Task, nested JobPipeline', async () => {
        const tasks = new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job4') } } });
        tasks.pipe(new Task({ fn: (event) => { if (event?.messages) { event.messages.push('job5') } } }))

        const pipeline = Pipeline.pipe(
            Pipeline.pipe(
                new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task1') } } }),
            ),
            new Task({ fn: (event) => { if (event?.messages) { event.messages.push('task2') } } }),
            (event) => { if (event?.messages) { event.messages.push('task3') } },
            tasks
        )

        const event = { messages: [] };
        await pipeline.run(event);
        expect(event).toEqual({ messages: ['task1', 'task2', 'task3', 'job4', 'job5'] });
    });

    it('should run async pipeline of Task', async () => {
        const asyncPipeline = AsyncPipeline.pipe(
            new MockTask().setTimeout(2000).setName('task1'),
            new MockTask().setTimeout(3000).setName('task2'),
            new MockTask().setTimeout(1000).setName('task3'),
        );

        const event = { messages: [] };
        await asyncPipeline.run(event);
        expect(event.messages).toContain('task1');
        expect(event.messages).toContain('task2');
        expect(event.messages).toContain('task3');
    });

    it('should run Task callback', async () => {
        const task = new Task();
        const mockCallback = jest.fn((x) => x + 1);
        jest.spyOn(task, 'run');
        task.run({}, {}, mockCallback);
        expect(mockCallback).toHaveBeenCalled();
    });
});