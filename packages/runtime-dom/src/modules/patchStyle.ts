export default function patchStyle(el:any, prevValue: any, nextValue: any) {
    if (!nextValue) {
        el.removeAttribute('style');
    }

    let style = el.style;

    for (let key in nextValue) {
        style[key] = nextValue[key];
    }

    if (prevValue) {
        for (let key in prevValue) {
            if (nextValue[key] == null) {
                style[key] = null;
                style.removeProperty(key);
             }
        }
    }
}