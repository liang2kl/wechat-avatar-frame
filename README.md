# 添加头像框微信小程序

## 功能
- 选择当前头像或本地图片进行合成
- 自动支持任意数量的头像框模版
- 支持对头像原图进行缩放操作

## 使用
- 修改小程序项目信息
- 将 `index.js` 中 `const urls` 中内容改为相框图片的 url
- 将 `index.wxml` 中 `headImage` 的 `src` 改为头图的网址
- 将 `index.wxml` 中 `container` 的 `background-image` 中 url 改为长背景图的 url
- 在微信公共平台的 `开发管理-开发设置-服务器域名` 处添加两个 `downloadFile` 域名：

    1. 微信官方头像域名：`https://thirdwx.qlogo.cn`
    2. 相框图片等资源的域名，如：`https://cloud.tsinghua.edu.cn`

## 参考
[Yonghui-Lee
/
profile_photo_editor_weChatApplet](https://github.com/Yonghui-Lee/profile_photo_editor_weChatApplet)
