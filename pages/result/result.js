// pages/result/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameResult: {
      score: 0,
      correctWords: [],
      skippedWords: [],
      gameTime: 60,
      category: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取游戏结果
    const gameResult = wx.getStorageSync('gameResult') || {
      score: 0,
      correctWords: [],
      skippedWords: [],
      gameTime: 60,
      category: ''
    };

    this.setData({
      gameResult
    });

    // 播放结果页音效
    const soundEnabled = wx.getStorageSync('gameSettings')?.soundEnabled;
    if (soundEnabled) {
      this.resultAudio = wx.createInnerAudioContext();
      this.resultAudio.src = '/audio/result.mp3';
      this.resultAudio.play();
    }

    // 显示成绩动画
    setTimeout(() => {
      this.animateScore();
    }, 300);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 释放音频资源
    if (this.resultAudio) {
      this.resultAudio.destroy();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // 获取正确猜中的前3个词语作为分享内容
    const correctWords = this.data.gameResult.correctWords || [];
    const wordsPreview = correctWords.length > 0
      ? `猜对词语：${correctWords.slice(0, 3).join('、')}${correctWords.length > 3 ? '...' : ''}`
      : '来挑战猜词游戏吧！';

    return {
      title: `我在疯狂猜词中得了${this.data.gameResult.score}分！`,
      desc: wordsPreview,
      path: '/pages/index/index',
      imageUrl: '/images/share-image.png' // 可以添加分享图
    };
  },

  playAgain() {
    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    // 播放按钮音效
    if (this.buttonAudio) {
      this.buttonAudio = wx.createInnerAudioContext();
      this.buttonAudio.src = '/audio/button-click.mp3';
      this.buttonAudio.play();
    }

    // 返回准备页面
    wx.redirectTo({
      url: '/pages/prepare/prepare'
    });
  },

  backToHome() {
    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    // 返回首页
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  animateScore() {
    const score = this.data.gameResult.score;
    // 使用微信的动画API对分数进行动画展示
    // 因为小程序不支持直接操作DOM，所以这里只是一个模拟实现
    // 实际效果已通过CSS来实现
    console.log(`动画展示分数: ${score}`);
  }
})