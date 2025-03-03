/**
 * 1.做proxy的handler，
 * 2.主要做了两件事：get收集依赖，set触发更新
 * 3.获取属性值的时候，通过track函数进行依赖收集，会收集成一个映射表，对象套属性的映射表 依赖收集的目的是为了让用户写的effect函数，知道这个属性的变化，然后让effect 去更新试图
 * 4.赋值的时候，找到这个对象和属性，找到依赖的effct 都更新，触发更新，
 */

import { activeEffect } from "./effect";
import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags { 
    IS_REACTIVE = "__v_isReactive" // 基本上唯一
}

export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if(key === ReactiveFlags.IS_REACTIVE) { 
            return true;
        }
        
        // 依赖收集 todo...
        track(target, key); // 收集这个对象上的这个属性和effect 关联在一起
        // console.log(activeEffect, key)

        return Reflect.get(target, key, receiver); 
    },
    // set里触发所有的订阅者重新执行
    set(target, key, value, receiver) { 
        let oldValue = target[key]; // 后面可能会watch
        let result = Reflect.set(target, key, value, receiver); 
        if (oldValue !== value) {
            // 触发更新 todo...
            // debugger
            trigger(target, key, value, oldValue);
        }
        
        return result
    },
}
