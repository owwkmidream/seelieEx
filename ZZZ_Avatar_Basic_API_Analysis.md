# 绝区零角色基础信息API分析

## API概述
- **接口名称**: 获取角色基础信息列表
- **请求方法**: GET
- **接口URL**: `https://api-takumi-record.mihoyo.com/event/game_record_zzz/api/zzz/avatar/basic`

## 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| server | string | 是 | 服务器标识，如 `prod_gf_cn` |
| role_id | string | 是 | 角色ID |

## 响应结构

### 基础响应格式
```json
{
  "retcode": 0,
  "message": "OK", 
  "data": {
    "avatar_list": []
  }
}
```

### 角色基础信息字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 角色唯一标识ID |
| level | number | 角色等级 |
| name_mi18n | string | 角色简称 |
| full_name_mi18n | string | 角色全名 |
| element_type | number | 属性类型编码 |
| camp_name_mi18n | string | 所属阵营名称 |
| avatar_profession | number | 角色职业编码 |
| rarity | string | 稀有度等级 (S/A) |
| group_icon_path | string | 阵营图标URL |
| hollow_icon_path | string | 空洞图标URL |
| rank | number | 角色星级/命座等级 |
| is_chosen | boolean | 是否被选中 |
| role_square_url | string | 角色方形头像URL |
| sub_element_type | number | 子属性类型 |
| awaken_state | string | 觉醒状态 |

## 属性类型编码对照

| 编码 | 属性 |
|------|------|
| 200 | 物理 |
| 201 | 火 |
| 202 | 冰 |
| 203 | 电 |
| 205 | 以太 |

## 职业编码对照

| 编码 | 职业 |
|------|------|
| 1 | 攻击 |
| 2 | 击破 |
| 3 | 异常 |
| 4 | 支援 |
| 5 | 防护 |
| 6 | 未知职业 |

## 稀有度说明
- **S**: S级角色（5星）
- **A**: A级角色（4星）

## 觉醒状态说明
- **AwakenStateNotVisible**: 未觉醒或觉醒状态不可见
- **AwakenStateActivated**: 已觉醒激活

## 示例响应数据
```json
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "avatar_list": [
      {
        "id": 1411,
        "level": 60,
        "name_mi18n": "柚叶",
        "full_name_mi18n": "浮波 柚叶",
        "element_type": 200,
        "camp_name_mi18n": "怪啖屋",
        "avatar_profession": 4,
        "rarity": "S",
        "group_icon_path": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/15ed89ee76985a1666a1519fe618703e.png",
        "hollow_icon_path": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/38d79ce974c5cb334dfce1a8b56e2332.png",
        "rank": 0,
        "is_chosen": false,
        "role_square_url": "https://act-webstatic.mihoyo.com/game_record/zzzv2/role_square_avatar/role_square_avatar_1411.png",
        "sub_element_type": 0,
        "awaken_state": "AwakenStateNotVisible"
      }
    ]
  }
}
```

## 错误码说明
| 错误码 | 说明 |
|--------|------|
| 0 | 请求成功 |
| -1 | 系统错误 |
| 10001 | 参数错误 |
| 10101 | 账号不存在 |

## 使用说明
1. 该接口用于获取指定玩家的所有角色基础信息
2. 返回的角色列表按照角色等级降序排列
3. 包含角色的基本属性、稀有度、阵营等核心信息
4. 适用于角色列表展示、筛选等场景