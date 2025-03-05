

export default function patchAttr(el:Element, key:string, newValue:any) {
    if (newValue === null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, newValue);
    }
}