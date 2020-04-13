import mitt from 'mitt';

export class HookRegister {
    hookMap: { [key: string]: Array<Hook> };
    private topic: mitt.Emitter;

    constructor() {
        this.topic = mitt();
        this.hookMap = {};
    }

    listen<T>(hookName: string, listener: (hook: Hook<T>) => void) {
        this.topic.on(hookName, event => {
            listener(event);
        })
    }

    register<T = any>(hook: Hook<T>) {
        let hooks = this.hookMap[hook.name] || [];
        hooks = [...hooks, hook];
        this.hookMap[hook.name] = hooks;
        this.topic.emit(hook.name, hook);
    }

    getHooks<T = any>(name: string): Array<Hook<T>> {
        return this.hookMap[name] || [];
    }

    getHook<T = any>(name: string): Hook<T> {
        return this.getHooks(name)[0];
    }
}

export interface Hook<T = any> {
    id: string,
    name: string,
    hook: T,
}