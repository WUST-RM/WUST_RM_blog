---
title: lesson8 cpp进阶cpp新标准简介
published: 2026-07-15
description: "教学文档lesson8"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson8 cpp进阶cpp新标准简介**

这是cpp进阶系列的最后一篇，大致总结讲解一些常用的新标准特性语法。还是要说明一个现象，大部分新手认为的cpp是黑马千万播放的cpp98教程，而实际的现代项目已经到17,20,23,如果不了解新标准，一些开源库代码是根本看不懂的，这里也是简介一下工程级项目常用语法，并希望大家学以致用。详细的语法说明请见cppreference:[传送门](https://cppreference.cn/w/)

## 智能指针

之前介绍RAII的时候简单讲过，这里再次讲解一遍。

核心内容为：
- unique_ptr:独占所有权，一个对象在同一时刻有且仅有一个unique_ptr拥有它。不可拷贝，只可移动。可以理解为带有RAII的指针，是替代裸指针的首选。
- shared_ptr:共享所有权，多个shared_ptr可共同拥有同一块资源，通过引用记数自动化管理，当最后一个拥有者销毁时释放资源。
- weak_ptr:它不控制对象的生命周期，只是观测一个由shared_ptr管理的对象，主要用于打破循环应用（当两个对象彼此拥有对方的shared_ptr时，引用记数永远都不会归零，从而导致内存泄露，将其中一个改为weak_ptr即可打破循环）

有了智能指针，我们就不需要去使用裸指针来直接管理动态资源。当所有权唯一时使用unique_ptr，需要共享则使用shared_ptr。

## auto

让编译器自动推导变量类型，从而减少冗余类型名，尤其在泛型、迭代器、复杂模板类型时不可替代

```
auto i = 91;           //int
auto d = 3.14;         //double
auto s = "hello";      //string
std::vector<int> v;
auto it = v.begin();   //std::vector<int>::iterator
auto add = [](auto a,auto b){return a+b;};
```

可以配合decltype(auto)来完全保留表达式的值类别（包括引用性和cv限定符）,主要用于函数返回类型需要精确转发引用属性的场景
```
const int ci = 5;
decltype(auto) a = ci;    //const int
```

## lambda表达式

一个lambda表达式的一般形式为
```
[capture](parameters) specifiers -> return_type{body}
```

- capture(捕获列表)：定义lambda体内可以访问哪些外部变量，以及访问方式（值或引用）（如[&]引用捕获所有局部变量，[this]捕获当前对象指针，简单来说就是可以限定访问范围）
- parameters(参数列表)：与普通函数的参数列表一致，无参时可省略
- specifiers（修饰符）：可选，如mutable、constexpr、noexcept
- return_type(返回类型)：可省略，由编译器推导
- body(函数体)：执行的代码

```
std::vector<int> v = {1,2,3,4,5};
auto it = std::find_if(v.begin(),v.end(),[](int n) -> {return n > 3;});
```

lambda表达式是函数式编程的典型案例，也可以简单理解为匿名函数。

## noexcept

noexcept说明符：用在函数说明或定义末尾，告诉编译器该函数不会让异常逃逸出去

```
void f() noexcept;  //承诺不抛出异常
```

noexcept运算符：检查表达式是否会抛异常，在编译期求值返回bool

简单理解noexcept就是主动告诉编译器这里不需要进行检查，进行编译器优化，从而提高性能。

给移动构造函数/赋值加上noexcept,告诉编译器移动无风险，不用为了安全退化为拷贝，往往能够显著提升容器性能。

所有析构函数也都隐式声明为noexcept(true)。

## 移动语义

移动允许我们以一种清量的方式将资源从一个对象“转移”到另一个对象，而不是进行昂贵的深拷贝。核心是窃取临时对象或即将销毁的对象的资源，从而大幅提升性能。

拷贝析构是对新对象重新分配内存，并逐一复制所有元素，此时临时对象的拷贝就会造成不必要的开销（刚拷贝完临时对象就被析构了），而移动就是直接“接管”临时对象的内存指针，省去内存分配和拷贝。

还有一些概念需要明白：
- 左值：有名字、可寻址的对象，如变量x
- 右值：临时对象、字面量、表达式中间结果等，没有名字，即将被销毁
- 右值引用：T&&，专门用来绑定右值。是实现移动语义的基石

```
int a = 10;         //a是左值
int&& rref = 10;    //rref绑定右值10
```

一个类要支持移动，需要定义以下特殊成员（或编译器自动生成）：
- 移动构造函数：ClassName(ClassName&& other)noexcept
- 移动赋值运算符：ClassName& operator=(ClassName&& other)noexcept

## 范围for循环

```
for(声明 ： 表达式)
    语句
```

- 表达式：需要是一个范围，如数组、std::vector、初始化列表{1,2,3}等
- 声明：循环变量的定义，常用auto、auto&、const auto&

编译器底层就是将范围for转换为等价的传统for

```
//源代码
for (auto&& elem : range){...}

//编译器展开
{
    auto && __range = range;                     // 1. 绑定范围，延长右值生命周期
    auto __begin = begin(__range);               // 2. 获取起始迭代器
    auto __end   = end(__range);                 // 3. 获取终止哨兵
    for ( ; __begin != __end; ++__begin ) {      // 4. 迭代、比较、前进
        auto&& elem = *__begin;                  // 5. 解引用，得到循环变量
        // 循环体
    }
}
```

## 结构化绑定

一次性将一个对象“拆解”成多个独立的变量

```
auto [a, b] = expr;          // 拷贝（或移动）expr 到匿名对象，再拆解
auto& [a, b] = expr;         // expr 是左值引用，a/b 直接指代 expr 内部元素
const auto& [a, b] = expr;   // 常量左值引用，不能通过 a/b 修改
auto&& [a, b] = expr;        // 转发引用，保留 expr 的值类别
```

绑定支持三类实体：
- 绑定到原生数组：数组长度必须在编译期已知
- 绑定到“类元组”类型：：如std::pair、std::array
- 绑定到非静态数据成员：类类型的所有非静态公开数据成员都可以被直接拆解

```
std::map<std::string, int> dict = {{"a",1}, {"b",2}};
for (const auto& [key, value] : dict) {
    // key 是 const std::string&, value 是 const int&
    std::cout << key << ": " << value << '\n';
}
```

## 列表初始化

一种统一初始化语法，使用花括号{}来初始化对象，提供一种通用、统一、安全的初始化方式

```
int a{5};                // 直接列表初始化
int b = {5};             // 拷贝列表初始化
std::vector<int> v{1,2,3};
```

## override和final

用于虚函数和类的继承体系，来显式声明虚函数和类

- override: 在子类函数声明，可显式要求编译器验证基类确实存在对应虚函数，其签名完全匹配，若有错误即可在编译期捕捉，而不在运行期报错
- final(虚函数)：在虚函数声明，其派生类则不可重写该函数
- final(类)：在类名后添加，可禁止该类作为基类使用


一些其他的新标准，如concepts、modules等，大家感兴趣可以自行了解，可以到cppreference或教学视频学习

<iframe width="100%" height="468" src="//player.bilibili.com/player.html?isOutside=true&aid=606216686&bvid=BV1D84y1t76J&cid=934044773&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" &autoplay=0></iframe>

