## RXJS 入门

<!-- toc -->

- [安装RXJS](#%E5%AE%89%E8%A3%85rxjs)
- [Observable 和 Observer 概念](#observable-%E5%92%8C-observer-%E6%A6%82%E5%BF%B5)
  * [创建 Observable](#%E5%88%9B%E5%BB%BA-observable)
  * [再复杂一点](#%E5%86%8D%E5%A4%8D%E6%9D%82%E4%B8%80%E7%82%B9)
  * [Observable的结束](#observable%E7%9A%84%E7%BB%93%E6%9D%9F)
  * [关于错误机制](#%E5%85%B3%E4%BA%8E%E9%94%99%E8%AF%AF%E6%9C%BA%E5%88%B6)
  * [关于简写方式](#%E5%85%B3%E4%BA%8E%E7%AE%80%E5%86%99%E6%96%B9%E5%BC%8F)
  * [退订 Observable](#%E9%80%80%E8%AE%A2-observable)

<!-- tocstop -->

### 安装RXJS
直接 `yarn add rxjs --dev`                        
会自动安装TS定义， 所以TS项目不需要额外装包

### Observable 和 Observer 概念


#### 创建 Observable
Observable = Publisher + Iterator

```js
// RxJS v6+
import { Observable } from 'rxjs';

const { create } = Observable;

// 订阅事件
const onSubscribe = observer => {
  // 这个地方next 表示吧数据推送
  observer.next(1);
  observer.next(2);
  observer.next(3);
};

// 数据流对象
const source$ = create(onSubscribe);

// 观察者
const theObserver = {
  next: item => console.log(item),
};

// 发布事件
source$.subscribe(theObserver);
```


#### 再复杂一点
上面的例子看不出来有何优点， 如果这样：
如果Observable 是不间断的推送出一串正整数

```js
// 如果Observable 是不间断的推送出一串正整数

// RxJS v6+
import { Observable } from 'rxjs';

const { create } = Observable;

const onSubscribe = observer => {
  let time = 0;
  const handleInterval = setInterval(()=> {
    time+=1;
    observer.next(time);
    if (time > 5) clearInterval(handleInterval)
  }, 500)
};

const source$ = create(onSubscribe);
const theObserver = {
  next: item => console.log(item),
};

source$.subscribe(theObserver);
```

#### Observable的结束
调动`observer.next` 仅仅是吧数据推送给观察者执行， 但是并没有 事件结束的意思。                    
实际场景中 可以使用 `observer.complete()` 来表示事件的结束
```typescript
// 如果Observable 是不间断的推送出一串正整数
// 需要在最后结束的时候调用终结程序的方法

// RxJS v6+
import { Observable } from 'rxjs';
import { Subscriber } from 'rxjs/src/internal/Subscriber';
import { PartialObserver, TeardownLogic } from 'rxjs/src/internal/types';

const { create } = Observable;

type OnSubscribe<T> = (subscriber: Subscriber<T>) => TeardownLogic

const onSubscribe: OnSubscribe<number> = observer => {
  let time = 0;
  const handleInterval = setInterval(() => {
    time += 1;
    observer.next(time);
    if (time > 5) {
      clearInterval(handleInterval);
      observer.complete();
    }
  }, 500);
};

const source$: Observable<number> = create(onSubscribe);

const theObserver: PartialObserver<number> = {
  next: item => console.log(item),
  complete: () => console.log('没有更多数据'),
};

source$.subscribe(theObserver);
```


#### 关于错误机制
```typescript
import { Observable } from 'rxjs';
import { OnSubscribe } from './utils';

const { create } = Observable;

const onSubscribe: OnSubscribe<number> = observer => {
  observer.next(1);
  observer.error('has error');
  observer.complete();
};

const source$: Observable<number> = create(onSubscribe);

source$.subscribe({
  next: item => console.log(item),
  // 实际上出现错误之后， Observable 对象已经终结了，所以不会再执行 complete
  error: err => console.log(err),
  complete: () => console.log('complete'),
});
```


#### 关于简写方式
```typescript
import { Observable } from 'rxjs';
import { OnSubscribe } from './utils';

const { create } = Observable;

const onSubscribe: OnSubscribe<number> = observer => {
  let time = 0;
  const handleInterval = setInterval(() => {
    time += 1;
    observer.next(time);
    if (time > 5) {
      clearInterval(handleInterval);
      observer.complete();
    }
  }, 500);
};

const source$: Observable<number> = create(onSubscribe);

source$.subscribe(
  value=>console.log('next: ', value),
  err => console.log(err), // 如果不想要 err 的话， 可以直接置位 null 就可以了
  ()=> console.log('complete'),
);
```

#### 退订 Observable
```typescript
import { Observable } from 'rxjs';
import { OnSubscribe } from './utils';

const { create } = Observable;

const onSubscribe: OnSubscribe<number> = observer => {
  let time = 0;
  const handleInterval = setInterval(() => {
    observer.next(time++);
  }, 500);

  return {
    unsubscribe: () => clearInterval(handleInterval),
  };
};

const source$: Observable<number> = create(onSubscribe);

const subscription = source$.subscribe(
  value => console.log('next: ', value),
  err => console.log(err), // 如果不想要 err 的话， 可以直接置位 null 就可以了
  () => console.log('complete'),
);

setTimeout(()=> {
  subscription.unsubscribe();
});
```
有一个非常值得注意的地方， 这个虽然在 `unsubscribe` 函数调用之后，Observer 不在接受到推送的数据了， 但是并不表示 Observable 已经结束了。
结束的唯一标志是complete 或者 error














