import { isFunction } from "@vue/shared";
import { ReactiveEffect} from "./effect"
import { trackRefValue, triggerRefValue } from "./ref";

/**
 * 计算属性首先依赖属性值，属性在依赖收集的时候，会将计算属性的effect收集进去
 * 计算属性本身就是一个effect，有一个标识dirty=true，访问的时候会触发name属性的get方法（依赖收集）
 * 将name属性和计算属性做一个映射，当取计算属性的时候，会对当前的effect进行依赖收集
 * 如果name属性变化了，会通过计算属性将dirty变为true（触发计算属性收集的effect）
 * 
 * name 计算属性 计算属性的scheduler 触发计算属性收集的effect
 */

class ComputedRefImpl {
    public _value: any;
    public effect: ReactiveEffect;
    public dep: any;
    public __v_isRef = true; // 增加ref标识
    constructor(public getter: any, public setter: any) {
        this.effect = new ReactiveEffect(
            () => getter(this._value), // 用户写的fn state.name变化之后就执行下面的函数
            () => {
                // 计算属性依赖的值变化了，我们应该触发渲染effect重新执行 依赖的属性变化之后需要重新渲染，还需要更新dirty标记  在triggerRefValue-> trackEffects里的处理的
                triggerRefValue(this);
            }
        );
    }

    get value() { // 让计算属性收集对应的effect
        // 这里要做缓存 不能每次取值的时候都去执行effect.run()
        if (this.effect.dirty) {
            // 默认取值一定是脏的，但是执行一次run后就不脏了，就进不来了
            this._value = this.effect.run()

            // 依赖收集 如果当前在effect访问了计算属性 计算属性是可以收集这个effect
            trackRefValue(this);
        }
        return this._value
    }

    set value(newValue: any) {
        // 这个就是ref的setter
        this.setter(newValue)

        
    }
}


export function computed(getterOrOptions: any): any { 
    let onlyGetter = isFunction(getterOrOptions) //  如果是函数，则只传入getter，不传入setter 是只读的

    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {}
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set; 
    }

    // console.log(getter, setter)
    return new ComputedRefImpl(getter, setter)
}

