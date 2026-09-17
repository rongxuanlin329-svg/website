/**
 * 康樂小幫手 - 資料持久化與預設資料庫 (LocalStorage Store)
 */

const DEFAULT_DATA = {
  announcement: {
    title: "⚡ 考完試這週五聚會！下週排球班際聯賽開打！",
    text: "各位同學好！辛苦考完試啦～這週五晚上 18:30 我們在校門口集合一起去吃燒肉！另外下週二體育課是排球預賽，請各隊記得利用下課時間暖身。有任何想辦的活動都可以到「民主提案所」投票或找康樂許願喔！🎉",
    date: "今天 12:30",
    author: "康樂股長"
  },

  morale: {
    percentage: 95,
    subtitle: "凝聚力火力全開！班級熱度持續沸騰中 🔥"
  },

  events: [
    {
      id: "ev-1",
      title: "🔥 期末班級狂歡燒肉趴",
      category: "party",
      categoryName: "娛樂聚會",
      date: "2026-09-25",
      time: "18:30",
      location: "本格和牛燒肉吃到飽 (站前旗艦店)",
      cost: "約 $599 / 人",
      organizer: "康樂股長",
      desc: "期中考完徹底解放！大口吃肉喝飲料，現場還有康樂準備的抽獎與猜歌遊戲，歡迎攜帶空腹前往！",
      attendees: ["陳冠宇", "林怡君", "張廷偉", "王品涵", "李宗翰", "黃美婷", "周子傑", "謝佳蓉", "劉柏翰", "吳沛玲", "許哲維", "蔡昕妤", "楊承恩", "鄭詠潔", "洪睿祥"],
      targetCount: 20
    },
    {
      id: "ev-2",
      title: "🏐 班際排球熱血爭霸賽",
      category: "sports",
      categoryName: "體育賽事",
      date: "2026-09-29",
      time: "15:20",
      location: "風雨球場 B 區",
      cost: "免費 (班費贊助運動飲料)",
      organizer: "康樂股長 & 體育小老師",
      desc: "對戰隔壁二班！需要上場熱血救球的隊員，也超級需要最猛的大聲公啦啦隊！大家穿上運動服衝一波！",
      attendees: ["李宗翰", "張廷偉", "陳冠宇", "周子傑", "劉柏翰", "許哲維", "楊承恩", "洪睿祥", "林怡君", "謝佳蓉", "王品涵"],
      targetCount: 15
    },
    {
      id: "ev-3",
      title: "🌊 宜蘭包棟海邊渡假露營班遊",
      category: "trip",
      categoryName: "戶外旅行",
      date: "2026-10-17",
      time: "08:00 (兩天一夜)",
      location: "宜蘭頭城包棟海景民宿",
      cost: "預估每人 $1,800 (含住宿車資烤肉)",
      organizer: "康樂團隊",
      desc: "海邊踏浪、星空BBQ夜烤、通宵狼人殺與卡拉OK歡唱，為我們的青春留下最耀眼的一頁回憶！",
      attendees: ["陳冠宇", "林怡君", "張廷偉", "王品涵", "李宗翰", "黃美婷", "謝佳蓉", "蔡昕妤", "鄭詠潔", "許哲維"],
      targetCount: 25
    },
    {
      id: "ev-4",
      title: "🎲 週五放學桌遊與狼人殺之夜",
      category: "game",
      categoryName: "破冰同樂",
      date: "2026-10-02",
      time: "17:00",
      location: "301 教室 / 放學秘密基地",
      cost: "自備零食餅乾",
      organizer: "康樂股長",
      desc: "阿瓦隆、狼人殺、璀璨寶石、敲敲企鵝！不用趕時間，放鬆大笑、看誰心機最重！",
      attendees: ["王品涵", "黃美婷", "周子傑", "蔡昕妤", "劉柏翰", "吳沛玲", "鄭詠潔"],
      targetCount: 12
    }
  ],

  wheelPresets: {
    drinks: {
      name: "🧋 誰去買飲料/請客",
      items: ["康樂股長", "班長大人", "左邊第一位", "壽星請客", "猜拳輸家", "副班長", "全體AA", "學藝股長"]
    },
    dare: {
      name: "🎭 團康大冒險處罰",
      items: ["學鴨子叫三聲", "深情對黑板告白", "做10個波比跳", "用屁股寫自己的名字", "大聲喊我是班上最帥/美", "模仿指定同學口頭禪", "喝一口特調飲料", "深蹲唱一首兒歌"]
    },
    perform: {
      name: "🎤 誰來開場表演/自介",
      items: ["現場清唱高潮段", "講一個冷笑話", "展示一項隱藏才藝", "分享一個最尷尬糗事", "走台步繞教室一圈", "秀一段抖音熱門舞"]
    },
    dinner: {
      name: "🍱 今天聚餐吃什麼",
      items: ["火鍋吃到飽", "日式拉麵", "韓式炸雞啤酒", "熱血燒肉", "平價牛排", "麥當勞歡樂送", "義大利麵", "夜市小吃大集合"]
    },
    clean: {
      name: "🧹 班級活動場地復原分工",
      items: ["垃圾分類回收", "擦桌子與白板", "搬桌椅歸位", "掃地拖地", "檢查電燈冷氣", "監督組(打氣加油)"]
    }
  },

  students: [
    "陳冠宇", "林怡君", "張廷偉", "王品涵", "李宗翰",
    "黃美婷", "周子傑", "謝佳蓉", "劉柏翰", "吳沛玲",
    "許哲維", "蔡昕妤", "楊承恩", "鄭詠潔", "洪睿祥",
    "高詩晴", "潘威廷", "郭雅婷", "蘇宏銘", "賴郁婷",
    "曾俊傑", "葉子萱", "蕭承峰", "徐佳欣", "杜建廷",
    "朱珮甄", "施佑霖", "柯婷玉"
  ],

  icebreakerPrompts: [
    { type: "truth", tag: "真心話 · 校園爆料", text: "開學到現在，對班上哪位同學的第一印象和現在反差最大？" },
    { type: "truth", tag: "真心話 · 秘密檔案", text: "分享一個你在學校或上課時做過最荒謬、但老師沒發現的秘密？" },
    { type: "truth", tag: "真心話 · 心動瞬間", text: "在場所有同學中，你覺得誰笑起來最有感染力？" },
    { type: "truth", tag: "真心話 · 默契考驗", text: "如果世界末日只能帶班上兩個人逃難，你會選誰？為什麼？" },
    { type: "dare", tag: "大冒險 · 肢體爆笑", text: "請用全身肢體語言演繹一種瀕臨絕種的動物，直到有人猜出來！" },
    { type: "dare", tag: "大冒險 · 演技考驗", text: "深情款款地對著隔壁同學說：「其实...這顆球是我為你接的。」" },
    { type: "dare", tag: "大冒險 · 表情包大師", text: "模仿手機貼圖裡最浮誇的三個表情，維持5秒供大家拍照截圖！" },
    { type: "team", tag: "默契挑戰 · 心靈相通", text: "倒數三秒！全場同時喊出「最代表我們班的一首歌」或「一種食物」！" },
    { type: "sports", tag: "體育體能 · 燃燒卡路里", text: "在30秒內完成20個開合跳，並在最後一個時大喊「康樂萬歲」！" },
    { type: "truth", tag: "真心話 · 走心時刻", text: "如果時光倒流回剛進這個班的第一天，你想跟那時的自己說什麼？" }
  ],

  polls: [
    {
      id: "poll-1",
      title: "🏖️ 下次班遊渡假去哪裡最嗨？",
      desc: "大家一起來決定！票數最高的地點我們就直接排進企劃案！",
      totalVotes: 32,
      voted: false,
      options: [
        { id: "opt-1", text: "宜蘭海景包棟民宿＋星空BBQ夜烤", votes: 15 },
        { id: "opt-2", text: "苗栗懶人豪華露營＋營火晚會", votes: 9 },
        { id: "opt-3", text: "六福村主題樂園＋歡樂尖叫日", votes: 5 },
        { id: "opt-4", text: "密室逃脫旗艦館＋巨型雷射對戰", votes: 3 }
      ]
    },
    {
      id: "poll-2",
      title: "👕 班級專屬隊服/班服代表色投票",
      desc: "我們要印制運動會進場與班級紀念T-shirt，一人一票公平決定！",
      totalVotes: 28,
      voted: false,
      options: [
        { id: "opt-21", text: "曜石黑 × 霓虹夕陽橘 (超潮科技感)", votes: 12 },
        { id: "opt-22", text: "純白 × 經典皇家鈷藍 (清爽青春學院風)", votes: 9 },
        { id: "opt-23", text: "復古燕麥奶米白 (百搭低調溫柔)", votes: 5 },
        { id: "opt-24", text: "薄荷星河綠 (活力元氣滿點)", votes: 2 }
      ]
    }
  ],

  cheers: [
    {
      id: "ch-1",
      author: "林怡君",
      color: "yellow",
      message: "康樂股長太給力了吧！這次烤肉趴地點選得超好，已經空腹準備去吃垮店家了哈哈哈哈！",
      time: "10分鐘前",
      likes: 12,
      liked: false
    },
    {
      id: "ch-2",
      author: "張廷偉",
      color: "pink",
      message: "下週排球比賽全班集合啦！大家一起把隔壁班電爆，冠軍錦旗留給我們！🏐🔥",
      time: "35分鐘前",
      likes: 18,
      liked: true
    },
    {
      id: "ch-3",
      author: "王品涵",
      color: "cyan",
      message: "這個網站太可愛了！那個命運大轉盤誰做的，以後中午買飲料都用它轉就好啦～",
      time: "2小時前",
      likes: 9,
      liked: false
    },
    {
      id: "ch-4",
      author: "李宗翰",
      color: "violet",
      message: "大家記得投班服的顏色！曜石黑橘色真的帥到沒朋友，穿出去運動會超有氣勢！",
      time: "昨天",
      likes: 14,
      liked: false
    }
  ],

  memories: [
    {
      emoji: "🏆",
      title: "大一校園拔河大賽亞軍",
      tag: "體育榮譽",
      date: "2026 年春"
    },
    {
      emoji: "⛺",
      title: "忘憂谷星空夜宿烤肉露營",
      tag: "班遊回憶",
      date: "2026 年夏初"
    },
    {
      emoji: "🏀",
      title: "班際三對三籃球冠亞同樂",
      tag: "熱血賽事",
      date: "2026 年秋"
    },
    {
      emoji: "🎂",
      title: "驚喜壽星突襲砸派大亂鬥",
      tag: "歡樂團康",
      date: "上個月"
    }
  ]
};

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('class_fun_events')) {
      this.resetAll();
    }
  }

  resetAll() {
    localStorage.setItem('class_fun_announcement', JSON.stringify(DEFAULT_DATA.announcement));
    localStorage.setItem('class_fun_morale', JSON.stringify(DEFAULT_DATA.morale));
    localStorage.setItem('class_fun_events', JSON.stringify(DEFAULT_DATA.events));
    localStorage.setItem('class_fun_wheel_items', JSON.stringify(DEFAULT_DATA.wheelPresets.drinks.items));
    localStorage.setItem('class_fun_students', JSON.stringify(DEFAULT_DATA.students));
    localStorage.setItem('class_fun_polls', JSON.stringify(DEFAULT_DATA.polls));
    localStorage.setItem('class_fun_cheers', JSON.stringify(DEFAULT_DATA.cheers));
  }

  // Announcement
  getAnnouncement() {
    return JSON.parse(localStorage.getItem('class_fun_announcement')) || DEFAULT_DATA.announcement;
  }
  saveAnnouncement(ann) {
    localStorage.setItem('class_fun_announcement', JSON.stringify(ann));
  }

  // Events
  getEvents() {
    return JSON.parse(localStorage.getItem('class_fun_events')) || DEFAULT_DATA.events;
  }
  saveEvents(events) {
    localStorage.setItem('class_fun_events', JSON.stringify(events));
  }

  // Wheel Items
  getWheelItems() {
    return JSON.parse(localStorage.getItem('class_fun_wheel_items')) || DEFAULT_DATA.wheelPresets.drinks.items;
  }
  saveWheelItems(items) {
    localStorage.setItem('class_fun_wheel_items', JSON.stringify(items));
  }
  getWheelPresets() {
    return DEFAULT_DATA.wheelPresets;
  }

  // Students
  getStudents() {
    return JSON.parse(localStorage.getItem('class_fun_students')) || DEFAULT_DATA.students;
  }
  saveStudents(students) {
    localStorage.setItem('class_fun_students', JSON.stringify(students));
  }

  // Icebreakers
  getIcebreakers() {
    return DEFAULT_DATA.icebreakerPrompts;
  }

  // Polls
  getPolls() {
    return JSON.parse(localStorage.getItem('class_fun_polls')) || DEFAULT_DATA.polls;
  }
  savePolls(polls) {
    localStorage.setItem('class_fun_polls', JSON.stringify(polls));
  }

  // Cheers
  getCheers() {
    return JSON.parse(localStorage.getItem('class_fun_cheers')) || DEFAULT_DATA.cheers;
  }
  saveCheers(cheers) {
    localStorage.setItem('class_fun_cheers', JSON.stringify(cheers));
  }

  // Memories
  getMemories() {
    return DEFAULT_DATA.memories;
  }
}

window.storage = new StorageManager();
