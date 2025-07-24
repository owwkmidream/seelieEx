import React, {useEffect} from 'react';
import './isolated-styles.css';
import SidebarIntegration from "./components/SidebarIntegration";
import { initDebugHelper } from './debug/debug-helper';

function App() {

    useEffect(() => {
        // 只保留反馈功能
        GM_registerMenuCommand("意见反馈", () => GM_openInTab("https://github.com/Owwkmidream/seelieEx/issues"))
        
        // 初始化调试助手
        initDebugHelper();
        
        // 添加简单的测试函数到全局
        const globalObj = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window) as any;
        globalObj.testButtonText = () => {
            const syncButton = document.getElementById('seelieex-sync-button');
            if (syncButton) {
                const iconElement = syncButton.querySelector('img');
                if (iconElement) {
                    syncButton.innerHTML = iconElement.outerHTML + ' Seelie同步';
                    console.log('✅ 同步按钮文本已更新为: Seelie同步');
                }
            }
            
            const accountButton = document.getElementById('seelieex-account-button');
            if (accountButton) {
                const iconElement = accountButton.querySelector('img');
                if (iconElement) {
                    accountButton.innerHTML = iconElement.outerHTML + ' 账户信息';
                    console.log('✅ 账户按钮文本已更新为: 账户信息');
                }
            }
        };
    })

    return (
        <div className="seelie-App">
            <SidebarIntegration />
        </div>
    );
}

export default App;
