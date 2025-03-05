import { isObject, isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";


export function watch(source: any, cb: Function, options = {} as any) {
    return doWatch(source, cb, options as any);
}

// source == getter
export function watchEffect(source: Function, options = {} as any) {
    return doWatch(source, null, options as any);
}

// 控制depth 已经当前遍历到那一层了
function traverse(source: any, depth: number, currentDepth=0, seen = new Set()) {
    if (!isObject(source)) {
        return source;
    }

    if (depth) {
        if (currentDepth >= depth) {
            return source;
        }
        currentDepth++; // 根据deep属性来看是否是深度遍历
    }

    if (seen.has(source)) {
        return source
    }
    for (let key in source) {
        traverse(source[key],depth, currentDepth, seen)
    }
    return source; // 遍历一遍 遍历就会触发每个属性的get 进行依赖收集
}


 // watch and watchEffect 也是基于doWatch实现的
function doWatch(source: any, cb: any, options: any) {
    let deep = options.deep;
    let immediate = options.immediate;
    // 需要把source作为一个计算属性，用来收集
    // effect -> getter

    const reactiveGetter = (source: any) =>
        traverse(source, deep === false ? 1 : 0);

    let getter;
    if (isReactive(source)) {
        // 生成一个可以给ReactiveEffect使用的getter 需要对这个对象进行取值操作，会关联当前的reactiveEffect
        getter = () => reactiveGetter(source);
    } else if (isRef(source)) {
        getter = () => source.value;
    } else if (isFunction(source)) {
        getter = source;
    }

    
    let oldValue: any = undefined;
    const job = () => { 
        // watch 与 watchEffect 都会走到这里 做cb 区分处理
        if (cb) {
            const newValue = effect.run();
            cb(newValue, oldValue)
            oldValue = newValue;
        } else {
            effect.run();
        }
        
    }

    const effect = new ReactiveEffect(getter, job);
    console.log("effect:", effect)
    if (cb) {
        if (immediate) {// 立即先执行一次用户的回调，传递心智和老值
            job();
        } else {
            oldValue = effect.run(); // 立即执行effect 进行依赖收集
        }
    } else {
        // watchEffect 无cb
        effect.run(); // 立即执行effect 进行依赖收集
    }
}



// 相当于是watch，上来先执行一次，变化之后，再执行一次
// const runner = effect(() => {

// }, {
//     scheduler() {
//         runner();
//     }
// })