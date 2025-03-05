// 主要对节点元素的增删改查

export const nodeOps = {
    // 如果第三个元素不传递，等驾驭 parent.appendChild(el)
    insert:(el: Node, parent: Node, anchor?: Node | null) => parent.insertBefore(el, anchor || null),
    remove(el: Node) {
        const parent = el.parentNode;
        parent && parent.removeChild(el);
    },
    createElement: (type: string) => document.createElement(type),
    createText: (text: string) => document.createTextNode(text),
    setElementText: (el: Element, text: string) => el.textContent = text,
    setText: (node: Node, text: string) => node.nodeValue = text,
    parentNode: (node: Node) => node.parentNode,
    nextSibling: (node: Node) => node.nextSibling, // 后一个兄弟节点
    querySelector: (selector: string) => document.querySelector(selector),
}