/**
 * 康樂小幫手 · 班級活力大本營 (Main Application)
 * 整合導航、公告廣播、活動籌辦、投票所、留言板與彈跳視窗
 */

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.initHeader();
    this.initTabs();
    this.initModals();
    this.initDashboard();
    this.initEvents();
    this.initPolls();
    this.initMorale();
    this.initSubmodules();
  }

  /* ==========================================================================
     Header & Global Controls
     ========================================================================== */
  initHeader() {
    // 音效開關
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      this.updateSoundBtnUI(soundBtn);
      soundBtn.addEventListener('click', () => {
        const isMuted = window.sound.toggleMute();
        this.updateSoundBtnUI(soundBtn);
        this.showToast(isMuted ? '🔇 音效已靜音' : '🔊 音效已開啟', 'success');
      });
    }

    // 重設全部資料
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('確定要恢復預設範本資料嗎？這將會重設所有活動、投票與留言。')) {
          window.storage.resetAll();
          window.location.reload();
        }
      });
    }
  }

  updateSoundBtnUI(btn) {
    const isMuted = window.sound.isMuted();
    btn.innerHTML = isMuted ? '🔇' : '🔊';
    btn.title = isMuted ? '點擊開啟音效' : '點擊靜音';
    if (isMuted) {
      btn.classList.add('muted');
      btn.classList.remove('active-sound');
    } else {
      btn.classList.remove('muted');
      btn.classList.add('active-sound');
    }
  }

  /* ==========================================================================
     Tab Navigation
     ========================================================================== */
  initTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // 支援快捷跳轉 (Quick tool cards in Dashboard)
    document.querySelectorAll('[data-switch-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.dataset.switchTab;
        const sub = el.dataset.switchSubtool;
        this.switchTab(tab);
        if (sub) {
          this.switchSubtool(sub);
        }
      });
    });
  }

  switchTab(tabId) {
    window.sound.playClick();
    this.currentTab = tabId;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // 若切換至工具箱，且轉盤已就緒，重新繪製以適應尺寸
    if (tabId === 'tools' && window.wheel) {
      setTimeout(() => {
        window.wheel.setupCanvas();
        window.wheel.draw();
      }, 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchSubtool(subtoolId) {
    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === subtoolId);
    });
    document.querySelectorAll('.tool-subview').forEach(view => {
      view.classList.toggle('active', view.id === `subview-${subtoolId}`);
    });
    if (subtoolId === 'wheel' && window.wheel) {
      setTimeout(() => {
        window.wheel.setupCanvas();
        window.wheel.draw();
      }, 50);
    }
  }

  /* ==========================================================================
     Dashboard Module
     ========================================================================== */
  initDashboard() {
    this.renderAnnouncement();
    this.initCountdown();
    this.updateStats();

    // 編輯公告按鈕
    const editAnnBtn = document.getElementById('editAnnBtn');
    if (editAnnBtn) {
      editAnnBtn.addEventListener('click', () => {
        const ann = window.storage.getAnnouncement();
        document.getElementById('editAnnTitle').value = ann.title;
        document.getElementById('editAnnText').value = ann.text;
        this.openModal('annModal');
      });
    }

    // 複製公告為 LINE 格式
    const copyAnnBtn = document.getElementById('copyAnnBtn');
    if (copyAnnBtn) {
      copyAnnBtn.addEventListener('click', () => {
        const ann = window.storage.getAnnouncement();
        const text = `📢【康樂股長班級廣播站】\n\n${ann.title}\n\n${ann.text}\n\n⏰ 發布時間：${ann.date} | ${ann.author}\n👉 快來班級活力大本營看詳情與報名！`;
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('📋 已複製公告，可直接貼到 LINE 班群！', 'success');
        });
      });
    }

    // 儲存公告表單
    const annForm = document.getElementById('annForm');
    if (annForm) {
      annForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('editAnnTitle').value.trim();
        const text = document.getElementById('editAnnText').value.trim();
        if (title && text) {
          window.storage.saveAnnouncement({
            title,
            text,
            date: "剛剛",
            author: "康樂股長"
          });
          this.renderAnnouncement();
          this.closeModal('annModal');
          this.showToast('✅ 康樂公告已成功更新！', 'success');
        }
      });
    }
  }

  renderAnnouncement() {
    const ann = window.storage.getAnnouncement();
    const titleEl = document.getElementById('broadcastTitle');
    const textEl = document.getElementById('broadcastText');
    const metaEl = document.getElementById('broadcastMeta');

    if (titleEl) titleEl.textContent = ann.title;
    if (textEl) textEl.textContent = ann.text;
    if (metaEl) metaEl.innerHTML = `<span>🕒 ${ann.date}</span> <span>👤 發布：${ann.author}</span>`;
  }

  initCountdown() {
    const events = window.storage.getEvents();
    if (events.length === 0) return;

    // 找最近的一個未來活動
    const nextEvent = events[0];
    const eventNameEl = document.getElementById('countdownEventName');
    if (eventNameEl) {
      eventNameEl.innerHTML = `<span>📌</span> <strong>${nextEvent.title}</strong> (${nextEvent.date})`;
    }

    const updateTimer = () => {
      const targetDate = new Date(`${nextEvent.date}T${nextEvent.time || '00:00'}:00`).getTime();
      const now = new Date().getTime();
      let diff = targetDate - now;

      if (isNaN(diff) || diff <= 0) {
        // 若日期已過，設置假倒數 7 天讓介面保持生動
        diff = 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cdDays');
      const hEl = document.getElementById('cdHours');
      const mEl = document.getElementById('cdMins');
      const sEl = document.getElementById('cdSecs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  updateStats() {
    const events = window.storage.getEvents();
    const polls = window.storage.getPolls();
    const cheers = window.storage.getCheers();

    let totalAttendees = 0;
    events.forEach(e => totalAttendees += (e.attendees ? e.attendees.length : 0));

    const evCountEl = document.getElementById('statEventsCount');
    const attCountEl = document.getElementById('statAttendeesCount');
    const pollsCountEl = document.getElementById('statPollsCount');
    const cheersCountEl = document.getElementById('statCheersCount');

    if (evCountEl) evCountEl.textContent = events.length;
    if (attCountEl) attCountEl.textContent = totalAttendees;
    if (pollsCountEl) pollsCountEl.textContent = polls.length;
    if (cheersCountEl) cheersCountEl.textContent = cheers.length;
  }

  /* ==========================================================================
     Events & Sports Planner
     ========================================================================== */
  initEvents() {
    this.renderEvents('all');

    // 篩選按鈕
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderEvents(btn.dataset.category);
      });
    });

    // 新增活動按鈕與表單
    const openAddEventBtn = document.getElementById('openAddEventModalBtn');
    if (openAddEventBtn) {
      openAddEventBtn.addEventListener('click', () => {
        this.openModal('eventModal');
      });
    }

    const eventForm = document.getElementById('newEventForm');
    if (eventForm) {
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('evTitleInput').value.trim();
        const category = document.getElementById('evCategorySelect').value;
        const date = document.getElementById('evDateInput').value;
        const time = document.getElementById('evTimeInput').value;
        const location = document.getElementById('evLocationInput').value.trim();
        const cost = document.getElementById('evCostInput').value.trim() || '免費';
        const desc = document.getElementById('evDescInput').value.trim();

        const categoryNames = {
          sports: '體育賽事',
          party: '娛樂聚會',
          trip: '戶外旅行',
          game: '破冰同樂'
        };

        const newEv = {
          id: 'ev-' + Date.now(),
          title,
          category,
          categoryName: categoryNames[category] || '班級活動',
          date,
          time,
          location,
          cost,
          organizer: '康樂股長',
          desc,
          attendees: ['康樂股長 (發起人)'],
          targetCount: 20
        };

        const events = window.storage.getEvents();
        events.unshift(newEv);
        window.storage.saveEvents(events);

        this.renderEvents('all');
        this.updateStats();
        this.closeModal('eventModal');
        eventForm.reset();
        window.sound.playWin();
        window.confetti.burst(80);
        this.showToast('🎉 新活動已成功發布！', 'success');
      });
    }
  }

  renderEvents(categoryFilter = 'all') {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    let events = window.storage.getEvents();
    if (categoryFilter !== 'all') {
      events = events.filter(e => e.category === categoryFilter);
    }

    grid.innerHTML = '';
    if (events.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
          <h3>目前此分類還沒有活動喔！</h3>
          <p style="margin-top: 0.5rem;">點擊上方「＋發起新活動」來籌備一場熱血聚會吧！</p>
        </div>
      `;
      return;
    }

    events.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';

      const isUserJoined = ev.attendees && ev.attendees.includes('我 (同學)');
      const attendeesCount = ev.attendees ? ev.attendees.length : 0;

      card.innerHTML = `
        <div class="event-header">
          <span class="event-category-tag tag-${ev.category}">${ev.categoryName}</span>
          <span style="font-size:0.8rem; color:var(--text-secondary);">主揪：${ev.organizer}</span>
        </div>
        <h3 class="event-title">${ev.title}</h3>
        <div class="event-details-list">
          <div class="event-detail-item">
            <span class="item-icon">📅</span>
            <span>${ev.date} ${ev.time || ''}</span>
          </div>
          <div class="event-detail-item">
            <span class="item-icon">📍</span>
            <span>${ev.location}</span>
          </div>
          <div class="event-detail-item">
            <span class="item-icon">💰</span>
            <span>${ev.cost}</span>
          </div>
          <div class="event-detail-item" style="color:var(--text-secondary); margin-top:0.25rem;">
            <span class="item-icon">📝</span>
            <span>${ev.desc}</span>
          </div>
        </div>

        <div class="event-rsvp-section">
          <div class="rsvp-status">
            <span>已報名名單：</span>
            <strong>${attendeesCount}</strong> 人
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              ${ev.attendees ? ev.attendees.slice(0, 5).join('、 ') + (attendeesCount > 5 ? ` 等...` : '') : ''}
            </div>
          </div>
          <button class="btn btn-sm ${isUserJoined ? 'btn-secondary' : 'btn-primary'}" onclick="window.app.toggleRSVP('${ev.id}')">
            ${isUserJoined ? '✓ 我已報名' : '＋我要參加'}
          </button>
        </div>

        <div class="event-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.app.copyEventTemplate('${ev.id}')">
            📋 複製 LINE 揪團文案
          </button>
          <button class="btn btn-secondary btn-sm" style="color:#ff7675;" onclick="window.app.deleteEvent('${ev.id}')">
            🗑️ 刪除
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  toggleRSVP(eventId) {
    window.sound.playClick();
    const events = window.storage.getEvents();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    if (!ev.attendees) ev.attendees = [];
    const myName = '我 (同學)';

    if (ev.attendees.includes(myName)) {
      ev.attendees = ev.attendees.filter(n => n !== myName);
      this.showToast('已取消報名', 'coral');
    } else {
      ev.attendees.push(myName);
      window.sound.playWin();
      window.confetti.burst(60);
      this.showToast('🎉 報名成功！期待一起玩！', 'success');
    }

    window.storage.saveEvents(events);
    this.renderEvents(document.querySelector('.filter-btn.active').dataset.category);
    this.updateStats();
  }

  deleteEvent(eventId) {
    if (confirm('確定要刪除這個活動嗎？')) {
      let events = window.storage.getEvents();
      events = events.filter(e => e.id !== eventId);
      window.storage.saveEvents(events);
      this.renderEvents(document.querySelector('.filter-btn.active').dataset.category);
      this.updateStats();
      this.showToast('活動已刪除', 'coral');
    }
  }

  copyEventTemplate(eventId) {
    const events = window.storage.getEvents();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;

    const count = ev.attendees ? ev.attendees.length : 0;
    const text = `🔥【康樂活動揪團報名中】\n\n【${ev.title}】\n📅 時間：${ev.date} ${ev.time || ''}\n📍 地點：${ev.location}\n💰 費用：${ev.cost}\n📝 內容：${ev.desc}\n\n🙋‍♂️ 目前已報名（${count}人）：\n${ev.attendees ? ev.attendees.join('、 ') : '無'}\n\n👉 想去的同學快點向康樂股長喊 +1 或到大本營網站直接登記！🎉`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('📋 已複製活動揪團文案，快貼到 LINE 班群！', 'success');
    });
  }

  /* ==========================================================================
     Democratic Polls & Voting
     ========================================================================== */
  initPolls() {
    this.renderPolls();

    const openAddPollBtn = document.getElementById('openAddPollModalBtn');
    if (openAddPollBtn) {
      openAddPollBtn.addEventListener('click', () => {
        this.openModal('pollModal');
      });
    }

    const newPollForm = document.getElementById('newPollForm');
    if (newPollForm) {
      newPollForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('pollTitleInput').value.trim();
        const desc = document.getElementById('pollDescInput').value.trim();
        const rawOptions = document.getElementById('pollOptionsInput').value.split('\n').map(s => s.trim()).filter(s => s.length > 0);

        if (rawOptions.length < 2) {
          this.showToast('投票至少需要 2 個選項喔！', 'coral');
          return;
        }

        const newPoll = {
          id: 'poll-' + Date.now(),
          title,
          desc,
          totalVotes: 0,
          voted: false,
          options: rawOptions.map((opt, idx) => ({
            id: 'opt-' + Date.now() + '-' + idx,
            text: opt,
            votes: 0
          }))
        };

        const polls = window.storage.getPolls();
        polls.unshift(newPoll);
        window.storage.savePolls(polls);

        this.renderPolls();
        this.updateStats();
        this.closeModal('pollModal');
        newPollForm.reset();
        window.sound.playWin();
        window.confetti.burst(70);
        this.showToast('🗳️ 新投票案已建立！', 'success');
      });
    }
  }

  renderPolls() {
    const grid = document.getElementById('pollsGrid');
    if (!grid) return;

    const polls = window.storage.getPolls();
    grid.innerHTML = '';

    polls.forEach(poll => {
      const card = document.createElement('div');
      card.className = 'poll-card';

      let optionsHtml = '';
      poll.options.forEach(opt => {
        const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
        const isSelected = poll.userVotedOptionId === opt.id;

        optionsHtml += `
          <div class="poll-option-item ${isSelected ? 'user-voted' : ''}" onclick="window.app.votePoll('${poll.id}', '${opt.id}')">
            <div class="poll-option-fill" style="width: ${percent}%;"></div>
            <div class="poll-option-content">
              <span>${isSelected ? '✔ ' : ''}${opt.text}</span>
              <span class="poll-percent">${opt.votes} 票 (${percent}%)</span>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="poll-card-header">
          <div>
            <h3 class="poll-card-title">${poll.title}</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">${poll.desc}</p>
          </div>
          <span class="poll-total-votes">總票數：${poll.totalVotes} 票</span>
        </div>
        <div class="poll-options-list">
          ${optionsHtml}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  votePoll(pollId, optionId) {
    window.sound.playClick();
    const polls = window.storage.getPolls();
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    // 若已經投過此選項
    if (poll.userVotedOptionId === optionId) {
      this.showToast('您已經投給此選項囉！', 'coral');
      return;
    }

    // 若之前投過別的選項，先扣除
    if (poll.userVotedOptionId) {
      const oldOpt = poll.options.find(o => o.id === poll.userVotedOptionId);
      if (oldOpt && oldOpt.votes > 0) oldOpt.votes--;
      poll.totalVotes--;
    }

    // 增加新票數
    const newOpt = poll.options.find(o => o.id === optionId);
    if (newOpt) {
      newOpt.votes++;
      poll.totalVotes++;
      poll.userVotedOptionId = optionId;
      window.sound.playWin();
      window.confetti.burst(60);
      this.showToast(`已為【${newOpt.text}】投票成功！`, 'success');
    }

    window.storage.savePolls(polls);
    this.renderPolls();
  }

  /* ==========================================================================
     Morale Board & Cheer Notes
     ========================================================================== */
  initMorale() {
    this.renderCheers();
    this.renderMemories();

    const cheerForm = document.getElementById('newCheerForm');
    if (cheerForm) {
      cheerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('cheerAuthorInput').value.trim() || '匿名熱血同學';
        const message = document.getElementById('cheerMessageInput').value.trim();
        const color = document.querySelector('input[name="cheerColor"]:checked')?.value || 'yellow';

        if (!message) return;

        const newCheer = {
          id: 'ch-' + Date.now(),
          author,
          color,
          message,
          time: '剛剛',
          likes: 1,
          liked: true
        };

        const cheers = window.storage.getCheers();
        cheers.unshift(newCheer);
        window.storage.saveCheers(cheers);

        this.renderCheers();
        this.updateStats();
        cheerForm.reset();
        window.sound.playWin();
        window.confetti.burst(80);
        this.showToast('💌 加油便利貼已貼上打氣樹！', 'success');
      });
    }
  }

  renderCheers() {
    const masonry = document.getElementById('cheerNotesMasonry');
    if (!masonry) return;

    const cheers = window.storage.getCheers();
    masonry.innerHTML = '';

    cheers.forEach(ch => {
      const note = document.createElement('div');
      note.className = `cheer-note note-${ch.color}`;
      note.innerHTML = `
        <div class="cheer-author-row">
          <div class="cheer-author">💬 ${ch.author}</div>
          <div class="cheer-time">${ch.time}</div>
        </div>
        <div class="cheer-message">${ch.message}</div>
        <div class="cheer-footer">
          <button class="like-btn ${ch.liked ? 'liked' : ''}" onclick="window.app.toggleLikeCheer('${ch.id}')">
            <span>❤️</span>
            <span>${ch.likes}</span>
          </button>
        </div>
      `;
      masonry.appendChild(note);
    });
  }

  toggleLikeCheer(cheerId) {
    window.sound.playClick();
    const cheers = window.storage.getCheers();
    const ch = cheers.find(c => c.id === cheerId);
    if (!ch) return;

    if (ch.liked) {
      ch.likes = Math.max(0, ch.likes - 1);
      ch.liked = false;
    } else {
      ch.likes++;
      ch.liked = true;
      window.sound.playScore();
    }

    window.storage.saveCheers(cheers);
    this.renderCheers();
  }

  renderMemories() {
    const grid = document.getElementById('memoriesGrid');
    if (!grid) return;

    const memories = window.storage.getMemories();
    grid.innerHTML = '';

    memories.forEach(m => {
      const card = document.createElement('div');
      card.className = 'memory-photo-card';
      card.innerHTML = `
        <div class="memory-img-box">
          <div class="memory-emoji-display">${m.emoji}</div>
        </div>
        <div class="memory-info">
          <div class="memory-tag">${m.tag}</div>
          <h4 class="memory-caption">${m.title}</h4>
          <div class="memory-date">🗓️ ${m.date}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     Submodules & Modals
     ========================================================================== */
  initSubmodules() {
    // 轉盤
    window.wheel = new window.LuckyWheel('wheelCanvas');

    // 團康工具箱
    window.tools = new window.ToolsManager();

    // 工具箱子分頁切換
    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSubtool(btn.dataset.tool);
      });
    });
  }

  initModals() {
    // 點擊背景或關閉按鈕
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('open');
        });
      }
    });

    // 關閉 winnerModal
    const closeWinnerBtn = document.getElementById('closeWinnerBtn');
    if (closeWinnerBtn) {
      closeWinnerBtn.addEventListener('click', () => {
        this.closeModal('winnerModal');
      });
    }
  }

  openModal(modalId) {
    window.sound.playClick();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */
  showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'coral' ? '⚠️' : '✨'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInToast 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// 頁面載入完成後啟動
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
