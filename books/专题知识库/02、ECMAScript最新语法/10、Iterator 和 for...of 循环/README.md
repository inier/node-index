# Iterator 和 for...of 循环

<!-- toc -->

- [1、Iterator 的概念](#1iterator-%E7%9A%84%E6%A6%82%E5%BF%B5)
- [2、数据结构的默认 Iterator 接口](#2%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%E7%9A%84%E9%BB%98%E8%AE%A4-iterator-%E6%8E%A5%E5%8F%A3)
- [3、调用 Iterator 接口的场合](#3%E8%B0%83%E7%94%A8-iterator-%E6%8E%A5%E5%8F%A3%E7%9A%84%E5%9C%BA%E5%90%88)
  * [3.1、解构赋值](#31%E8%A7%A3%E6%9E%84%E8%B5%8B%E5%80%BC)
  * [3.2、扩展运算符](#32%E6%89%A9%E5%B1%95%E8%BF%90%E7%AE%97%E7%AC%A6)
  * [3.3、yield*](#33yield)
  * [3.4、其他场合](#34%E5%85%B6%E4%BB%96%E5%9C%BA%E5%90%88)
- [4、Iterator 接口与 Generator 函数](#4iterator-%E6%8E%A5%E5%8F%A3%E4%B8%8E-generator-%E5%87%BD%E6%95%B0)
- [5、for...of 循环 - 重点！！！](#5forof-%E5%BE%AA%E7%8E%AF-------%E9%87%8D%E7%82%B9)
  * [5.1、数组](#51%E6%95%B0%E7%BB%84)
  * [5.2、Set 和 Map 结构](#52set-%E5%92%8C-map-%E7%BB%93%E6%9E%84)
  * [5.3、计算生成的数据结构](#53%E8%AE%A1%E7%AE%97%E7%94%9F%E6%88%90%E7%9A%84%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84)
  * [5.4、对象](#54%E5%AF%B9%E8%B1%A1)
- [6、对比JS中的几种遍历：for forEach for...in for...of](#6%E5%AF%B9%E6%AF%94js%E4%B8%AD%E7%9A%84%E5%87%A0%E7%A7%8D%E9%81%8D%E5%8E%86for-----foreach---forin---forof)
  * [理解 JavaScript 中的 for…of 循环](#%E7%90%86%E8%A7%A3-javascript-%E4%B8%AD%E7%9A%84-forof-%E5%BE%AA%E7%8E%AF)
  * [Arrays(数组)](#arrays%E6%95%B0%E7%BB%84)
  * [Maps(映射)](#maps%E6%98%A0%E5%B0%84)
  * [Set(集合)](#set%E9%9B%86%E5%90%88)
  * [String(字符串)](#string%E5%AD%97%E7%AC%A6%E4%B8%B2)
  * [Arguments Object(参数对象)](#arguments-object%E5%8F%82%E6%95%B0%E5%AF%B9%E8%B1%A1)
  * [Generators(生成器)](#generators%E7%94%9F%E6%88%90%E5%99%A8)
  * [退出迭代](#%E9%80%80%E5%87%BA%E8%BF%AD%E4%BB%A3)
  * [普通对象不可迭代](#%E6%99%AE%E9%80%9A%E5%AF%B9%E8%B1%A1%E4%B8%8D%E5%8F%AF%E8%BF%AD%E4%BB%A3)
  * [For…of vs For…in](#forof-vs-forin)

<!-- tocstop -->

### 1、Iterator 的概念

JavaScript 原有的表示 “ 集合 ” 的数据结构，主要是数组（ Array ）和对象（ Object ）， ES6 又添加了 Map 和 Set 。
这样就有了四种数据集合，用户还可以组合使用它们，定义自己的数据结构，比如数组的成员是 Map ， Map 的成员是对象。
这样就需要一种统一的接口机制，来处理所有不同的数据结构。                                         
遍历器（ Iterator ）就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。
任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。           
Iterator 的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；二是使得数据结构的成员能够按某种次序排列；三是 ES6 创造了一种新的遍历命令for...of循环， Iterator 接口主要供for...of消费。          

Iterator 的遍历过程是这样的。         
- （ 1 ）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
- （ 2 ）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
- （ 3 ）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
- （ 4 ）不断调用指针对象的next方法，直到它指向数据结构的结束位置。

每一次调用next方法，都会返回数据结构的当前成员的信息。
具体来说，就是返回一个包含value和done两个属性的对象。其中，value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。            


### 2、数据结构的默认 Iterator 接口

Iterator 接口的目的，就是为所有数据结构，提供了一种统一的访问机制，即for...of循环（详见下文）。当使用for...of循环遍历某种数据结构时，该循环会自动去寻找 Iterator 接口。           
在 ES6 中，有三类数据结构原生具备 Iterator 接口：数组、某些类似数组的对象、 Set 和 Map 结构。             

实例：
```javascript
    let arr = ['a', 'b', 'c'];
    let iter = arr[Symbol.iterator]();
    iter.next() // { value: 'a', done: false }
    iter.next() // { value: 'b', done: false }
    iter.next() // { value: 'c', done: false }
    iter.next() // { value: undefined, done: true }
```

上面提到，原生就部署 Iterator 接口的数据结构有三类，对于这三类数据结构，不用自己写遍历器生成函数，for...of循环会自动遍历它们。除此之外，其他数据结构（主要是对象）的 Iterator 接口，都需要自己在Symbol.iterator属性上面部署，这样才会被for...of循环遍历。              


### 3、调用 Iterator 接口的场合         
有一些场合会默认调用 Iterator 接口（即Symbol.iterator方法），除了下文会介绍的for...of循环，还有几个别的场合。             

#### 3.1、解构赋值           
对数组和 Set 结构进行解构赋值时，会默认调用Symbol.iterator方法。          
实例1：                
```javascript
    let set = new Set().add('a').add('b').add('c');
    let [x,y] = set;
    // x='a'; y='b'
    let [first, ...rest] = set;
    // first='a'; rest=['b','c'];
```

#### 3.2、扩展运算符      
扩展运算符（ ... ）也会调用默认的 iterator 接口。            
实例2：            
```javascript
    //  例一
    var str = 'hello';
    [...str] // ['h','e','l','l','o']
    //  例二
    let arr = ['b', 'c'];
    ['a', ...arr, 'd']
    // ['a', 'b', 'c', 'd']
```

#### 3.3、yield*         
yield* 后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。         
实例3：            
```javascript
    let generator = function* () {
        yield 1;
        yield* [2,3,4];
        yield 5;
    };
    var iterator = generator();
    iterator.next() // { value: 1, done: false }
    iterator.next() // { value: 2, done: false }
    iterator.next() // { value: 3, done: false }
    iterator.next() // { value: 4, done: false }
    iterator.next() // { value: 5, done: false }
    iterator.next() // { value: undefined, done: true }
```

#### 3.4、其他场合       
由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合，其实都调用了遍历器接口。下面是一些例子。            
- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet() （比如new Map([['a',1],['b',2]])）
- Promise.all()
- Promise.race()


### 4、Iterator 接口与 Generator 函数         
Symbol.iterator方法的最简单实现，还是使用下一章要介绍的 Generator 函数。           
实例：         
```javascript
    var myIterable = {};
    myIterable[Symbol.iterator] = function* () {
        yield 1;
        yield 2;
        yield 3;
    };
    [...myIterable] // [1, 2, 3]
    
    //  或者采用下面的简洁写法
    let obj = {
        * [Symbol.iterator]() {
            yield 'hello';
            yield 'world';
        }
    };
    for (let x of obj) {
        console.log(x);
    }
    // hello
    // world
```

### 5、for...of 循环   -   重点！！！           
ES6 借鉴 C++ 、 Java 、 C# 和 Python 语言，引入了for...of循环，作为遍历所有数据结构的统一的方法。一个数据结构只要部署了Symbol.iterator属性，就被视为具有 iterator 接口，就可以用for...of循环遍历它的成员。也就是说，for...of循环内部调用的是数据结构的Symbol.iterator方法。             
for...of 循环可以使用的范围包括数组、 Set 和 Map 结构、某些类似数组的对象（比如 arguments 对象、 DOM NodeList 对象）、后文的 Generator 对象，以及字符串。                

#### 5.1、数组         
数组原生具备 iterator 接口，for...of循环本质上就是调用这个接口产生的遍历器，可以用下面的代码证明。          
实例1:            
```javascript
    const arr = ['red', 'green', 'blue'];
    let iterator = arr[Symbol.iterator]();
    
    for(let v of arr) {
        console.log(v); // red green blue
    }
    
    for(let v of iterator) {
        console.log(v); // red green blue
    }
``` 

JavaScript 原有的for...in循环，只能获得对象的键名，不能直接获取键值。 ES6 提供for...of循环，允许遍历获得键值。     
实例2:            
```javascript
    var arr = ['a', 'b', 'c', 'd'];
    
    for (let a in arr) {
        console.log(a); // 0 1 2 3
    }
    
    for (let a of arr) {
        console.log(a); // a b c d
    }
```
上面代码表明，for...in循环读取键名，for...of循环读取键值。如果要通过for...of循环，获取数组的索引，可以借助数组实例的entries方法和keys方法，参见《数组的扩展》章节。         

实例3：for...of循环调用遍历器接口，数组的遍历器接口只返回具有数字索引的属性。这一点跟for...in循环也不一样。          
```javascript
    let arr = [3, 5, 7];
    arr.foo = 'hello';
    
    for (let i in arr) {
        console.log(i); // "0", "1", "2", "foo"
    }
    
    for (let i of arr) {
        console.log(i); // "3", "5", "7"
    }
```

#### 5.2、Set 和 Map 结构           
Set 和 Map 结构也原生具有 Iterator 接口，可以直接使用for...of循环。     
实例1：基本使用            
```javascript
    var engines = new Set(["Gecko", "Trident", "Webkit", "Webkit"]);
    for (var e of engines) {
        console.log(e);
    }
    // Gecko
    // Trident
    // Webkit
    
    var es6 = new Map();
    es6.set("edition", 6);
    es6.set("committee", "TC39");
    es6.set("standard", "ECMA-262");
    for (var [name, value] of es6) {
        console.log(name + ": " + value);
    }
    4、通信类
    // committee: TC39
    // standard: ECMA-262
```

Set 结构遍历时，返回的是一个值，而 Map 结构遍历时，返回的是一个数组，该数组的两个成员分别为当前 Map 成员的键名和键值。         
实例2：   
```javascript
    let map = new Map().set('a', 1).set('b', 2);
    for (let pair of map) {
        console.log(pair);
    }
    // ['a', 1]
    // ['b', 2]
    
    for (let [key, value] of map) {
        console.log(key + ' : ' + value);
    }
    // a : 1
    // b : 2
```

#### 5.3、计算生成的数据结构

有些数据结构是在现有数据结构的基础上，计算生成的。比如， ES6 的数组、 Set 、 Map 都部署了以下三个方法，调用后都返回遍历器对象。     

- entries() 返回一个遍历器对象，用来遍历[ 键名 ,  键值 ]组成的数组。对于数组，键名就是索引值；对于 Set ，键名与键值相同。 Map 结构的iterator 接口，默认就是调用 entries 方法。
- keys() 返回一个遍历器对象，用来遍历所有的键名。
- values() 返回一个遍历器对象，用来遍历所有的键值。

实例：         
```javascript
    let arr = ['a', 'b', 'c'];
    
    for (let pair of arr.entries()) {
        console.log(pair);
    }
    // [0, 'a']
    // [1, 'b']
    // [2, 'c']
```

#### 5.4、对象             
对于普通的对象，for...of结构不能直接使用，会报错，必须部署了 iterator 接口后才能使用。但是，这样情况下，for...in循环依然可以用来遍历键名。              
实例：         
```javascript
    var es6 = {
        edition: 6,
        committee: "TC39",
        standard: "ECMA-262"
    };
    
    for (e in es6) {
        console.log(e);
    }
    // edition
    // committee
    // standard
    
    for (e of es6) {
        console.log(e);
    }
    // TypeError: es6 is not iterable
```
一种解决方法是，使用Object.keys方法将对象的键名生成一个数组，然后遍历这个数组。           
```javascript
    for (var key of Object.keys(someObject)) {
        console.log(key + ": " + someObject[key]);
    }
```

另一个方法是使用 Generator 函数将对象重新包装一下。         
```javascript
    function* entries(obj) {
        for (let key of Object.keys(obj)) {
            yield [key, obj[key]];
        }
    }
    for (let [key, value] of entries(obj)) {
        console.log(key, "->", value);
    }
    // a -> 1
    // b -> 2
    // c -> 3
```


### 6、对比JS中的几种遍历：for     forEach   for...in   for...of
#### 理解 JavaScript 中的 for…of 循环
for...of 语句创建一个循环来迭代可迭代的对象。
在 ES6 中引入的 for...of 循环，以替代 for...in 和 forEach() ，并支持新的迭代协议。
for...of 允许你遍历 Arrays（数组）, Strings（字符串）, Maps（映射）, Sets（集合）等可迭代的数据结构等。                          
对象数据结构是不可以用于for...of 的

语法：
```js
for (variable of iterable) {
    statement
}
```
- variable：每个迭代的属性值被分配给该变量。
- iterable：一个具有可枚举属性并且可以迭代的对象。

#### Arrays(数组)
Arrays（数组）就是类列表（list-like）对象。数组原型上有各种方法，允许对其进行操作，比如修改和遍历等操作。
下面手在一个数组上进行的 for...of 操作：
```js
// array-example.js
const iterable = ['mini', 'mani', 'mo'];
 
for (const value of iterable) {
  console.log(value);
}
 
// Output:
// mini
// mani
// mo
```


#### Maps(映射)
Map 对象就是保存 key-value(键值) 对。对象和原始值可以用作 key(键)或 value(值)。
Map 对象根据其插入方式迭代元素。换句话说， for...of 循环将为每次迭代返回一个 key-value(键值) 数组。
```js
// map-example.js
const iterable = new Map([['one', 1], ['two', 2]]);
 
for (const [key, value] of iterable) {
  console.log(`Key: ${key} and Value: ${value}`);
}
 
// Output:
// Key: one and Value: 1
// Key: two and Value: 2
```

#### Set(集合)
Set(集合) 对象允许你存储任何类型的唯一值，这些值可以是原始值或对象。 
Set(集合) 对象只是值的集合。 Set(集合) 元素的迭代基于其插入顺序。
Set(集合) 中的值只能发生一次。如果您创建一个具有多个相同元素的 Set(集合) ，那么它仍然被认为是单个元素                       
```js
// set-example.js
const iterable = new Set([1, 1, 2, 2, 1]);
 
for (const value of iterable) {
  console.log(value);
}
// Output:
// 1
// 2
```

#### String(字符串)
```js
// string-example.js
const iterable = 'javascript';
 
for (const value of iterable) {
  console.log(value);
}
 
// Output:
// "j"
// "a"
// "v"
// "a"
// "s"
// "c"
// "r"
// "i"
// "p"
// "t"
```


#### Arguments Object(参数对象)
```js
// arguments-example.js
function args() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
 
args('a', 'b', 'c');
// Output:
// a
// b
// c
```

#### Generators(生成器)
```js
// generator-example.js
function* generator(){ 
  yield 1; 
  yield 2; 
  yield 3; 
}
 
for (const g of generator()) { 
  console.log(g); 
}
 
// Output:
// 1
// 2
// 3
```


#### 退出迭代
avaScript 提供了四种已知的终止循环执行的方法：break、continue、return 和 throw。让我们来看一个例子：
```js
const iterable = ['mini', 'mani', 'mo'];
 
for (const value of iterable) {
  console.log(value);
  break;
}
 
// Output:
// mini
```


#### 普通对象不可迭代
for...of 循环仅适用于迭代。 而普通对象不可迭代。 我们来看一下：
```js
const obj = { fname: 'foo', lname: 'bar' };
 
for (const value of obj) { // TypeError: obj[Symbol.iterator] is not a function
    console.log(value);
}
```
在这里，我们定义了一个普通对象 obj ，并且当我们尝试 for...of 对其进行操作时，会报错：TypeError: obj[Symbol.iterator] is not a function。

我们可以通过将类数组(array-like)对象转换为数组来绕过它。该对象将具有一个 length 属性，其元素必须可以被索引。我们来看一个例子：
```js
// object-example.js
const obj = { length: 3, 0: 'foo', 1: 'bar', 2: 'baz' };
 
const array = Array.from(obj);
for (const value of array) { 
    console.log(value);
}
// Output:
// foo
// bar
// baz
```
Array.from() 方法可以让我通过类数组(array-like)或可迭代对象来创建一个新的 Array(数组) 实例。

#### For…of vs For…in
for...of 更多用于特定于集合（如数组和对象），但不包括所有对象。                        
注意：任何具有 Symbol.iterator 属性的元素都是可迭代的。

for...in 不考虑构造函数原型的不可枚举属性。它只需要查找可枚举属性并将其打印出来。

