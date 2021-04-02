//index.js
//获取应用实例

const avatarWidth = 500

const urls = [
  'https://cloud.tsinghua.edu.cn/f/7fe904f7d9e74f0fb4ac/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/a9bdb6515aca4e43b309/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/8ebacd7d8fc84a7db88e/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/2acf612ce3df437d900c/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/7ecf956e0f37495fb5b9/?dl=1',
  'https://cloud.tsinghua.edu.cn/f/e08ab91ea3264bd0a637/?dl=1',
]

Page({
  data: {
    imgUrl: ["","","","","",""],
    backgroundImgSrc: "",     //从本地获取的背景图片的路径
    tplImgSrc: '',            //校徽模板对应的图片路径
    isShowChooseImg: false,
    isShowContainer: false,
    isShowCanvas: false,
    isShowSuccess: false,
    gridWidth: 675,
    scrollableHeight: 675,
    imgAspectRatio: 1,
    imgScale: 1,
    imgOffsetX: 0,
    imgOffsetY: 0,
    windowWidth: "",
  },

  onLoad: function () {
    const width = wx.getSystemInfoSync().windowWidth;
    this.setData({
      windowWidth: width
    });
    for (let index = 0; index < urls.length; index++) {
      const element = urls[index];
      var that = this;
      wx.getImageInfo({
        src: element,
        success: function (res) {
          var array = that.data.imgUrl;
          console.log(array)
          array[index] = res.path;
          that.setData({
            isShowContainer: true,
            imgUrl: array
          })
          console.log(array)
        },
        fail: function (res) {
          console.log(res)
        }
      });
    }
  },

  //从本地图库选择图片的事件处理函数
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
        console.log(this.data.backgroundImgBase64)
      }
    })
  },

  getAvatar: function () {

    wx.getUserProfile({
      desc: "获取头像以生成相框",
      success: res1 => {
        var url = res1.userInfo.avatarUrl
        console.log(url.substring(url.length - 1, url.length))
        while (!isNaN(parseInt(url.substring(url.length - 1, url.length)))) {
          url = url.substring(0, url.length - 1)
        }
        url = url.substring(0, url.length - 1)

        var that = this;
        this.startLoading();
    
        wx.getImageInfo({
          src: url + "/0",
          success: function (res) {
            that.endLoading()
            that.setData({
              isShowContainer: true,
              backgroundImgSrc: [res.path]
            })
          },
          fail: function (res) {
            that.endLoading(true);
            console.log(res)
          }
        });
      },
      fail: res => {
        console.log(res)
      }
    })
  },

  //点击校徽模板时调用的函数
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

  drawAfter: () => {
    wx.canvasToTempFilePath({
      width: avatarWidth,
      heght: avatarWidth,
      destWidth: avatarWidth,
      destHeight: avatarWidth,
      canvasId: 'myCanvas',
      fileType: 'jpg',
      quality: 1,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
        });

        wx.showToast({
          title: '成功保存至系统相册',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        console.log(res);
      },
    })
  },

  //点击生成图片时用Canvas将两个图片绘制成Canvas然后保存
  saveImg: function () {
    
    this.setData({
      isShowCanvas: true,
    });

    setTimeout(() => {   //这里用异步来实现,不然会提示canvas为空
      var context = wx.createCanvasContext('myCanvas');

      const offsetX = this.data.imgOffsetX * 675 / 300 / (this.data.windowWidth * 0.9) * avatarWidth * this.data.imgScale;
      const offsetY = this.data.imgOffsetY * (675 * this.data.imgAspectRatio) / 300 / (this.data.windowWidth * 0.9) * avatarWidth * this.data.imgScale;

      console.log(this.data);
      console.log(offsetX);
      console.log(offsetY);

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

  didMove: function (event) {
    this.setData({
      scrollableHeight: ((675 * this.data.imgAspectRatio) - this.data.gridWidth),

      imgOffsetX: (event.detail.x - 200 * this.data.windowWidth / 750) * 300.0 / 675,
      imgOffsetY: (event.detail.y - 200 * this.data.windowWidth / 750) * 300.0 / (675)
    })

    setTimeout(() => {
      this.setData({
        scrollableHeight: ((675 * this.data.imgAspectRatio) - this.data.gridWidth),
      })
      }, 0)


    console.log(this.data.imgOffsetX)
  },

  didScale: function (event) {
    this.setData({
      gridWidth: 675 * event.detail.scale
    })

    this.setData({
      imgScale: 675.0 / this.data.gridWidth,
    })


  },

  onLoadEditImage(e) {
    this.setData({
      imgAspectRatio: e.detail.height / e.detail.width,
    })
    console.log(this.data.imgAspectRatio)
  }
})