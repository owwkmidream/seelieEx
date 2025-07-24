import React, {useState} from "react";
import CharacterGoalTab from "./tabs/CharacterGoalTab";
import TalentGoalTab from "./tabs/TalentGoalTab";
import {addZZZCharacterFromAPI, batchUpdateCharacter, batchUpdateWeapon} from "../seelie";
import {getAccount, getDetailList} from "../hoyo";
import {Disclosure, Tab} from "@headlessui/react";
import {ChevronUpIcon} from '@heroicons/react/solid'
import ToggleSwitch from "./switch/ToggleSwitch";
import ListboxSelect from "./select/ListboxSelect";
import Role = mihoyo.Role;


function ExDialog() {

    // const [gameBizSwitchEnabled, setGameBizSwitchEnabled] = useState(() => isGlobal())
    //
    // const onChangeGameBiz = (e: boolean) => {
    //     setGameBizSwitchEnabled(e)
    //     let gameBizNew = (!e) ? 'hk4e_cn' : 'hk4e_global';
    //     console.log(gameBizNew)
    //     localStorage.setItem("gameBiz", gameBizNew)
    // };

    const [accountList, setAccountList] = useState<Role[]>([]);

    const [currentAccount, setCurrentAccount] = useState<Role>();

    const handleRoleSelectChange = (idx: number) => {
        setCurrentAccount(accountList[idx])
    }

    const accountShow = (idx: number) => {
        if (!accountList || !(accountList[idx])) {
            return '';
        }
        const role = accountList[idx];
        return `${role.nickname}(${role.game_uid})`
    }

    const getAccountList = () => {
        getAccount().then(
            res => {
                const roles: mihoyo.Role[] = res || [];
                setAccountList(roles)
                roles.length > 0 && setCurrentAccount(roles[0])
            }
        ).catch(
            err => {
                console.error(err)
                console.error("账户信息获取失败")
                alert("账户信息获取失败")
            }
        )
    };

    const syncCharacterInfo = () => {
        if (!currentAccount) {
            console.error("账户信息获取失败")
            alert("账户信息获取失败")
            return
        }
        console.log("开始同步角色信息")
        const {game_uid, region} = currentAccount;
        getDetailList(game_uid, region).then(
            res => {
                console.group('返回数据');
                console.log(res);
                console.groupCollapsed('角色');
                console.table(res.map(a => a.avatar))
                console.groupEnd();
                console.groupCollapsed('武器');
                console.table(res.map(a => a.weapon))
                console.groupEnd();
                console.groupCollapsed('角色天赋');
                res.forEach(
                    c => {
                        const name = c.avatar.name_mi18n;
                        console.groupCollapsed(name);
                        console.table(c.skills)
                        console.groupEnd();
                    }
                )
                console.groupEnd();
                console.groupEnd();
                res.forEach(
                    v => {
                        // 绝区零数据结构，直接使用新的处理函数
                        addZZZCharacterFromAPI(v)
                    }
                )
                console.log(`米游社数据无法判断是否突破,请自行比较整数等级是否已突破`)
                console.log(`角色信息同步完毕`)
                alert("角色信息同步完毕")
                location.reload();
            }
        )
    }

    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div className="seelie-fixed seelie-top-10 seelie-inset-x-[20%] seelie-mx-auto seelie-min-w-[50%] seelie-min-h-min seelie-rounded-md seelie-bg-slate-700 seelie-opacity-75 seelie-text-white seelie-text-center seelie-z-[1200]">
            <h1 className="seelie-text-3xl seelie-font-bold seelie-underline seelie-pt-4">
                SeelieEX
            </h1>
            <h2 className="seelie-text-xl seelie-font-bold seelie-underline seelie-pt-4">
                绝区零规划助手扩展
            </h2>
            <div className="seelie-w-full seelie-p-4">
                <div className="seelie-w-full seelie-max-w-md seelie-p-2 seelie-mx-auto seelie-bg-purple seelie-rounded-2xl">
                    <Disclosure>
                        {({open}) => (
                            <>
                                <Disclosure.Button
                                    className="seelie-flex seelie-justify-between seelie-w-full seelie-px-4 seelie-py-2 seelie-text-sm seelie-font-medium seelie-text-left seelie-text-slate-900 seelie-bg-purple-100 seelie-rounded-lg hover:seelie-bg-purple-200 focus:seelie-outline-none focus-visible:seelie-ring focus-visible:seelie-ring-purple-500 focus-visible:seelie-ring-opacity-75">
                                    <span>角色信息同步</span>
                                    <ChevronUpIcon
                                        className={`${
                                            open ? 'seelie-transform seelie-rotate-180' : ''
                                        } seelie-w-5 seelie-h-5 seelie-text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="seelie-px-4 seelie-pt-4 seelie-pb-2 seelie-text-sm seelie-text-white-500">
                                    {/*<div className="flex pt-4">*/}
                                    {/*    <div className="w-1/2 text-white-900">*/}
                                    {/*        区服选择:*/}
                                    {/*    </div>*/}
                                    {/*    <ToggleSwitch*/}
                                    {/*        className='w-1/2'*/}
                                    {/*        checked={gameBizSwitchEnabled}*/}
                                    {/*        onChange={onChangeGameBiz}*/}
                                    {/*        labelLeft={'国服'}*/}
                                    {/*        labelRight={'国际服'}*/}
                                    {/*    />*/}
                                    {/*</div>*/}
                                    <div className="seelie-flex seelie-pt-2">
                                        <div className="seelie-w-full">
                                            <button className="seelie-text-white seelie-bg-blue-500 seelie-px-4 seelie-py-2 seelie-rounded hover:seelie-bg-blue-600"
                                                    onClick={getAccountList}>获取账户信息
                                            </button>
                                        </div>
                                    </div>
                                    <div className="seelie-flex seelie-pt-4">
                                        <div className="seelie-w-1/2 seelie-text-white-900">
                                            账户选择:
                                        </div>
                                        <div className="seelie-w-1/2">
                                            <ListboxSelect
                                                selected={currentAccount ? accountList.indexOf(currentAccount) : 0}
                                                setSelected={handleRoleSelectChange}
                                                optionList={accountList.map((_, idx) => idx)}
                                                show={accountShow}
                                            />
                                        </div>
                                    </div>
                                    <div className="seelie-flex seelie-pt-2">
                                        <div className="seelie-w-full">
                                            <button className="seelie-text-white seelie-bg-blue-500 seelie-px-4 seelie-py-2 seelie-rounded hover:seelie-bg-blue-600"
                                                    onClick={syncCharacterInfo}>同步mihoyo角色信息
                                            </button>
                                        </div>
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                    <Disclosure as="div" className="seelie-mt-2">
                        {({open}) => (
                            <>
                                <Disclosure.Button
                                    className="seelie-flex seelie-justify-between seelie-w-full seelie-px-4 seelie-py-2 seelie-text-sm seelie-font-medium seelie-text-left seelie-text-slate-900 seelie-bg-purple-100 seelie-rounded-lg hover:seelie-bg-purple-200 focus:seelie-outline-none focus-visible:seelie-ring focus-visible:seelie-ring-purple-500 focus-visible:seelie-ring-opacity-75">
                                    <span>规划批量操作</span>
                                    <ChevronUpIcon
                                        className={`${
                                            open ? 'seelie-transform seelie-rotate-180' : ''
                                        } seelie-w-5 seelie-h-5 seelie-text-purple-500`}
                                    />
                                </Disclosure.Button>
                                <Disclosure.Panel className="seelie-px-4 seelie-pt-4 seelie-pb-2 seelie-text-sm seelie-text-white-500">
                                    <Tab.Group>
                                        <Tab.List className="seelie-flex seelie-p-1 seelie-space-x-1 seelie-bg-blue-900/20 seelie-rounded-xl">
                                            {['角色目标等级', '天赋目标等级', '武器目标等级'].map((category) => (
                                                <Tab
                                                    key={category}
                                                    className={({selected}) =>
                                                        classNames(
                                                            'seelie-w-full seelie-py-2.5 seelie-text-sm seelie-leading-5 seelie-font-medium seelie-text-blue-700 seelie-rounded-lg',
                                                            'focus:seelie-outline-none focus:seelie-ring-2 seelie-ring-offset-2 seelie-ring-offset-blue-400 seelie-ring-white seelie-ring-opacity-60',
                                                            selected
                                                                ? 'seelie-bg-white seelie-shadow'
                                                                : 'seelie-text-blue-100 hover:seelie-bg-white/[0.12] hover:seelie-text-white'
                                                        )
                                                    }
                                                >
                                                    {category}
                                                </Tab>
                                            ))}
                                        </Tab.List>
                                        <Tab.Panels>
                                            <Tab.Panel><CharacterGoalTab showText={'角色'} batchUpdateCharacter={batchUpdateCharacter}/></Tab.Panel>
                                            <Tab.Panel><TalentGoalTab/></Tab.Panel>
                                            <Tab.Panel><CharacterGoalTab showText={'武器'} batchUpdateCharacter={batchUpdateWeapon}/></Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>
            </div>
        </div>
    );
}

export default ExDialog;
