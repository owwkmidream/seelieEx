// 基础类型导入
import Goal = seelie.Goal;
import CharacterStatus = seelie.CharacterStatus;
import CharacterGoal = seelie.CharacterGoal;
import TalentGoal = seelie.TalentGoal;
import WeaponGoal = seelie.WeaponGoal;

// 绝区零特有类型导入
import ZZZTalentGoal = seelie.ZZZTalentGoal;
import ZZZTalentInput = seelie.ZZZTalentInput;
import ZZZCharacterGoal = seelie.ZZZCharacterGoal;
import ZZZCharacterInput = seelie.ZZZCharacterInput;
import ZZZWeaponGoal = seelie.ZZZWeaponGoal;
import ZZZWeaponInput = seelie.ZZZWeaponInput;

// 原神兼容性导入（如果需要保持向后兼容）
import CharacterDataEx = mihoyo.CharacterDataEx;
import AvatarDetail = mihoyo.AvatarDetail;
import { getCharacterId, getWeaponId } from "./query";

// ===== 绝区零特有功能 =====

// 绝区零突破等级转换函数
// 将官方API的突破等级(1-6)转换为Seelie内部格式(0-5)
const convertAscensionLevel = (apiLevel: number): number => {
    // 边界检查：确保输入值在有效范围内
    if (apiLevel < 1) return 0;
    if (apiLevel > 6) return 5;

    // 转换公式：seelie_asc = api_asc - 1
    return apiLevel - 1;
};

// 验证绝区零角色数据的有效性
const validateZZZCharacterData = (data: any): boolean => {
    return (
        typeof data.level === 'number' && data.level >= 1 && data.level <= 60 &&
        typeof data.asc === 'number' && data.asc >= 0 && data.asc <= 5 &&
        typeof data.cons === 'number' && data.cons >= 0 && data.cons <= 6
    );
};

// 验证绝区零天赋数据的有效性
const validateZZZTalentData = (data: any): boolean => {
    const skillRanges = {
        basic: [1, 12],
        dodge: [1, 12],
        assist: [1, 12],
        special: [1, 12],
        chain: [1, 12],
        core: [0, 6]  // 核心技能特殊，从0开始
    };

    return Object.entries(skillRanges).every(([skill, [min, max]]) => {
        const value = data[skill];
        return typeof value === 'number' && value >= min && value <= max;
    });
};

// 验证绝区零武器数据的有效性
const validateZZZWeaponData = (data: any): boolean => {
    return (
        typeof data.level === 'number' && data.level >= 0 && data.level <= 60 &&
        typeof data.asc === 'number' && data.asc >= 0 && data.asc <= 5 &&
        typeof data.craft === 'number' && data.craft >= 0 && data.craft <= 5
    );
};

const getAccount: () => string = () => localStorage.account || "main";

const getTotalGoal: () => Goal[] = () =>
    JSON.parse(
        localStorage.getItem(`${getAccount()}-goals`) || "[]"
    ) as Goal[];

const getGoalInactive: () => string[] = () =>
    Object.keys(JSON.parse(localStorage.getItem(`${getAccount()}-inactive`) || "{}"));

const setGoals = (goals: any) => {
    // console.log(`${getAccount()}-goals`)
    // console.log(JSON.stringify(goals))
    localStorage.setItem(`${getAccount()}-goals`, JSON.stringify(goals));
    localStorage.setItem("last_update", new Date().toISOString());
};

// 辅助函数：生成新的ID
const generateNewId = (goals: Goal[]): number => {
    const ids = goals.map(g => g.id).filter(id => typeof id === "number");
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

// 辅助函数：查找现有目标的索引
const findGoalIndex = (goals: Goal[], type: string, identifier: string): number => {
    return goals.findIndex(g => {
        if (type === "character") {
            return g.type === type && g.character === identifier;
        } else if (type === "weapon") {
            return g.type === type && (g as ZZZWeaponGoal).weapon === identifier;
        } else if (type === "talent") {
            return g.type === type && g.character === identifier;
        }
        return false;
    });
};

const addGoal = (data: any) => {
    const goals = getTotalGoal();
    let index: number = -1;

    // 查找现有目标
    if (data.character && data.type === "character") {
        index = findGoalIndex(goals, data.type, data.character);
    } else if (data.character && data.type === "talent") {
        index = findGoalIndex(goals, data.type, data.character);
    } else if (data.weapon && data.character && data.type === "weapon") {
        // 武器需要同时匹配武器ID和角色ID
        index = goals.findIndex(g =>
            g.type === "weapon" &&
            (g as ZZZWeaponGoal).weapon === data.weapon &&
            (g as ZZZWeaponGoal).character === data.character
        );
    } else if (data.id) {
        index = goals.findIndex((g: any) => g.id === data.id);
    }

    if (index >= 0) {
        // 更新现有目标
        goals[index] = { ...goals[index], ...data };
    } else {
        // 创建新目标
        data.id = generateNewId(goals);
        goals.push(data);
        console.log('Added new goal:', data);
    }

    setGoals(goals);
};

const addTalentGoal = (talentCharacter: string, skill_list: mihoyo.Skill[]) => {
    const totalGoal: Goal[] = getTotalGoal();
    const ids = totalGoal.map(g => g.id);
    const id = Math.max(...ids) + 1 || 1;
    const talentIdx = totalGoal.findIndex(g => g.type == "talent" && g.character == talentCharacter);
    const [normalCurrent, skillCurrent, burstCurrent] = skill_list.filter(a => a.level >= 1).sort().map(a => a.level)
    let talentGoal: TalentGoal;
    if (talentIdx < 0) {
        talentGoal = {
            type: "talent",
            character: talentCharacter,
            c3: false,
            c5: false,
            normal: {
                current: normalCurrent,
                goal: normalCurrent
            },
            skill: {
                current: skillCurrent,
                goal: skillCurrent
            },
            burst: {
                current: burstCurrent,
                goal: burstCurrent
            },
            id
        }
    } else {
        const seelieGoal = totalGoal[talentIdx] as TalentGoal;
        const { normal, skill, burst } = seelieGoal;
        const { goal: normalGoal } = normal;
        const { goal: skillGoal } = skill;
        const { goal: burstGoal } = burst;
        talentGoal = {
            ...seelieGoal,
            normal: {
                current: normalCurrent,
                goal: normalCurrent > normalGoal ? normalCurrent : normalGoal
            }, skill: {
                current: skillCurrent,
                goal: skillCurrent > skillGoal ? skillCurrent : skillGoal
            }, burst: {
                current: burstCurrent,
                goal: burstCurrent > burstGoal ? burstCurrent : burstGoal
            }
        }
    }
    addGoal(talentGoal)
};

// 绝区零天赋目标添加函数 - 支持六种技能类型
const addZZZTalentGoal = (character: string, talentData: ZZZTalentInput) => {
    // 验证输入数据
    if (!validateZZZTalentData(talentData)) {
        console.error('Invalid ZZZ talent data:', talentData);
        return;
    }

    const totalGoal: Goal[] = getTotalGoal();
    const id = generateNewId(totalGoal);

    // 查找现有的天赋目标
    const existingTalentIdx = findGoalIndex(totalGoal, "talent", character);

    let talentGoal: ZZZTalentGoal;

    if (existingTalentIdx < 0) {
        // 创建新的天赋目标
        talentGoal = {
            type: "talent",
            character,
            basic: {
                current: talentData.basic,
                goal: talentData.basic
            },
            dodge: {
                current: talentData.dodge,
                goal: talentData.dodge
            },
            assist: {
                current: talentData.assist,
                goal: talentData.assist
            },
            special: {
                current: talentData.special,
                goal: talentData.special
            },
            chain: {
                current: talentData.chain,
                goal: talentData.chain
            },
            core: {
                current: talentData.core,
                goal: talentData.core
            },
            id
        };
    } else {
        // 更新现有的天赋目标 - 只更新current，保留用户设置的goal
        const existingTalent = totalGoal[existingTalentIdx] as ZZZTalentGoal;

        talentGoal = {
            ...existingTalent,
            basic: {
                current: talentData.basic,
                goal: Math.max(talentData.basic, existingTalent.basic?.goal || talentData.basic)
            },
            dodge: {
                current: talentData.dodge,
                goal: Math.max(talentData.dodge, existingTalent.dodge?.goal || talentData.dodge)
            },
            assist: {
                current: talentData.assist,
                goal: Math.max(talentData.assist, existingTalent.assist?.goal || talentData.assist)
            },
            special: {
                current: talentData.special,
                goal: Math.max(talentData.special, existingTalent.special?.goal || talentData.special)
            },
            chain: {
                current: talentData.chain,
                goal: Math.max(talentData.chain, existingTalent.chain?.goal || talentData.chain)
            },
            core: {
                current: talentData.core,
                goal: Math.max(talentData.core, existingTalent.core?.goal || talentData.core)
            }
        };
    }

    addGoal(talentGoal);
};

// 绝区零角色目标添加函数 - 支持命座和突破等级转换
const addZZZCharacterGoal = (characterData: ZZZCharacterInput) => {
    // 验证输入数据
    const validationData = {
        level: characterData.level,
        asc: convertAscensionLevel(characterData.asc), // 转换后的突破等级用于验证
        cons: characterData.cons
    };

    if (!validateZZZCharacterData(validationData)) {
        console.error('Invalid ZZZ character data:', characterData);
        return;
    }

    const totalGoal: Goal[] = getTotalGoal();
    const id = generateNewId(totalGoal);

    // 查找现有的角色目标
    const existingCharacterIdx = findGoalIndex(totalGoal, "character", characterData.characterId);

    // 创建角色状态对象
    const currentStatus: CharacterStatus = {
        level: characterData.level,
        asc: convertAscensionLevel(characterData.asc), // 转换突破等级
        // text: characterData.level.toString()
    };

    let characterGoal: ZZZCharacterGoal;

    if (existingCharacterIdx < 0) {
        // 创建新的角色目标
        characterGoal = {
            type: "character",
            character: characterData.characterId,
            cons: characterData.cons,
            current: currentStatus,
            goal: currentStatus, // 新角色的目标等于当前状态
            id
        };
    } else {
        // 更新现有的角色目标 - 只更新current和cons，保留用户设置的goal
        const existingCharacter = totalGoal[existingCharacterIdx] as ZZZCharacterGoal;
        const { goal: existingGoal } = existingCharacter;

        // 如果当前状态比目标更高，则更新目标
        const shouldUpdateGoal = currentStatus.level > existingGoal.level ||
            (currentStatus.level === existingGoal.level && currentStatus.asc > existingGoal.asc);

        characterGoal = {
            ...existingCharacter,
            cons: characterData.cons, // 更新命座
            current: currentStatus,
            goal: shouldUpdateGoal ? currentStatus : existingGoal
        };
    }

    addGoal(characterGoal);
};

// 绝区零武器目标添加函数 - 支持精炼等级和角色关联
const addZZZWeaponGoal = (weaponData: ZZZWeaponInput) => {
    // 验证输入数据
    const validationData = {
        level: weaponData.level,
        asc: weaponData.asc,
        craft: weaponData.craft
    };

    if (!validateZZZWeaponData(validationData)) {
        console.error('Invalid ZZZ weapon data:', weaponData);
        return;
    }

    const totalGoal: Goal[] = getTotalGoal();
    const id = generateNewId(totalGoal);

    // 查找现有的武器目标 - 根据武器ID和角色ID查找
    const existingWeaponIdx = totalGoal.findIndex(
        g => g.type === "weapon" &&
            (g as ZZZWeaponGoal).weapon === weaponData.weaponId &&
            (g as ZZZWeaponGoal).character === weaponData.characterId
    );

    // 创建武器状态对象
    const currentStatus: seelie.ZZZWeaponStatus = {
        level: weaponData.level,
        asc: weaponData.asc,
        craft: weaponData.craft,
        // text: weaponData.level.toString()
    };

    let weaponGoal: ZZZWeaponGoal;

    if (existingWeaponIdx < 0) {
        // 创建新的武器目标
        weaponGoal = {
            type: "weapon",
            character: weaponData.characterId,
            weapon: weaponData.weaponId,
            current: currentStatus,
            goal: currentStatus, // 新武器的目标等于当前状态
            id
        };
    } else {
        // 更新现有的武器目标 - 只更新current，保留用户设置的goal
        const existingWeapon = totalGoal[existingWeaponIdx] as ZZZWeaponGoal;
        const { goal: existingGoal } = existingWeapon;

        // 如果当前状态比目标更高，则更新目标
        const shouldUpdateGoal = currentStatus.level > existingGoal.level ||
            (currentStatus.level === existingGoal.level && currentStatus.asc > existingGoal.asc) ||
            (currentStatus.level === existingGoal.level && currentStatus.asc === existingGoal.asc && currentStatus.craft > existingGoal.craft);

        weaponGoal = {
            ...existingWeapon,
            character: weaponData.characterId, // 更新角色关联
            current: currentStatus,
            goal: shouldUpdateGoal ? currentStatus : existingGoal
        };
    }

    addGoal(weaponGoal);
};

export const addCharacterGoal = (level_current: number, nameEn: String, name: string, type: string) => {
    let totalGoal: Goal[] = getTotalGoal();
    const ids = totalGoal.map(g => g.id);
    const id = Math.max(...ids) + 1 || 1;
    let characterPredicate = (g: Goal) => g.type == type && g.character == nameEn;
    let weaponPredicate = (g: Goal) => g.type == type && g.weapon == nameEn;
    const characterIdx = totalGoal.findIndex(type == "character" ? characterPredicate : weaponPredicate);
    const characterStatus: CharacterStatus = initCharacterStatus(level_current);

    let characterGoal: Goal

    function initCharacterGoal() {
        return {
            type,
            character: nameEn,
            current: characterStatus,
            goal: characterStatus,
            id
        } as CharacterGoal
    }

    function initWeaponGoal() {
        return {
            type,
            character: "",
            weapon: nameEn,
            current: characterStatus,
            goal: characterStatus,
            id
        } as WeaponGoal
    }

    if (characterIdx < 0) {
        characterGoal = type == "character" ? initCharacterGoal() : initWeaponGoal();
    } else {
        const seelieGoal = type == "character" ? totalGoal[characterIdx] as CharacterGoal : totalGoal[characterIdx] as WeaponGoal
        const { goal, current } = seelieGoal;
        const { level: levelCurrent, asc: ascCurrent } = current;
        const { level: levelGoal, asc: ascGoal } = goal;
        const { level, asc } = characterStatus;

        characterGoal = {
            ...seelieGoal,
            current: level >= levelCurrent && asc >= ascCurrent ? characterStatus : current,
            goal: level >= levelGoal && asc >= ascGoal ? characterStatus : goal,
        }
    }
    addGoal(characterGoal)
};

// 绝区零角色数据添加函数 - 处理角色、武器、天赋的完整数据
export function addZZZCharacter(
    characterData: ZZZCharacterInput,
    talentData: ZZZTalentInput,
    weaponData?: ZZZWeaponInput
) {
    // 添加角色数据
    addZZZCharacterGoal(characterData);

    // 添加天赋数据
    addZZZTalentGoal(characterData.characterId, talentData);

    // 如果有武器数据，添加武器
    if (weaponData) {
        addZZZWeaponGoal(weaponData);
    }
}

// 绝区零角色数据处理函数 - 处理新的API数据结构
export function addZZZCharacterFromAPI(avatarDetail: mihoyo.AvatarDetail) {
    const { avatar, weapon } = avatarDetail;
    const { skills, ranks } = avatar;

    if (!avatar) {
        console.error('角色数据缺失');
        return;
    }

    const characterId = getCharacterId(avatar.name_mi18n || avatar.full_name_mi18n);
    if (!characterId) {
        console.warn(`未找到角色ID: ${avatar.name_mi18n || avatar.full_name_mi18n}`);
        return;
    }
    const avatarRank = avatar.rank || ranks?.filter(r => r.is_unlocked).length || 0;
    const characterInput: ZZZCharacterInput = {
        characterId,
        level: avatar.level,
        asc: avatar?.promotes || 1, // API格式的突破等级 1-6
        cons: avatarRank
    };
    addZZZCharacterGoal(characterInput);
    // 2. 处理天赋数据
    if (skills && skills.length > 0) {
        // 按index顺序判断技能类型
        const skillTypeOrder: (keyof ZZZTalentInput)[] = ['basic', 'dodge', 'assist', 'special', 'chain', 'core'];
        const talentInput: ZZZTalentInput = {
            characterId,
            basic: 1,
            dodge: 1,
            assist: 1,
            special: 1,
            chain: 1,
            core: 0
        };

        // 根据API返回的技能数据设置等级
        skills.forEach((skill, index) => {
            if (index < skillTypeOrder.length) {
                const skillKey = skillTypeOrder[index];
                // 处理核心技等级
                if (skillKey === 'core') (talentInput as any)[skillKey] = skill.level - 1;
                // 处理命座等级加成
                else (talentInput as any)[skillKey] = skill.level - (avatarRank >= 3 ? 2 : 0) - (avatarRank >= 5 ? 2 : 0);
            }
        });

        addZZZTalentGoal(characterId, talentInput);
    }

    // 3. 处理武器数据
    if (weapon) {
        const weaponId = getWeaponId(weapon.name);
        if (weaponId) {
            // 根据武器等级推算突破等级（绝区零武器等级上限60，突破点：10, 20, 30, 40, 50）
            let weaponAscensionLevel = 0;
            if (weapon.level > 50) weaponAscensionLevel = 5;
            else if (weapon.level > 40) weaponAscensionLevel = 4;
            else if (weapon.level > 30) weaponAscensionLevel = 3;
            else if (weapon.level > 20) weaponAscensionLevel = 2;
            else if (weapon.level > 10) weaponAscensionLevel = 1;

            const weaponInput: ZZZWeaponInput = {
                characterId,
                weaponId,
                level: weapon.level,
                asc: weaponAscensionLevel, // 0-5
                craft: weapon.star || 1 // 精炼等级
            };
            addZZZWeaponGoal(weaponInput);
        }
    }
}

// 保留原有的addCharacter函数以维持向后兼容性（原神数据）
export function addCharacter(characterDataEx: CharacterDataEx) {
    // 检查是否为绝区零数据结构
    if (characterDataEx.avatar && characterDataEx.skills) {
        // 这是绝区零的数据结构，使用新的处理函数
        addZZZCharacterFromAPI(characterDataEx as mihoyo.AvatarDetail);
        return;
    }

    // 原神数据处理逻辑
    const { character, skills, weapon } = characterDataEx;
    const characterName = character.name_mi18n || character.full_name_mi18n;

    if (weapon) {
        const { name, level: weaponLeveL } = weapon;
        const weaponId = getWeaponId(name);
        if (weaponId) {
            addCharacterGoal(weaponLeveL, weaponId, name, "weapon");
        }
    }
    const { level: characterLevel } = character;
    const characterId = getCharacterId(characterName);
    if (!characterId) {
        return
    }
    addCharacterGoal(characterLevel, characterId, characterName, "character");

    // 原神天赋处理
    if (skills) {
        addTalentGoal(characterId, skills);
    }
}

// 绝区零等级状态列表 - 等级上限60，突破等级0-5
export const characterStatusList: CharacterStatus[] = [
    { level: 1, asc: 0 },
    { level: 10, asc: 0 },
    { level: 10, asc: 1 },
    { level: 20, asc: 1 },
    { level: 20, asc: 2 },
    { level: 30, asc: 2 },
    { level: 30, asc: 3 },
    { level: 40, asc: 3 },
    { level: 40, asc: 4 },
    { level: 50, asc: 4 },
    { level: 50, asc: 5 },
    { level: 60, asc: 5 },
]

const initCharacterStatus = (level_current: number) => {
    let initCharacterStatus = characterStatusList[0];
    if (level_current < 20) {
        return initCharacterStatus;
    }
    for (let characterStatus of characterStatusList) {
        const { level } = characterStatus;
        if (level_current < level) {
            return initCharacterStatus;
        } else if (level_current == level) {
            return characterStatus;
        } else if (level_current > level) {
            initCharacterStatus = characterStatus
        }
    }
    return initCharacterStatus;
};

const updateTalent = (talent: TalentGoal, normalGoal = 9, skillGoal = 9, burstGoal = 9) => {
    const { normal: { current: normalCurrent }, skill: { current: skillCurrent }, burst: { current: burstCurrent } } = talent;
    const talentNew = {
        ...talent,
        normal: {
            current: normalCurrent,
            goal: normalCurrent > normalGoal ? normalCurrent : normalGoal
        }, skill: {
            current: skillCurrent,
            goal: skillCurrent > skillGoal ? skillCurrent : skillGoal
        }, burst: {
            current: burstCurrent,
            goal: burstCurrent > burstGoal ? burstCurrent : burstGoal
        }
    }
    addGoal(talentNew)
}

// 绝区零天赋更新函数 - 支持六种技能类型
const updateZZZTalent = (talent: ZZZTalentGoal, skillGoals: {
    basic?: number,
    dodge?: number,
    assist?: number,
    special?: number,
    chain?: number,
    core?: number
}) => {
    const {
        basic: { current: basicCurrent },
        dodge: { current: dodgeCurrent },
        assist: { current: assistCurrent },
        special: { current: specialCurrent },
        chain: { current: chainCurrent },
        core: { current: coreCurrent }
    } = talent;

    const talentNew: ZZZTalentGoal = {
        ...talent,
        basic: {
            current: basicCurrent,
            goal: skillGoals.basic !== undefined ?
                (basicCurrent > skillGoals.basic ? basicCurrent : skillGoals.basic) :
                talent.basic.goal
        },
        dodge: {
            current: dodgeCurrent,
            goal: skillGoals.dodge !== undefined ?
                (dodgeCurrent > skillGoals.dodge ? dodgeCurrent : skillGoals.dodge) :
                talent.dodge.goal
        },
        assist: {
            current: assistCurrent,
            goal: skillGoals.assist !== undefined ?
                (assistCurrent > skillGoals.assist ? assistCurrent : skillGoals.assist) :
                talent.assist.goal
        },
        special: {
            current: specialCurrent,
            goal: skillGoals.special !== undefined ?
                (specialCurrent > skillGoals.special ? specialCurrent : skillGoals.special) :
                talent.special.goal
        },
        chain: {
            current: chainCurrent,
            goal: skillGoals.chain !== undefined ?
                (chainCurrent > skillGoals.chain ? chainCurrent : skillGoals.chain) :
                talent.chain.goal
        },
        core: {
            current: coreCurrent,
            goal: skillGoals.core !== undefined ?
                (coreCurrent > skillGoals.core ? coreCurrent : skillGoals.core) :
                talent.core.goal
        }
    };

    addGoal(talentNew);
};

// ===== 绝区零API导出 =====
export {
    addZZZTalentGoal,
    addZZZCharacterGoal,
    addZZZWeaponGoal
};
