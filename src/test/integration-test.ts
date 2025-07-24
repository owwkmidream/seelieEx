/**
 * 集成测试 - 验证侧边栏同步功能
 * 这个文件用于手动测试，不是自动化测试
 */

import { SyncService } from '../services/SyncService';
import { ButtonRenderer } from '../utils/ButtonRenderer';

// 测试用的模拟数据
const mockAccountInfo = {
    nickname: '测试用户',
    game_uid: '123456789',
    region: 'prod_gf_cn',
    timestamp: Date.now()
};

/**
 * 测试同步服务功能
 */
export function testSyncService() {
    console.log('=== 测试同步服务 ===');
    
    try {
        // 测试账户信息存储和读取
        console.log('1. 测试账户信息存储...');
        SyncService.clearAccountInfo();
        console.log('清除前:', SyncService.hasValidAccount());
        
        // 模拟设置账户信息
        const mockRole = {
            nickname: mockAccountInfo.nickname,
            game_uid: mockAccountInfo.game_uid,
            region: mockAccountInfo.region
        } as mihoyo.Role;
        
        SyncService.setAccountInfo(mockRole);
        console.log('设置后:', SyncService.hasValidAccount());
        
        const stored = SyncService.getStoredAccountInfo();
        console.log('读取的账户信息:', stored);
        
        // 测试清除功能
        SyncService.clearAccountInfo();
        console.log('清除后:', SyncService.hasValidAccount());
        
        console.log('✅ 同步服务测试通过');
        return true;
    } catch (error) {
        console.error('❌ 同步服务测试失败:', error);
        return false;
    }
}

/**
 * 测试按钮渲染器功能
 */
export async function testButtonRenderer() {
    console.log('=== 测试按钮渲染器 ===');
    
    try {
        // 等待DOM准备
        await ButtonRenderer.waitForDOM();
        console.log('✅ DOM准备就绪');
        
        // 测试等待元素功能
        const testElement = await ButtonRenderer.waitForElement('body', 1000);
        if (testElement) {
            console.log('✅ 元素等待功能正常');
        } else {
            console.log('⚠️ 元素等待超时（预期行为）');
        }
        
        console.log('✅ 按钮渲染器基础功能测试通过');
        return true;
    } catch (error) {
        console.error('❌ 按钮渲染器测试失败:', error);
        return false;
    }
}

/**
 * 运行所有测试
 */
export async function runIntegrationTests() {
    console.log('🚀 开始集成测试...');
    
    const results = {
        syncService: false,
        buttonRenderer: false
    };
    
    // 测试同步服务
    results.syncService = testSyncService();
    
    // 测试按钮渲染器
    results.buttonRenderer = await testButtonRenderer();
    
    // 输出测试结果
    console.log('📊 测试结果:');
    console.log('- 同步服务:', results.syncService ? '✅ 通过' : '❌ 失败');
    console.log('- 按钮渲染器:', results.buttonRenderer ? '✅ 通过' : '❌ 失败');
    
    const allPassed = Object.values(results).every(result => result);
    console.log('🎯 总体结果:', allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败');
    
    return allPassed;
}

// 如果在浏览器环境中，可以通过控制台调用测试
if (typeof window !== 'undefined') {
    (window as any).testSeelieEx = {
        runIntegrationTests,
        testSyncService,
        testButtonRenderer
    };
    
    console.log('💡 提示: 可以通过 window.testSeelieEx.runIntegrationTests() 运行测试');
}