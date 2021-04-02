# 添加头像框微信小程序

## 功能
- 选择当前头像或本地图片进行合成
- 自动支持任意数量的头像框模版
- 支持对头像原图进行缩放操作

## 自定义
- 修改小程序项目信息
- 将 `index.js` 中 `const urls` 中内容改为相框图片的 url
- 将 `index.wxml` 中 `headImage` 的 `src` 改为头图的网址
- 将 `index.wxml` 中 `contentContainer` 的 `background-image` 中 url 改为长背景图的 url
- （可选）修改 `index.js` 中定义的常量，并同步修改其他文件中的值

## 参考
[Yonghui-Lee
/
profile_photo_editor_weChatApplet](https://github.com/Yonghui-Lee/profile_photo_editor_weChatApplet)