declare module seelie {

    export interface CharacterStatus {
        level: number;
        asc: number;
        text?: string;
    }

    export interface SkillStatus {
        current: number;
        goal: number;
    }

    // 绝区零武器状态接口，扩展了精炼等级
    export interface ZZZWeaponStatus extends CharacterStatus {
        craft: number; // 精炼等级 0-5
    }

    export interface Goal {
        type: "character" | "talent" | "weapon";
        id: number;
        character?: string;
        weapon?: string;
        current?: CharacterStatus;
        goal?: CharacterStatus;
        normal?: SkillStatus;
        skill?: SkillStatus;
        burst?: SkillStatus;
        c3?: boolean;
        c5?: boolean;
    }

    export interface CharacterGoal extends Goal {
        character: string;
        current: CharacterStatus;
        goal: CharacterStatus;
    }

    // 绝区零角色目标接口，增加了命座支持
    export interface ZZZCharacterGoal extends CharacterGoal {
        cons: number; // 命座等级 0-6
    }

    export interface WeaponGoal extends Goal {
        character: string;
        weapon: string;
        current: CharacterStatus;
        goal: CharacterStatus;
    }

    // 绝区零武器目标接口，支持精炼等级
    export interface ZZZWeaponGoal extends Goal {
        character: string;
        weapon: string;
        current: ZZZWeaponStatus;
        goal: ZZZWeaponStatus;
    }

    export interface TalentGoal extends Goal {
        character: string;
        normal: SkillStatus;
        skill: SkillStatus;
        burst: SkillStatus;
        c3: boolean;
        c5: boolean;
    }

    // 绝区零天赋目标接口，支持六种技能类型
    export interface ZZZTalentGoal extends Goal {
        character: string;
        basic: SkillStatus;    // 普通攻击 1-12
        dodge: SkillStatus;    // 闪避技能 1-12
        assist: SkillStatus;   // 支援技能 1-12
        special: SkillStatus;  // 特殊技能 1-12
        chain: SkillStatus;    // 连携技能 1-12
        core: SkillStatus;     // 核心被动 0-6
    }

    // 绝区零数据输入接口
    export interface ZZZCharacterInput {
        characterId: string;
        level: number;         // 等级 1-60
        asc: number;          // 突破等级 1-6 (API格式，需要转换为 0-5)
        cons: number;         // 命座 0-6
    }

    export interface ZZZTalentInput {
        characterId: string;
        basic: number;        // 普通攻击等级
        dodge: number;        // 闪避技能等级
        assist: number;       // 支援技能等级
        special: number;      // 特殊技能等级
        chain: number;        // 连携技能等级
        core: number;         // 核心被动等级
    }

    export interface ZZZWeaponInput {
        characterId: string;
        weaponId: string;
        level: number;        // 武器等级
        asc: number;         // 武器突破等级
        craft: number;       // 精炼等级 0-5
    }

}

