export default function patchClass(el: Element, value: any) {
    if (value == null)  {
        el.removeAttribute('class');
    } else {
        el.className = value;
    }
}