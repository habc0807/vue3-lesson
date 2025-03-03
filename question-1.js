const person = {
  name: 'jw',
  get aliasName() {
    return this.name + 'handsome'
  }
}

var myReceiverObject = {
  name: 'momo',
  bar: 4,
};

let proxyPerson = new Proxy(person, {
  get(target, key, recevier) {
    console.log(target, key, recevier)
    // return recevier[key] // 错误的使用 不能在代理对象中访问代理对象的属性
    // 通过 Reflect 让原对象的this指向为代理对象
    return Reflect.get(target, key, myReceiverObject)  // recevier是谁 person内的方法aliasNamede this就指向谁
    // return Reflect.get(target, key, recevier)  // person内的方法aliasName内部的this由 recevier确定 recevier是谁 this就指向谁
  }
})

// 如果 Proxy对象和 Reflect对象联合使用，前者拦截赋值操作，后者完成赋值的默认行为
console.log(proxyPerson.aliasName) // jwhandsome 