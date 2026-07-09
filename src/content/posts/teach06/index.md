---
title: lesson6 cpp进阶零开销抽象
published: 2026-07-09
description: "教学文档lesson6"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson6 cpp进阶零开销抽象**

这一部分主要是讲解使用cpp进行性能优化

## 简介零开销原则

简单来说，C++的高级抽象特性(如类、模板、内联函数等)在编译后不应产生额外的运行时开销,其性能应该与手写的底层代码相当，这就是c++的设计理念：零开销原则。

零开销原则便是：
- 你无需为你所不用的付出。
- 你所用的正与你所能合理手写的效率相同。

落实到实际便是，能不在程序运行期进行的计算就不在运行期计算，在编译期确定开销更小，出错直接编译失败。

要做到零开销编程，我们主要在编译期常量上动刀，编译期常量即：
- 该量的初始值是一个确定的量，不会受到程序输入的影响。
- 该量在程序运行过程中不会发生变化。

举个例子，我们要实现读取用户键盘输入量的需求，就只能在运行期读取计算，而不能在编译期进行，因为在编译期这个量不是常量，不能够在编译期确定，自然无法在编译期计算。

程序运行时要消耗的硬成本主要是 CPU 时间 和 内存带宽。而零开销抽象就是把占用 CPU 计算周期的逻辑运算，转化为编译时对数据/类型的静态推导，把运行期负担转移为编译期信息。

具体转移了以下三类东西：

- 数值计算：1 + 2 * 3 不用在程序启动后算，编译完直接变成常量 7。
- 内存布局与偏移量：结构体里第 3 个成员变量的地址偏移，不用运行时用 offsetof 算，编译期直接硬编码进机器码。
- 分支判断与类型分发：不需要在 if (type == 1) 上浪费 CPU 流水线，而是在编译期直接确定走哪条路，把没用的路径代码直接抹掉。

## 零开销抽象具体使用

1. constexpr

使用 constexpr 修饰变量和函数，可以强制编译器在编译期求值。

```
// 运行期：每次调用都要做乘法和循环
int factorial_runtime(int n) {
    return (n <= 1) ? 1 : n * factorial_runtime(n - 1);
}

// 编译期：n=5 在编译时就算出 120，直接嵌入二进制
constexpr int factorial_constexpr(int n) {
    return (n <= 1) ? 1 : n * factorial_constexpr(n - 1);
}

int main() {
    constexpr int result = factorial_constexpr(5); 
}
```

2. if constexpr

把运行时的 if 分支判断，提升为编译期的“代码剪裁”。

```
template<typename T>
void printValue(const T& value) {
    // 如果 T 是 int 类型，编译期就直接把下面这行以外的分支删除
    if constexpr (std::is_integral_v<T>) {
        std::cout << "Integer: " << value << std::endl;
    } else {
        std::cout << "Other type: " << value << std::endl;
    }
}
```

3. 模板元编程

模板参数本身必须是编译期常量。通过递归模板实例化，可以把复杂的逻辑在编译期“算”出来。零开销的代码实现方式大多需要借助与模板。

```
// 编译期计算 2 的 N 次方
template<int N>
struct Pow2 {
    static constexpr int value = 2 * Pow2<N - 1>::value;
};
template<>
struct Pow2<0> {
    static constexpr int value = 1;
};

int main() {
    // 这行代码在运行时连个整数加法都没有，直接是常量 8
    int size = Pow2<3>::value; 
}
```

## 静态检查

一个好的程序一定有好的错误检查，而错误检查通常与外部输入有关。如果一个外部输入量是一个编译期常量，那么显然这样一个输入是否合法不需要放在运行期进行，在编译期便可检查出来。

我们希望静态检查可以做到以下几点：
- 在编译期发现尽可能多的错误。
- 不占用运行期资源。
- 报错信息让人可以方便的定位到问题。

举一个Eigen3库的例子
```
using namespace Eigen;
Matrix<double, 2, 3> x1;
Matrix<double, 3, 4> x2;
// 由于我们知道3x4的矩阵无法右乘2x3的矩阵，显然下面的语句应该产生一个编译错误，并且提示矩阵维度不匹配。
auto y = x2 * x1;

Matrix<double, Dynamic, Dynamic> a1;
a1.resize(2, 3);
Matrix<double, Dynamic, Dynamic> a2;
a2.resize(3, 4);
// 虽然我们知道下面的语句会产生错误，但由于矩阵a1,a2的维度是在运行期指明的，所以在编译期无法判定其是否错误，故不会报错。
// 但显然，下面的语句应该会在运行时产生一个报错。
auto b = a2 * a1;
```

那么，这样一种静态检查机制应该如何实现呢？这个主要靠static_assert()进行。static_assert()的参数应该是编译期常量，如果为false，则再编译到这个语句的时候，会产生一个编译错误。下面给出一个例子，假设由我们自己实现一个矩阵乘法的功能。

```
// 定义矩阵类，让矩阵的行数和列数作为模板参数
template<int row, int col>
class Matrix;

// 在实现矩阵乘法函数时，有多种实现方式，对应了不同的静态检查
template<class MatrixTypeA, class MatrixTypeB>
auto matrix_mul1(MatrixTypeA a, MatrixTypeB b){
    // static_assert(MatrixTypeA is a Type of Matrix);
    // static_assert(MatrixTypeA is a Type of Matrix);	
    // static_assert(MatrixTypeA::col == MatrixTypeB::row);
    // ...
}
// 在上述例子中，我们需要进行三个静态检查。由于函数的两个参数都是模板类型，所以我们需要检测这个模板类型是不是Matrix类型。
// 这里用伪代码表示，因为在c++20 concept机制出现之前，为了实现这样一个判断，我们需要一些特殊的技巧
// 此外，假如确定两个类型都是Matrix类型后，还需要判断两个矩阵的维度是否相同。
// 所以共计三个静态检查。
```
