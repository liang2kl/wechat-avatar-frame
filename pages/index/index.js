//index.js

// 生成头像的宽度，请与 index.wxml 保持一致
const avatarWidth = 640.0;
// 页边距百分比，左右总和，请与 index.wxss 保持一致
const reservedPaddingProportion = 0.1;
// 除去保留的页边距外剩余可用空间，单位为rpx
const availableSpace = 750.0 * (1 - reservedPaddingProportion);
// 头像原图宽度，单位为rpx
const oriImgWidth = availableSpace;
// 裁剪框左右单侧溢出空间，单位为rpx，请与 index.wxss 保持一致
const gridOverflowX = 506.0;
// 裁剪框上下单侧溢出空间，单位为rpx，请与 index.wxss 保持一致
const gridOverflowY = 506.0;
// 预览框宽度，单位为rpx，请与 index.wxss 保持一致
const previewWidth = 300.0;

// 头像框资源网址
const urls = [
  'https://cloud.tsinghua.edu.cn/f/7fe904f7d9e74f0fb4ac/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/a9bdb6515aca4e43b309/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/8ebacd7d8fc84a7db88e/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/2acf612ce3df437d900c/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/7ecf956e0f37495fb5b9/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/e08ab91ea3264bd0a637/?dl=1',
];

Page({
  data: {
    imgUrl: Array(urls.length), // 初始化与相框数目相同的url，作为placeholder
    backgroundImgSrc: "", // 头像原图url
    tplImgSrc: '', // 相框url
    isShowChooseImg: false,
    isShowCanvas: false,
    gridWidth: oriImgWidth, // 头像缩放框的宽度
    scrollableHeight: oriImgWidth, // movable-area的高度，初始化为宽度
    imgAspectRatio: 1, // 头像原图高宽比
    imgScale: 1, // 头像缩放倍率
    imgOffsetX: 0, // 预览界面头像的X方向偏移，单位为px
    imgOffsetY: 0, // 预览界面头像的Y方向偏移，单位为px
    windowWidth: "", // 窗口宽度
    movableViewX: gridOverflowX + "rpx", // 控制movable-view的x
    movableViewY: gridOverflowY + "rpx", // 控制movable-view的x
  },

  onShareAppMessage: function () {

  },

  onShareTimeline: function() {

  },

  onLoad: function () {
    // 获取窗口宽度
    const width = wx.getSystemInfoSync().windowWidth;
    this.setData({
      windowWidth: width
    });

    // 从网络获取头像框
    for (let index = 0; index < urls.length; index++) {
      var that = this;
      wx.getImageInfo({
        src: urls[index],
        success: function (res) {
          var array = that.data.imgUrl;
          array[index] = res.path;
          that.setData({
            imgUrl: array
          })
        },
        fail: function (res) {
          console.log(res)
        }
      });
    }
  },

  // 从图库选择图片
  getLocalImg: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album'],
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        this.setData({
          isShowContainer: true,
          backgroundImgSrc: tempFilePaths,
        })

        // 滚动到预览区域
        wx.pageScrollTo({
          selector: "#avatarPreview",
        })

        this.resetOffset();
      }
    })
  },

  // 获取用户当前头像
  getAvatar: function () {
    this.startLoading();

    wx.getUserProfile({
      desc: "获取头像以生成相框",
      success: res1 => {
        var url = res1.userInfo.avatarUrl

        /* 将url最后数字改为0，获取最清晰版本
        ref: avatarUrl: 用户头像，最后一个数值代表正方形头像大小（有 0、46、64、96、132 数值可选，0 代表 132*132 正方形头像）
        */
        console.log(url.substring(url.length - 1, url.length))
        while (!isNaN(parseInt(url.substring(url.length - 1, url.length)))) {
          url = url.substring(0, url.length - 1)
        }
        url = url.substring(0, url.length - 1)

        // 将头像下载至本地
        var that = this;

        wx.getImageInfo({
          src: url + "/0",
          success: function (res) {
            that.endLoading()
            that.setData({
              backgroundImgSrc: [res.path]
            })
            wx.pageScrollTo({
              selector: "#avatarPreview",
            })
            that.resetOffset();

          },
          fail: function (res) {
            that.endLoading(true);
            console.log(res)
          }
        });
      },
      fail: res => {
        this.endLoading();
        console.log(res)
      }
    })
  },

  //点击相框，将其设置为当前相框
  showChooseImg: function (e) {

    if (!this.data.isShowChooseImg) {
      this.setData({
        isShowChooseImg: true,
      })
    }

    if (this.data.tplImgSrc != e.target.dataset.img && e.target.dataset.img != "") {
      var temp = e.target.dataset;
      this.setData({
        tplImgSrc: temp.img,
      })
    }
  },


  // 在 canvas 绘制头像及相框
  saveImg: function () {

    this.setData({
      isShowCanvas: true,
    });

    setTimeout(() => {   //这里用异步来实现,不然会提示canvas为空
      var context = wx.createCanvasContext('myCanvas');

      // 计算偏移量，注意单位为px
      const offsetX = this.data.imgOffsetX * oriImgWidth / previewWidth / (this.data.windowWidth * (1 - reservedPaddingProportion)) * avatarWidth * this.data.imgScale;
      const offsetY = this.data.imgOffsetY * (oriImgWidth * this.data.imgAspectRatio) / previewWidth / (this.data.windowWidth * (1 - reservedPaddingProportion)) * avatarWidth * this.data.imgScale;

      context.save();

      context.drawImage(this.data.backgroundImgSrc[0], -offsetX, -offsetY, avatarWidth * this.data.imgScale, avatarWidth * this.data.imgScale * this.data.imgAspectRatio);
      context.restore();
      context.drawImage(this.data.tplImgSrc, 0, 0, avatarWidth, avatarWidth);
      context.draw();
      setTimeout(() => {
        this.drawAfter();
      }, 200);
    }, 50)

  },

  // 异步绘制
  drawAfter: () => {
    wx.canvasToTempFilePath({
      width: avatarWidth,
      heght: avatarWidth,
      destWidth: avatarWidth,
      destHeight: avatarWidth,
      canvasId: 'myCanvas',
      fileType: 'png',
      // quality: 1,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({
              title: '成功保存至系统相册',
              icon: 'success',
              duration: 2000
            })
          },
          fail: () => {
            wx.getSetting({
              success: (res) => {
                if (!res.authSetting["scope.writePhotosAlbum"]) {
                  wx.showModal({
                    title: "保存失败",
                    content: "需要授予小程序访问系统图库的权限",
                    cancelText: "取消",
                    confirmText: "前往设置",
                    success: (res) => {
                      if (res.confirm) {
                        wx.openSetting();
                      }
                    }
                  })
                }
              }
            })
          },
        });

      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  startLoading: () => {
    wx.showLoading({
      title: '加载中',
    })
  },

  endLoading: (fail = false) => {
    wx.hideLoading()

    if (fail) {
      wx.showToast({
        title: '图片生成失败',
        icon: 'fail',
        duration: 2000
      })
    }
  },

  // 监听裁剪框移动事件
  didMove: function (event) {
    this.updateOffset(event);
  },

  // 监听裁剪框缩放事件
  didScale: function (event) {
    const width = oriImgWidth * event.detail.scale
    this.setData({
      gridWidth: width,
      imgScale: oriImgWidth / width,
    })
    this.updateOffset(event);
console.log(event)
  },

  updateOffset: function (event) {
    this.setData({

      imgOffsetX: (event.detail.x - gridOverflowX * this.data.windowWidth / 750) * previewWidth / oriImgWidth,
      imgOffsetY: (event.detail.y - gridOverflowY * this.data.windowWidth / 750) * previewWidth / oriImgWidth

    })
  },

  resetOffset: function() {
    this.setData({
      movableViewX: gridOverflowX + "rpx",
      movableViewY: gridOverflowY + "rpx",
    })
  },

  touchDidEnd: function (event) {

    this.setData({
      // 重新设置可移动区域的高度
      scrollableHeight: ((oriImgWidth * this.data.imgAspectRatio) - this.data.gridWidth),
    })

  },

  // 加载原图时，获取长宽比
  onLoadEditImage(e) {
    this.setData({
      imgAspectRatio: e.detail.height / e.detail.width,
    })
    console.log(this.data.imgAspectRatio)
  }
})