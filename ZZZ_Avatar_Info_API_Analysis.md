# 绝区零角色详细信息API分析

## API概述
- **接口名称**: 获取角色详细信息
- **请求方法**: GET  
- **接口URL**: `https://api-takumi-record.mihoyo.com/event/game_record_zzz/api/zzz/avatar/info`

## 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| role_id | string | 是 | 角色ID |
| server | string | 是 | 服务器标识，如 `prod_gf_cn` |
| id_list[] | array | 是 | 要查询的角色ID列表 |
| need_wiki | boolean | 否 | 是否需要wiki信息，默认false |

## 响应结构

### 基础响应格式
```json
{
  "retcode": 0,
  "message": "OK",
  "data": {
    "avatar_list": [],
    "equip_wiki": {},
    "weapon_wiki": {},
    "avatar_wiki": {},
    "strategy_wiki": {},
    "cultivate_index": {},
    "cultivate_equip": {}
  }
}
```

## 角色详细信息字段说明

### 基础信息
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 角色唯一标识ID |
| level | number | 角色等级 |
| name_mi18n | string | 角色简称 |
| full_name_mi18n | string | 角色全名 |
| element_type | number | 属性类型编码 |
| camp_name_mi18n | string | 所属阵营名称 |
| avatar_profession | number | 角色职业编码 |
| rarity | string | 稀有度等级 |
| rank | number | 角色星级/命座等级 |
| us_full_name | string | 英文全名 |
| vertical_painting_color | string | 立绘主色调 |
| sub_element_type | number | 子属性类型 |
| awaken_state | string | 觉醒状态 |

```json
{
  "id": 1371,                    // 角色唯一标识ID
  "level": 60,                   // 角色等级
  "name_mi18n": "仪玄",          // 角色简称
  "full_name_mi18n": "仪玄",     // 角色全名
  "element_type": 205,           // 属性类型编码 (205=以太)
  "camp_name_mi18n": "云岿山",   // 所属阵营名称
  "avatar_profession": 6,        // 角色职业编码 (6=支援)
  "rarity": "S",                 // 稀有度等级
  "rank": 0,                     // 角色星级/命座等级
  "us_full_name": "Yixuan",      // 英文全名
  "vertical_painting_color": "#b7986f", // 立绘主色调
  "sub_element_type": 2,         // 子属性类型
  "awaken_state": "AwakenStateNotVisible", // 觉醒状态
  "group_icon_path": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/bfd889b7385bc0c6ffc756acefb1a14a.png", // 角色组图标URL
  "hollow_icon_path": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/d1ff8669a9f870efa4b024175542532e.png", // 空洞图标URL
  "role_vertical_painting_url": "https://act-webstatic.mihoyo.com/game_record/zzzv2/role_vertical_painting/role_vertical_painting_1371.png", // 角色立绘URL
  "role_square_url": "https://act-webstatic.mihoyo.com/game_record/zzzv2/role_square_avatar/role_square_avatar_1371.png" // 角色方形头像URL
}
```

### 武器信息 (weapon)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 武器ID |
| level | number | 武器等级 |
| name | string | 武器名称 |
| star | number | 武器星级 |
| icon | string | 武器图标URL |
| rarity | string | 武器稀有度 |
| properties | array | 武器属性列表 |
| main_properties | array | 武器主属性列表 |
| talent_title | string | 天赋标题 |
| talent_content | string | 天赋内容 |
| profession | number | 适用职业 |

```json
{
  "id": 13015,                  // 武器ID
  "level": 60,                  // 武器等级
  "name": "强音热望",           // 武器名称
  "star": 5,                    // 武器星级
  "icon": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/3ddd6cf6f394332822c8ee89e3ad160d.png", // 武器图标URL
  "rarity": "A",                // 武器稀有度
  "properties": [               // 武器属性列表
    {
      "property_name": "暴击率",
      "property_id": 20103,
      "base": "20%",
      "level": 0,
      "valid": false,
      "system_id": 0,
      "add": 0
    }
  ],
  "main_properties": [          // 武器主属性列表
    {
      "property_name": "基础攻击力",
      "property_id": 12101,
      "base": "594",
      "level": 0,
      "valid": false,
      "system_id": 0,
      "add": 0
    }
  ],
  "talent_title": "躁动全场",   // 天赋标题
  "talent_content": "[强化特殊技]或[连携技]命中敌人时...", // 天赋内容
  "profession": 1               // 适用职业
}
```

### 装备信息 (equip)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 装备ID |
| level | number | 装备等级 |
| name | string | 装备名称 |
| icon | string | 装备图标URL |
| rarity | string | 装备稀有度 |
| properties | array | 副属性列表 |
| main_properties | array | 主属性列表 |
| equip_suit | object | 套装信息 |
| equipment_type | number | 装备类型 (1-6对应6个部位) |
| invalid_property_cnt | number | 无效属性数量 |
| all_hit | boolean | 是否全部命中有效属性 |

```json
{
  "id": 32341,                   // 装备ID
  "level": 15,                   // 装备等级
  "name": "混沌重金属[1]",       // 装备名称
  "icon": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/af449913e63729194d32493317a3adce.png", // 装备图标URL
  "rarity": "S",                 // 装备稀有度
  "properties": [                // 副属性列表
    {
      "property_name": "防御力",
      "property_id": 13103,
      "base": "30",
      "level": 2,
      "valid": false,
      "system_id": 131,
      "add": 1
    }
  ],
  "main_properties": [           // 主属性列表
    {
      "property_name": "生命值",
      "property_id": 11103,
      "base": "2200",
      "level": 1,
      "valid": false,
      "system_id": 111,
      "add": 0
    }
  ],
  "equip_suit": {               // 套装信息
    "suit_id": 32300,
    "name": "混沌重金属",
    "own": 2,
    "desc1": "以太伤害+10%。",
    "desc2": "装备者的暴击伤害提升20%..."
  },
  "equipment_type": 1,          // 装备类型 (1=音擎)
  "invalid_property_cnt": 1,    // 无效属性数量
  "all_hit": false             // 是否全部命中有效属性
}
```

### 装备属性信息 (equip.properties)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| property_name | string | 属性名称 |
| property_id | number | 属性ID |
| base | string | 基础值 |
| level | number | 强化等级 |
| valid | boolean | 是否为有效属性 |
| system_id | number | 属性系统ID |
| add | number | 强化次数 |

```json
{
  "property_name": "生命值",     // 属性名称
  "property_id": 11102,         // 属性ID
  "base": "9%",                 // 基础值
  "level": 3,                   // 强化等级
  "valid": true,                // 是否为有效属性
  "system_id": 111,             // 属性系统ID
  "add": 2                      // 强化次数
}
```

### 角色属性 (properties)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| property_name | string | 属性名称 |
| property_id | number | 属性ID |
| base | string | 基础值 |
| add | string | 附加值 |
| final | string | 最终值 |

```json
{
  "property_name": "生命值",     // 属性名称
  "property_id": 1,             // 属性ID
  "base": "8373",               // 基础值
  "add": "9766",                // 附加值
  "final": "18139"              // 最终值
}
```

### 技能信息 (skills)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| level | number | 技能等级 |
| skill_type | number | 技能类型 |
| items | array | 技能详情列表 |
| awaken_state | string | 觉醒状态 |

```json
{
  "level": 11,                  // 技能等级
  "skill_type": 0,              // 技能类型 (0=普通攻击)
  "items": [                    // 技能详情列表
    {
      "title": "普通攻击：霄云劲",
      "text": "点按发动：向前方进行至多五段的攻击...",
      "awaken": false
    }
  ],
  "awaken_state": "AwakenStateNotVisible" // 觉醒状态
}
```

### 技能类型编码
| 编码 | 技能类型 |
|------|----------|
| 0 | 普通攻击 |
| 1 | 特殊技 |
| 2 | 闪避技 |
| 3 | 连携技/终结技 |
| 5 | 核心被动 |
| 6 | 支援技 |

### 命座信息 (ranks)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 命座ID |
| name | string | 命座名称 |
| desc | string | 命座描述 |
| pos | number | 命座位置 |
| is_unlocked | boolean | 是否已解锁 |

```json
{
  "id": 1,                      // 命座ID
  "name": "清灵道心",           // 命座名称
  "desc": "进入战场时，暴击率提升10%...", // 命座描述
  "pos": 1,                     // 命座位置
  "is_unlocked": false          // 是否已解锁
}
```

### 装备方案信息 (equip_plan_info)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| type | number | 方案类型 |
| game_default | object | 游戏默认方案 |
| cultivate_info | object | 培养方案信息 |
| custom_info | object | 自定义方案信息 |
| valid_property_cnt | number | 有效属性数量 |
| equip_rating | string | 装备评级 |
| equip_rating_score | number | 装备评分 |

```json
{
  "type": 3,                    // 方案类型
  "game_default": {             // 游戏默认方案
    "property_list": [
      {
        "id": 1,
        "name": "生命值",
        "full_name": "生命值",
        "system_id": 1,
        "is_select": false
      }
    ]
  },
  "cultivate_info": {           // 培养方案信息
    "name": "【0+0】平民仪玄养成方案",
    "plan_id": "11489",
    "is_delete": false,
    "old_plan": false
  },
  "custom_info": {              // 自定义方案信息
    "property_list": [
      {
        "id": 11102,
        "name": "生命值",
        "full_name": "生命值百分比",
        "system_id": 111,
        "is_select": true
      }
    ]
  },
  "valid_property_cnt": 31,     // 有效属性数量
  "equip_rating": "ER_S_Plus",  // 装备评级
  "equip_rating_score": 80.39   // 装备评分
}
```

### 皮肤信息 (skin_list)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| skin_id | number | 皮肤ID |
| skin_name | string | 皮肤名称 |
| skin_vertical_painting_url | string | 皮肤立绘URL |
| skin_square_url | string | 皮肤方形图标URL |
| skin_hollow_icon_path | string | 皮肤空洞图标URL |
| unlocked | boolean | 是否已解锁 |
| rarity | string | 皮肤稀有度 |
| is_original | boolean | 是否为原始皮肤 |

```json
{
  "skin_id": 3113710,           // 皮肤ID
  "skin_name": "仪玄·观云同岿", // 皮肤名称
  "skin_vertical_painting_url": "https://act-webstatic.mihoyo.com/game_record/zzzv2/role_vertical_painting/role_vertical_painting_1371.png", // 皮肤立绘URL
  "skin_square_url": "https://act-webstatic.mihoyo.com/game_record/zzzv2/role_square_avatar/role_square_avatar_1371.png", // 皮肤方形图标URL
  "skin_hollow_icon_path": "https://act-webstatic.mihoyo.com/darkmatter/nap/prod_gf_cn/item_icon_ud1fhc/d1ff8669a9f870efa4b024175542532e.png", // 皮肤空洞图标URL
  "skin_vertical_painting_color": "#b7986f", // 皮肤立绘主色调
  "unlocked": true,             // 是否已解锁
  "rarity": "S",                // 皮肤稀有度
  "is_original": true           // 是否为原始皮肤
}
```

## 装备部位编码
| 编码 | 部位 |
|------|------|
| 1 | 音擎 |
| 2 | 驱动盘2号位 |
| 3 | 驱动盘3号位 |
| 4 | 驱动盘4号位 |
| 5 | 驱动盘5号位 |
| 6 | 驱动盘6号位 |

## 装备评级说明
- **ER_S**: S级评级
- **ER_A**: A级评级  
- **ER_B**: B级评级
- **ER_C**: C级评级

## 示例请求
```
GET https://api-takumi-record.mihoyo.com/event/game_record_zzz/api/zzz/avatar/info?role_id=10946813&server=prod_gf_cn&id_list[]=1411&need_wiki=false
```

## 错误码说明
| 错误码 | 说明 |
|--------|------|
| 0 | 请求成功 |
| -1 | 系统错误 |
| 10001 | 参数错误 |
| 10101 | 账号不存在 |

## 使用说明
1. 该接口用于获取指定角色的详细信息，包括装备、属性、技能等
2. 支持批量查询多个角色，通过id_list[]参数传入
3. 返回数据包含角色的完整配置信息，适用于详细展示页面
4. 包含装备评分和培养建议等高级功能
5. 支持皮肤信息查询，展示角色的不同外观