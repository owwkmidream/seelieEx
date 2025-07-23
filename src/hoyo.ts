import Role = mihoyo.Role;
import Data = mihoyo.Data;
import Character = mihoyo.Character;
import CharacterDataEx = mihoyo.CharacterDataEx;

// 绝区零 API
const BBS_URL = 'https://webstatic.mihoyo.com/nap/event/e20240701preview/index.html'
const ROLE_URL = 'https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=nap_cn'
const CHARACTERS_URL = 'https://api-takumi.mihoyo.com/event/game_record_zzz/api/zzz/avatar/basic'
const CHARACTERS_DETAIL_URL = 'https://api-takumi.mihoyo.com/event/game_record_zzz/api/zzz/avatar/info'
import GM_fetch from "@trim21/gm-fetch";
import { charactersNum } from "./query";

// (<any>window).GM.xmlHttpRequest = GM_xmlhttpRequest;
function generateCharString(number = 16) {
    const characters = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < number; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

const headers = {
    Referer: "https://webstatic.mihoyo.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
}

const to = (promise: Promise<any>) => promise.then(data => {
    return [null, data];
}).catch(err => [err]);

// 只支持绝区零国服

const requestPageSize = 200;

export const getAccount = async () => {
    const [err, res] = await to(GM_fetch(ROLE_URL, {
        method: 'GET',
        headers: headers
    }));

    if (!err) {
        if (res.ok) {
            const resData = await res.json();
            const { retcode, data } = resData;
            if (retcode === 0) {
                const { list: accountList } = await data as Data<Role>;
                return accountList;
            }
        }
    }

    alert("请确认已登录活动页面且绑定绝区零账户!")
    GM_openInTab(BBS_URL)
    throw err ? err : new Error("账户信息获取失败");
};

const getCharacters = async (uid: string, region: string, page = 1) => {
    let fp = await getFp();
    const requestHeaders = {
        "x-rpc-device_fp": fp,
        "Referer": "https://webstatic.mihoyo.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        "Content-Type": "application/json"
    }

    const [err, res] = await to(GM_fetch(CHARACTERS_URL, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
            "uid": uid,
            "region": region,
            "lang": "zh-cn"
        })
    }));

    if (!err) {
        console.log(res)
        if (res.ok) {
            const resData = await res.json();
            const { retcode, data } = resData;
            if (retcode === 0) {
                const { list: characterList } = await data as Data<Character>;
                return characterList;
            }
        }
    }

    localStorage.removeItem("fp")
    alert("请确认已登录活动页面且绑定绝区零账户!")
    GM_openInTab(BBS_URL)
    throw err ? err : new Error("角色列表获取失败");
};

const getCharacterDetail = async (character: Character, uid: string, region: string) => {
    const { id } = character;
    const params = `?avatar_id=${id}&uid=${uid}&region=${region}&lang=zh-cn`

    const [err, res] = await to(GM_fetch(CHARACTERS_DETAIL_URL + params, {
        method: 'GET',
        headers: headers
    }));

    if (!err) {
        if (res.ok) {
            const resData = await res.json();
            const { retcode, data } = resData;
            if (retcode === 0) {
                return { character, ...data } as CharacterDataEx;
            }
        }
    } else {
        console.error(err)
    }

    // 如果获取详细信息失败，返回基础信息
    return { character, ...character } as any as CharacterDataEx
};

function getGuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }

    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

const getFp = async () => {
    let fp = localStorage.getItem("fp");
    let deviceId = localStorage.getItem("mysDeviceId");
    if (!deviceId) {
        deviceId = getGuid()
        localStorage.setItem("mysDeviceId", deviceId);
    }
    if (!fp) {
        let url = "https://public-data-api.mihoyo.com/device-fp/api/getFp";
        const [err, res] = await to(GM_fetch(url, {
            method: 'POST',
            headers: {
                ...headers,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                seed_id: generateCharString(),
                device_id: deviceId.toUpperCase(),
                platform: '1',
                seed_time: new Date().getTime() + '',
                ext_fields: `{"proxyStatus":"0","accelerometer":"-0.159515x-0.830887x-0.682495","ramCapacity":"3746","IDFV":"${deviceId.toUpperCase()}","gyroscope":"-0.191951x-0.112927x0.632637","isJailBreak":"0","model":"iPhone12,5","ramRemain":"115","chargeStatus":"1","networkType":"WIFI","vendor":"--","osVersion":"17.0.2","batteryStatus":"50","screenSize":"414×896","cpuCores":"6","appMemory":"55","romCapacity":"488153","romRemain":"157348","cpuType":"CPU_TYPE_ARM64","magnetometer":"-84.426331x-89.708435x-37.117889"}`,
                app_name: 'bbs_cn',
                device_fp: '38d7ee834d1e9'
            })
        }));
        
        if (!err) {
            console.log(res)
            if (res.ok) {
                const resData = await res.json();
                const { retcode, data } = resData;
                if (retcode === 0) {
                    console.log(data)
                    let resFp = data["device_fp"];
                    localStorage.setItem("fp", resFp);
                    return resFp;
                }
            }
        }
    } else {
        return fp;
    }
};

export const getDetailList = async (game_uid: string, region: string) => {

    let maxPageSize = Math.ceil(charactersNum / requestPageSize);
    let idxs = Array.from(new Array(maxPageSize).keys());




    const characters: Character[] = [];
    for await (let i of idxs) {
        characters.push.apply(characters, await getCharacters(game_uid, region, i + 1))
    }

    const details = characters.map(c => getCharacterDetail(c, game_uid, region));
    const detailList = [];
    for await (let d of details) {
        if (!!d) {
            detailList.push(d);
        }
    }
    return detailList;
}



