---
title: lesson7 如何做出一个工程级项目
published: 2026-07-10
description: "教学文档lesson7"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson7 如何做出一个工程级项目**

这次教程主要基于cpp讲解工程级项目的搭建，其他语言的项目大致逻辑相同。希望大家不要写出💩山代码。

## 项目框架

由于cpp没有像rust一样有强力的cargo作为构建系统工具和包管理器，所以cpp项目一般选用cmake来作为构建系统，可以使用如vcpkg/Conan的包管理器，但目前我们仅使用cmake来管理依赖，且用系统级包管理器apt来进行依赖安装。

使用现代cmake，能够极其方便地进行系统构建，具体cmake教程已讲过，这里便不过多赘述了。

一个好的工程级项目一定有一个好的目录结构，能够做到命名即注释，可读性强，简洁明了，让人看着赏心悦目。

下面是一份参考目录结构
```
my_project/
├── CMakeLists.txt
├── cmake/              # CMake 模块和查找脚本
├── include/            # 公开头文件
│   └── my_project/
│       ├── core/
│       └── utils/
├── src/                # 私有源文件和头文件
│   ├── core/
│   └── utils/
├── tests/              # 测试代码
│   ├── unit/
│   └── integration/
├── examples/           # 示例用法
├── docs/               # 文档源文件
├── external/           # 第三方依赖或 git submodule（如果需要）
├── scripts/            # 构建、打包、代码生成脚本
├── .github/            # CI 配置
└── .cmake-format.yaml  # CMake 文件格式化配置
```

具体项目的目录结构一般示需要而定，但一般包括include,src,tests等，大家也可以参考我们自家仓库awakening的目录结构。

## 代码质量

一份好的代码一定是可读性强的（不要乱命名如a,b,c），一定是有注释的（如果你想能够看懂自己之前写的代码就给我好好写注释了chovy😡），一定是有代码格式规范的。

幸运的是，我们可以使用clang-format作为自动化工具来规范代码格式，只需要提供根目录下的 .clang-format 文件，就可以按照该规范格式化代码。

在这里我推荐交✌的代码规范（真的赏心悦目）：[传送门](https://sjtu-robomaster-team.github.io/cpp-style-guide/)

同样静态检查可以使用clang-tidy，提供 .clang-tidy 文件来进行代码检查。

## 测试

工程级项目一定会有测试环节，小到单元测试，再到集成测试，及Benchmark基准测试。这些测试都相当重要。

测试框架主流选择GoogleTest（即gtest）,配合gmock能够在没有硬件设备的条件下完成各种交互测试。gtest只需要在cmakelists中进行简单配置即可实现。

benchmark是检测程序性能相当重要的一环，我们能够通过benchmark对比基准从而简单明了的得出当前修改对程序性能的影响。

## 可观测性

可观测性强能够很好地帮助我们进行debug，不仅要有明确的终端输出，还要有以文件保存的日志，日志输出是很重要的一环。

日志一定要带有时间戳（时间戳很重要🙃），写清楚日志类型，输出信息简洁明了。

## 文档

文档做到详细介绍当前项目功能，readme中写清楚项目的介绍。