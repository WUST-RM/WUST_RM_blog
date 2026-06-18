---
title: lesson3 版本管理工具git使用指南
published: 2026-06-19
description: "教学文档lesson3"
image: ""
tags: ["teach"]
category: teach
draft: false
author: qing_feng
---

# **lesson3 版本管理工具git使用指南**

## 何为git

在多人团队合作中，一个版本控制系统是极为重要的，它能够让代码进行多版本备份，实现多分支开发等。git就是一个文件的版本管理工具，方便我们进行代码管理。

## 安装git

在linux上安装git非常简单，apt源中已配置，只需
```
sudo apt install git
```
记得在安装好git后进行初始配置
```
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```
(Your Name为你想配置的用户名，email@example.com为你的邮箱，global参数表明所有git仓库都会使用这套配置)

### git简介

git快速入门教程：[传送门](https://www.bilibili.com/video/BV1Hkr7YYEh8?spm_id_from=333.788.videopod.sections&vd_source=513b0a1c28964df3eb762ff4217dae5d)  [传送门](https://www.bilibili.com/video/BV1udEuzrEa7?spm_id_from=333.788.videopod.sections&vd_source=513b0a1c28964df3eb762ff4217dae5d)


以上教程都可以清晰明了地带你学会使用git，在这里我就不过多赘述了。在RM的实际开发环境下，我们最常用的也就是版本回溯和分支了。

git的版本回溯是一个非常强大的功能，你每一份提交的commit都会记录在git仓库中，你也可以随时checkout到之前的commit。假设你发现现在的代码出现问题，或者修改错误了，你只需要进行版本回溯，就能够很容易的回到修改前的状态（就像玩肉鸽类游戏打BOSS前存档，没打过就使用SL大法😉）

分支则是提供了协作开发的舒适环境（毕竟你也不想刚写好的代码被别人push到main出依托大的吧💩）,分支能够在一个base commit上开出多条支线，一般一人一个分支，互不干扰，最后再合并到main上。

学会git能够给你的开发体验带来极大的提升，一定要灵活使用git在进行开发的时候。

--由qing_feng编写