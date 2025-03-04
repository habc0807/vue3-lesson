/**
 * 1.reactive 只做了一件事，就是将对象转成响应式的。
 * 
 * 2.怎么变成响应式的 核心就是new Proxy拦截代理
 * 
 * 3.但是我们要防止一个对象被重复的代理，所以将每一个响应式的对象都放到缓存下次在取值的时候 如果缓存里有直接取出来用
 * 
 * 4.还有如果被返回的代理的对象 我就看看它没有私有IS_REACTIVE属性，如果它代理过了，有这个属性，就直接反馈
 */

import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandler";
import { ReactiveFlags } from "./constants"
const reactiveMap = new WeakMap();

function createReactiveObject(target: object) {
    // 统一做判断，响应式对象必须是对象才可以，所以基础数据类型需要先转成对象上的value???
    if (!isObject(target)) {
        return target;
    }

    if ((target as any)[ReactiveFlags.IS_REACTIVE]) {
        // console.log(target, "is already reactive") 
        // 此时的 target已经是一个响应式对象了 Proxy(Object) {name: 'jw', age: 30, flag: true} 'is already reactive'
        return target;
    }

    const exitsProxy = reactiveMap.get(target);
    if (exitsProxy) {
        return exitsProxy;
    }

    let proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
}

export function reactive(target: object) {
    return createReactiveObject(target);
}


export function toReactive(value: any) {
    return isObject(value) ? reactive(value) : value;
}

