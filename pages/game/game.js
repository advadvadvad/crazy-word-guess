// pages/game/game.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameSettings: {},
    words: [],
    currentWordIndex: 0,
    currentWord: '',
    score: 0,
    remainingTime: 60,
    isPaused: false,
    correctWords: [],
    skippedWords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取游戏设置和词库
    const gameSettings = wx.getStorageSync('gameSettings') || {
      category: '动物',
      gameTime: 60,
      soundEnabled: true
    };

    const words = wx.getStorageSync('gameWords') || [];

    if (words.length === 0) {
      wx.showToast({
        title: '词库加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({
      gameSettings,
      words,
      remainingTime: gameSettings.gameTime,
      currentWord: words[0]
    });

    // 创建音效
    if (gameSettings.soundEnabled) {
      this.correctAudio = wx.createInnerAudioContext();
      this.correctAudio.src = '/audio/correct.mp3';

      this.skipAudio = wx.createInnerAudioContext();
      this.skipAudio.src = '/audio/skip.mp3';

      this.timeOutAudio = wx.createInnerAudioContext();
      this.timeOutAudio.src = '/audio/timeout.mp3';

      this.tickAudio = wx.createInnerAudioContext();
      this.tickAudio.src = '/audio/tick.mp3';
    }

    // 开始倒计时
    this.startTimer();
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
    // 清除计时器
    clearInterval(this.timer);

    // 释放音频资源
    if (this.correctAudio) {
      this.correctAudio.destroy();
    }
    if (this.skipAudio) {
      this.skipAudio.destroy();
    }
    if (this.timeOutAudio) {
      this.timeOutAudio.destroy();
    }
    if (this.tickAudio) {
      this.tickAudio.destroy();
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

  },

  startTimer() {
    this.timer = setInterval(() => {
      if (this.data.isPaused) return;

      if (this.data.remainingTime > 1) {
        // 更新剩余时间
        const newTime = this.data.remainingTime - 1;

        // 最后10秒播放倒计时音效
        if (newTime <= 10 && this.data.gameSettings.soundEnabled && this.tickAudio) {
          this.tickAudio.play();
        }

        this.setData({
          remainingTime: newTime
        });
      } else {
        // 游戏结束
        if (this.data.gameSettings.soundEnabled && this.timeOutAudio) {
          this.timeOutAudio.play();
        }

        // 增加震动反馈
        wx.vibrateLong();

        this.endGame();
      }
    }, 1000);
  },

  togglePause() {
    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    this.setData({
      isPaused: !this.data.isPaused
    });
  },

  wordCorrect() {
    if (this.data.isPaused) return;

    // 振动反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 播放音效
    if (this.data.gameSettings.soundEnabled && this.correctAudio) {
      this.correctAudio.play();
    }

    // 增加分数
    const correctWords = [...this.data.correctWords, this.data.currentWord];

    this.setData({
      score: this.data.score + 1,
      correctWords
    });

    this.nextWord();
  },

  wordSkip() {
    if (this.data.isPaused) return;

    // 振动反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 播放音效
    if (this.data.gameSettings.soundEnabled && this.skipAudio) {
      this.skipAudio.play();
    }

    // 添加到跳过列表
    const skippedWords = [...this.data.skippedWords, this.data.currentWord];

    this.setData({
      skippedWords
    });

    this.nextWord();
  },

  nextWord() {
    let nextIndex = this.data.currentWordIndex + 1;

    // 如果所有词语都已经用完，则重新洗牌
    if (nextIndex >= this.data.words.length) {
      const shuffledWords = this.shuffleArray([...this.data.words]);
      this.setData({
        words: shuffledWords,
        currentWordIndex: 0
      });
      nextIndex = 0;
    }

    this.setData({
      currentWordIndex: nextIndex,
      currentWord: this.data.words[nextIndex]
    });
  },

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  endGame() {
    // 清除计时器
    clearInterval(this.timer);

    // 存储游戏结果
    const gameResult = {
      score: this.data.score,
      correctWords: this.data.correctWords,
      skippedWords: this.data.skippedWords,
      gameTime: this.data.gameSettings.gameTime,
      category: this.data.gameSettings.category,
      date: new Date().toLocaleDateString()
    };

    wx.setStorageSync('gameResult', gameResult);

    // 保存历史最高分
    this.saveHighScore(gameResult);

    // 跳转到结果页面
    wx.redirectTo({
      url: '/pages/result/result'
    });
  },

  saveHighScore(result) {
    // 获取历史最高分
    const highScores = wx.getStorageSync('highScores') || [];

    // 添加新分数
    highScores.push({
      score: result.score,
      category: result.category,
      date: result.date
    });

    // 保存
    wx.setStorageSync('highScores', highScores);
  },

  exitGame() {
    // 清除计时器
    clearInterval(this.timer);

    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    wx.navigateBack({
      delta: 2 // 返回到首页
    });
  }
})