/**
 * 微信小游戏类型声明
 */

interface WxLoginResult {
    code: string;
    errMsg: string;
}

interface WxUserInfo {
    nickName: string;
    avatarUrl: string;
    gender: number;
    city: string;
    province: string;
    country: string;
    language: string;
}

interface WxGetUserInfoResult {
    userInfo: WxUserInfo;
    errMsg: string;
}

interface WxAuthSetting {
    'scope.userInfo'?: boolean;
    'scope.userLocation'?: boolean;
    [key: string]: boolean | undefined;
}

interface WxGetSettingResult {
    authSetting: WxAuthSetting;
}

interface WxShareAppMessageResult {
    shareTickets?: string[];
}

interface WxCloudStorageData {
    KVDataList: Array<{
        key: string;
        value: string;
    }>;
}

interface WxFriendCloudStorageData {
    openid: string;
    nickname: string;
    avatarUrl: string;
    KVDataList: Array<{
        key: string;
        value: string;
    }>;
}

interface WxGroupCloudStorageData {
    data: WxFriendCloudStorageData[];
}

interface WxModalResult {
    confirm: boolean;
    cancel: boolean;
}

interface WxUserInfoButton {
    onTap: (callback: (res: { userInfo?: WxUserInfo }) => void) => void;
    destroy: () => void;
}

interface WxLoginOption {
    success?: (res: WxLoginResult) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxGetUserInfoOption {
    success?: (res: WxGetUserInfoResult) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxGetSettingOption {
    success?: (res: WxGetSettingResult) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxShareAppMessageOption {
    title: string;
    imageUrl?: string;
    query?: string;
    success?: (res: WxShareAppMessageResult) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxSetUserCloudStorageOption {
    KVDataList: Array<{
        key: string;
        value: string;
    }>;
    success?: () => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxGetFriendCloudStorageOption {
    keyList: string[];
    success?: (res: WxGroupCloudStorageData) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxGetGroupCloudStorageOption {
    shareTicket: string;
    keyList: string[];
    success?: (res: WxGroupCloudStorageData) => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxRequestMidasPaymentOption {
    mode: string;
    env: number;
    offerId: string;
    currencyType: string;
    platform: string;
    buyQuantity: number;
    success?: () => void;
    fail?: (res: { errMsg: string }) => void;
}

interface WxShowModalOption {
    title: string;
    content: string;
    showCancel?: boolean;
    success?: (res: WxModalResult) => void;
}

interface WxCreateUserInfoButtonOption {
    type: 'text' | 'image';
    text?: string;
    image?: string;
    style: {
        left: number;
        top: number;
        width: number;
        height: number;
        lineHeight?: number;
        backgroundColor?: string;
        color?: string;
        textAlign?: string;
        fontSize?: number;
        borderRadius?: number;
    };
}

declare const wx: {
    login: (option: WxLoginOption) => void;
    getUserInfo: (option: WxGetUserInfoOption) => void;
    getSetting: (option: WxGetSettingOption) => void;
    shareAppMessage: (option: WxShareAppMessageOption) => void;
    onShareAppMessage: (callback: () => WxShareAppMessageOption) => void;
    setUserCloudStorage: (option: WxSetUserCloudStorageOption) => void;
    getFriendCloudStorage: (option: WxGetFriendCloudStorageOption) => void;
    getGroupCloudStorage: (option: WxGetGroupCloudStorageOption) => void;
    requestMidasPayment: (option: WxRequestMidasPaymentOption) => void;
    showModal: (option: WxShowModalOption) => void;
    createUserInfoButton: (option: WxCreateUserInfoButtonOption) => WxUserInfoButton;
    setStorageSync: (key: string, value: string) => void;
    getStorageSync: (key: string) => string;
    removeStorageSync: (key: string) => void;
    clearStorageSync: () => void;
};
