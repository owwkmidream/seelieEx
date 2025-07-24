import React, { useEffect, useState, useCallback } from 'react';
import { SyncService, AccountInfo, SyncStatus, SyncError, SyncErrorType } from '../services/SyncService';
import { ButtonRenderer } from '../utils/ButtonRenderer';
import Role = mihoyo.Role;

// 组件状态接口
interface SidebarState {
    accountInfo: AccountInfo | null;
    syncStatus: SyncStatus;
    error: SyncError | null;
    accountList: Role[];
    currentAccount: Role | null;
}

/**
 * 侧边栏集成组件
 * 负责管理同步按钮和账户信息按钮的状态和交互
 */
const SidebarIntegration: React.FC = () => {
    const [state, setState] = useState<SidebarState>({
        accountInfo: null,
        syncStatus: SyncStatus.IDLE,
        error: null,
        accountList: [],
        currentAccount: null
    });

    const [buttonRenderer] = useState(() => new ButtonRenderer());

    /**
     * 初始化组件
     */
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                // 等待DOM准备就绪
                await ButtonRenderer.waitForDOM();
                
                // 等待目标元素出现
                const settingsButton = await ButtonRenderer.waitForElement('a[href="/settings"]');
                if (!settingsButton) {
                    console.warn('未找到设置按钮，无法注入同步功能');
                    return;
                }

                // 初始化按钮渲染器
                await buttonRenderer.initialize();

                // 加载本地账户信息
                const storedAccount = SyncService.getStoredAccountInfo();
                setState(prev => ({
                    ...prev,
                    accountInfo: storedAccount
                }));

                // 创建并插入按钮
                await createAndInsertButtons();

                console.log('侧边栏集成组件初始化完成');
            } catch (error) {
                console.error('初始化侧边栏集成组件失败:', error);
                setState(prev => ({
                    ...prev,
                    error: new SyncError({
                        type: SyncErrorType.DATA_INVALID,
                        message: '初始化失败: ' + (error as Error).message
                    })
                }));
            }
        };

        initializeComponent();

        // 设置定时检查账户信息状态
        const checkAccountInterval = setInterval(() => {
            const latestAccountInfo = SyncService.getStoredAccountInfo();
            setState(prev => {
                if (JSON.stringify(latestAccountInfo) !== JSON.stringify(prev.accountInfo)) {
                    console.log('检测到账户信息变化，更新状态');
                    return {
                        ...prev,
                        accountInfo: latestAccountInfo
                    };
                }
                return prev;
            });
        }, 1000); // 每秒检查一次

        // 清理函数
        return () => {
            buttonRenderer.removeButtons();
            clearInterval(checkAccountInterval);
        };
    }, []);

    /**
     * 创建并插入按钮
     */
    const createAndInsertButtons = useCallback(async () => {
        try {
            // 检查按钮是否已存在
            if (buttonRenderer.buttonsExist()) {
                console.log('按钮已存在，跳过创建');
                return;
            }

            // 创建同步按钮
            const syncButton = buttonRenderer.createSyncButton(handleSyncClick);
            
            // 创建账户信息按钮
            const accountButton = buttonRenderer.createAccountButton(state.accountInfo, handleAccountClick);

            // 插入到侧边栏
            buttonRenderer.insertButtonsToSidebar();

            console.log('按钮创建并插入完成');
        } catch (error) {
            console.error('创建按钮失败:', error);
            throw error;
        }
    }, []);

    /**
     * 处理同步按钮点击
     */
    const handleSyncClick = useCallback(async () => {
        try {
            // 重新获取最新的账户信息
            const currentAccountInfo = SyncService.getStoredAccountInfo();
            console.log('当前账户信息:', currentAccountInfo);
            
            if (!currentAccountInfo) {
                alert('请先获取账户信息');
                return;
            }

            setState(prev => ({
                ...prev,
                syncStatus: SyncStatus.LOADING,
                error: null
            }));

            // 更新按钮状态
            buttonRenderer.updateSyncButtonState(false, true, '同步中...');

            // 执行同步
            await SyncService.syncCharacterData(currentAccountInfo);

            setState(prev => ({
                ...prev,
                syncStatus: SyncStatus.SUCCESS
            }));

            // 显示成功消息
            alert('角色信息同步完毕');
            
            // 刷新页面以显示更新的数据
            location.reload();

        } catch (error) {
            console.error('同步失败:', error);
            
            const syncError = error as SyncError;
            setState(prev => ({
                ...prev,
                syncStatus: SyncStatus.ERROR,
                error: syncError
            }));

            // 显示错误消息
            alert(`同步失败: ${syncError.message}`);
        } finally {
            // 恢复按钮状态
            buttonRenderer.updateSyncButtonState(true, false, 'Seelie同步');
        }
    }, [buttonRenderer]);

    /**
     * 处理账户信息按钮点击
     */
    const handleAccountClick = useCallback(async () => {
        try {
            setState(prev => ({
                ...prev,
                syncStatus: SyncStatus.LOADING,
                error: null
            }));

            // 获取账户列表
            const roles = await SyncService.fetchAccountList();
            
            setState(prev => ({
                ...prev,
                accountList: roles,
                currentAccount: roles.length > 0 ? roles[0] : null,
                syncStatus: SyncStatus.SUCCESS
            }));

            // 如果只有一个账户，直接保存
            if (roles.length === 1) {
                const selectedAccount = roles[0];
                SyncService.setAccountInfo(selectedAccount);
                
                const accountInfo = SyncService.getStoredAccountInfo();
                setState(prev => ({
                    ...prev,
                    accountInfo: accountInfo,
                    currentAccount: selectedAccount
                }));

                alert(`账户信息已保存: ${selectedAccount.nickname}(${selectedAccount.game_uid})`);
            } else if (roles.length > 1) {
                // 多个账户时显示选择对话框
                showAccountSelectionDialog(roles);
            }

        } catch (error) {
            console.error('获取账户信息失败:', error);
            
            const syncError = error as SyncError;
            setState(prev => ({
                ...prev,
                syncStatus: SyncStatus.ERROR,
                error: syncError
            }));

            alert(`获取账户信息失败: ${syncError.message}`);
        }
    }, [buttonRenderer]);

    /**
     * 显示账户选择对话框
     */
    const showAccountSelectionDialog = useCallback((roles: Role[]) => {
        const options = roles.map((role, index) => 
            `${index + 1}. ${role.nickname}(${role.game_uid})`
        ).join('\\n');

        const selection = prompt(
            `检测到多个账户，请选择要使用的账户:\\n${options}\\n\\n请输入序号 (1-${roles.length}):`
        );

        if (selection) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < roles.length) {
                const selectedAccount = roles[index];
                SyncService.setAccountInfo(selectedAccount);
                
                const accountInfo = SyncService.getStoredAccountInfo();
                setState(prev => ({
                    ...prev,
                    accountInfo: accountInfo,
                    currentAccount: selectedAccount
                }));

                alert(`账户信息已保存: ${selectedAccount.nickname}(${selectedAccount.game_uid})`);
            } else {
                alert('无效的选择');
            }
        }
    }, [buttonRenderer]);

    /**
     * 更新按钮状态
     */
    useEffect(() => {
        // 重新获取最新的账户信息
        const latestAccountInfo = SyncService.getStoredAccountInfo();
        
        // 如果本地存储的账户信息与组件状态不一致，更新组件状态
        if (JSON.stringify(latestAccountInfo) !== JSON.stringify(state.accountInfo)) {
            setState(prev => ({
                ...prev,
                accountInfo: latestAccountInfo
            }));
        }
        
        // 更新账户按钮状态
        buttonRenderer.updateAccountButtonState(latestAccountInfo);
        
        // 更新同步按钮状态
        const hasAccount = latestAccountInfo !== null;
        const isLoading = state.syncStatus === SyncStatus.LOADING;
        buttonRenderer.updateSyncButtonState(hasAccount && !isLoading, isLoading, hasAccount ? 'Seelie同步' : 'Seelie同步');
    }, [state.accountInfo, state.syncStatus, buttonRenderer]);

    // 这个组件不渲染任何可见内容，只负责管理DOM注入的按钮
    return null;
};

export default SidebarIntegration;