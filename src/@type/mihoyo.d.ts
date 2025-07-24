declare namespace mihoyo {

    export interface Role {
        game_biz: string;
        region: string;
        game_uid: string;
        nickname: string;
        level: number;
        is_chosen: boolean;
        region_name: string;
        is_official: boolean;
    }

    // 新的绝区零角色基础信息接口
    export interface Character {
        id: number;
        level: number;
        name_mi18n: string;
        full_name_mi18n: string;
        element_type: number;
        camp_name_mi18n: string;
        avatar_profession: number;
        rarity: string;
        group_icon_path: string;
        hollow_icon_path: string;
        rank: number; // 影级
        sub_element_type: number;
        awaken_state: string;
        promotes?: number; // 突破
        ranks?: Rank[]; // 命座描述
        skills?: Skill[]; // 命座描述
    }

    // 角色基础信息项（包含解锁状态等）
    export interface AvatarBasicItem {
        avatar: Character;
        unlocked: boolean;
        is_up: boolean;
        is_teaser: boolean;
        is_top: boolean;
    }

    // 新的绝区零技能接口
    export interface Skill {
        level: number;
        skill_type: number; // 0:普攻, 1:特殊技, 2:闪避, 3:连携技, 5:核心被动, 6:支援技
        items: SkillItem[];
        awaken_state?: string;
    }

    export interface SkillItem {
        title: string;
        text: string;
        awaken: boolean;
    }

    // 新的绝区零武器接口
    export interface Weapon {
        id: number;
        level: number;
        name: string;
        star: number; // 精炼等级
        icon: string;
        rarity: string;
        properties: Property[];
        main_properties: Property[];
        talent_title: string;
        talent_content: string;
        profession: number;
    }

    // 新的绝区零装备接口
    export interface Equipment {
        id: number;
        level: number;
        name: string;
        icon: string;
        rarity: string;
        properties: Property[];
        main_properties: Property[];
        equip_suit: EquipSuit;
        equipment_type: number; // 装备位置 (1-6)
        invalid_property_cnt: number;
        all_hit: boolean;
    }

    export interface EquipSuit {
        suit_id: number;
        name: string;
        own: number;
        desc1: string;
        desc2: string;
        icon?: string;
        cnt?: number;
        rarity?: string;
    }

    // 属性接口
    export interface Property {
        property_name: string;
        property_id: number;
        base: string;
        add?: string;
        final?: string;
        final_val?: string;
        level?: number;
        valid?: boolean;
        system_id?: number;
    }

    // 影级接口
    export interface Rank {
        id: number;
        name: string;
        desc: string;
        pos: number;
        is_unlocked: boolean;
    }

    export interface Data<T> {
        list: T[];
    }

    // 新的绝区零角色详细信息接口
    export interface AvatarDetail {
        avatar: Character;
        skills: Skill[];
        weapon: Weapon;
        equip: Equipment[];
        ranks: Rank[];
        properties: Property[];
    }

    // 保持向后兼容
    export interface CharacterData {
        skill_list?: Skill[];
        weapon?: Weapon;
        reliquary_list?: Equipment[];
    }

    export interface CharacterDataEx extends CharacterData {
        character: Character;
        // 新增字段以支持绝区零数据结构
        avatar?: Character;
        skills?: Skill[];
        equip?: Equipment[];
        ranks?: Rank[];
        properties?: Property[];
    }

    export interface Res<T> {
        retcode: number;
        message: string;
        data: Data<T>;
    }

}
