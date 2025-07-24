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
import {getCharacterId, getWeaponId} from "./query";

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
    if (data.character && data.type) {
        index = findGoalIndex(goals, data.type, data.character);
    } else if (data.weapon && data.type === "weapon") {
        index = findGoalIndex(goals, data.type, data.weapon);
    } else if (data.id) {
        index = goals.findIndex((g: any) => g.id === data.id);
    }

    if (index >= 0) {
        // 更新现有目标
        goals[index] = {...goals[index], ...data};
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
        const {normal, skill, burst} = seelieGoal;
        const {goal: normalGoal} = normal;
        const {goal: skillGoal} = skill;
        const {goal: burstGoal} = burst;
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
        text: characterData.level.toString()
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
        const {goal: existingGoal} = existingCharacter;
        
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
        asc: convertAscensionLevel(weaponData.asc), // 转换后的突破等级用于验证
        craft: weaponData.craft
    };
    
    if (!validateZZZWeaponData(validationData)) {
        console.error('Invalid ZZZ weapon data:', weaponData);
        return;
    }

    const totalGoal: Goal[] = getTotalGoal();
    const id = generateNewId(totalGoal);
    
    // 查找现有的武器目标 - 根据武器ID查找
    const existingWeaponIdx = totalGoal.findIndex(
        g => g.type === "weapon" && 
             (g as ZZZWeaponGoal).weapon === weaponData.weaponId
    );
    
    // 创建武器状态对象
    const currentStatus: seelie.ZZZWeaponStatus = {
        level: weaponData.level,
        asc: convertAscensionLevel(weaponData.asc), // 转换突破等级
        craft: weaponData.craft,
        text: weaponData.level.toString()
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
        const {goal: existingGoal} = existingWeapon;
        
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
        const {goal, current} = seelieGoal;
        const {level: levelCurrent, asc: ascCurrent} = current;
        const {level: levelGoal, asc: ascGoal} = goal;
        const {level, asc} = characterStatus;

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

// 保留原有的addCharacter函数以维持向后兼容性（如果需要）
export function addCharacter(characterDataEx: CharacterDataEx) {

    const {character, skill_list, weapon} = characterDataEx;
    const characterName = character.name_mi18n || character.full_name_mi18n;

    //{"type":"character","character":"traveler","current":{"level":70,"asc":4,"text":"70"},"goal":{"level":70,"asc":4,"text":"70"},"id":1},
    //{"type":"weapon","weapon":""deathmatch"","current":{"level":70,"asc":4,"text":"70"},"goal":{"level":70,"asc":4,"text":"70"},"id":1},
    //{"type":"talent","character":"traveler_geo","c3":false,"c5":false,"normal":{"current":1,"goal":6},"skill":{"current":1,"goal":6},"burst":{"current":1,"goal":6},"id":2}

    if (weapon) {
        const {name, level: weaponLeveL} = weapon;
        const weaponId = getWeaponId(name);
        if (weaponId) {
            addCharacterGoal(weaponLeveL, weaponId, name, "weapon");
        }
    }
    const {level: characterLevel} = character;
    const characterId = getCharacterId(characterName);
    if (!characterId) {
        return
    }
    addCharacterGoal(characterLevel, characterId, characterName, "character");

    // 绝区零没有旅行者角色，直接使用角色ID
    if (skill_list) {
        addTalentGoal(characterId, skill_list);
    }

}

// 绝区零等级状态列表 - 等级上限60，突破等级0-5
export const characterStatusList: CharacterStatus[] = [
    {level: 1, asc: 0, text: "1"},
    {level: 10, asc: 0, text: "10"},
    {level: 10, asc: 1, text: "10 A"},
    {level: 20, asc: 1, text: "20"},
    {level: 20, asc: 2, text: "20 A"},
    {level: 30, asc: 2, text: "30"},
    {level: 30, asc: 3, text: "30 A"},
    {level: 40, asc: 3, text: "40"},
    {level: 40, asc: 4, text: "40 A"},
    {level: 50, asc: 4, text: "50"},
    {level: 50, asc: 5, text: "50 A"},
    {level: 60, asc: 5, text: "60"},
]

const initCharacterStatus = (level_current: number) => {
    let initCharacterStatus = characterStatusList[0];
    if (level_current < 20) {
        return initCharacterStatus;
    }
    for (let characterStatus of characterStatusList) {
        const {level} = characterStatus;
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
    const {normal: {current: normalCurrent}, skill: {current: skillCurrent}, burst: {current: burstCurrent}} = talent;
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
        basic: {current: basicCurrent},
        dodge: {current: dodgeCurrent},
        assist: {current: assistCurrent},
        special: {current: specialCurrent},
        chain: {current: chainCurrent},
        core: {current: coreCurrent}
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

export const batchUpdateTalent = (all: boolean, normal: number, skill: number, burst: number) => {
    getTotalGoal().filter(a => a.type == 'talent').filter(a => all || !getGoalInactive().includes(a.character as string))
        .map(a => updateTalent(a as TalentGoal, normal, skill, burst))
}

// ===== 绝区零API导出 =====
export { 
    addZZZTalentGoal, 
    addZZZCharacterGoal, 
    addZZZWeaponGoal
};

// ===== 原神兼容性API（如需要） =====

// 绝区零批量天赋更新函数 - 支持六种技能类型
export const batchUpdateZZZTalent = (
    all: boolean, 
    basic: number, 
    dodge: number, 
    assist: number, 
    special: number, 
    chain: number, 
    core: number
) => {
    getTotalGoal()
        .filter(a => a.type === 'talent')
        .filter(a => all || !getGoalInactive().includes(a.character as string))
        .forEach(talent => updateZZZTalent(talent as ZZZTalentGoal, {
            basic, dodge, assist, special, chain, core
        }));
};

const updateCharacter = (character: CharacterGoal, characterStatusGoal: CharacterStatus) => {
    const {current} = character;
    const {level: levelCurrent, asc: ascCurrent} = current;
    const {level, asc} = characterStatusGoal;

    const characterGoalNew = {
        ...character,
        goal: level >= levelCurrent && asc >= ascCurrent ? characterStatusGoal : current,
    }
    addGoal(characterGoalNew)
}

// 绝区零角色批量更新函数
export const batchUpdateZZZCharacter = (all: boolean, characterStatusGoal: CharacterStatus) => {
    getTotalGoal()
        .filter(a => a.type === "character")
        .filter(a => all || !getGoalInactive().includes(a.character as string))
        .forEach(character => {
            const zzzCharacter = character as ZZZCharacterGoal;
            const {current} = zzzCharacter;
            const {level: levelCurrent, asc: ascCurrent} = current;
            const {level, asc} = characterStatusGoal;

            const characterGoalNew: ZZZCharacterGoal = {
                ...zzzCharacter,
                goal: level >= levelCurrent && asc >= ascCurrent ? characterStatusGoal : current,
            };
            addGoal(characterGoalNew);
        });
};

// 保留原有函数以维持兼容性
export const batchUpdateCharacter = (all: boolean, characterStatusGoal: CharacterStatus,) => {
    getTotalGoal().filter(a => a.type == "character").filter(a => all || !getGoalInactive().includes(a.character as string))
        .map(a => updateCharacter(a as CharacterGoal, characterStatusGoal))
    location.reload()
}

// 绝区零武器批量更新函数 - 支持精炼等级
export const batchUpdateZZZWeapon = (all: boolean, weaponStatusGoal: seelie.ZZZWeaponStatus) => {
    getTotalGoal()
        .filter(a => a.type === "weapon")
        .filter(a => all || !getGoalInactive().includes((a as ZZZWeaponGoal).weapon as string))
        .forEach(weapon => {
            const zzzWeapon = weapon as ZZZWeaponGoal;
            const {current} = zzzWeapon;
            const {level: levelCurrent, asc: ascCurrent, craft: craftCurrent} = current;
            const {level, asc, craft} = weaponStatusGoal;

            // 如果新目标比当前状态更高，则更新目标
            const shouldUpdate = level > levelCurrent || 
                               (level === levelCurrent && asc > ascCurrent) ||
                               (level === levelCurrent && asc === ascCurrent && craft > craftCurrent);

            const weaponGoalNew: ZZZWeaponGoal = {
                ...zzzWeapon,
                goal: shouldUpdate ? weaponStatusGoal : current,
            };
            addGoal(weaponGoalNew);
        });
};

// 保留原有函数以维持兼容性
export const batchUpdateWeapon = (all: boolean, characterStatusGoal: CharacterStatus,) => {
    getTotalGoal().filter(a => a.type == "weapon").filter(a => all || !getGoalInactive().includes(a.weapon as string))
        .map(a => updateCharacter(a as CharacterGoal, characterStatusGoal))
    location.reload()
}
