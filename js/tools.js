/**
 * 康樂小幫手 - 團康神器與體育工具模組 (Tools Module)
 * 1. 隨機分組抽籤機 (Team Randomizer & Matchup)
 * 2. 賽事即時計分板 (Scoreboard & Whistle)
 * 3. 真心話大冒險破冰抽取器 (Icebreaker Prompts)
 */

class ToolsManager {
  constructor() {
    this.initRandomizer();
    this.initScoreboard();
    this.initIcebreakers();
  }

  /* ==========================================================================
     1. 隨機分組抽籤機 (Team Randomizer)
     ========================================================================== */
  initRandomizer() {
    this.students = window.storage.getStudents();
    this.teamFunNames = [
      "🔥 烈火雄鷹隊", "⚡ 閃電暴風隊", "🚀 宇宙第一隊", "🍕 狂暴披薩隊",
      "🥑 躺平養生組", "🦁 榮耀獅王隊", "🧋 珍珠奶茶隊", "🛸 超時空戰隊",
      "🐺 孤勇群狼隊", "🌈 彩虹微笑隊", "🎯 穿雲百步隊", "🏆 冠軍錦旗隊"
    ];

    const rosterTextarea = document.getElementById('rosterInput');
    if (rosterTextarea) {
      rosterTextarea.value = this.students.join('\n');
    }

    const randomizeBtn = document.getElementById('doRandomizeBtn');
    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', () => this.generateTeams());
    }

    const copyTeamsBtn = document.getElementById('copyTeamsBtn');
    if (copyTeamsBtn) {
      copyTeamsBtn.addEventListener('click', () => this.copyTeamsToClipboard());
    }

    const resetRosterBtn = document.getElementById('resetRosterBtn');
    if (resetRosterBtn) {
      resetRosterBtn.addEventListener('click', () => {
        if (rosterTextarea) {
          this.students = window.storage.getStudents();
          rosterTextarea.value = this.students.join('\n');
          window.app.showToast('已重設為預設班級名單', 'success');
        }
      });
    }
  }

  generateTeams() {
    window.sound.playClick();
    const rosterTextarea = document.getElementById('rosterInput');
    if (!rosterTextarea) return;

    const rawList = rosterTextarea.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (rawList.length < 2) {
      window.app.showToast('請至少輸入 2 位同學姓名喔！', 'coral');
      return;
    }

    // 更新並持久化名單
    window.storage.saveStudents(rawList);

    // 洗牌算法 Fisher-Yates
    const shuffled = [...rawList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 取得分組模式
    const splitMode = document.getElementById('splitModeSelect').value; // 'teams' 或 'per_team'
    const splitNumber = parseInt(document.getElementById('splitNumberInput').value, 10) || 2;

    let numTeams = 2;
    if (splitMode === 'teams') {
      numTeams = Math.max(2, Math.min(splitNumber, shuffled.length));
    } else {
      // 每組 N 人
      const perTeam = Math.max(1, splitNumber);
      numTeams = Math.max(1, Math.ceil(shuffled.length / perTeam));
    }

    const teams = Array.from({ length: numTeams }, (_, i) => ({
      name: this.teamFunNames[i % this.teamFunNames.length] || `第 ${i + 1} 小隊`,
      members: []
    }));

    // 輪流分配隊員
    shuffled.forEach((member, index) => {
      teams[index % numTeams].members.push(member);
    });

    this.currentTeams = teams;
    this.renderTeams(teams);
    this.renderMatchups(teams);
    window.confetti.burst(60);
    window.sound.playWin();
  }

  renderTeams(teams) {
    const grid = document.getElementById('teamsResultGrid');
    if (!grid) return;
    grid.innerHTML = '';

    teams.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <div class="team-card-header">
          <div class="team-name">${t.name}</div>
          <div class="team-count">${t.members.length} 人</div>
        </div>
        <ul class="team-member-list">
          ${t.members.map(m => `<li class="team-member-item">${m}</li>`).join('')}
        </ul>
      `;
      grid.appendChild(card);
    });
  }

  renderMatchups(teams) {
    const matchupBox = document.getElementById('matchupSection');
    const matchupList = document.getElementById('matchupList');
    if (!matchupBox || !matchupList) return;

    if (teams.length >= 2) {
      matchupBox.style.display = 'block';
      matchupList.innerHTML = '';

      for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
          const match = document.createElement('div');
          match.className = 'match-item';
          match.innerHTML = `
            <span>${teams[i].name}</span>
            <span class="vs-badge">VS</span>
            <span>${teams[i + 1].name}</span>
          `;
          matchupList.appendChild(match);
        } else {
          // 輪空
          const match = document.createElement('div');
          match.className = 'match-item';
          match.innerHTML = `
            <span>${teams[i].name}</span>
            <span class="badge" style="background:rgba(245,158,11,0.2);color:#fbbf24;">第一輪輪空晉級 👑</span>
          `;
          matchupList.appendChild(match);
        }
      }
    } else {
      matchupBox.style.display = 'none';
    }
  }

  copyTeamsToClipboard() {
    if (!this.currentTeams || this.currentTeams.length === 0) {
      window.app.showToast('請先進行分組抽籤喔！', 'coral');
      return;
    }

    let text = `📢【康樂股長神速分組名單出爐】\n`;
    this.currentTeams.forEach((t) => {
      text += `\n【${t.name}】(${t.members.length}人)\n`;
      text += t.members.join('、 ') + `\n`;
    });
    text += `\n大家加油，友誼第一、比賽第二！🔥`;

    navigator.clipboard.writeText(text).then(() => {
      window.app.showToast('📋 已複製分組名單，可直接貼到 LINE 班群！', 'success');
    });
  }

  /* ==========================================================================
     2. 賽事即時計分板 (Scoreboard)
     ========================================================================== */
  initScoreboard() {
    this.scoreRed = 0;
    this.scoreBlue = 0;
    this.timerSeconds = 10 * 60; // 預設 10 分鐘
    this.initialTimer = 10 * 60;
    this.timerInterval = null;
    this.isTimerRunning = false;
    this.periodIndex = 1;
    this.periods = ['第 1 節 / 局', '第 2 節 / 局', '第 3 節 / 局', '第 4 節 / 局', '延長激戰賽'];

    // Red team buttons
    document.querySelectorAll('[data-score-red]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(btn.dataset.scoreRed, 10);
        this.updateScore('red', delta);
      });
    });

    // Blue team buttons
    document.querySelectorAll('[data-score-blue]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delta = parseInt(btn.dataset.scoreBlue, 10);
        this.updateScore('blue', delta);
      });
    });

    // Whistle
    const whistleBtn = document.getElementById('whistleBtn');
    if (whistleBtn) {
      whistleBtn.addEventListener('click', () => {
        window.sound.playWhistle();
        window.app.showToast('吹哨！嗶嗶嗶——！', 'success');
      });
    }

    // Timer controls
    const startPauseBtn = document.getElementById('timerStartPauseBtn');
    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', () => this.toggleTimer());
    }

    const resetTimerBtn = document.getElementById('timerResetBtn');
    if (resetTimerBtn) {
      resetTimerBtn.addEventListener('click', () => this.resetTimer());
    }

    const nextPeriodBtn = document.getElementById('nextPeriodBtn');
    if (nextPeriodBtn) {
      nextPeriodBtn.addEventListener('click', () => this.nextPeriod());
    }

    const resetScoreboardBtn = document.getElementById('resetScoreboardBtn');
    if (resetScoreboardBtn) {
      resetScoreboardBtn.addEventListener('click', () => {
        if (confirm('確定要清空雙方比分嗎？')) {
          this.scoreRed = 0;
          this.scoreBlue = 0;
          this.updateScoreDisplay();
          window.app.showToast('比分已歸零', 'success');
        }
      });
    }

    this.updateTimerDisplay();
  }

  updateScore(team, delta) {
    if (team === 'red') {
      this.scoreRed = Math.max(0, this.scoreRed + delta);
    } else {
      this.scoreBlue = Math.max(0, this.scoreBlue + delta);
    }
    if (delta > 0) {
      window.sound.playScore();
    } else {
      window.sound.playClick();
    }
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    const redEl = document.getElementById('redScoreNum');
    const blueEl = document.getElementById('blueScoreNum');
    if (redEl) redEl.textContent = this.scoreRed;
    if (blueEl) blueEl.textContent = this.scoreBlue;
  }

  toggleTimer() {
    window.sound.playClick();
    const btn = document.getElementById('timerStartPauseBtn');
    if (this.isTimerRunning) {
      // Pause
      clearInterval(this.timerInterval);
      this.isTimerRunning = false;
      if (btn) btn.innerHTML = '▶ 開始計時';
    } else {
      // Start
      this.isTimerRunning = true;
      if (btn) btn.innerHTML = '⏸ 暫停';
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
          this.updateTimerDisplay();
          if (this.timerSeconds === 0) {
            this.toggleTimer();
            window.sound.playWhistle();
            window.confetti.burst(150);
            window.app.showToast('時間到！比賽結束！', 'coral');
          }
        }
      }, 1000);
    }
  }

  resetTimer() {
    window.sound.playClick();
    if (this.isTimerRunning) this.toggleTimer();
    this.timerSeconds = this.initialTimer;
    this.updateTimerDisplay();
  }

  nextPeriod() {
    window.sound.playClick();
    this.periodIndex = (this.periodIndex % this.periods.length) + 1;
    const periodEl = document.getElementById('scoreboardPeriod');
    if (periodEl) {
      periodEl.textContent = this.periods[this.periodIndex - 1];
    }
    window.sound.playWhistle();
    window.app.showToast(`進入：${this.periods[this.periodIndex - 1]}`, 'success');
  }

  updateTimerDisplay() {
    const display = document.getElementById('sbTimerDisplay');
    if (!display) return;
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /* ==========================================================================
     3. 真心話大冒險破冰抽取器 (Icebreaker Prompts)
     ========================================================================== */
  initIcebreakers() {
    this.prompts = window.storage.getIcebreakers();
    this.currentCategory = 'all';

    const pickBtn = document.getElementById('pickIcebreakerBtn');
    if (pickBtn) {
      pickBtn.addEventListener('click', () => this.drawPrompt());
    }

    const copyPromptBtn = document.getElementById('copyPromptBtn');
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener('click', () => this.copyCurrentPrompt());
    }

    document.querySelectorAll('.icebreaker-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.icebreaker-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.drawPrompt();
      });
    });

    // 初始抽取一題
    this.drawPrompt();
  }

  drawPrompt() {
    window.sound.playClick();
    let pool = this.prompts;
    if (this.currentCategory !== 'all') {
      pool = this.prompts.filter(p => p.type === this.currentCategory);
    }
    if (pool.length === 0) pool = this.prompts;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    this.activePrompt = selected;

    const card = document.getElementById('icebreakerCard');
    const tagEl = document.getElementById('icebreakerTag');
    const textEl = document.getElementById('icebreakerText');

    if (card) {
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (tagEl) {
          tagEl.textContent = selected.tag;
          tagEl.className = `icebreaker-type-tag tag-${selected.type}`;
        }
        if (textEl) {
          textEl.textContent = selected.text;
        }
        card.style.transform = 'scale(1)';
      }, 150);
    }
  }

  copyCurrentPrompt() {
    if (!this.activePrompt) return;
    const text = `🎭【團康破冰挑戰】\n${this.activePrompt.tag}\n題目：${this.activePrompt.text}`;
    navigator.clipboard.writeText(text).then(() => {
      window.app.showToast('已複製破冰題目！', 'success');
    });
  }
}

window.ToolsManager = ToolsManager;
