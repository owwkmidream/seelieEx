import { AccountInfo } from '../services/SyncService';

// 按钮状态接口
export interface ButtonState {
    syncButton: {
        enabled: boolean;
        loading: boolean;
        text: string;
    };
    accountButton: {
        hasAccount: boolean;
        accountInfo: AccountInfo | null;
        displayText: string;
        iconSrc: string;
    };
}

// DOM注入错误类型
export enum DOMInjectionError {
    TARGET_NOT_FOUND = 'TARGET_NOT_FOUND',
    BUTTON_CREATION_FAILED = 'BUTTON_CREATION_FAILED',
    STYLE_APPLICATION_FAILED = 'STYLE_APPLICATION_FAILED'
}

/**
 * 按钮渲染器 - 负责在网页中创建和管理按钮
 */
export class ButtonRenderer {
    private static readonly SETTINGS_SELECTOR = 'a[href="/settings"]';
    private static readonly SYNC_BUTTON_ID = 'seelieex-sync-button';
    private static readonly ACCOUNT_BUTTON_ID = 'seelieex-account-button';

    private syncButton: HTMLElement | null = null;
    private accountButton: HTMLElement | null = null;
    private targetContainer: HTMLElement | null = null;

    /**
     * 初始化按钮渲染器
     */
    public async initialize(): Promise<void> {
        try {
            // 查找目标容器
            this.targetContainer = this.findTargetContainer();
            if (!this.targetContainer) {
                throw new Error(`${DOMInjectionError.TARGET_NOT_FOUND}: 未找到设置按钮容器`);
            }

            console.log('找到目标容器，准备注入按钮');
        } catch (error) {
            console.error('初始化按钮渲染器失败:', error);
            throw error;
        }
    }

    /**
     * 创建同步按钮
     */
    public createSyncButton(onClick: () => void): HTMLElement {
        try {
            // 获取设置按钮作为样式模板
            const settingsButton = this.findSettingsButton();
            if (!settingsButton) {
                throw new Error('未找到设置按钮作为样式模板');
            }

            // 创建同步按钮
            const syncButton = this.cloneButtonStructure(settingsButton);
            syncButton.id = ButtonRenderer.SYNC_BUTTON_ID;

            // 设置按钮内容
            this.updateButtonContent(syncButton, {
                iconSrc: '/img/general/options.png', // 使用现有的设置图标
                text: 'Seelie同步',
                href: '#'
            });

            // 绑定点击事件
            syncButton.addEventListener('click', (e) => {
                e.preventDefault();
                onClick();
            });

            this.syncButton = syncButton;
            return syncButton;
        } catch (error) {
            console.error('创建同步按钮失败:', error);
            throw new Error(`${DOMInjectionError.BUTTON_CREATION_FAILED}: ${error}`);
        }
    }

    /**
     * 创建账户信息按钮
     */
    public createAccountButton(accountInfo: AccountInfo | null, onClick: () => void): HTMLElement {
        try {
            // 获取设置按钮作为样式模板
            const settingsButton = this.findSettingsButton();
            if (!settingsButton) {
                throw new Error('未找到设置按钮作为样式模板');
            }

            // 创建账户按钮
            const accountButton = this.cloneButtonStructure(settingsButton);
            accountButton.id = ButtonRenderer.ACCOUNT_BUTTON_ID;

            // 设置按钮内容
            this.updateAccountButtonContent(accountButton, accountInfo);

            // 绑定点击事件
            accountButton.addEventListener('click', (e) => {
                e.preventDefault();
                onClick();
            });

            this.accountButton = accountButton;
            return accountButton;
        } catch (error) {
            console.error('创建账户按钮失败:', error);
            throw new Error(`${DOMInjectionError.BUTTON_CREATION_FAILED}: ${error}`);
        }
    }

    /**
     * 更新同步按钮状态
     */
    public updateSyncButtonState(enabled: boolean, loading: boolean, text?: string): void {
        if (!this.syncButton) return;

        try {
            // 更新按钮可用状态
            if (enabled) {
                this.syncButton.classList.remove('opacity-50', 'cursor-not-allowed');
                this.syncButton.classList.add('hover:bg-gray-800');
            } else {
                this.syncButton.classList.add('opacity-50', 'cursor-not-allowed');
                this.syncButton.classList.remove('hover:bg-gray-800');
            }

            // 更新加载状态
            const textElement = this.syncButton.querySelector('span');
            if (textElement && text) {
                textElement.textContent = loading ? '同步中...' : text;
            }

            // 更新图标（如果需要显示加载动画）- 查找 svg 而不是 img
            const iconElement = this.syncButton.querySelector('svg') as SVGElement;
            if (iconElement && loading) {
                iconElement.style.animation = 'spin 1s linear infinite';
            } else if (iconElement) {
                iconElement.style.animation = '';
            }
        } catch (error) {
            console.error('更新同步按钮状态失败:', error);
        }
    }

    /**
     * 更新账户按钮状态
     */
    public updateAccountButtonState(accountInfo: AccountInfo | null): void {
        if (!this.accountButton) return;

        try {
            this.updateAccountButtonContent(this.accountButton, accountInfo);
        } catch (error) {
            console.error('更新账户按钮状态失败:', error);
        }
    }

    /**
     * 将按钮插入到侧边栏
     */
    public insertButtonsToSidebar(): void {
        try {
            if (!this.targetContainer) {
                throw new Error('目标容器未初始化');
            }
            // 插入账户按钮（在同步按钮下方）
            if (this.accountButton) {
                // const insertTarget = this.syncButton || this.targetContainer;
                // insertTarget.insertAdjacentElement('afterend', this.accountButton);
                this.targetContainer.appendChild(this.accountButton);
                console.log('账户按钮已插入到侧边栏');
            }
            // 插入同步按钮
            if (this.syncButton) {
                // this.targetContainer.insertAdjacentElement('afterend', this.syncButton);
                this.targetContainer.appendChild(this.syncButton);
                console.log('同步按钮已插入到侧边栏');
            }


        } catch (error) {
            console.error('插入按钮到侧边栏失败:', error);
            throw new Error(`${DOMInjectionError.STYLE_APPLICATION_FAILED}: ${error}`);
        }
    }

    /**
     * 移除所有按钮
     */
    public removeButtons(): void {
        try {
            if (this.syncButton) {
                this.syncButton.remove();
                this.syncButton = null;
            }

            if (this.accountButton) {
                this.accountButton.remove();
                this.accountButton = null;
            }

            console.log('所有按钮已移除');
        } catch (error) {
            console.error('移除按钮失败:', error);
        }
    }

    /**
     * 查找目标容器（设置按钮的父容器）
     */
    private findTargetContainer(): HTMLElement | null {
        const settingsButton = this.findSettingsButton();
        return settingsButton?.parentElement || null;
    }

    /**
     * 查找设置按钮
     */
    private findSettingsButton(): HTMLElement | null {
        return document.querySelector(ButtonRenderer.SETTINGS_SELECTOR) as HTMLElement;
    }

    /**
     * 克隆按钮结构
     */
    private cloneButtonStructure(templateButton: HTMLElement): HTMLElement {
        const clonedButton = templateButton.cloneNode(true) as HTMLElement;
        // 清除原有的href和其他属性
        clonedButton.removeAttribute('href');
        clonedButton.removeAttribute('id');
        clonedButton.removeAttribute('aria-current'); // 移除aria-current属性
        // 移除表示“选中状态”的CSS类
        clonedButton.classList.remove('!bg-gray-900');
        clonedButton.classList.remove('text-white');
        clonedButton.classList.remove('router-link-exact-active');
        // --- 替换 img 标签为 svg 标签并保持大小 ---
        const imgElement = clonedButton.querySelector('img'); // 查找 img 标签
        if (imgElement) { // 确保 img 标签存在
            // 收集原始 img 元素的所有 class
            const originalClasses = Array.from(imgElement.classList);
            
            const svgString = '<svg viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="currentColor" d="M13 17.5c0 .89.18 1.73.5 2.5h-7c-1.5 0-2.81-.5-3.89-1.57C1.54 17.38 1 16.09 1 14.58q0-1.95 1.17-3.48C3.34 9.57 4 9.43 5.25 9.15c.42-1.53 1.25-2.77 1.5-3.72S10.42 4 12 4c1.95 0 3.6.68 4.96 2.04S19 9.05 19 11h.1c-3.4.23-6.1 3.05-6.1 6.5m6-4V12l-2.25 2.25L19 16.5V15a2.5 2.5 0 0 1 2.5 2.5c0 .4-.09.78-.26 1.12l1.09 1.09c.42-.63.67-1.39.67-2.21c0-2.21-1.79-4-4-4m0 6.5a2.5 2.5 0 0 1-2.5-2.5c0-.4.09-.78.26-1.12l-1.09-1.09c-.42.63-.67 1.39-.67 2.21c0 2.21 1.79 4 4 4V23l2.25-2.25L19 18.5z"></path></svg>';

            // 创建一个临时的 div 来解析 SVG 字符串
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString;
            const svgElement = tempDiv.firstElementChild as SVGElement; // 获取解析后的 SVG 元素

            // 将原始 img 的所有 class 应用到 svg 元素
            originalClasses.forEach(className => {
                svgElement.classList.add(className);
            });
            svgElement.classList.add('flex-shrink-0');

            // 替换 img 标签
            imgElement.replaceWith(svgElement);
        }

        return clonedButton;
    }


    /**
     * 更新按钮内容
     */
    private updateButtonContent(button: HTMLElement, content: { iconSrc: string; text: string; href: string }): void {
        // 更新图标 - 查找 svg 而不是 img
        const iconElement = button.querySelector('svg') as SVGElement;

        // 更新文本 - 直接替换按钮的文本内容
        const textNodes = Array.from(button.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => {
            if (node.textContent?.trim() === '设置') {
                node.textContent = ' ' + content.text;
            }
        });

        // 如果没有找到文本节点，直接设置innerHTML
        if (textNodes.length === 0 || !textNodes.some(node => node.textContent?.includes(content.text))) {
            // 保留图标，更新文本
            const iconHTML = iconElement ? iconElement.outerHTML : '';
            button.innerHTML = iconHTML + ' ' + content.text;
        }

        // 设置href
        if (button.tagName.toLowerCase() === 'a') {
            (button as HTMLAnchorElement).href = content.href;
        }
    }

    /**
     * 更新账户按钮内容
     */
    private updateAccountButtonContent(button: HTMLElement, accountInfo: AccountInfo | null): void {
        const hasAccount = accountInfo !== null;

        // 确定显示内容
        const displayText = hasAccount
            ? `${accountInfo!.nickname}(${accountInfo!.game_uid})`
            : '账户信息';

        const iconSrc = hasAccount
            ? '/img/general/options.png'  // 使用现有图标
            : '/img/general/options.png'; // 使用现有图标

        // 更新按钮内容
        this.updateButtonContent(button, {
            iconSrc,
            text: displayText,
            href: '#'
        });

        // 更新样式状态
        if (hasAccount) {
            button.classList.add('text-green-300');
            button.classList.remove('text-gray-300');
        } else {
            button.classList.add('text-gray-300');
            button.classList.remove('text-green-300');
        }
    }

    /**
     * 检查按钮是否已存在
     */
    public buttonsExist(): boolean {
        return document.getElementById(ButtonRenderer.SYNC_BUTTON_ID) !== null ||
            document.getElementById(ButtonRenderer.ACCOUNT_BUTTON_ID) !== null;
    }

    /**
     * 等待DOM准备就绪
     */
    public static async waitForDOM(): Promise<void> {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => resolve());
            } else {
                resolve();
            }
        });
    }

    /**
     * 等待目标元素出现
     */
    public static async waitForElement(selector: string, timeout: number = 5000): Promise<HTMLElement | null> {
        return new Promise((resolve) => {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector) as HTMLElement;
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // 超时处理
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }
}