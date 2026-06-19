---
title: lesson5 cpp进阶多线程
published: 2026-06-21
description: "教学文档lesson5"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson5 cpp进阶多线程**

对于现代CPU，往往有多个核心进行计算，尤其是车上运算平台搭载的CPU（不同于单片机CPU只有一个核心），有多个核心就能说明可以实现并行的运算，大大提高计算效率。但是，常规的编程代码只会使用单一的核心进行运算，通常会造成一个核心占用跑满但其他核心只有丁点占用，显然这导致了算力资源的极度浪费，执行效率也不够高。因此，我们需要学习多线程编程来尽可能的压榨硬件资源，同时做到多线程安全。

## 基本概念讲解

我们要着重理解以下名词，这是了解多线程编程的基础：

- 进程：进程就是一个程序的执行过程,是资源分配的最小单位。每个进程之间相互独立，都有自己的堆、栈、存储以及数据。
- 线程：线程是在一个进程中的程序执行过程，是CPU调度的最小单位。它们共享同一份地址空间
- 同步：同步是指要在上一个任务执行结束后才能执行下一个任务，因此同步编程没有并发和并行的概念。
- 异步：异步就是你可以在执行任务A的同时执行任务B，而多线程编程就是一种典型的异步编程。
- 并发：狭义上表示计算机能够同时执行多项任务，但一般来说指在单核下通过分配时间片达到每个任务都能执行到（并非真正的达到同时执行多个任务）
- 并行：多核CPU就能够实现真正意义上的同时执行多个任务，这也叫并行

在实际情况下，线程数几乎不可能与核心数永远相等，对于每个线程来讲，操作系统会给每个线程分配一个虚拟的CPU核心，让每个线程都自以为独占一个核心，而实际的调度由操作系统背后执行。
对于线程数少于核心数的情况下，在线程的角度下，操作系统会根据核心占用率来更换线程占用的核心，不让一个线程长时间的占用一个核心而是多个核心轮换使用来提高核心利用率。

![Image](src/content/posts/teach05/images/image1.png)

对于线程数多于核心数的情况下，在核心的角度下，单个核心需要让多个线程来使用来提高执行效率（可以看作并行和并发的混合）。

![Image](src/content/posts/teach05/images/image2.png)

## 实现多线程编程

```
void greeting(int idx){
    std::cout<<"Hello from thread"<<idx<<std::endl;
}

int main(){
    const int N = 10;
    std::array<std::thread,N> workers;
    for(int i = 0;i < N;i++){
        workers[i] = std::thread(greeting,i);
    }

    for(auto& worker:workers){
        worker.join();
    }
}
```

这是一份简单的多线程示例代码
可以看到，创建线程需要使用std::thread来管理线程，thread(F&& f,Args&&... args),第一个参数是线程要执行的函数（即入口函数），args则是传给函数的参数。
join()则用来等待线程执行完毕以合并，在未执行完毕前join()不会返回。

```
int main(){
    std::thread mythread(hello,std::string("world"));
    return 0;
}
```

注意：在程序结束之前一定要先结束线程，例如这份代码，主程序在创建线程后会继续执行后面的代码return 0,导致程序结束，而此时线程还未结束，因此程序会出现error。

## 多线程同步

多线程同步是线程安全的基础，讲到这不得不看下面这一份经典案例代码

```
int n = 0;

void increase_number(){
    for(int i = 0;i < 1000000;i++){
        n++;
    }
}

int main(){
    for(int i = 0;i < 10;i++){
        std:thread(increase_number);
    }
}
```

如果你尝试运行一下上面的代码，你会发现得出的结果一定不是正确的，而且每次的结果不一样，这相当匪夷所思，其实问题就出现在n++这条代码上。
n++到汇编层会被翻译成三条机器指令，分别为把内存中的数据加载到CPU的寄存器eax中，然后将eax中的数据+1,最后再将计算结果写回内存。即这里的n++不是原子操作（原子操作指不能够被继续拆分或者被其它操作打断的指令）。
可以这样解释，现在有线程A和线程B，理想情况下是线程A从内存读取数据0到寄存器中，然后+1变为1,再写回内存中，然后线程B从内存读取数据1到寄存器中，然后+1得到2,再写回内存中。但是现实情况是线程之间是并行的，不能够保证线程B一定会在线程A执行结束后再执行，即可能线程A还未将寄存器中的1写回内存，线程B就读取数据，此时读取的数据还是旧数据0，导致结果只被累加了一次。
因此，我们需要实现多线程同步，即使原本异步的操作依次有序地执行。

### 锁🔓

在cpp中常用的是互斥锁std::mutex

锁的原理很简单，在线程创建后上锁lock()，mutex会保证同一时间只有一个线程能够执行，然后在线程执行结束后解锁unlock(),这样就能够保证多线程同步了。
但是手动的进行lock()和unlock()相当麻烦，而且也不够安全（就跟手动管理内存一样傻福🤮），因此我们可以使用带有RAII思想的std::unique_lock，实现构造时自动加锁，析构时自动解锁
需要知道的是，多个锁的叠加嵌套可能会导致死锁现象，因此不建议创建多个锁，而且频繁的上锁解锁会严重浪费资源，因此建议只在必要的读取资源时上锁。

### 原子操作

c++11引入std::atomic原子操作，提供了一种无锁的线程安全操作方式，它主要针对单一基础变量，且操作仅限于一些简单的读取、写入、增减或通过CAS更新，更接近于底层。
回看到上面多线程同步的讲解，我们说n++的机器指令不是原子操作，这里我们把代码改写为atomic<int> n = 0,就可以在机器内部翻译成硬件支持的原子操作，效率通常比锁更高。
可以看到原子操作和互斥锁是两个层面的同步方式，std::atomic在底层解决问题且聚焦于单一变量，std::mutex在上层业务中使用，方便管理多个变量的复合操作，两者一般结合使用。

### 信号量

semaphore信号量可以理解为一个信号灯，用于实现对有限资源的并发访问控制，其内部有一个计数器，代表资源的可用数量，信号量>0时线程可以访问资源，此时计数器-1,当信号量为0时，就不可访问资源，需要等待，当有线程结束资源释放时信号量重新+1,之前等待的线程也就结束等待，进行访问。
这样我们就可以灵活地进行控制

### 条件变量

std::condition_variable条件变量需要结合std::mutex使用，本质就是实现在满足一定条件下线程才能够执行，否则线程休眠。主要使用wait()来进行等待，notify_one()或notify_all()来进行通知


最后贴出写这次文档的参考资料，感兴趣的同学可以观看深入了解：

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=417284346&bvid=BV17V411e7Ua&cid=316175742&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=717872269&bvid=BV1oQ4y1C73G&cid=402142356&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113685502628251&bvid=BV18hk2Y4EAm&cid=27442155017&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113779169826043&bvid=BV1sDrGYQEKP&cid=29356132597&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113797322773349&bvid=BV1RkrrYSEDY&cid=27790018244&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1255441103&bvid=BV1VJ4m1g7Nh&cid=1573431472&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

--由qing_feng编写