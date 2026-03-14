# 微信小游戏配置指南

## 1. 获取 AppID

在微信公众平台注册小游戏账号后，获取 AppID：

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 登录后进入「开发」->「开发管理」->「开发设置」
3. 复制 AppID

## 2. 配置 AppID

修改 `settings/v2/packages/builder.json` 文件：

```json
{
  "wechatgame": {
    "appid": "你的微信小游戏AppID",
    "orientation": "landscape",
    "deviceOrientation": "landscape"
  }
}
```

## 3. 构建项目

```bash
# 使用 Cocos Creator 构建
# 或命令行：
npm run build:wechat
```

构建完成后，输出目录为 `build/wechatgame/`

## 4. 微信开发者工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目，选择 `build/wechatgame/` 目录
3. 填写 AppID
4. 预览和调试

## 5. 常见问题

### Q: 构建后白屏？
检查 `game.json` 配置是否正确，确保 `deviceOrientation` 为 `landscape`

### Q: 资源加载失败？
确保资源已正确放入 `assets/resources/` 目录

### Q: 微信登录失败？
需要在小程序后台配置服务器域名

## 6. 发布流程

1. 在微信开发者工具中点击「上传」
2. 填写版本号和备注
3. 在微信公众平台提交审核
4. 审核通过后发布