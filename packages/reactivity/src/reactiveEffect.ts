import { activeEffect, trackEffect, trackEffects } from "./effect";

const targetMap = new WeakMap(); // 不会出现内存泄露

export const createDep = (cleanup: Function, key: any) => {
    const dep = new Map() as any; // 创建的收集器还是一个map
    dep.cleanup = cleanup; // () => depsMap.delete(key)
    dep.name = key; // 自定义的为了标识这个映射表是给那个属性服务的
    return dep;
}

export function track(target : any, key : any) {
    // activeEffect 有这个属性 说明这个key是在effect中被访问的 没有说明在effect外面被访问的 不需要收集依赖
    if (activeEffect) {
        // console.log(key, activeEffect)

        let depsMap = targetMap.get(target); // 是对象属性的Map 不是weakmap
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map())) // 复用已有的 depsMap 或总是使用新的 Map 实例  targetMap.set(target, new Map());
        }

        // 给key: name, value: new Map()的Map上挂了一个内置的cleanup函数，用来删除掉条数据 删除key: name的映射
        let dep = depsMap.get(key)
        if (!dep) { 
            depsMap.set(
                key,
                dep = createDep(() => depsMap.delete(key), key),// 这个dep的cleanup函数是用来删除这个key的dep
            )
        }

        // 将当前的Effect放入到dep（映射表）中，后续可以根据值的变化触发此dep中存放的effect
        trackEffect(activeEffect, dep); 
        // debugger
        console.log(targetMap)
        
    }
}

export function trigger(target: Object, key: any, value: any, oldValue: any) { 
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }

    let dep = depsMap.get(key);
    if(dep) { 
        trackEffects(dep);
    }
}


// Map: { obj: { name: "xxx", age: 15 } }
// {
//     { name: "xxx", age: 15 } : {
//         age: {
//             effect: 0,
//             effect: 0,
//         },
//         name: { 
//             effect, effect
//         }
//     }
// }