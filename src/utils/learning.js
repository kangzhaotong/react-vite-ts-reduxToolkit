/*
 * @Author: M78.Kangzhaotong
 * @Date: 2022-07-26 09:46:46
 * @Last Modified by: M78.Kangzhaotong
 * @Last Modified time: 2024-04-16 14:22:01
 */
// function currFun() {
//   const newArgs = [...arguments]
//   console.log(arguments, '11111111')
//   function collectionFun() {
//     newArgs.push(...arguments)
//     console.log([...arguments], newArgs, '2222222222222222222222222222')
//     return collectionFun
//   }
//   console.log(newArgs, '3333333333333')
//   collectionFun.valueOf = () => newArgs.reduce((a, b) => a + b)
//   return collectionFun
// }
// console.log(currFun(4)(5, 6)(3)(8, 9).valueOf(), 'ceshjishisis')

// // 分词原理
// const LETTERS = /[\da-z]/
// const currentToken = ''
// const tokens = []
// function emit(token) {
//   currentToken.type = ''
//   currentToken.value = ''
//   tokens.push(token)
// }
// // eslint-disable-next-line consistent-return
// function jsxIdentifier(char) {
//   if (LETTERS.test(char)) {
//     currentToken.vaule += char
//     return jsxIdentifier
//   }
//   if (char === '') {
//     emit(currentToken)
//   }
// }
// // eslint-disable-next-line consistent-return
// function dealParaentFunc(char) {
//   console.log(char, 'first')
//   if (LETTERS.test(char)) {
//     currentToken.type = 'JSXIdentifier'
//     currentToken.vaule += char
//     return jsxIdentifier
//   }
// }
// function start(name) {
//   console.log(name, 'lllllllllllllllllll')
//   if (name === '<') {
//     emit({ type: 'leftParaent', value: '<' })
//     return dealParaentFunc
//   }
//   throw new Error('出错')
// }
// function testFunc(stringCode) {
//   // debugger
//   /*  */
//   let state = start
//   for (const item of stringCode) {
//     if (state) state = state(item)
//     //  start(item)
//   }
//   return tokens
// }
// // eslint-disable-next-line quotes
// testFunc("<h1 id='asda' class='name'> <span>sadasda</span></h1>")

// const PENDDING = 'PENDDING'
// const REJECTED = 'REJECTED'
// const FULFILLED = 'FULFILLED'
// class Promise {
//   constructor(executer) {
//     // debugger
//     this.state = PENDDING
//     this.val = undefined
//     this.reason = undefined
//     const resolve = (value) => {
//       if (this.state === PENDDING) {
//         this.state = FULFILLED
//         this.val = value
//       }
//     }
//     const reject = (reason) => {
//       if (this.state === PENDDING) {
//         this.state = REJECTED
//         this.reason = reason
//       }
//     }
//     try {
//       executer(resolve, reject)
//     } catch (e) {
//       throw new Error('执行失败')
//     }
//   }

//   then(onFullfilled, onReject) {
//     if (this.state === FULFILLED) {
//       onFullfilled(this.val)
//     }
//     if (this.state === REJECTED) {
//       onReject(this.reason)
//     }
//   }
// }
// const promise = new Promise((resolve, reject) => {
//   // 传入一个异步操作
//   resolve('成功')
// }).then(
//   // eslint-disable-next-line promise/always-return
//   (data) => {
//     console.log('success', data)
//   },
//   (err) => {
//     console.log('faild', err)
//   },
// )

// // 防抖
// function debounce(func, delay) {
//   let timer
//   return function (...args) {
//     if (timer) {
//       clearTimeout(timer)
//     }
//     timer = setTimeout(() => {
//       func.apply(this, args)
//     }, delay)
//   }
// }
// // 节流
// function throttle(func, delay) {
//   let timer
//   return function (...args) {
//     if (timer) {
//       return
//     }
//     timer = setTimeout(() => {
//       func.apply(this, args)
//       timer = null
//     }, delay)
//   }
// }
// // 偏平化
// function partial(func, ...args) {
//   return function (...rest) {
//     return func.apply(this, [...args, ...rest])
//   }
// }
// // 偏函数
// function partialRight(func, ...args) {
//   return function (...rest) {
//     return func.apply(this, [...rest, ...args])
//   }
// }
// 原型链
// function Animal() {
//   console.log('I`m a human')
// }
// class People {
//   constructor() {
//     this.name = 'aaaaa'
//   }
//   say = () => {
//     console.log('________________')
//   }
// }
// const child = new Animal()
// const child2 = new People
// console.log(
//   // eslint-disable-next-line no-proto
//   child.__proto__,
//   Animal.prototype,
//   Animal.prototype.constructor,
//   Object.prototype,
//   // eslint-disable-next-line no-proto
//   Object.__proto__,
//   child2.prototype,
//   child2.say(),
//   'ceshiceshi',
// )
// const a = {}
// const b = { name: 1, age: 12 }
// const c = { height: 1.9, weghit: 120 }
// const d = Object.assign(a, b, c)
// console.log(d)
// LruCache
// const LRUFunction = function (maxSize) {
//   this.maxSize = maxSize
//   this.cache = new Map()
// }
// LRUFunction.prototype.get = function (key) {
//   if (this.cache.has(key)) {
//     const value = this.cache.get(key)
//     this.cache.delete(key)
//     this.cache.set(key, value)
//     return value
//   }
//   return -1
// }
// LRUFunction.prototype.set = function (key, value) {
//   if (this.cache.has(key)) {
//     this.cache.delete(key)
//   }
//   if (this.cache.size > this.maxSize) {
//     this.cache.delete(this.cache.keys().next().value)
//   }
//   this.cache.set(key, value)
// }
// const cacheFun = new LRUFunction(3)
// cacheFun.set('a', 1)
// cacheFun.set('b', 2)
// cacheFun.set('c', 3)
// cacheFun.set('d', 4)
// console.log(cacheFun.get('a'))
// // 简单实现useState
// function myUseState(initState) {
//   let state = initState
//   const setState = (newState) => {
//     console.log(newState, 'newState')
//     state = newState
//     console.log(state)
//   }
//   return [state, setState]
// }
// function meyRender() {
//   const [count, setCount] = myUseState(0)
//   setCount(2222)
//   setTimeout(() => {
//     console.log(count, 'aaaaa')
//   }, 0)
// }
// meyRender()
// console.log('------------------------------------------------------')
// function Foo() {
//   Foo.a = function () {
//     console.log(1)
//   }
//   this.a = function () {
//     console.log(2)
//   }
// }
// Foo.prototype.a = function () {
//   console.log(3)
// }
// Foo.a = function () {
//   console.log(4)
// }
// Foo.a()
// let obj = new Foo()
// obj.a()
// obj.__proto__.a()
// // console.log(obj.prototype, obj.__proto__)
// Foo.a()
// function changeObjProperty(o) {
//   o.siteUrl = 'http://www.baidu.com'
//   o = new Object()
//   o.siteUrl = 'http://www.google.com'
// }
// let webSite = new Object()
// changeObjProperty(webSite)
// console.log(webSite.siteUrl)

// const testArr = [1, 8, 6, 2, 5, 4, 8, 3, 7]
// const maxWater = (arr) => {
//   let area = 0
//   for (let i = 0; i < arr.length; i++) {
//     for (let j = i + 1; j < arr.length; j++) {
//       const midArea = (j - i) * Math.min(arr[i], arr[j])
//       if (area < midArea) {
//         area = midArea
//       }
//     }
//   }
//   return area
// }
// maxWater(testArr)
// ------------------------------------------------
// 输入： n = 3
// 输出： 3
// 解释： 有三种方法可以爬到楼顶。
// 1. 1 阶 + 1 阶 + 1 阶
// 2. 1 阶 + 2 阶
// 3. 2 阶 + 1 阶
// 我们这里先分析下，楼梯有一级时，只有一种爬楼梯方法，当楼梯有两级时，有两种爬楼梯的方法，可以直接爬两级，或者一级一级爬，以此类推，当楼梯有n级时，爬楼梯的次数等于第n-1级的次数加上第n-2级的次数

// 根据上述分析，我们在进入函数中先声明两个变量，分别是n1变量和n2变量，n1变量值为1代表着一级楼梯，
// n2变量值为2代表着二级楼梯，在声明一个res变量，res变量值默认为0，用于存储爬n级楼梯的多少种方法，
// 在使用if语句进行判断当前出参n是否等于1或等于2,如果为1或者2则直接把当前的出参n返回即可
// ，因为一级楼梯和二级楼梯的爬楼梯方法与楼梯级数所对应，接下来我们使用for循环的方式对出参n进行循环，循环变量i默认值是3,
// 因为三级楼梯有三种爬楼梯方法，变量n1和变量n2相加正好等于三级楼梯的爬楼梯总方法，循环终止条件是当前循环变量i的值等于出参n,
// 在循环中我们将变量n1和变量n2的值相加赋值给res变量，然后再将n2变量值赋值给变量n1，再将变量res变量值赋值给n2，
// 以此去计算出每增加一级楼梯的爬楼梯的方法数，当循环结束后，我们将res变量返回即可

// const floorFun = (num) => {
//   let n = 1
//   let m = 2
//   let res = 0
//   if (num === 1 || num === 2) {
//     return num
//   }
//   for (let i = 3; i <= num; i++) {
//     res = m + n
//     n = m
//     m = res
//   }
//   return res
// }
// console.log(floorFun(100), 'floorFun(3)floorFun(3)floorFun(3)floorFun(3)floorFun(3)')
// const arrList = [
//   { id: 1, name: '部门1', pid: 0 },
//   { id: 2, name: '部门2', pid: 1 },
//   { id: 3, name: '部门3', pid: 1 },
//   { id: 4, name: '部门4', pid: 3 },
//   { id: 5, name: '部门5', pid: 4 },
//   { id: 6, name: '部门6', pid: 0 },
//   { id: 7, name: '部门7', pid: 6 },
//   { id: 8, name: '部门7', pid: 0 },
// ]

// const treeArray = (arr) => {
//   const result = []
//   const midmap = {}
//   arr.forEach((item) => {
//     const { pid, id } = item
//     if (!midmap[id]) {
//       midmap[id] = {
//         children: [],
//       }
//     }
//     midmap[id] = {
//       ...item,
//       children: midmap[id].children,
//     }
//     if (!pid) {
//       result.push(midmap[id])
//     } else if (midmap[pid]) {
//       midmap[pid].children.push(midmap[id])
//     } else {
//       midmap[pid] = {
//         children: [],
//       }
//     }
//   })
//   return JSON.stringify(result)
// }
// const dealFun = (arrList) => {
//   const result = []
//   const midMap = {}
//   arrList.forEach((v) => {
//     const { id, pid } = v
//     if (!midMap[id]) {
//       midMap[id] = {
//         children: [],
//       }
//     }
//     midMap[id] = {
//       ...v,
//       children: midMap[id].children,
//     }
//     if (!pid) {
//       result.push(midMap[id])
//     } else if (midMap[pid]) {
//       midMap[pid].children.push(midMap[id])
//     } else {
//       midMap[pid] = {
//         children: [],
//       }
//     }
//   })
//   console.log(result, 'resultresultresultresult')
//   return result
// }
// console.log(dealFun(arrList), 'dealFundealFundealFundealFun')
// function testFun() {
//   console.log('this is test')
// }
// class testFun2 {
//   constructor() {
//     console.log('constructor')
//   }

//   testFun() {
//     console.log('classFunclassFunclassFunclassFun')
//   }
// }
// const newTestFun = new testFun()
// const newTestFun2 = new testFun2()

// console.log(
//   testFun.prototype,
//   newTestFun.constructor,
//   newTestFun2.constructor,
//   newTestFun.__proto__,
//   newTestFun2.__proto__.constructor,
//   '----------------------------------',
// )
// 查找数组最大两个值
// function maxTwo(list) {
//   let max = -Infinity
//   let secondMax = -Infinity
//   for (const x of list) {
//     if (x > max) {
//       secondMax = max
//       max = x
//     } else if (x > secondMax) {
//       secondMax = x
//     }
//   }
//   return [max, secondMax]
// }

// console.log(maxTwo([100, 10]), maxTwo([-100, -10, 0]))
// bind/softBind/apply/call 都是this显式绑定的方法

// bind会返回一个硬绑定的新函数，新函数会使用指定的第一个thisCtx去调用原始函数，并将其它参数传给原始函数。 硬绑定会降低函数的灵活性，在绑定之后不能通过显式或硬绑定的方式改变this，只能通过new改变
// softBind 会对指定的函数进行封装，首先检查调用时的 this，如果 this 绑定到全局对象或者 undefined，那就用指定的thisCtx 去调用函数，否则不会修改 this
// apply和call功能相同，都是以指定的thisCtx和参数去执行方法，并返回原方法的返回值，只是apply中参数以数组传递

// 请实现一个 pathGet() 函数，给定任意的变量v，
// 能根据path获取到对应的值, v为任意的变量，可以是对象或数组或其他类型的值, path为路径，可以是数组或字符串, defaultValue为可选的默认值，当未获取到path路径的值时，此时返
// 回默认值
// 示例obj
// var obj = [ a': [ b': [ 'c': 3 1
// // 示例1
// result= pathGet(obj, ['a', 0', b', 'c']);
// console.log(result);
// // => 3
// function pathGet(v, path, defaultValue) {
//     if (!path) {
//         return v
//     }

//     const keys = Array.isArray(path) ? path : path.split('.')
//     let result = v

//     for (const key of keys) {
//         if (typeof result === 'object' && result !== null) {
//             if (key.includes('[')) {
//                 const newKey = key.replace(']', '').replace('[', '.')
//                 result = pathGet(result, newKey)
//             } else {
//                 result = result[key]
//             }
//         } else if (Array.isArray(result) && /^\d+$/.test(key) && key < result.length) {
//             result = result[key]
//         } else {
//             return defaultValue
//         }
//     }

//     return result !== undefined ? result : defaultValue
// }

// const obj = { a: [{ b: { c: 3 } }] }
// console.log(pathGet(obj, ['a', '0', 'b', 'c']), '3333333')
// console.log(pathGet(obj, 'a[0].b.c'), '12222222')
// N皇后问题
const isValid = (board, row, col) => {
    for (let i = 0; i < row; i++) {
        if (board[i][col] === 1 || board[i][col - row + i] === 1 || board[i][col + row - i] === 1) {
            return false;
        }
    }
    return true;
};
/**
 * @param {number} n 方阵的边长
 * @return {string[][]} 结果级
 */
function solveNQueens(n) {
    const solutions = [];
    const solve = (board, row) => {
        if (row === n) {
            solutions.push(board.map(row => [...row]));
            return;
        }
        /**
         * 
         * @param {*} row 皇后的行
         * @param {*} col 皇后的列
         * @returns 
         */
        for (let col = 0; col < n; col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 1;
                let str = ''
                board.forEach(element => {
                    str = str + JSON.stringify(element) + '\n'
                });
                console.log('first', row, col, '\n', str, '--------------')
                solve(board, row + 1);
                board[row][col] = 0;
            }
        }
    }
    solve(Array.from({ length: n }, () => Array(n).fill(0)), 0);
    return solutions;
}

// 示例
const solutions = solveNQueens(4); // 8 皇后问题的解
console.log(solutions);
