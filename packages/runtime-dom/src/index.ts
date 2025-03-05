

import { nodeOps } from './nodeOps';
import patchProp from './patchProp';


// 将节点操作与属性操作合并在一起
const renderOptions = Object.assign({ patchProp }, nodeOps);
console.log(renderOptions)


export { renderOptions };
export * from '@vue/reactivity'; // 为什么把它们放后面
export * from '@vue/shared';

// function createRenderer() { }

// createRenderer(renderOptions).render();