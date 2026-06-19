---
title: lesson4 cpp进阶RAII思想
published: 2026-06-20
description: "教学文档lesson4"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson4 cpp进阶RAII思想**

前面的文档是带大家了解和配置一些开发工具及环境，从lesson4开始后面讲解一些cpp的进阶知识，相信大部分人cpp入门看的都是黑马程序员，但是里面学到的内容只能保证你写出一些基本的cpp代码，远远达不到工程级代码的程度，如果你去看一些cpp语言的开源项目，我想你首先会觉得很懵（这给我干哪来了，这还是cpp吗😅），我本人的目标也是尽力带各位小登写出一个工程级的项目，理解一些工程思想。

话不多说，现在开始吧

## 什么是RAII

RAII即resource acquisition is initialization(资源获取即初始化)，是cpp的核心资源管理方式，是一种由多种语法、规则、准则共同实现的自动管理资源获取和释放的机制。

RAII本质上是将资源封装到栈对象的内部，并由站栈象负责资源的初始化和释放过程，配合栈对象的生命周期机制，实现自动的资源生命周期管理。由于c和cpp没有像python那样带有GC机制（垃圾回收机制），在c中一般都是程序员自己手动创建和释放资源（孩子不要学c风格到处malloc和new,特别傻福😡），极容易出现资源泄露，因此在cpp中使用了RAII来解决资源管理问题（但它并非像rust那样强制管理）。

## RAII的实现

RAII的实现依赖于以下三种概念：

- 对象的构造和析构函数：构造函数来进行对象的初始化，在对象创建时完成资源的获取过程，析构函数则是在对象销毁时执行来释放资源
- 栈对象和成员的生命周期：栈对象和类的成员在其生命周期中会执行构造函数和析构函数，避免发生未初始化或未释放的问题
- cpp资源所有权模型：资源的所有权绑定在对象上，对象需要负责资源的释放，使资源的生命周期与对象的生命周期一致

构造函数获取资源，析构函数释放资源，栈对象定义生命周期的边界，所有权模型明确谁负责释放资源，RAII这种自动资源管理体系便由此构建。

## RAII典例

std::unique_lock是典型的RAII类型，在构造时获取锁，析构时自动释放，从而避免死锁以及资源泄露问题

最后简单来说，就是将资源交给类来管理，类创建时自动调用构造函数获取资源，销毁时自动调用析构函数释放资源，从而不需要程序员手动管理资源。

RAII是cpp中非常重要的一个思想，你基本可以随地可见，如shared_ptr、unique_lock、scoped_lock等。相当重要的是要做到，千万不要用malloc，尽量不要new，尽可能多得用智能指针，这样能够很好地解决内存泄露问题。（再说一遍不要随便学c风格代码，我们不是c with class，而是modern cpp）

参考资料：
<iframe width="100%" height="468" src="//player.bilibili.com/player.html?isOutside=true&aid=115740258600246&bvid=BV1gAqpBgEb2&cid=34862073907&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0></iframe>

--qing_feng编写