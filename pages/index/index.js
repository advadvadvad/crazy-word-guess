// index.js
Page({
  data: {
    categories: ['动物', '水果', '日常用品', '职业', '成语'],
    categoryIndex: 0,
    gameTime: 60,
    soundEnabled: true
  },

  onLoad() {
    // 检查本地存储中的游戏设置
    const savedSettings = wx.getStorageSync('gameSettings');
    if (savedSettings) {
      // 查找类别索引
      const categoryIndex = this.data.categories.findIndex(c => c === savedSettings.category);

      this.setData({
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        gameTime: savedSettings.gameTime || 60,
        soundEnabled: savedSettings.soundEnabled !== undefined ? savedSettings.soundEnabled : true
      });
    }
  },

  onCategoryChange(e) {
    this.setData({
      categoryIndex: e.detail.value
    });
  },

  setGameTime(e) {
    const time = parseInt(e.currentTarget.dataset.time);
    this.setData({
      gameTime: time
    });
  },

  onSoundChange(e) {
    this.setData({
      soundEnabled: e.detail.value
    });
  },

  startGame() {
    // 播放按钮音效
    if (this.data.soundEnabled) {
      const clickAudio = wx.createInnerAudioContext();
      clickAudio.src = '/audio/button-click.mp3'; // 准备一个按钮音效
      clickAudio.play();
    }

    // 保存游戏设置
    const gameSettings = {
      category: this.data.categories[this.data.categoryIndex],
      gameTime: this.data.gameTime,
      soundEnabled: this.data.soundEnabled
    };

    wx.setStorageSync('gameSettings', gameSettings);

    // 添加震动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    // 跳转到准备页面
    wx.navigateTo({
      url: '/pages/prepare/prepare',
      success: () => {
        console.log('跳转到准备页面成功');
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  showRules() {
    wx.showModal({
      title: '游戏规则',
      content: '一名玩家手持设备，屏幕上显示需要猜的词语，但持有者看不到。其他玩家通过语言或肢体动作描述该词语，持有者根据描述进行猜测。猜对后，持有者点击左半边区域，表示正确，若放弃，则点击右半边区域，表示跳过。每轮有时间限制，规定时间内猜对的词语数量越多，得分越高。',
      confirmText: '知道了',
      confirmColor: '#3498DB',
      showCancel: false
    });
  },

  showRank() {
    // 获取本地存储的历史最高分
    const highScores = wx.getStorageSync('highScores') || [];
    if (highScores.length > 0) {
      // 排序
      highScores.sort((a, b) => b.score - a.score);

      // 构建排行榜内容
      let content = '历史最高分：\n';
      highScores.slice(0, 5).forEach((score, index) => {
        content += `${index + 1}. ${score.score}分 (${score.category}, ${score.date})\n`;
      });

      wx.showModal({
        title: '排行榜',
        content: content,
        showCancel: false,
        confirmText: '继续加油',
        confirmColor: '#3498DB'
      });
    } else {
      wx.showToast({
        title: '暂无历史记录',
        icon: 'none'
      });
    }
  }
})
