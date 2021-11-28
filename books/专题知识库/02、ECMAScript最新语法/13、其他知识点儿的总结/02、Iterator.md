## Iterator

<!-- toc -->

- [什么是迭代器(Iterator)？](#%E4%BB%80%E4%B9%88%E6%98%AF%E8%BF%AD%E4%BB%A3%E5%99%A8iterator)
- [什么是可迭代对象(Iterable)？](#%E4%BB%80%E4%B9%88%E6%98%AF%E5%8F%AF%E8%BF%AD%E4%BB%A3%E5%AF%B9%E8%B1%A1iterable)
- [理解 for...of 循环](#%E7%90%86%E8%A7%A3-forof-%E5%BE%AA%E7%8E%AF)
- [使迭代器可迭代](#%E4%BD%BF%E8%BF%AD%E4%BB%A3%E5%99%A8%E5%8F%AF%E8%BF%AD%E4%BB%A3)
- [生成器](#%E7%94%9F%E6%88%90%E5%99%A8)
  * [生成器函数](#%E7%94%9F%E6%88%90%E5%99%A8%E5%87%BD%E6%95%B0)
  * [在生成器中return](#%E5%9C%A8%E7%94%9F%E6%88%90%E5%99%A8%E4%B8%ADreturn)
- [添加`[Symbol.iterator]`使Object可迭代](#%E6%B7%BB%E5%8A%A0symboliterator%E4%BD%BFobject%E5%8F%AF%E8%BF%AD%E4%BB%A3)
- [生成器委托 yield*](#%E7%94%9F%E6%88%90%E5%99%A8%E5%A7%94%E6%89%98-yield)
- [最后一个例子](#%E6%9C%80%E5%90%8E%E4%B8%80%E4%B8%AA%E4%BE%8B%E5%AD%90)
- [参考资料](#%E5%8F%82%E8%80%83%E8%B5%84%E6%96%99)

<!-- tocstop -->

### 什么是迭代器(Iterator)？
满足迭代器协议的对象。                                 
迭代器协议: 对象的next方法是一个无参函数，它返回一个对象，该对象拥有done和value两个属性：

- done(boolean):
    - 如果迭代器已经经过了被迭代序列时为true。这时value可能描述了该迭代器的返回值。
    - 如果迭代器可以产生序列中的下一个值，则为false。这等效于连同done属性也不指定。
- value: 迭代器返回的任何 JavaScript值。done为true时可省略。

ES5实现一个简单迭代器：
```ts
const createIterator = (items: any[]) => {
  let i = 0;
  return {
    next: () => {
      const done = i >= items.length;
      const value = !done ? items[i++] : undefined;
      return {
        done,
        value,
      };
    },
  };
};

const iterator = createIterator([1, 3, 5]);
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());

console.log(iterator.next());

export default {};
```

### 什么是可迭代对象(Iterable)？
满足可迭代协议的对象是可迭代对象。                       
可迭代协议: 对象的[Symbol.iterator]值是一个无参函数，该函数返回一个迭代器。

在ES6中，所有的集合对象（Array、 Set 与 Map）以及String、arguments都是可迭代对象，它们都有默认的迭代器。                        

可迭代对象可以在以下语句中使用：

- for...of循环
```js
for (let value of ['a', 'b', 'c']) {
  console.log(value);
}
// "a"
// "b"
// "c"
```

- 扩展运算符
```js
[...'abc'];   // ["a", "b", "c"]
console.log(...['a', 'b', 'c']);   // ["a", "b", "c"]
```

- yield*
```js
function* gen() {
  yield* ['a', 'b', 'c'];
}

gen().next(); // { value: "a", done: false }
```

- 解构赋值
```js
let [a, b, c] = new Set(['a', 'b', 'c']);
a;   // 'a'
```

### 理解 for...of 循环
for...of接受一个可迭代对象（Iterable），或者能被强制转换/包装成一个可迭代对象的值（如'abc'）。
遍历时，for...of会获取可迭代对象的`[Symbol.iterator]()`，
对该迭代器逐次调用next()，直到迭代器返回对象的done属性为true时，遍历结束，不对该value处理。

for...of循环实例：
```js
var a = ["a","b","c","d","e"];

for (var val of a) {
	console.log( val );
}
// "a" "b" "c" "d" "e"
```

转换成普通for循环示例，等价于上面for...of循环：
```js
var a = ["a","b","c","d","e"];

for (var val, ret, it = a[Symbol.iterator]();
	(ret = it.next()) && !ret.done;
) {
	val = ret.value;
	console.log( val );
}
// "a" "b" "c" "d" "e"
```

### 使迭代器可迭代
在什么是迭代器部分，我们自定义了一个简单的生成迭代器的函数createIterator，但并该函数生成的迭代器并没有实现可迭代协议，
所以不能在for...of等语法中使用。可以为该对象实现可迭代协议，在`[Symbol.iterator]`函数中返回该迭代器自身。
```ts
const createIteratorDemo = (items: any[]) => {
  let i = 0;
  return {
    next: function() {
      const done = i >= items.length;
      const value = !done ? items[i++] : undefined;
      return {
        done,
        value,
      };
    },
    [Symbol.iterator]: function() {
      return this;
    },
  };
};

const iteratorDemo: any = createIteratorDemo([1, 2, 3]);
console.log(...iteratorDemo);

export default {};
```


### 生成器
#### 生成器函数

`生成器函数（GeneratorFunction）`是能返回一个生成器（generator）的函数。生成器函数由放在 function 关键字之后的一个星号（ * ）来表示，并能使用新的 yield 关键字。
```ts
function *aGeneratorfunction(){
  yield 1
  yield 2
  yield 3
};

var aGeneratorObject = aGeneratorfunction()
// 生成器对象
aGeneratorObject.toString()   // "[object Generator]"
```

生成器对象既是迭代器，又是可迭代对象
```js
function *aGeneratorfunction(){
  yield 1
  yield 2
  yield 3
};

var aGeneratorObject = aGeneratorfunction()

// 满足迭代器协议，是迭代器
aGeneratorObject.next()   // {value: 1, done: false}
aGeneratorObject.next()   // {value: 2, done: false}
aGeneratorObject.next()   // {value: 3, done: false}
aGeneratorObject.next()   // {value: undefined, done: true}

// [Symbol.iterator]是一个无参函数，该函数执行后返回生成器对象本身（是迭代器），所以是可迭代对象
aGeneratorObject[Symbol.iterator]() === aGeneratorObject   // true

// 可以被迭代
var aGeneratorObject1 = aGeneratorfunction()
[...aGeneratorObject1]   // [1, 2, 3]
```

#### 在生成器中return
遍历返回对象的done值为true时迭代即结束，不对该value处理。
```javascript
function *createIterator() {
  yield 1;
  return 42;
  yield 2;
}

let iterator = createIterator();
iterator.next();   // {value: 1, done: false}
iterator.next();   // {value: 42, done: true}
iterator.next();   // {value: undefined, done: true}
```

`done值为true时迭代即结束，迭代不对该value处理。`所以对这个迭代器遍历，不会对值42处理。
```javascript
let iterator1 = createIterator();
console.log(...iterator);   // 1
```

### 添加`[Symbol.iterator]`使Object可迭代
根据可迭代协议，给Object的原型添加`[Symbol.iterator]`，值为返回一个对象的无参函数，被返回对象符合迭代器协议。
```javascript
Object.prototype[Symbol.iterator] = function() {
  let i = 0;
  const items = Object.entries(this);
  return {
    next: () => {
      const done = i >= items.length;
      const value = !done ? items[i++] : undefined;
      return {
        done,
        value,
      };
    },
  };
};

const a = {
  name: 'Jimmy',
  age: 18,
  job: 'actor',
};

console.log(...a); // [ 'name', 'Jimmy' ] [ 'age', 18 ] [ 'job', 'actor' ]
```

使用生成器简化代码：
```javascript
// 生成器简化代码
Object.prototype[Symbol.iterator] = function *() {
  for (const key in this) {
    yield [key, this[key]]
  }
}

const a = {
  name: 'Jimmy',
  age: 18,
  job: 'actor'
}

console.log(...a)   // [ 'name', 'Jimmy' ] [ 'age', 18 ] [ 'job', 'actor' ]
```

### 生成器委托 yield*
```javascript
function* g1() {
  yield 1;
  yield 2;
}

function* g2() {
  yield* g1();
  yield* [3, 4];
  yield* "56";
  yield* arguments;
}

var generator = g2(7, 8);
console.log(...generator);   // 1 2 3 4 "5" "6" 7 8
```

### 最后一个例子
分析下面这段代码：
```javascript
function* fibs() {
  var a = 0;
  var b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

var [first, second, third, fourth, fifth, sixth] = fibs();
console.log(first, second, third, fourth, fifth, sixth);
```

在这段代码里，fibs是一个生成无限长的斐波那契数列的生成器，
`[a, b] = [b, a + b]` 是利用解构赋值的交换赋值写法（=赋值是从右到左计算，所以先计算右侧a+b，然后才结构，所有有交换赋值的效果），
写成生成有限长的数组的ES5写法如下：
```javascript
function fibs1(n) {
  var a = 0;
  var b = 1;
  var c = 0;
  var result = []
  for (var i = 0; i < n; i++) {
    result.push(a);
    c = a;
    a = b;
    b = c + b;
  }

  return result;
}

console.log(fibs1(6))   // [0, 1, 1, 2, 3, 5]
```

而第一段代码里，就是从fibs()迭代器（生成器是迭代器的子集）中解构出前六个值，代码示例如下：
```javascript
function* fibs2(n) {
  var a = 0;
  var b = 1;
  for (var i = 0; i < n; i++) {
    yield a;
    [a, b] = [b, a + b];
  }
}

console.log(...fibs2(6))
```


### 参考资料
- [ES6 迭代器(Iterator)和 for...of循环使用方法](https://www.jianshu.com/p/3bb77516fa7e)
- [理解ES6的 Iterator 、Iterable 、 Generator](https://github.com/yueshuiniao/blog/issues/2)
