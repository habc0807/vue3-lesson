/**
 * 1. 通过用户传递的执行函数，创建响应式effect？？？ 什么是响应式effect
 * 2. 响应式的的effect默认会先执行一次，然后再监听依赖的属性变化，如果变化了，就再执行一次 有点类似watch
 * 
 * 3.为了防止依赖嵌套，在依赖收集的时候，永远是自己，所以先把父亲保存起来，把自己放在全局上，等自己执行完之后，再把父亲设置回去。
 */

import { DirtyLevels } from "./constants";

// options 计算属性配置 调度函数的配置 内置了自动调度器
export function effect(fn: Function, options?: any) {

    // 这部分是scheduler的实现 调度函数
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run()
    })
    _effect.run()

    if (options) {
        Object.assign(_effect, options);
    }

    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 可以在run方法上获取到effect的引用

    return runner; // 外界可以自己让其重新run
}

function preCleanEffect(effect: any) {
    effect._depsLength = 0; // 依赖的属性长度清零
    effect._trackId++; // 依赖收集 虽然用到了 state.name 3次 但是不需要在依赖的属性里重复收集 每次执行ID 都是加1，如果当前同一个effect执行 ID就是相同的
}

export let activeEffect: ReactiveEffect | undefined; // 最初为undefined

function postCleanEffect(effect)   { 
    if (effect.deps.length > effect._depsLength) { 
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            cleanDepEffect(effect.deps[i], effect) // 删除映射表中对应的effect
        }
        effect.deps.length = effect._depsLength // 更新依赖列表的长度 归位
    }
}

/**
 * ReactiveEffect 类
 * key: ReactiveEffect类
 *  active: true
 *  deps: [Map] 老的5个，新的2个，需要删除映射更新数组长度
 *  fn: function
 *  scheduler: () => (_effect.run();)
 * _depsLength: 0 真实的依赖的属性的个数
 * _trackId: 0 用于记录effect函数的执行次数 防止一个属性在当前effect中多次依赖收集
 */
export class ReactiveEffect {
    _trackId = 0; // 用于记录当前effect 执行了几次 防止一个属性在当前effect中多次依赖收集
    _depsLength = 0; // 收集的个数
    _running = 0; // 正在执行的次数
    deps = []; // 用于记录 currentEffect 依赖的属性
    _dirtyLevel = DirtyLevels.Dirty; // 脏度级别 默认是Dirty 脏的
    public active = true; // 是否激活 创建的effect是不是响应式的
    // fn 为用户编写的函数 如果fn里有依赖的属性变化了，就要调用scheduler 让run 执行
    constructor(public fn: Function, public scheduler: () => void) {}
    
    public get dirty() {
        return this._dirtyLevel === DirtyLevels.Dirty;
    }

    public set dirty(value: boolean) {
        this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
    }

    run() {
        this._dirtyLevel = DirtyLevels.NoDirty; // 重新执行之前，先将脏度级别设置为0
        if (!this.active) {
            return this.fn();
        }

        let parent = activeEffect; // 临时记录当前激活的effect this
        // console.log("000", parent)
        try {
            // console.log('effect run')
            activeEffect = this; // 重制成当前激活的effect
            preCleanEffect(this) // effect 重新执行之前，需要将上一次的依赖情况清空
            this._running++;
            return this.fn()
        } finally { 
            this._running--;
            postCleanEffect(this)
            activeEffect = parent; // 恢复记录当前激活的effect
        }
    }

    // stop() {
    //     this.active = false;
    // }
}


function cleanDepEffect(dep:any, effect: ReactiveEffect) {
    dep.delete(effect)
    if(dep.size === 0) { 
        dep.cleanup() // 如果map为空了，就清理掉 dep为什么有size属性
    }
}

//  双向记忆 deps是数组 dep是Map Map里的key是ReactiveEffect value是effect._trackId
// [flag name] 更新deps
// [flag age]
export function trackEffect(effect: ReactiveEffect, dep: any) { 
    // 需要重新的去收集依赖 将不需要的移除掉 state.name+state.name+state.name
    // console.log(dep.get(effect), effect._trackId);
    if (dep.get(effect) !== effect._trackId) {
        // 收集依赖
        dep.set(effect, effect._trackId)

        let oldDep = effect.deps[effect._depsLength]
        // 去老换新 oldDep和dep都是Map 通过!==比较是否不相同
        if (oldDep !== dep) {
            if (oldDep) {
                cleanDepEffect(oldDep, effect)
            }
             effect.deps[effect._depsLength++] = dep;
        } else {
            // 相同的effect 不重新收集 但是统计次数
           effect._depsLength++;
        }
    }

    // dep.set(effect, effect._trackId)
    // // 我还想让 effect 和 dep 关联起来 effect有个数组，把dep也记住
    // effect.deps[effect._depsLength++] = dep;

}

// name -> 收集计算属性dirty=true -> 计算属性的scheduler -> 触发计算属性所收集的effect
export function trackEffects(dep: Map<ReactiveEffect, any>) {
    for (const effect of dep.keys()) {

        // 处理computed的缓存： 当前的值不脏，但是触发更新需要将值变为脏值 新值 Dirty 4 不脏是0，如果是不脏的，需要设置成脏的，因为依赖的属性变了 Dirty:4 
        if(effect._dirtyLevel < DirtyLevels.Dirty) {
            effect._dirtyLevel = DirtyLevels.Dirty;
        }

        // 如果不是正在执行，才能执行
        if (!effect._running) {
            if (effect.scheduler) {
                 effect.scheduler(); // 等价于就相当于执行了 effect.run()
            }
        }
    }
}