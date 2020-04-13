import {Action, Dispatch, Middleware, Reducer} from "redux";

const CommandActionName = "CommandAction";
const CommandNullActionName = CommandActionName + ":null";
const CommandPromiseActionName = CommandActionName + ":promise";

export const commandMiddleware: Middleware = api => dispatch => action => {
    if (action instanceof Command) {


        let extra: any = null;
        if (action.json != null) {
            try {
                extra = action.json();
            } catch (e) {
                extra = e.toString();
            }
        }

        let result: any = action.process(api.getState(), (a: any) => {
            a.parent = {
                command: action.name(),
                extra: extra,
            };
            return api.dispatch(a);
        });

        if (result == null) {
            dispatch({
                type: CommandNullActionName + ":" + action.name(),
                parent: action.parent,
                extra,
            });
            return action;
        }
        if (Promise.resolve(result) === result) {
            // if return is a promise
            dispatch({
                type: CommandPromiseActionName + ":" + action.name(),
                parent: action.parent,
                extra,
            });
			return result;
        } else {
            dispatch({
                type: CommandActionName + ":" + action.name(),
                state: result,
                parent: action.parent,
                extra,
            });

            return action;
        }
    }
    return dispatch(action);
};

export abstract class Command<S, C = string> implements Action<any> {
    abstract name(): C;
    parent: any = null;

    /**
     * S: return a updated status
     *
     * Promise<void>: not update status immediately, bug dispatch use param: dispatch
     *              when promise resolves, indicates the job has done.
     * @param state current status
     * @param dispatch top level dispatcher
     */
    process(state: S, dispatch: Dispatch<any>): S | Promise<void> | null {
        return state;
    }

    json?(): object;
    type = "CommandsAction";
}

export interface CommandAction<S> extends Action<string> {
    type: string,
    state: S,
    command: Command<S>,
}

export function enhanceCommandReducer<S, A extends Action<string>>(reducer: Reducer<S, A>) {
    return function (state: S | undefined, action: A): S {
        if (action.type.startsWith(CommandActionName)) {
            if (action.type.startsWith(CommandPromiseActionName)) {
                return state as S;
            } else if (action.type.startsWith(CommandNullActionName)) {
                return state as S;
            } else {
                let a: any = action;
                return a.state;
            }
        } else {
            return reducer(state, action);
        }
    }
}
