// div onClick=() => invoker.value()
//  invoker.value = fn1/ fn2
function createInvoker(value: any) { 
    const invoker = (e) => invoker.value(e);
    invoker.value = value; // 更改invoker中的value属性，可以修改对应的调用函数
    return invoker;
}

// nextValue 就是绑定的事件 handler
// div onClick=() => fn()
export default function patchEvent(el: any, name: string, nextValue: any) { 
    // vue_event_invoker
    const invokers = el._vei || (el._vei = {});
    const eventName = name.slice(2).toLowerCase();
    const exisitingInvokers = invokers[name]; // 是否存在同名的事件绑定
    if (nextValue && exisitingInvokers) { 
        // 事件换绑定
        return (exisitingInvokers.value = nextValue);
    }
    if (nextValue) {
        const involer = (invokers[name] = createInvoker(nextValue)); // 创建一个调用函数，并且内部会执行nextValue
        return el.addEventListener(eventName, involer)
    } 
    if (exisitingInvokers) { //  现在没有，以前有
        el.removeEventListener(eventName, exisitingInvokers);
        invokers[name] = undefined;
    }
}
