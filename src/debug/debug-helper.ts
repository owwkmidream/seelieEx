/**
 * 调试助手 - 用于在浏览器控制台中调试功能
 */

import { SyncService } from '../services/SyncService';

// 将调试函数暴露到全局对象
declare global {
    interface Window {
        SeelieExDebug: {
            checkAccountInfo: () => void;
            clearAccountInfo: () => void;
            testSyncService: () => void;
            checkButtons: () => void;
            forceRefreshButtons: () => void;
        };
    }
}

export function initDebugHelper() {
    if (typeof window !== 'undefined') {
        // 使用unsafeWindow来确保在油猴脚本中能正确访问
        const globalObj = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window) as any;
        
        globalObj.SeelieExDebug = {
            /**
             * 检查当前账户信息
             */
            checkAccountInfo: () => {
                const accountInfo = SyncService.getStoredAccountInfo();
                console.log('=== 账户信息检查 ===');
                console.log('存储的账户信息:', accountInfo);
                console.log('是否有有效账户:', SyncService.hasValidAccount());
                console.log('localStorage 原始数据:', localStorage.getItem('seelieex_account_info'));
            },

            /**
             * 清除账户信息
             */
            clearAccountInfo: () => {
                SyncService.clearAccountInfo();
                console.log('账户信息已清除');
                location.reload();
            },

            /**
             * 测试同步服务
             */
            testSyncService: async () => {
                try {
                    console.log('=== 测试同步服务 ===');
                    const accountInfo = SyncService.getStoredAccountInfo();
                    if (!accountInfo) {
                        console.log('❌ 没有账户信息');
                        return;
                    }
                    
                    console.log('✅ 账户信息存在:', accountInfo);
                    console.log('开始测试同步...');
                    
                    await SyncService.syncCharacterData(accountInfo);
                    console.log('✅ 同步测试完成');
                } catch (error) {
                    console.error('❌ 同步测试失败:', error);
                }
            },

            /**
             * 检查按钮状态
             */
            checkButtons: () => {
                console.log('=== 按钮状态检查 ===');
                const syncButton = document.getElementById('seelieex-sync-button');
                const accountButton = document.getElementById('seelieex-account-button');
                
                console.log('同步按钮:', syncButton ? '✅ 存在' : '❌ 不存在');
                console.log('账户按钮:', accountButton ? '✅ 存在' : '❌ 不存在');
                
                if (syncButton) {
                    console.log('同步按钮文本:', syncButton.textContent);
                }
                if (accountButton) {
                    console.log('账户按钮文本:', accountButton.textContent);
                }
            },

            /**
             * 强制刷新按钮状态
             */
            forceRefreshButtons: () => {
                console.log('强制刷新按钮状态...');
                location.reload();
            }
        };

        console.log('🔧 SeelieEx 调试工具已加载');
        console.log('可用命令:');
        console.log('- window.SeelieExDebug.checkAccountInfo() - 检查账户信息');
        console.log('- window.SeelieExDebug.clearAccountInfo() - 清除账户信息');
        console.log('- window.SeelieExDebug.testSyncService() - 测试同步服务');
        console.log('- window.SeelieExDebug.checkButtons() - 检查按钮状态');
        console.log('- window.SeelieExDebug.forceRefreshButtons() - 强制刷新按钮');
    }
}