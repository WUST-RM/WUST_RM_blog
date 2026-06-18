---
title: 27赛季算法组学习路径和规划
published: 2026-06-19
description: "27赛季算法组学习路径和规划"
image: ""
tags: ["library"]
category: library
draft: false
---

# 27赛季算法组学习路径和规划

算法组的学习路径规划

## **一些前置的知识**

### **git以及github**

git是一个有助于开发的工具，可以简单的了解，并不需要系统的去学习。

### **CMAKE**

已经在配置阶段有了简单的部署，然后了解一些基本的语句

## **C\+\+的学习**

【黑马程序员匠心之作\|C\+\+教程从0到1入门编程,学习编程不再难】 https://www\.bilibili\.com/video/BV1et411b73Z/?share\_source=copy\_web\&vd\_source=f123faad5b1b17d19714d3dc06f66900

可以参考这个视频 ，主要是对于C\+\+语法的掌握具体的看那个视频，并无特定的要求。

对于书籍，建议经典书籍《c\+\+ primer plus》，还额外讲解了cpp新标准的一些新特性

\[C\+\+ Primer Plus 中文版（第6版）（2019重印） \(Stephen Prata, 张海龙, 袁国忠\) \.pdf\]

## **分组学习**

### 自瞄

#### opencv基础

阿三的opencv速成课

【4h上手C\+\+版Opencv】 https://www\.bilibili\.com/video/BV11A411T7rL/?share\_source=copy\_web\&vd\_source=67c7cf3f00d689ea393ebc93fd94efd5

#### 视觉圣经

视觉cv入门必看

\[了解CV和RoboMaster视觉组\.pdf\]

以及君佬的毕设

\[陈君\-毕设\.docx\]

这些都可以带你们快速入门了解RM中视觉组的工作和知识

#### 机器学习和神经网络

感谢吴恩达老师

【吴恩达机器学习经典名课【中英字幕】】 https://www\.bilibili\.com/video/BV164411S78V/?share\_source=copy\_web\&vd\_source=67c7cf3f00d689ea393ebc93fd94efd5

【【中英字幕】吴恩达深度学习课程第一课 — 神经网络与深度学习】 https://www\.bilibili\.com/video/BV164411m79z/?share\_source=copy\_web\&vd\_source=67c7cf3f00d689ea393ebc93fd94efd5

#### 一些源码

同济spvision：* *[*https://github\.com/TongjiSuperPower/sp*](https://github.com/TongjiSuperPower/sp_vision_25/)[vision\_25/](https://github.com/TongjiSuperPower/sp_vision_25/)（济✌）

君喵：https://github\.com/chenjunnn/rm\_vision（适合入门看，虽然我们现在基本摒弃了ROS框架）

自家的：https://github\.com/WUST\-RM/awakening（hy？！强强！？）

### 导航

#### ROS的基本框架

【【鱼香ROS】动手学ROS2\|ROS2基础入门到实践教程\|小鱼带你手把手学习ROS2】 https://www\.bilibili\.com/video/BV1gr4y1Q7j5/?share\_source=copy\_web\&vd\_source=f123faad5b1b17d19714d3dc06f66900

#### 官方文档

https://docs\.nav2\.org/ 相对于视频的学习 知识密度会更大

https://github\.com/ros\-navigation/navigation2\.git 官方的源码

#### 战队导航源码

https://github\.com/SMBU\-PolarBear\-Robot\-Team/pb2025\_sentry\_nav （北极熊导航）自家导航的基础

https://github\.com/hyheiyue/rose\_navigation\.git自家导航

### 机械臂

版本配置：22ubuntu\+ROS2（humble） \+ MoveIt2

#### 视频学习

【ROS2之Moveit2机械臂教程\-Automatic Addison（中文语音）】 https://www\.bilibili\.com/video/BV17QoVB5EkX/?share\_source=copy\_web\&vd\_source=8d0e619b4379ca3bf35d8c0bf001bbd5

【ROS 2 Moveit 2 \- Control a Robotic Arm】 https://www\.bilibili\.com/video/BV1rdxdzkES5/?share\_source=copy\_web\&vd\_source=8d0e619b4379ca3bf35d8c0bf001bbd5 此视频使用的是ubuntu22 \+ROS2（jazzy）\+MoveIt2，但是大部分可以借用，可以结合官方文档食用

#### 官方学习网站

官方网站    [https://moveit\.ai/](https://moveit.ai/) MoveIt 项目官网,含介绍、案例、新闻

GitHub仓库    [https://github\.com/ros\-planning/moveit2\.git](https://github.com/ros-planning/moveit2.git)  MoveIt 2 源代码仓库

官方文档    [https://moveit\.picknik\.ai/humble/](https://moveit.picknik.ai/humble/)     推荐 \- Humble版本文档,含教程、指南、概念

教程集合    [https://ros\-planning\.github\.io/moveit\_tutorials/](https://ros-planning.github.io/moveit_tutorials/)     MoveIt教程主入口

#### 源码

https://github\.com/moveit/moveit2\.git

https://ros\.ncnynl\.com/cn/moveit2/index\.html 文档的学习

自家的：https://github\.com/TRIAuAuAu/wust\_arm\_planner