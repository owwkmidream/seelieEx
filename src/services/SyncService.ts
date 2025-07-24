import { getAccount, getDetailList } from '../hoyo';
import { addZZZCharacterFromAPI } from '../seelie';
import Role = mihoyo.Role;

// 账户信息接口
export interface AccountInfo {
    nickname: string;
    game_uid: string;
    region: string;
    timestamp: number; // 存储时间戳，用于验证数据有效性
}

// 同步状态枚举
export enum SyncStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

// 错误类型枚举
export enum SyncErrorType {
    NO_ACCOUNT = 'NO_ACCOUNT',
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTH_FAILED = 'AUTH_FAILED',
    DATA_INVALID = 'DATA_INVALID'
}

// 同步错误接口
export interface ISyncError {
    type: SyncErrorType;
    message: string;
    details?: any;
}

// 同步服务类
export class SyncService {
    private static readonly STORAGE_KEY = 'seelieex_account_info';
    private static readonly DATA_EXPIRY_HOURS = 24; // 账户信息有效期24小时

    /**
     * 获取存储的账户信息
     */
    public static getStoredAccountInfo(): AccountInfo | null {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;

            const accountInfo: AccountInfo = JSON.parse(stored);
            
            // 检查数据有效性
            if (!this.isAccountInfoValid(accountInfo)) {
                this.clearAccountInfo();
                return null;
            }

            return accountInfo;
        } catch (error) {
            console.error('读取账户信息失败:', error);
            this.clearAccountInfo();
            return null;
        }
    }

    /**
     * 设置账户信息
     */
    public static setAccountInfo(account: Role): void {
        try {
            const accountInfo: AccountInfo = {
                nickname: account.nickname,
                game_uid: account.game_uid,
                region: account.region,
                timestamp: Date.now()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accountInfo));
            console.log('账户信息已保存:', accountInfo.nickname, accountInfo.game_uid);
        } catch (error) {
            console.error('保存账户信息失败:', error);
            throw new Error('保存账户信息失败');
        }
    }

    /**
     * 清除账户信息
     */
    public static clearAccountInfo(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('账户信息已清除');
        } catch (error) {
            console.error('清除账户信息失败:', error);
        }
    }

    /**
     * 检查是否有有效的账户信息
     */
    public static hasValidAccount(): boolean {
        return this.getStoredAccountInfo() !== null;
    }

    /**
     * 获取账户列表
     */
    public static async fetchAccountList(): Promise<Role[]> {
        try {
            console.log('开始获取账户列表...');
            const roles = await getAccount();
            
            if (!roles || roles.length === 0) {
                throw new SyncError({
                    type: SyncErrorType.AUTH_FAILED,
                    message: '未获取到账户信息，请确认已登录米游社'
                });
            }

            console.log(`获取到 ${roles.length} 个账户`);
            return roles;
        } catch (error) {
            console.error('获取账户列表失败:', error);
            throw this.createSyncError(error);
        }
    }

    /**
     * 同步角色数据
     */
    public static async syncCharacterData(account?: AccountInfo): Promise<void> {
        try {
            // 如果没有提供账户信息，尝试从本地存储获取
            const targetAccount = account || this.getStoredAccountInfo();
            
            if (!targetAccount) {
                throw new SyncError({
                    type: SyncErrorType.NO_ACCOUNT,
                    message: '未找到账户信息，请先获取账户信息'
                });
            }

            console.log('开始同步角色信息:', targetAccount.nickname);
            
            const { game_uid, region } = targetAccount;
            const characterDetails = await getDetailList(game_uid, region);

            if (!characterDetails || characterDetails.length === 0) {
                throw new SyncError({
                    type: SyncErrorType.DATA_INVALID,
                    message: '未获取到角色数据'
                });
            }

            // 处理角色数据
            console.group('角色数据同步');
            console.log('返回数据:', characterDetails);
            
            console.groupCollapsed('角色信息');
            console.table(characterDetails.map(a => a.avatar));
            console.groupEnd();
            
            console.groupCollapsed('武器信息');
            console.table(characterDetails.map(a => a.weapon));
            console.groupEnd();
            
            console.groupCollapsed('角色天赋');
            characterDetails.forEach(c => {
                const name = c.avatar.name_mi18n;
                console.groupCollapsed(name);
                console.table(c.skills);
                console.groupEnd();
            });
            console.groupEnd();

            // 导入到Seelie
            characterDetails.forEach(detail => {
                addZZZCharacterFromAPI(detail);
            });

            console.groupEnd();
            console.log('米游社数据无法判断是否突破，请自行比较整数等级是否已突破');
            console.log('角色信息同步完毕');
            
        } catch (error) {
            console.error('同步角色数据失败:', error);
            throw this.createSyncError(error);
        }
    }

    /**
     * 验证账户信息有效性
     */
    private static isAccountInfoValid(accountInfo: AccountInfo): boolean {
        if (!accountInfo || !accountInfo.nickname || !accountInfo.game_uid || !accountInfo.region) {
            return false;
        }

        // 检查时间戳有效性
        if (!accountInfo.timestamp) {
            return false;
        }

        const now = Date.now();
        const expiryTime = this.DATA_EXPIRY_HOURS * 60 * 60 * 1000; // 转换为毫秒
        
        return (now - accountInfo.timestamp) < expiryTime;
    }

    /**
     * 创建统一的同步错误
     */
    private static createSyncError(error: any): SyncError {
        if (error instanceof SyncError) {
            return error;
        }

        // 根据错误信息判断错误类型
        const errorMessage = error?.message || error?.toString() || '未知错误';
        
        if (errorMessage.includes('登录') || errorMessage.includes('认证')) {
            return new SyncError({
                type: SyncErrorType.AUTH_FAILED,
                message: '认证失败，请重新登录米游社',
                details: error
            });
        }
        
        if (errorMessage.includes('网络') || errorMessage.includes('fetch')) {
            return new SyncError({
                type: SyncErrorType.NETWORK_ERROR,
                message: '网络请求失败，请检查网络连接',
                details: error
            });
        }

        return new SyncError({
            type: SyncErrorType.DATA_INVALID,
            message: errorMessage,
            details: error
        });
    }
}

// 创建SyncError类
export class SyncError extends Error {
    public type: SyncErrorType;
    public details?: any;

    constructor(error: { type: SyncErrorType; message: string; details?: any }) {
        super(error.message);
        this.type = error.type;
        this.details = error.details;
        this.name = 'SyncError';
    }
}