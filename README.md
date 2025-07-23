<!--
 * @Date: 2021-07-10 11:00:00
 * @LastEditors: KeyPJ
 * @Author: KeyPJ
 * @LastEditTime: 2022-04-18 12:00:00
-->

# 前言
~~本脚本基于 [tampermonkey-webpack-template](https://github.com/lisonge/tampermonkey-webpack-template) 开发~~

# 简介
个人想偷懒,不想手动在[仙灵 - 绝区零规划助手](https://zzz.seelie.me/) 手动录入角色及其装备  
于是简单整理一个脚本,利用米游社api获取角色信息,直接导入至绝区零seelie

相关api详见[mihoyo.http](mihoyo.http)

# 使用说明
本脚本使用GM_xmlhttpRequest跨域请求相关api,所以需要登录米游社活动页面, 例如:

国服:绝区零活动页面, 且确定已通过米游社已绑定绝区零账户

其他的主要信息也会在console输出,请自行查看
