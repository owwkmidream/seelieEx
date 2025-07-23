# 绝区零头像信息 API 分析文档

## API 概览

**接口地址:** `https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool/user/icon_info`

**请求方法:** GET

**功能说明:** 获取绝区零角色头像和邦布头像信息

## 请求参数

| 参数名 | 值 | 说明 |
|--------|----|----|
| `uid` | `10946813` | 用户ID |
| `region` | `prod_gf_cn` | 服务器区域（中国正式服） |

## 请求头信息

### 身份验证与安全
- `cookie`: 包含多个认证令牌，如 `ltoken`、`cookie_token`、`account_id`
- `x-rpc-device_id`: 设备标识符，用于追踪
- `x-rpc-device_fp`: 设备指纹，用于安全验证

### 本地化设置
- `accept-language`: `zh-CN,zh;q=0.9,ru;q=0.8,en;q=0.7,ee;q=0.6`
- `x-rpc-lang`: `zh-cn`

### 平台信息
- `x-rpc-platform`: `4` (PC平台)
- `x-rpc-cultivate_source`: `pc`
- `x-rpc-page`: `v2.1.0_apps-h_#`

### 反机器人保护
- `x-rpc-geetest_ext`: 包含游戏ID和验证数据
- `x-rpc-is_teaser`: `1`

## 响应数据结构

### 根响应结构
```json
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "avatar_icon": { ... },
    "buddy_icon": { ... }
  }
}
```

### 角色头像数据结构
每个角色条目包含：
- `square_avatar`: 方形头像图片URL
- `rectangle_avatar`: 矩形头像图片URL  
- `vertical_painting`: 完整角色立绘URL
- `vertical_painting_color`: 角色主题色的十六进制颜色代码
- `avatar_us_full_name`: 英文角色名称
- `teaser_avatar`: 预告头像（当前为空）

### 邦布头像数据结构
每个邦布条目包含：
- `square_avatar`: 方形邦布头像URL
- `rectangle_avatar`: 矩形邦布头像URL

## 角色数据分析

### 角色总数：37个角色

#### 角色ID范围分布
- **1000-1099**: 核心角色（安比、妮可、比利等）
- **1100-1199**: 扩展阵容（可蕾达、本、安东等）  
- **1200-1299**: 近期新增（朝雾、亚历山德里娜等）
- **1300-1399**: 最新角色（雅、伊芙琳等）
- **1400+**: 最新发布（潘、浮竹等）

#### 主要角色信息
| ID | 角色名 | 主题色 |
|----|------|-------|
| 1011 | 安比·德玛拉 | #c8e16c (浅绿色) |
| 1021 | 猫宫·又奈 | #a0351c (深红色) |
| 1031 | 妮可·德玛拉 | #e6adaa (粉色) |
| 1041 | 11号 | #febb2e (黄色) |
| 1081 | 比利·奇德 | #af3e3a (红色) |
| 1091 | 星见雅 | #05777a (青绿色) |
| 1101 | 可蕾达·白祖 | #de643d (橙色) |

### 邦布头像分析

#### 邦布头像总数：30个

#### ID范围分布
- **53000-53999**: 标准邦布头像
- **54000-54999**: 特殊/高级邦布头像

#### 头像分布情况
- 17个标准邦布（53xxx系列）
- 13个特殊邦布（54xxx系列）

## 图片资源规律

### 角色图片
- **基础URL**: `https://act-webstatic.mihoyo.com/game_record/zzzv2/`
- **方形头像**: `role_square_avatar/role_square_avatar_{id}.png`
- **立绘图片**: `role_vertical_painting/role_vertical_painting_{id}.png`

### 邦布图片  
- **基础URL**: `https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/`
- **格式**: `{hash}.png` (32位字符哈希值)

## 颜色主题分析

### 常见颜色主题
- 红色系: #af3e3a, #a0351c, #be3b2b, #c84342
- 橙色系: #da8837, #de643d, #e29737
- 蓝色系: #4e7ebd, #136dd5, #28bdcc
- 绿色系: #c8e16c, #28c79d, #c8d7bd

### 角色稀有度指示
颜色可能表示角色稀有度或属性类型：
- 暖色调（红/橙）: 可能为火属性/物理属性角色
- 冷色调（蓝/青）: 可能为冰属性/电属性角色  
- 绿色调: 可能为辅助/治疗类角色

## 技术实现要点

### CDN架构
- 游戏资源托管在 `act-webstatic.mihoyo.com`
- 不同资源类型使用独立路径
- 统一命名规范便于程序化访问

### 缓存策略
- 静态资源URL便于可靠缓存
- 基于哈希的邦布头像命名避免缓存冲突
- 结构化ID系统支持可预测的URL生成

## API使用建议

### 开发者指南
1. **角色查询**: 使用角色ID作为主键
2. **图片显示**: 根据需要选择合适格式（方形 vs 立绘）
3. **颜色主题**: 使用 `vertical_painting_color` 进行UI主题化
4. **本地化**: 角色名称提供英文版本（`avatar_us_full_name`）

### 请求频率限制考虑
- 需要有效的认证cookie
- 设备指纹可能限制请求频率
- 建议本地缓存响应数据

## 安全注意事项

- API需要有效的米哈游账户认证
- 设备指纹防止未授权访问
- 可能存在区域限制（`prod_gf_cn` 区域）
- 通过geetest集成提供反机器人保护

## 潜在应用场景

1. **角色数据库**: 构建完整的角色名册
2. **队伍构建器**: 可视化角色选择界面
3. **收集追踪器**: 追踪已拥有vs可获得角色
4. **粉丝网站**: 角色画廊和信息展示
5. **移动应用**: 游戏规划的伴侣应用

## 数据时效性

基于角色ID和最新添加的角色，该API似乎随着新角色发布而积极维护。最高角色ID（1421 - 潘寅虎）表明数据较为新鲜。