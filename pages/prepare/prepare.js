// prepare.js
Page({
  data: {
    gameSettings: {},
    isCountingDown: false,
    countdown: 3
  },

  onLoad() {
    // 获取游戏设置
    const gameSettings = wx.getStorageSync('gameSettings') || {
      category: '动物',
      gameTime: 60,
      soundEnabled: true
    };

    this.setData({
      gameSettings
    });

    // 创建音频上下文，准备音效
    if (gameSettings.soundEnabled) {
      this.countdownAudio = wx.createInnerAudioContext();
      this.countdownAudio.src = '/audio/countdown.mp3';

      this.startAudio = wx.createInnerAudioContext();
      this.startAudio.src = '/audio/game-start.mp3';
    }
  },

  goBack() {
    wx.navigateBack();
  },

  startCountdown() {
    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    });

    this.setData({
      isCountingDown: true,
      countdown: 3
    });

    // 播放倒计时音效
    if (this.data.gameSettings.soundEnabled && this.countdownAudio) {
      this.countdownAudio.play();
    }

    const countInterval = setInterval(() => {
      if (this.data.countdown > 1) {
        const newCountdown = this.data.countdown - 1;

        this.setData({
          countdown: newCountdown
        });

        // 振动反馈
        wx.vibrateShort({
          type: 'light'
        });

        // 倒计时音效
        if (this.data.gameSettings.soundEnabled && this.countdownAudio) {
          this.countdownAudio.play();
        }
      } else {
        // 清除倒计时
        clearInterval(countInterval);

        // 开始音效
        if (this.data.gameSettings.soundEnabled && this.startAudio) {
          this.startAudio.play();
        }

        // 生成游戏词库并存储
        this.generateWords();

        // 强振动
        wx.vibrateLong();

        // 跳转到游戏页面
        wx.navigateTo({
          url: '/pages/game/game'
        });
      }
    }, 1000);
  },

  generateWords() {
    // 根据选择的类别生成词语列表
    // 这里简单实现，实际应该根据选择的类别加载不同词库
    const wordsByCategory = {
      '动物': ['猫', '狗', '老虎', '大象', '长颈鹿', '熊猫', '兔子', '鸭子', '青蛙', '金鱼', '猴子', '狮子', '老鼠', '鸡', '蛇', '羊'],
      '水果': ['苹果', '香蕉', '橙子', '草莓', '西瓜', '葡萄', '菠萝', '梨', '桃子', '樱桃', '柚子', '柠檬', '猕猴桃', '榴莲', '椰子'],
      '日常用品': ['杯子', '电视', '钟表', '书包', '雨伞', '鞋子', '手机', '眼镜', '毛巾', '牙刷', '梳子', '抽纸', '水杯', '剪刀', '电脑'],
      '职业': ['老师', '医生', '警察', '厨师', '消防员', '司机', '画家', '歌手', '运动员', '演员', '程序员', '农民', '科学家', '记者'],
      '成语': ['画蛇添足', '守株待兔', '掩耳盗铃', '对牛弹琴', '朝三暮四', '惊弓之鸟', '杯弓蛇影', '亡羊补牢', '一心一意', '入乡随俗']
    };

    const category = this.data.gameSettings.category;
    const words = wordsByCategory[category] || wordsByCategory['动物'];

    // 随机打乱词语顺序
    const shuffledWords = this.shuffleArray(words);

    // 存储词语列表供游戏页面使用
    wx.setStorageSync('gameWords', shuffledWords);
  },

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  onUnload() {
    // 释放音频资源
    if (this.countdownAudio) {
      this.countdownAudio.destroy();
    }
    if (this.startAudio) {
      this.startAudio.destroy();
    }
  }
}) 