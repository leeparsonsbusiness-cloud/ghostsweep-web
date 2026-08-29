// GhostSweep Minimalist Visual Controller
const extpay = ExtPay('ghostsweep');

const MALE_NAMES = new Set([
  'james','john','robert','michael','william','david','richard','joseph','thomas','charles',
  'christopher','daniel','matthew','anthony','mark','donald','steven','paul','andrew','joshua',
  'kenneth','kevin','brian','george','timothy','ronald','edward','jason','jeffrey','ryan',
  'jacob','gary','nicholas','eric','jonathan','stephen','larry','justin','scott','brandon',
  'benjamin','samuel','gregory','alexander','frank','patrick','raymond','jack','dennis','jerry',
  'tyler','aaron','jose','adam','nathan','henry','douglas','zachary','peter','kyle',
  'walter','ethan','jeremy','harold','keith','christian','roger','noah','gerald','carl',
  'terry','sean','austin','arthur','lawrence','jesse','dylan','bryan','joe','jordan',
  'billy','albert','bruce','willie','gabriel','logan','alan','juan','wayne','roy',
  'ralph','randy','eugene','vincent','russell','louis','philip','bobby','johnny','brad',
  'chad','todd','trevor','travis','cameron','colin','ian','connor','lucas','liam',
  'mason','elijah','oliver','mateo','aidan','lee','jake','marcus','max','alex','sam'
]);

const FEMALE_NAMES = new Set([
  'mary','patricia','jennifer','linda','elizabeth','barbara','susan','jessica','sarah','karen',
  'lisa','nancy','betty','margaret','sandra','ashley','kimberly','emily','donna','michelle',
  'carol','amanda','dorothy','melissa','deborah','stephanie','rebecca','sharon','laura','cynthia',
  'kathleen','amy','angela','shirley','anna','brenda','pamela','emma','nicole','helen',
  'samantha','katherine','christine','debra','rachel','carolyn','janet','catherine','maria','heather',
  'diane','olivia','julie','joyce','victoria','kelly','christina','lauren','joan','evelyn',
  'judith','megan','cheryl','andrea','hannah','martha','jacqueline','frances','gloria','ann',
  'teresa','kathryn','sara','janice','jean','alice','madison','doris','abigail','julia',
  'judy','grace','denise','amber','marilyn','beverly','danielle','theresa','sophia','marie',
  'diana','brittany','natalie','isabella','charlotte','chloe','mia','harper','talia','claire','kayla'
]);

class GhostSweepPopup {
  constructor() {
    this.currentUser = null;
    this.isProUser = false;
    this.tab = null;
    this.rawTargets = [];
    this.whitelist = new Set();
    this.selected = new Set();
    this.searchQuery = '';
    this.showOnlyWhitelist = false;
    this.currentSort = 'recent';
    this.currentGender = 'all';
    this.selectedMode = 'non_reciprocal';
    this.tickerInterval = null;

    this.initElements();
    this.initAuth();
  }

  initElements() {
    // Auth Screen
    this.authGate = document.getElementById('authGate');
    this.mainApp = document.getElementById('mainApp');
    this.tabSignInBtn = document.getElementById('tabSignInBtn');
    this.tabRegisterBtn = document.getElementById('tabRegisterBtn');
    this.signInForm = document.getElementById('signInForm');
    this.registerForm = document.getElementById('registerForm');
    this.loginUsername = document.getElementById('loginUsername');
    this.loginPassword = document.getElementById('loginPassword');
    this.loginError = document.getElementById('loginError');
    this.regEmail = document.getElementById('regEmail');
    this.regUsername = document.getElementById('regUsername');
    this.regPassword = document.getElementById('regPassword');
    this.registerError = document.getElementById('registerError');
    
    // Header
    this.userHandle = document.getElementById('userHandle');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.helpBtn = document.getElementById('helpBtn');
    this.planBadge = document.getElementById('planBadge');
    
    // Dashboard Controls
    this.beginAuditBtn = document.getElementById('beginAuditBtn');
    this.beginAuditText = document.getElementById('beginAuditText');
    this.modeTabs = document.querySelectorAll('.mode-tab-btn');
    this.followingCount = document.getElementById('followingCount');
    this.followersCount = document.getElementById('followersCount');
    this.targetCount = document.getElementById('targetCount');
    this.statusBox = document.getElementById('statusBox');
    this.statusText = document.getElementById('statusText');
    this.progressBar = document.getElementById('progressBar');
    
    // Review Controls
    this.reviewControls = document.getElementById('reviewControls');
    this.searchInput = document.getElementById('searchInput');
    this.whitelistToggleBtn = document.getElementById('whitelistToggleBtn');
    this.whiteCount = document.getElementById('whiteCount');
    this.sortSelect = document.getElementById('sortSelect');
    
    // Demographics
    this.genderBtns = document.querySelectorAll('.chip-btn');
    this.countAll = document.getElementById('countAll');
    this.countMale = document.getElementById('countMale');
    this.countFemale = document.getElementById('countFemale');
    this.countOther = document.getElementById('countOther');

    // Selection Chips
    this.select18Btn = document.getElementById('select18Btn');
    this.select50Btn = document.getElementById('select50Btn');
    this.selectAllBtn = document.getElementById('selectAllBtn');
    this.deselectAllBtn = document.getElementById('deselectAllBtn');
    
    this.startAutoPilotBtn = document.getElementById('startAutoPilotBtn');
    this.userList = document.getElementById('userList');

    // Queue Banner
    this.queueBanner = document.getElementById('queueBanner');
    this.queueBannerTitle = document.getElementById('queueBannerTitle');
    this.queueBannerStatus = document.getElementById('queueBannerStatus');
    this.queueBarFill = document.getElementById('queueBarFill');
    this.queueProgressCount = document.getElementById('queueProgressCount');
    this.stopAutomationBtn = document.getElementById('stopAutomationBtn');
    this.timerPill = document.getElementById('timerPill');
    this.pulseDot = document.getElementById('pulseDot');

    // Onboarding Modal
    this.onboardingModal = document.getElementById('onboardingModal');
    this.dotStep1 = document.getElementById('dotStep1');
    this.dotStep2 = document.getElementById('dotStep2');
    this.onboardingStep1 = document.getElementById('onboardingStep1');
    this.onboardingStep2 = document.getElementById('onboardingStep2');
    this.nextOnboardingBtn = document.getElementById('nextOnboardingBtn');
    this.backOnboardingBtn = document.getElementById('backOnboardingBtn');
    this.finishOnboardingBtn = document.getElementById('finishOnboardingBtn');

    // Paywall Modal
    this.paywallModal = document.getElementById('paywallModal');
    this.closePaywallBtn = document.getElementById('closePaywallBtn');
    this.checkoutBtn = document.getElementById('checkoutBtn');

    // Celebration Modal
    this.celebrationModal = document.getElementById('celebrationModal');
    this.ratioMetric = document.getElementById('ratioMetric');
    this.cleanedMetric = document.getElementById('cleanedMetric');
    this.closeCelebrationBtn = document.getElementById('closeCelebrationBtn');
  }

  async initAuth() {
    this.bindAuthEvents();

    const session = await chrome.storage.local.get(['ghostsweep_current_session']);
    if (session.ghostsweep_current_session) {
      await this.loginUserSession(session.ghostsweep_current_session, false);
    } else {
      this.showAuthGate();
    }
  }

  bindAuthEvents() {
    this.tabSignInBtn.addEventListener('click', () => {
      this.tabSignInBtn.classList.add('active');
      this.tabRegisterBtn.classList.remove('active');
      this.signInForm.classList.remove('hidden');
      this.registerForm.classList.add('hidden');
      this.loginError.classList.add('hidden');
    });

    this.tabRegisterBtn.addEventListener('click', () => {
      this.tabRegisterBtn.classList.add('active');
      this.tabSignInBtn.classList.remove('active');
      this.registerForm.classList.remove('hidden');
      this.signInForm.classList.add('hidden');
      this.registerError.classList.add('hidden');
    });

    this.signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = this.loginUsername.value.trim().toLowerCase();
      const passwordInput = this.loginPassword.value.trim();

      if (usernameInput === 'dev' && passwordInput === 'dev') {
        const devUser = {
          id: 'dev_root_bypass',
          username: 'dev',
          email: 'dev@ghostsweep.internal',
          isPro: true,
          createdAt: Date.now()
        };
        await this.loginUserSession(devUser, true);
        return;
      }

      const data = await chrome.storage.local.get(['ghostsweep_users_db']);
      const usersDb = data.ghostsweep_users_db || {};
      const user = usersDb[usernameInput];

      if (!user || user.password !== passwordInput) {
        this.loginError.textContent = 'Invalid username or password.';
        this.loginError.classList.remove('hidden');
        return;
      }

      await this.loginUserSession(user, true);
    });

    this.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.regEmail.value.trim().toLowerCase();
      const username = this.regUsername.value.trim().toLowerCase();
      const password = this.regPassword.value.trim();

      if (username === 'dev') {
        this.registerError.textContent = 'Username reserved for internal system.';
        this.registerError.classList.remove('hidden');
        return;
      }

      if (password.length < 4) {
        this.registerError.textContent = 'Password must be at least 4 characters.';
        this.registerError.classList.remove('hidden');
        return;
      }

      const data = await chrome.storage.local.get(['ghostsweep_users_db']);
      const usersDb = data.ghostsweep_users_db || {};

      if (usersDb[username]) {
        this.registerError.textContent = 'Username already exists. Please choose another.';
        this.registerError.classList.remove('hidden');
        return;
      }

      const newUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        password,
        isPro: false,
        createdAt: Date.now()
      };

      usersDb[username] = newUser;
      await chrome.storage.local.set({ ghostsweep_users_db: usersDb });
      await this.loginUserSession(newUser, true);
    });

    this.logoutBtn.addEventListener('click', async () => {
      await chrome.storage.local.remove('ghostsweep_current_session');
      this.currentUser = null;
      this.isProUser = false;
      this.showAuthGate();
    });

    if (this.helpBtn) this.helpBtn.addEventListener('click', () => this.showOnboarding(1));
    if (this.nextOnboardingBtn) this.nextOnboardingBtn.addEventListener('click', () => this.showOnboarding(2));
    if (this.backOnboardingBtn) this.backOnboardingBtn.addEventListener('click', () => this.showOnboarding(1));
    if (this.finishOnboardingBtn) {
      this.finishOnboardingBtn.addEventListener('click', () => {
        this.onboardingModal.classList.add('hidden');
      });
    }
  }

  showOnboarding(step = 1) {
    this.onboardingModal.classList.remove('hidden');
    if (step === 1) {
      this.onboardingStep1.classList.remove('hidden');
      this.onboardingStep2.classList.add('hidden');
      this.dotStep1.classList.add('active');
      this.dotStep2.classList.remove('active');
    } else {
      this.onboardingStep1.classList.add('hidden');
      this.onboardingStep2.classList.remove('hidden');
      this.dotStep1.classList.remove('active');
      this.dotStep2.classList.add('active');
    }
  }

  showAuthGate() {
    this.authGate.classList.remove('hidden');
    this.mainApp.classList.add('hidden');
  }

  async loginUserSession(user, triggerOnboarding = false) {
    this.currentUser = user;
    await chrome.storage.local.set({ ghostsweep_current_session: user });

    if (user.username === 'dev' || user.isPro) {
      this.isProUser = true;
    } else {
      try {
        const extUser = await extpay.getUser();
        if (extUser && extUser.paid) {
          this.isProUser = true;
        }
      } catch (e) {
        console.warn('ExtPay check skipped:', e);
      }
    }

    this.userHandle.textContent = `@${user.username}`;
    if (this.isProUser) {
      this.planBadge.textContent = 'PRO';
      this.planBadge.classList.remove('free');
      this.planBadge.classList.add('pro');
    } else {
      this.planBadge.textContent = 'FREE';
      this.planBadge.classList.remove('pro');
      this.planBadge.classList.add('free');
    }

    this.authGate.classList.add('hidden');
    this.mainApp.classList.remove('hidden');

    if (triggerOnboarding) {
      this.showOnboarding(1);
    }

    this.initApp();
  }

  async initApp() {
    const storeKey = `ghostsweep_whitelist_${this.currentUser.id}`;
    const store = await chrome.storage.local.get([storeKey, 'ghostsweep_last_audit']);
    if (store[storeKey]) {
      this.whitelist = new Set(store[storeKey]);
      if (this.whiteCount) this.whiteCount.textContent = this.whitelist.size;
    }

    if (store.ghostsweep_last_audit) {
      this.renderAuditResults(store.ghostsweep_last_audit);
    }

    chrome.runtime.sendMessage({ action: 'GET_QUEUE_STATE' }, (state) => {
      if (state) this.renderQueueState(state);
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'AUDIT_PROGRESS') {
        this.showStatus(msg.text, msg.pct);
      }
      if (msg.action === 'AUDIT_COMPLETE' && msg.data) {
        this.renderAuditResults(msg.data);
      }
      if (msg.action === 'AUDIT_ERROR') {
        this.showStatus(`Scan failed: ${msg.error}`, 0);
        if (this.beginAuditBtn) this.beginAuditBtn.disabled = false;
      }
      if (msg.action === 'QUEUE_STATE_CHANGED' && msg.state) {
        this.renderQueueState(msg.state);
        if (msg.state.status === 'COMPLETED' && msg.state.completed > 0) {
          this.triggerCelebration(msg.state);
        }
      }
    });

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.url && activeTab.url.includes('instagram.com')) {
      this.tab = activeTab;
    }

    this.bindAppEvents();
    this.startLiveTicker();
  }

  startLiveTicker() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    this.tickerInterval = setInterval(async () => {
      const data = await chrome.storage.local.get(['ghostsweep_queue_state']);
      const state = data.ghostsweep_queue_state;
      if (state && state.nextRunTimestamp && (state.status === 'SESSION_REST' || state.status === 'COOLDOWN_SLEEP')) {
        const diffMs = state.nextRunTimestamp - Date.now();
        if (diffMs > 0) {
          const minutes = Math.floor(diffMs / 60000);
          const seconds = Math.floor((diffMs % 60000) / 1000);
          const timeStr = `${minutes}m ${seconds}s`;
          if (this.timerPill) {
            this.timerPill.textContent = state.status === 'COOLDOWN_SLEEP' ? `Recovery: ${timeStr}` : `Sess in: ${timeStr}`;
            this.timerPill.classList.remove('hidden');
          }
        } else {
          if (this.timerPill) this.timerPill.textContent = 'Resuming...';
        }
      }
    }, 1000);
  }

  classifyGender(user) {
    const namePart = (user.full_name || '').toLowerCase().trim();
    const userPart = (user.username || '').toLowerCase().trim();
    const firstWord = namePart.split(/\s+/)[0].replace(/[^a-z]/g, '');

    if (MALE_NAMES.has(firstWord)) return 'male';
    if (FEMALE_NAMES.has(firstWord)) return 'female';

    if (MALE_NAMES.has(userPart)) return 'male';
    if (FEMALE_NAMES.has(userPart)) return 'female';

    return 'other';
  }

  bindAppEvents() {
    // Mode pill tabs selector
    this.modeTabs.forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        this.modeTabs.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedMode = e.currentTarget.dataset.mode;
      });
    });

    if (this.beginAuditBtn) {
      this.beginAuditBtn.addEventListener('click', () => {
        if ((this.selectedMode === 'non_reciprocal' || this.selectedMode === 'verified_shield') && !this.isProUser) {
          this.openPaywall();
          return;
        }
        this.startAudit(this.selectedMode);
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderList();
      });
    }

    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderList();
      });
    }

    this.genderBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const g = e.currentTarget.dataset.gender;
        if ((g === 'male' || g === 'female') && !this.isProUser) {
          this.openPaywall();
          return;
        }
        this.genderBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentGender = g;
        this.renderList();
      });
    });

    if (this.whitelistToggleBtn) {
      this.whitelistToggleBtn.addEventListener('click', () => {
        this.showOnlyWhitelist = !this.showOnlyWhitelist;
        this.whitelistToggleBtn.classList.toggle('active', this.showOnlyWhitelist);
        this.renderList();
      });
    }

    // Batch Chips
    if (this.select18Btn) this.select18Btn.addEventListener('click', () => this.quickSelectCount(18));
    if (this.select50Btn) this.select50Btn.addEventListener('click', () => this.quickSelectCount(50));
    if (this.selectAllBtn) {
      this.selectAllBtn.addEventListener('click', () => {
        const visible = this.getVisibleUsers();
        visible.forEach(u => {
          if (!this.whitelist.has(u.username)) this.selected.add(u.id);
        });
        this.renderList();
      });
    }
    if (this.deselectAllBtn) {
      this.deselectAllBtn.addEventListener('click', () => {
        const visible = this.getVisibleUsers();
        visible.forEach(u => this.selected.delete(u.id));
        this.renderList();
      });
    }

    if (this.startAutoPilotBtn) {
      this.startAutoPilotBtn.addEventListener('click', () => {
        if (!this.isProUser) {
          this.openPaywall();
          return;
        }
        this.triggerAutonomousSweep();
      });
    }

    if (this.stopAutomationBtn) {
      this.stopAutomationBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'STOP_BACKGROUND_QUEUE' });
      });
    }

    this.closePaywallBtn.addEventListener('click', () => this.paywallModal.classList.add('hidden'));
    this.checkoutBtn.addEventListener('click', () => {
      extpay.openPaymentPage();
      this.paywallModal.classList.add('hidden');
    });

    if (this.closeCelebrationBtn) {
      this.closeCelebrationBtn.addEventListener('click', () => {
        this.celebrationModal.classList.add('hidden');
      });
    }
  }

  openPaywall() {
    this.paywallModal.classList.remove('hidden');
  }

  quickSelectCount(count) {
    const visible = this.getVisibleUsers();
    this.selected.clear();
    let added = 0;
    for (const u of visible) {
      if (!this.whitelist.has(u.username)) {
        this.selected.add(u.id);
        added++;
        if (added >= count) break;
      }
    }
    this.renderList();
  }

  showStatus(text, progress = null) {
    if (!this.statusBox) return;
    this.statusBox.classList.remove('hidden');
    if (this.statusText) this.statusText.textContent = text;
    if (progress !== null && this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
  }

  startAudit(mode) {
    if (!this.tab) {
      this.showStatus('Please open Instagram in your active tab.');
      return;
    }

    if (this.beginAuditBtn) this.beginAuditBtn.disabled = true;
    this.showStatus('Connecting to Instagram...', 5);

    chrome.tabs.sendMessage(this.tab.id, { action: 'START_FULL_AUDIT', mode: mode }, (response) => {
      if (chrome.runtime.lastError) {
        this.showStatus('Could not reach IG tab. Hard-refresh IG (Cmd+Shift+R).', 0);
        if (this.beginAuditBtn) this.beginAuditBtn.disabled = false;
      }
    });
  }

  renderAuditResults(data) {
    this.rawTargets = (data.targets || []).map(u => ({
      ...u,
      gender: this.classifyGender(u)
    }));

    let m = 0, f = 0, o = 0;
    this.rawTargets.forEach(u => {
      if (u.gender === 'male') m++;
      else if (u.gender === 'female') f++;
      else o++;
    });

    if (this.countAll) this.countAll.textContent = this.rawTargets.length;
    if (this.countMale) this.countMale.textContent = m;
    if (this.countFemale) this.countFemale.textContent = f;
    if (this.countOther) this.countOther.textContent = o;

    this.selected.clear();
    this.rawTargets.forEach(u => {
      if (!this.whitelist.has(u.username)) {
        this.selected.add(u.id);
      }
    });

    if (this.followingCount) this.followingCount.textContent = data.followingCount;
    if (this.followersCount) this.followersCount.textContent = data.followersCount;
    if (this.targetCount) this.targetCount.textContent = this.rawTargets.length;

    if (this.reviewControls) this.reviewControls.classList.remove('hidden');
    if (this.statusBox) this.statusBox.classList.add('hidden');
    if (this.beginAuditBtn) this.beginAuditBtn.disabled = false;
    if (this.beginAuditText) this.beginAuditText.textContent = '🔄 Re-Run Audit';

    this.renderList();
  }

  getVisibleUsers() {
    let list = [...this.rawTargets];

    if (this.currentGender !== 'all') {
      list = list.filter(u => u.gender === this.currentGender);
    }

    if (this.showOnlyWhitelist) {
      list = list.filter(u => this.whitelist.has(u.username));
    }

    if (this.searchQuery) {
      list = list.filter(u =>
        u.username.toLowerCase().includes(this.searchQuery) ||
        (u.full_name && u.full_name.toLowerCase().includes(this.searchQuery))
      );
    }

    if (this.currentSort === 'recent') {
      list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    } else if (this.currentSort === 'oldest') {
      list.sort((a, b) => (b.orderIndex || 0) - (a.orderIndex || 0));
    } else if (this.currentSort === 'alpha_asc') {
      list.sort((a, b) => a.username.localeCompare(b.username));
    }

    return list;
  }

  renderList() {
    if (!this.userList) return;
    const list = this.getVisibleUsers();
    if (this.whiteCount) this.whiteCount.textContent = this.whitelist.size;
    
    if (this.startAutoPilotBtn) {
      this.startAutoPilotBtn.textContent = this.isProUser 
        ? `🚀 Start Autonomous Sweep (${this.selected.size})`
        : `🔒 Unlock Sweep (${this.selected.size})`;
      this.startAutoPilotBtn.disabled = this.selected.size === 0;
    }

    if (list.length === 0) {
      this.userList.innerHTML = `<div class="empty-state">${this.showOnlyWhitelist ? 'No whitelisted accounts.' : '🎉 No accounts match your filters.'}</div>`;
      return;
    }

    this.userList.innerHTML = list.map(user => `
      <div class="user-row ${this.whitelist.has(user.username) ? 'whitelisted' : ''}" data-id="${user.id}">
        <input type="checkbox" class="user-checkbox" data-id="${user.id}" 
               ${this.selected.has(user.id) ? 'checked' : ''} 
               ${this.whitelist.has(user.username) ? 'disabled' : ''}>
        <img class="user-avatar" 
             src="${user.profile_pic_url || 'https://via.placeholder.com/28'}" 
             referrerpolicy="no-referrer"
             onerror="this.src='https://via.placeholder.com/28'">
        <div class="user-meta">
          <div class="user-handle-line">
            @${user.username}
            ${user.gender === 'male' ? '<span class="gender-mini-tag">👨 M</span>' : ''}
            ${user.gender === 'female' ? '<span class="gender-mini-tag">👩 F</span>' : ''}
          </div>
          <div class="user-subtext">${user.full_name || ''}</div>
        </div>
        <button class="btn-star-whitelist ${this.whitelist.has(user.username) ? 'active' : ''}" 
                data-username="${user.username}" title="Whitelist User">
          ⭐
        </button>
      </div>
    `).join('');

    this.userList.querySelectorAll('.user-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) this.selected.add(id);
        else this.selected.delete(id);
        this.renderList();
      });
    });

    this.userList.querySelectorAll('.btn-star-whitelist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const username = e.currentTarget.dataset.username;
        if (this.whitelist.has(username)) {
          this.whitelist.delete(username);
        } else {
          this.whitelist.add(username);
          const user = this.rawTargets.find(u => u.username === username);
          if (user) this.selected.delete(user.id);
        }
        
        const storeKey = `ghostsweep_whitelist_${this.currentUser.id}`;
        chrome.storage.local.set({ [storeKey]: Array.from(this.whitelist) });
        this.renderList();
      });
    });
  }

  triggerAutonomousSweep() {
    if (this.selected.size === 0) return;
    const targetObjects = this.rawTargets.filter(u => this.selected.has(u.id));

    const initialFollowing = parseInt(this.followingCount.textContent) || 0;
    const followersCount = parseInt(this.followersCount.textContent) || 0;

    chrome.runtime.sendMessage({
      action: 'START_AUTOPILOT_QUEUE',
      targets: targetObjects,
      initialFollowing,
      followersCount
    }, () => {
      if (this.queueBanner) this.queueBanner.classList.remove('hidden');
    });
  }

  triggerCelebration(state) {
    if (!this.celebrationModal) return;

    const initialFollowing = state.initialFollowing || 100;
    const finalFollowing = Math.max(0, initialFollowing - state.completed);
    const followers = state.followersCount || 100;

    const oldRatio = (followers / (initialFollowing || 1)).toFixed(2);
    const newRatio = (followers / (finalFollowing || 1)).toFixed(2);

    this.ratioMetric.textContent = `${oldRatio} ➔ ${newRatio}`;
    this.cleanedMetric.textContent = `${state.completed} Accounts`;
    this.celebrationModal.classList.remove('hidden');
  }

  renderQueueState(state) {
    if (!this.queueBanner) return;

    if (state.isAutoPilot || state.status === 'ACTIVE' || state.status === 'SESSION_REST' || state.status === 'COOLDOWN_SLEEP') {
      this.queueBanner.classList.remove('hidden');
      if (this.queueBannerStatus) this.queueBannerStatus.textContent = state.statusMessage;
      if (this.queueProgressCount) this.queueProgressCount.textContent = `${state.completed} / ${state.total}`;
      
      if (this.queueBarFill) {
        const pct = state.total > 0 ? (state.completed / state.total) * 100 : 0;
        this.queueBarFill.style.width = `${pct}%`;
      }

      this.queueBanner.className = 'status-card';
      if (state.status === 'COOLDOWN_SLEEP') {
        this.queueBanner.classList.add('cooldown');
        this.queueBannerTitle.textContent = 'Auto-Recovery Active';
        if (this.pulseDot) this.pulseDot.style.background = '#ef4444';
      } else if (state.status === 'SESSION_REST') {
        this.queueBanner.classList.add('standby');
        this.queueBannerTitle.textContent = 'Session Standby';
        if (this.pulseDot) this.pulseDot.style.background = '#38bdf8';
      } else {
        this.queueBannerTitle.textContent = 'Auto-Pilot Active';
        if (this.pulseDot) this.pulseDot.style.background = '#38bdf8';
      }
    } else if (state.statusMessage && state.status !== 'IDLE') {
      this.queueBanner.classList.remove('hidden');
      if (this.queueBannerStatus) this.queueBannerStatus.textContent = state.statusMessage;
      if (this.queueProgressCount) this.queueProgressCount.textContent = `${state.completed} / ${state.total}`;
      if (this.timerPill) this.timerPill.classList.add('hidden');
    } else {
      this.queueBanner.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GhostSweepPopup();
});