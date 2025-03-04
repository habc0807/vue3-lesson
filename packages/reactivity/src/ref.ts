// ref shallowRef
// reactive shallowReactive

import { activeEffect, trackEffect, trackEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";


export function ref(value: any) {
    return createRef(value)
}

function createRef(value: any) {
    return new RefImpl(value)
}


class RefImpl {
    public __v_isRef = true; // 增加ref标识
    public _value: any; // 用来保存ref的值
    public dep: any; // 用来保存ref的依赖

    // constructor(public rawValue: any)  的这种用法 就可以在实例上增加rawValue属性
    constructor(public rawValue: any) { 
        this._value = toReactive(rawValue)
    }
    
    // 类的属性访问器
    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue;
            this._value = newValue;
            triggerRefValue(this)
        }
    }
}


function trackRefValue(ref: RefImpl) {
    if (activeEffect) {
        trackEffect(
            activeEffect,
            (ref.dep = createDep(
                () => (ref.dep = undefined), 
                "undefined")
            )
        )
    }
}

function triggerRefValue(ref: RefImpl) {
    let dep = ref.dep;
    if (dep) {
        trackEffects(dep); // 触发依赖
    }
}


// toRef toRefs reactive 对象变成响应式对象
class ObjectRefImpl { 
    public __v_isRef = true; // 增加ref标识
    constructor(public _object: any, public _key: string) {}
    get value() {
        return this._object[this._key]
    }
    set value(newValue) {
        this._object[this._key] = newValue;
    }
}
export function toRef(object: any, key: string) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object: any) {
    const res: any = {};
    for (const key in object) {
        res[key] = toRef(object, key);
    }
    return res
}
    
export function proxyRefs(objectWithRefs: any) {
    return new Proxy(objectWithRefs, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver);
            return r.__v_isRef ? r.value : r; // 自动脱ref
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            if (oldValue !== value) {
                //  如果老值是ref 需要ref赋值
                if (oldValue.__v_isRef) { 
                    oldValue.value = value;
                    return true;
                } else {
                    return Reflect.set(target, key, value, receiver);
                }
            }
        }
    })
}