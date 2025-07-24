/**
 * 按钮测试脚本 - 可以直接在浏览器控制台中运行
 */

// 测试按钮文本更新
function testButtonTextUpdate() {
    console.log('=== 测试按钮文本更新 ===');
    
    const syncButton = document.getElementById('seelieex-sync-button');
    const accountButton = document.getElementById('seelieex-account-button');
    
    if (syncButton) {
        console.log('同步按钮当前文本:', syncButton.textContent);
        console.log('同步按钮HTML:', syncButton.outerHTML);
        
        // 手动更新文本
        const iconElement = syncButton.querySelector('img');
        if (iconElement) {
            syncButton.innerHTML = iconElement.outerHTML + ' Seelie同步';
            console.log('✅ 同步按钮文本已更新');
        }
    } else {
        console.log('❌ 未找到同步按钮');
    }
    
    if (accountButton) {
        console.log('账户按钮当前文本:', accountButton.textContent);
        console.log('账户按钮HTML:', accountButton.outerHTML);
        
        // 手动更新文本
        const iconElement = accountButton.querySelector('img');
        if (iconElement) {
            accountButton.innerHTML = iconElement.outerHTML + ' 账户信息';
            console.log('✅ 账户按钮文本已更新');
        }
    } else {
        console.log('❌ 未找到账户按钮');
    }
}

// 检查账户信息
function checkAccountInfo() {
    const stored = localStorage.getItem('seelieex_account_info');
    console.log('=== 账户信息检查 ===');
    console.log('localStorage数据:', stored);
    
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('解析后的数据:', parsed);
            console.log('是否过期:', (Date.now() - parsed.timestamp) > (24 * 60 * 60 * 1000));
        } catch (e) {
            console.log('数据解析失败:', e);
        }
    } else {
        console.log('没有存储的账户信息');
    }
}

// 暴露到全局
if (typeof window !== 'undefined') {
    window.testButtonTextUpdate = testButtonTextUpdate;
    window.checkAccountInfo = checkAccountInfo;
    
    console.log('🔧 按钮测试工具已加载');
    console.log('可用命令:');
    console.log('- testButtonTextUpdate() - 测试按钮文本更新');
    console.log('- checkAccountInfo() - 检查账户信息');
}