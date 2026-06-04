---
title: lesson2 现代编译工具链配置指南
published: 2026-06-04
description: "教学文档lesson2"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson2 现代编译工具链配置指南**

## 简介构建流程

我们编写的代码源文件，都需要通过如下的完整构建流程进行build
```
源文件(.c/.cpp) → [预处理] → 预处理文件(.i) → [编译] → 汇编文件(.s) → [汇编] → 目标文件(.o) → [链接] → 可执行文件
```
这些操作都可以通过gcc/g++进行，也可直接编译源文件，生成可执行文件。

gcc命令虽然对于简单项目或单一文件编译操作简单，但遇到大型项目时，问题便来了：
我们需要将多个文件（可能上百个乃至更多）编译成一个或多个可执行文件，我们当然可以简单地通过
```
g++ src1.cpp src2.cpp ...
```
来编译，但不免过于繁琐，还会产生其他问题：

-  项目依赖配置不便（不用cmake环境会配到想4的孩子💀）
-  编译配置修改不便
-  无法灵活选择编译项

## cmake+clang+clangd现代编译工具链

cmake很好的解决了以上问题，实现了多文件编译、管理外部依赖、代码模块化的功能
cmake教学视频：[传送门](https://www.bilibili.com/video/BV1nw411C71Z/?spm_id_from=333.337.search-card.all.click&vd_source=513b0a1c28964df3eb762ff4217dae5d)
cmake教学文档：[网盘传送门](https://pan.baidu.com/s/1GakDJP3pDnNib364TDAEBg?pwd=0416)

cmake作为构建工具，可以帮我们自动生成makefile,省去了我们去编写复杂的makefile的过程，通过简单的CMakeLists编写，我们就可以很快的进行构建；clang作为更高效现代的c/c++编译器，相比gcc能够更快速地进行编译；clangd作为IDE中的插件，能够帮助我们解决头文件路径问题、进行代码诊断、作为代码格式化工具等。

在这里着重说一下，在vscode中刚clone下来的新项目，经常会遇到一堆报错的情况，仔细看都是can not find dictionary or file ,但如果你试着编译一下会发现编译通过。这是vscode找不到头文件路径而clang可以找到导致的IDE虚假报错，需要在.vscode.json中手动配置，但我们可以通过clangd插件（实际上我用clangd主要就是为了解决这个问题的😁）实现自动编写.vscode，只需要在CMakeLists中加入
```
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
```
然后记得ctrl+s保存刷新一下，就会发现报错自动消失了，如果没有记得build一下，基本都能解决

### **工具链的部署问题**

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWYyZjU2NmY5YzU1ZDNiZTcwMWQ3MmViYzMwODBiYjRfMDM2ZGE5NDIxOGNkNzEzMzJiODk4MDVkNjhiYWJjZmZfSUQ6NzY0NTk3OTgwNjI2OTQ1OTQyNV8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

sudo apt install cmake

使用以上命令可以较为简单的在Linux上下载好CMAKE（链接器）

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MmYyZWU4MzQyNTEwNDRlMzlkNmZiNDE0N2UxMzcyYTdfY2EyOWUwZDI0OGQ0NzhlMjY5YmJkYmQyYmI2ODM1YjRfSUQ6NzY0NTk3OTgwNDkxNDg0NjkwMF8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

sudo apt install clang

C\+\+工具链的安装以及“虚假报错”解决论述  在者便是有关IDE的选择。这里我较为推荐的是Vscode,一来是表较轻量，再者会提供较多的插件，以供开发者配置各具特色的IDE，一方面适配各种工作环境，另一方面同时可以满足个人的审美需要。（qf注：相信初学者使用的第一个cppIDE会是vs，如果你真跟着学校的c语言课用codeblock或devc\+\+，那当我没说，要么不轻量（比如vs这坨大的），要么不现代（你真的用的下去这些上古IDE吗）） 

对此推荐的上到官网来进行VScode的安装包的下载。\(https://code\.visualstudio\.com/\)

当然并非是终端不能够进行VScode的下载，而是通过Snap库下载的VScode会出现各种链接问题（qf注：snap是一坨，建议刚安装好ubuntu就删掉snap），以至于会在开发或学习的过程中出现各种各样的编译问题，对此我深受其害。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MTViNzljZmRhZTE0YmIyZGE2NWUxMzEyMTI1ZDJiNzdfMDA0OGY4ZTZmNjYwMzUzM2FhZjlhZTBhZjZkYmVlMDhfSUQ6NzY0NTk3OTgwNjQ4NzY0NTE1Nl8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

需牢记linux与WIn不同的是\.deb后缀的包,下载完成后在Downloads的目录下打开终端执行类似图上的命令\./后面是你的点电脑上下载安装包的名字

至此基本上完成在ubuntu上安装好自己的工具链。



对于vscode的插件，推荐安装cmake和clangd，对于大型工程项目管理极其友好

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=M2E5MTQ4ZDE5ZDQ2ZWMxZTQwYmZkOTk4OGRkOWMzMzBfZDA5ODJlYjJjMzJhMWJjZGU5NGIwZTU1ZDJjZDFiNGFfSUQ6NzY0NTk3OTgwNTk1MDcyNTA1MV8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTQ1MTQ3Y2ZkYjQyNjQ3NDU5ZDlkNjQwZmE5MmFkZTRfZTZjY2UxZGNkNzU4MmM0MDJiOTViYzgwZDIwNzc2MDlfSUQ6NzY0NTk3OTgwNjQxMjA4MjM2NF8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

对于微软官方的cpp包插件，建议直接禁用，避免与clangd冲突（并且clangd更好使）

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZWNlNWIxMjhhOTQyOTAzY2UzNmFjZmJmZDA3NDkxYTZfN2U5ZTRhZjFkZjFkNjA3MDJmNjBjMjJiODBmNjAwZDlfSUQ6NzY0NTk3OTgwMzYzMTQ3MTU0Nl8xNzgwNTgwNzg2OjE3ODA2NjcxODZfVjM)

--由qing_feng编写