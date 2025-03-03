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
 
