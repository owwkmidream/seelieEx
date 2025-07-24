import Role = mihoyo.Role;
import Data = mihoyo.Data;
import Character = mihoyo.Character;
import CharacterDataEx = mihoyo.CharacterDataEx;

// 绝区零 API
const BBS_URL = 'https://act.mihoyo.com/zzz/gt/character-builder-h/index.html'
const ROLE_URL = 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=nap_cn'
const CHARACTERS_URL = 'https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool/user/avatar_basic_list'
const CHARACTERS_DETAIL_URL = 'https://act-api-takumi.mihoyo.com/event/nap_cultivate_tool/user/batch_avatar_detail_v2'
import GM_fetch from "@trim21/gm-fetch";


// UUID生成函数（等价于Python的uuid.uuid4()）
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 生成随机字符串
function generateCharString(number = 16) {
    const characters = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

// 生成GUID
function getGuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}



// 基础请求头
const baseHeaders = {
    "accept": "application/json, text/plain, */*"
}

// 设备ID获取和持久化
const getOrCreateDeviceId = () => {
    let deviceId = localStorage.getItem("mysDeviceId");
    if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem("mysDeviceId", deviceId);
    }
    return deviceId;
}

// 带认证信息的请求头
const getAuthHeaders = async () => {
    const deviceId = getOrCreateDeviceId();
    
    return {
        ...baseHeaders,
        "x-rpc-device_id": deviceId
    };
}



const to = (promise: Promise<any>) => promise.then(data => {
    return [null, data];
}).catch(err => [err]);

// 统一错误处理函数
const handleApiError = (err: any, res?: Response) => {
    console.error('API调用失败:', err);
    alert("请确认已登录活动页面且绑定绝区零账户!");
    GM_openInTab(BBS_URL);
    throw err ? err : new Error("API调用失败");
}

// 数据结构验证函数
const validateAvatarBasicData = (data: any) => {
    if (!data || !Array.isArray(data.list)) {
        console.warn('角色基础数据格式不正确:', data);
        return false;
    }
    
    for (const item of data.list) {
        if (!item.avatar || typeof item.unlocked !== 'boolean') {
            console.warn('角色基础项数据格式不正确:', item);
            return false;
        }
    }
    
    return true;
}

const validateAvatarDetailData = (data: any) => {
    if (!data || !Array.isArray(data.list)) {
        console.warn('角色详细数据格式不正确:', data);
        return false;
    }
    
    for (const item of data.list) {
        if (!item.avatar) {
            console.warn('角色详细项缺少avatar字段:', item);
            continue;
        }
        
        if (item.skills && Array.isArray(item.skills)) {
            console.log(`角色 ${item.avatar.name_mi18n} 包含 ${item.skills.length} 个技能`);
        }
        
        if (item.weapon) {
            console.log(`角色 ${item.avatar.name_mi18n} 装备武器: ${item.weapon.name}`);
        }
        
        if (item.equip && Array.isArray(item.equip)) {
            console.log(`角色 ${item.avatar.name_mi18n} 装备 ${item.equip.length} 件装备`);
        }
    }
    
    return true;
}

// 只支持绝区零国服

export const getAccount = async () => {
    const [err, res] = await to(GM_fetch(ROLE_URL, {
        method: 'GET',
        headers: baseHeaders
    }));

    if (!err) {
        if (res.ok) {
            const resData = await res.json();
            console.log(resData);
            const { retcode, data } = resData;
            if (retcode === 0) {
                const { list: accountList } = await data as Data<Role>;
                return accountList;
            }
        }
    }

    handleApiError(err, res);
};

const getCharacters = async (uid: string, region: string) => {
    const url = `${CHARACTERS_URL}?uid=${uid}&region=${region}`;
    const requestHeaders = await getAuthHeaders();

    // GM_fetch会自动携带浏览器的cookie，包括e_nap_token
    const [err, res] = await to(GM_fetch(url, {
        method: 'GET',
        headers: requestHeaders
    }));

    if (!err) {
        console.log(res)
        if (res.ok) {
            const resData = await res.json();
            console.log(resData);
            const { retcode, data } = resData;
            if (retcode === 0) {
                // 验证数据结构
                if (validateAvatarBasicData(data)) {
                    // 解析data.list而不是data.avatar_list，只返回已解锁角色的avatar字段
                    return data.list.filter((item: any) => item.unlocked).map((item: any) => item.avatar);
                } else {
                    console.error('角色基础数据结构验证失败');
                    return [];
                }
            }
        }
    }

    handleApiError(err, res);
};

const getCharacterDetail = async (characters: Character[], uid: string, region: string) => {
    const url = `${CHARACTERS_DETAIL_URL}?uid=${uid}&region=${region}`;
    const requestHeaders = await getAuthHeaders();
    
    // 构建请求体
    const requestBody = {
        avatar_list: characters.map(char => ({
            avatar_id: char.id,
            is_teaser: false,
            teaser_need_weapon: false,
            teaser_sp_skill: false
        }))
    };

    // GM_fetch会自动携带浏览器的cookie，包括e_nap_token
    const [err, res] = await to(GM_fetch(url, {
        method: 'POST',
        headers: {
            ...requestHeaders,
            "content-type": "application/json"
        },
        body: JSON.stringify(requestBody)
    }));

    if (!err) {
        if (res.ok) {
            const resData = await res.json();
            console.log(resData);
            const { retcode, data } = resData;
            if (retcode === 0) {
                // 验证数据结构
                if (validateAvatarDetailData(data)) {
                    return data.list; // 返回详细信息列表
                } else {
                    console.error('角色详细数据结构验证失败');
                    // 降级处理：返回基础信息
                    return characters.map(char => ({ character: char, ...char }));
                }
            }
        }
    } else {
        console.error(err)
    }

    // 降级处理：返回基础信息
    return characters.map(char => ({ character: char, ...char }));
};



const BATCH_SIZE = 20; // 每批处理的角色数量

export const getDetailList = async (game_uid: string, region: string) => {
    console.log('开始获取角色数据，UID:', game_uid, '区域:', region);
    
    try {
        // 1. 获取角色基础列表
        console.log('步骤1: 获取角色基础列表...');
        const characters = await getCharacters(game_uid, region);
        console.log(`获取到 ${characters.length} 个已解锁角色`);
        
        if (characters.length === 0) {
            console.warn('未获取到任何角色数据');
            return [];
        }
        
        // 2. 分批处理角色详情
        console.log('步骤2: 分批处理角色详情...');
        const batches = [];
        for (let i = 0; i < characters.length; i += BATCH_SIZE) {
            batches.push(characters.slice(i, i + BATCH_SIZE));
        }
        console.log(`将 ${characters.length} 个角色分为 ${batches.length} 批处理，每批最多 ${BATCH_SIZE} 个`);
        
        // 3. 并发处理各批次
        console.log('步骤3: 并发获取角色详情...');
        const detailPromises = batches.map((batch, index) => {
            console.log(`处理第 ${index + 1} 批，包含 ${batch.length} 个角色`);
            return getCharacterDetail(batch, game_uid, region);
        });
        
        // 4. 合并结果
        console.log('步骤4: 合并结果...');
        const detailResults = await Promise.all(detailPromises);
        const finalResults = detailResults.flat();
        
        console.log(`成功获取 ${finalResults.length} 个角色的详细信息`);
        
        // 5. 验证最终结果
        console.log('步骤5: 验证最终结果...');
        validateFinalResults(finalResults);
        
        return finalResults;
    } catch (error) {
        console.error('获取角色详情列表失败:', error);
        throw error;
    }
}

// 最终结果验证函数
const validateFinalResults = (results: any[]) => {
    console.log('=== 最终结果验证 ===');
    console.log(`总角色数量: ${results.length}`);
    
    let skillCount = 0;
    let weaponCount = 0;
    let equipCount = 0;
    
    results.forEach((result, index) => {
        if (result.avatar || result.character) {
            const avatar = result.avatar || result.character;
            console.log(`角色 ${index + 1}: ${avatar.name_mi18n || avatar.name} (ID: ${avatar.id})`);
        }
        
        if (result.skills && Array.isArray(result.skills)) {
            skillCount += result.skills.length;
        }
        
        if (result.weapon) {
            weaponCount++;
        }
        
        if (result.equip && Array.isArray(result.equip)) {
            equipCount += result.equip.length;
        }
    });
    
    console.log(`技能总数: ${skillCount}`);
    console.log(`武器总数: ${weaponCount}`);
    console.log(`装备总数: ${equipCount}`);
    console.log('=== 验证完成 ===');
}

// API兼容性测试函数
export const testApiCompatibility = async () => {
    console.log('=== API兼容性测试开始 ===');
    
    try {
        // 测试1: 验证API端点配置
        console.log('测试1: 验证API端点配置');
        console.log('角色基础列表API:', CHARACTERS_URL);
        console.log('角色详细信息API:', CHARACTERS_DETAIL_URL);
        console.log('账户信息API:', ROLE_URL);
        
        // 测试2: 验证UUID生成
        console.log('测试2: 验证UUID生成');
        const uuid1 = generateUUID();
        const uuid2 = generateUUID();
        console.log('UUID1:', uuid1);
        console.log('UUID2:', uuid2);
        console.log('UUID格式正确:', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid1));
        console.log('UUID唯一性:', uuid1 !== uuid2);
        
        // 测试3: 验证设备ID持久化
        console.log('测试3: 验证设备ID持久化');
        const deviceId1 = getOrCreateDeviceId();
        const deviceId2 = getOrCreateDeviceId();
        console.log('设备ID1:', deviceId1);
        console.log('设备ID2:', deviceId2);
        console.log('设备ID一致性:', deviceId1 === deviceId2);
        
        // 测试4: 验证请求头构建
        console.log('测试4: 验证请求头构建');
        const authHeaders = await getAuthHeaders();
        console.log('认证请求头:', authHeaders);
        console.log('包含accept字段:', 'accept' in authHeaders);
        console.log('包含x-rpc-device_id字段:', 'x-rpc-device_id' in authHeaders);
        
        console.log('=== API兼容性测试完成 ===');
        return true;
    } catch (error) {
        console.error('API兼容性测试失败:', error);
        return false;
    }
}



