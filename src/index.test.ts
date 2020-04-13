import {applyMiddleware, createStore, Dispatch} from "redux";
import {Command, commandMiddleware, enhanceCommandReducer} from "./index";
// @ts-ignore
import * as sleep from 'sleepjs';

class GrownOldCommand extends Command<any> {
    by: number;

    constructor(by: number) {
        super();
        this.by = by;
    }

    name(): string {
        return "my-command";
    }

    process(state: any): any {
        return {
            ...state,
            age: state.age + this.by,
        }
    }
}

class GrownOldLately extends Command<any> {
    by: number;


    constructor(by: number) {
        super();
        this.by = by;
    }

    name(): string {
        return "late grown update";
    }

    async process(state: any, dispatch: Dispatch<any>): Promise<void> {
        // grow old after 3 seconds
        await sleep(3000);
        dispatch(new GrownOldCommand(this.by));
    }
}

test('basic', async () => {
    function initReducer() {
        return {
            name: "yuankui",
            age: 30,
        };
    }

    let store = createStore(enhanceCommandReducer(initReducer), applyMiddleware(commandMiddleware));
    console.log("init state");
    console.log(store.getState());
    // output:
    //    { name: 'yuankui', age: 30 }


    // print age at interval
    const interval = setInterval(() => {
        console.log("current state", store.getState());
    }, 1000);

    const promise = new Promise((resolve) => {
        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, 5000);
    });

    // dispatch sync state change
    console.log("dispatch new GrownOldCommand(3)");
    store.dispatch(new GrownOldCommand(3));

    // dispatch async state change
    console.log("dispatch new GrownOldLately(3)");
    store.dispatch(new GrownOldLately(3));

    await promise;
});