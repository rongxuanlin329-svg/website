/**
 * 康樂小幫手 - 命運大轉盤 (Lucky Wheel Engine)
 * 高度流暢 HTML5 Canvas 旋轉動畫、指針碰撞音效與五彩碎紙歡慶
 */

class LuckyWheel {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.items = window.storage.getWheelItems();
    this.colors = [
      '#ff5e57', '#ff9f43', '#10b981', '#06b6d4',
      '#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b'
    ];

    this.currentAngle = 0; // 當前弧度
    this.isSpinning = false;
    this.lastTickIndex = -1;

    // Retina display resolution scaling
    this.setupCanvas();
    this.draw();
    this.initUI();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const size = rect.width || 380;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = size;
    this.height = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size / 2 - 14;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const numItems = this.items.length;
    if (numItems === 0) {
      this.drawEmpty();
      return;
    }

    const arc = (2 * Math.PI) / numItems;

    // 繪製外環發光裝飾
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius + 6, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.restore();

    // 繪製每個扇形
    for (let i = 0; i < numItems; i++) {
      const angle = this.currentAngle + i * arc;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, angle, angle + arc);
      this.ctx.closePath();

      // 扇形填色
      this.ctx.fillStyle = this.colors[i % this.colors.length];
      this.ctx.fill();

      // 扇形邊界
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // 繪製文字
      this.ctx.translate(this.centerX, this.centerY);
      this.ctx.rotate(angle + arc / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 15px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
      this.ctx.shadowBlur = 4;

      // 文字字數保護與截斷
      let text = this.items[i];
      if (text.length > 9) text = text.substring(0, 8) + '…';
      this.ctx.fillText(text, this.radius - 20, 5);

      this.ctx.restore();
    }

    // 繪製中心指針輪轂 (Hub)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 26, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 10, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#ff5e57';
    this.ctx.fill();
    this.ctx.restore();
  }

  drawEmpty() {
    this.ctx.save();
    this.ctx.fillStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '16px "Noto Sans TC", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('請新增轉盤選項', this.centerX, this.centerY);
    this.ctx.restore();
  }

  spin() {
    if (this.isSpinning || this.items.length < 2) return;
    this.isSpinning = true;
    window.sound.playClick();

    // 隨機選中一個項目
    const selectedIndex = Math.floor(Math.random() * this.items.length);
    const numItems = this.items.length;
    const arc = (2 * Math.PI) / numItems;

    // 指針固定在最頂部 ( -Math.PI / 2 )
    // 計算為了讓 selectedIndex 停在 -Math.PI / 2 所需的目標角度
    const extraRounds = 5 + Math.floor(Math.random() * 4); // 旋轉 5~8 圈
    // 扇形內部隨機微調偏移（避免每次停在扇形死板正中心）
    const randomOffsetInSlice = (Math.random() * 0.7 + 0.15) * arc;
    const targetSliceAngle = (3 * Math.PI / 2) - (selectedIndex * arc + randomOffsetInSlice);
    
    // 計算總旋轉弧度
    const fullRotations = extraRounds * 2 * Math.PI;
    const startAngle = this.currentAngle % (2 * Math.PI);
    let delta = (targetSliceAngle - startAngle) % (2 * Math.PI);
    if (delta < 0) delta += 2 * Math.PI;
    const totalRotation = fullRotations + delta;

    const duration = 4200; // 旋轉持續 4.2 秒
    const startTime = performance.now();

    const pointerEl = document.getElementById('wheelPointer');

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic 減速曲線
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentAngle = startAngle + totalRotation * ease;

      // 檢查是否跨越扇形，觸發音效與指針抖動
      const currentNormalAngle = ((3 * Math.PI / 2) - (this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(currentNormalAngle / arc) % numItems;

      if (currentSlice !== this.lastTickIndex) {
        this.lastTickIndex = currentSlice;
        window.sound.playTick();
        if (pointerEl) {
          pointerEl.style.transform = 'translateX(-50%) rotate(-12deg)';
          setTimeout(() => {
            if (pointerEl) pointerEl.style.transform = 'translateX(-50%) rotate(0deg)';
          }, 60);
        }
      }

      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.onSpinEnd(this.items[selectedIndex]);
      }
    };

    requestAnimationFrame(animate);
  }

  onSpinEnd(winner) {
    window.sound.playWin();
    window.confetti.burst(120);

    // 顯示勝利彈跳對話框
    setTimeout(() => {
      this.showWinnerModal(winner);
    }, 400);
  }

  showWinnerModal(winner) {
    const modal = document.getElementById('winnerModal');
    const winnerText = document.getElementById('winnerText');
    if (modal && winnerText) {
      winnerText.textContent = winner;
      modal.classList.add('open');
    } else {
      alert(`🎉 命運結果揭曉：【${winner}】！`);
    }
  }

  setItems(newItems) {
    this.items = [...newItems];
    window.storage.saveWheelItems(this.items);
    this.draw();
    this.renderItemsList();
  }

  addItem(itemText) {
    if (!itemText || !itemText.trim()) return;
    this.items.push(itemText.trim());
    window.storage.saveWheelItems(this.items);
    this.draw();
    this.renderItemsList();
  }

  removeItem(index) {
    if (this.items.length <= 2) {
      window.app.showToast('轉盤至少需要 2 個選項喔！', 'coral');
      return;
    }
    this.items.splice(index, 1);
    window.storage.saveWheelItems(this.items);
    this.draw();
    this.renderItemsList();
  }

  renderItemsList() {
    const listEl = document.getElementById('wheelItemsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <span>${item}</span>
        <button class="item-delete-btn" title="刪除" onclick="window.wheel.removeItem(${index})">✕</button>
      `;
      listEl.appendChild(row);
    });
  }

  initUI() {
    this.renderItemsList();

    // 旋轉按鈕
    const spinBtn = document.getElementById('spinWheelBtn');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => this.spin());
    }

    // 新增項目按鈕 & 表單
    const addBtn = document.getElementById('addWheelItemBtn');
    const inputEl = document.getElementById('newWheelItemInput');
    if (addBtn && inputEl) {
      const doAdd = () => {
        if (inputEl.value.trim()) {
          this.addItem(inputEl.value.trim());
          inputEl.value = '';
        }
      };
      addBtn.addEventListener('click', doAdd);
      inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doAdd();
      });
    }

    // 預設方案點擊切換
    const presets = window.storage.getWheelPresets();
    const presetContainer = document.getElementById('wheelPresetsContainer');
    if (presetContainer) {
      presetContainer.innerHTML = '';
      Object.keys(presets).forEach((key) => {
        const p = presets[key];
        const chip = document.createElement('button');
        chip.className = 'preset-chip';
        chip.textContent = p.name;
        chip.addEventListener('click', () => {
          document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.setItems(p.items);
          window.app.showToast(`已載入：${p.name}`, 'success');
        });
        presetContainer.appendChild(chip);
      });
    }
  }
}

window.LuckyWheel = LuckyWheel;
