// Whitelist Manager
GhostSweepUI.prototype.initWhitelist = async function() {
    const stored = await chrome.storage.local.get('ghostsweepWhitelist');
    this.whitelist = new Set(stored.ghostsweepWhitelist || []);
};

GhostSweepUI.prototype.saveWhitelist = function() {
    return chrome.storage.local.set({
        ghostsweepWhitelist: Array.from(this.whitelist)
    });
};

GhostSweepUI.prototype.isWhitelisted = function(username) {
    return this.whitelist.has(username.toLowerCase());
};

GhostSweepUI.prototype.toggleWhitelist = async function(username) {
    const lowerUser = username.toLowerCase();
    
    if (this.whitelist.has(lowerUser)) {
        this.whitelist.delete(lowerUser);
    } else {
        this.whitelist.add(lowerUser);
        // Automatically deselect whitelisted users
        this.selectedUsers.delete(username);
    }
    
    await this.saveWhitelist();
    return !this.whitelist.has(lowerUser); // Returns new state
};
// Additional GhostSweep UI Helper Methods and Functions

// Add to GhostSweepUI class
GhostSweepUI.prototype.simulateProgress = async function() {
    const steps = [
        { progress: 40, message: 'Scanning recent posts...' },
        { progress: 60, message: 'Analyzing engagement patterns...' },
        { progress: 80, message: 'Identifying low-engagement followers...' },
        { progress: 95, message: 'Preparing results...' }
    ];
    
    for (let step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.showStatus(step.message, 'loading');
        this.showProgress(step.progress);
    }
};

GhostSweepUI.prototype.generateMockResults = function(scanDepth, threshold) {
    const mockUsers = [
        'ghost_follower_1', 'inactive_user_23', 'bot_account_56', 'fake_profile_89',
        'spam_account_12', 'dead_follower_34', 'ghost_user_67', 'inactive_bot_90',
        'fake_engagement_45', 'zombie_follower_78', 'silent_ghost_01', 'bot_farm_23',
        'inactive_spam_56', 'ghost_profile_89', 'dead_account_12'
    ];
    
    this.auditResults = mockUsers.slice(0, Math.min(15, scanDepth / 3)).map((username, index) => ({
        username,
        engagementRate: Math.random() * threshold * 0.8, // Below threshold
        totalLikes: Math.floor(Math.random() * threshold * 0.8),
        totalComments: Math.floor(Math.random() * 3),
        isBot: Math.random() > 0.7,
        isInactive: Math.random() > 0.6,
        selected: true
    }));
    
    this.selectedUsers = new Set(this.auditResults.map(user => user.username));
};

GhostSweepUI.prototype.displayResults = function() {
    const resultsSection = document.getElementById('resultsSection');
    const resultsSummary = document.getElementById('resultsSummary');
    
    // Set up tab filters
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.filterResults(tab.dataset.filter);
        });
    });
    
    // Initialize queue panel
    document.getElementById('pauseQueue')?.addEventListener(
        'click', 
        () => this.toggleQueuePause()
    );
    const resultsContent = document.getElementById('resultsContent');
    
    // Show summary
    const totalUsers = this.auditResults.length;
    const selectedCount = this.selectedUsers.size;
    
    resultsSummary.innerHTML = `
        <p><strong>${totalUsers}</strong> low-engagement followers found</p>
        <p><strong>${selectedCount}</strong> selected for cleanup</p>
    `;
    
    // Show user list
    resultsContent.innerHTML = this.auditResults.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="username">@${user.username}</div>
                <div class="engagement">${user.totalLikes} likes, ${user.totalComments} comments</div>
            </div>
            <div class="user-actions">
                <input type="checkbox" ${user.selected ? 'checked' : ''} 
                       onchange="window.ghostSweep.toggleUser('${user.username}')" />
            </div>
        </div>
    `).join('');
    
    this.hideStatus();
    this.hideConfig();
    resultsSection.classList.remove('hidden');
    
    // Make this instance accessible for checkbox events
    window.ghostSweep = this;
};

GhostSweepUI.prototype.toggleUser = function(username) {
    if (this.selectedUsers.has(username)) {
        this.selectedUsers.delete(username);
    } else {
        this.selectedUsers.add(username);
    }
    
    // Update summary
    const resultsSummary = document.getElementById('resultsSummary');
    const totalUsers = this.auditResults.length;
    const selectedCount = this.selectedUsers.size;
    
    resultsSummary.innerHTML = `
        <p><strong>${totalUsers}</strong> low-engagement followers found</p>
        <p><strong>${selectedCount}</strong> selected for cleanup</p>
    `;
};

// Action Queue System with Safety Controls
GhostSweepUI.prototype.performCleanup = async function() {
    if (this.selectedUsers.size === 0) {
        this.showStatus('No users selected for cleanup', 'error');
        return;
    }
    
    // Create interruptible queue
    this.actionQueue = {
        users: Array.from(this.selectedUsers),
        completed: 0,
        errors: 0,
        running: true,
        lastActionTime: 0
    };
    
    // Update UI for action mode
    document.getElementById('cleanupBtn').classList.add('hidden');
    this.showEmergencyStop();
    
    // Process queue
    await this.processActionQueue();
};

GhostSweepUI.prototype.processActionQueue = async function() {
    if (!this.actionQueue.running) return;
    
    const config = {
        maxActions: 25, // Safe default limit
        minDelay: 15000, // 15 seconds
        maxDelay: 35000 // 35 seconds
    };
    
    try {
        while (this.actionQueue.running && 
               this.actionQueue.completed < this.actionQueue.users.length &&
               this.actionQueue.completed < config.maxActions) {
                
            const user = this.actionQueue.users[this.actionQueue.completed];
            
            // Check whitelist
            if (this.isWhitelisted(user)) {
                this.actionQueue.completed++;
                continue;
            }
            
            // Calculate randomized delay
            const timeSinceLast = Date.now() - this.actionQueue.lastActionTime;
            const delay = Math.max(0, 
                config.minDelay + 
                Math.random() * (config.maxDelay - config.minDelay) - 
                timeSinceLast
            );
            
            if (delay > 0) {
                this.showStatus(`Waiting ${Math.round(delay/1000)}s before next action...`, 'loading');
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            // Perform action
            this.showStatus(`Processing @${user}...`, 'loading');
            this.actionQueue.lastActionTime = Date.now();
            
            try {
                const result = await chrome.scripting.executeScript({
                    target: { tabId: this.currentTab.id },
                    func: (username) => {
                        return window.GhostSweepAPI.unfollowUser(username);
                    },
                    args: [user]
                });
                
                this.actionQueue.completed++;
                this.updateActionProgress();
                
            } catch (error) {
                this.actionQueue.errors++;
                
                if (error.message.includes('400') || error.message.includes('checkpoint')) {
                    // Critical error - stop immediately
                    this.showStatus(
                        'Action blocked by Instagram! Pausing for safety.', 
                        'error'
                    );
                    this.actionQueue.running = false;
                    break;
                }
                
                // Rate limit handling
                if (error.message.includes('429')) {
                    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
                    continue;
                }
            }
        }
        
        this.showActionCompletion();
        
    } finally {
        document.getElementById('cleanupBtn').classList.remove('hidden');
        this.hideEmergencyStop();
    }
};

// UI Updates
GhostSweepUI.prototype.showEmergencyStop = function() {
    const stopBtn = document.createElement('button');
    stopBtn.id = 'emergencyStop';
    stopBtn.className = 'btn btn-danger';
    stopBtn.textContent = '⛔ Emergency Stop';
    stopBtn.onclick = () => {
        this.actionQueue.running = false;
        this.showStatus('Stopped by user', 'error');
        this.hideEmergencyStop();
    };
    
    document.getElementById('statusSection').appendChild(stopBtn);
};

GhostSweepUI.prototype.hideEmergencyStop = function() {
    const btn = document.getElementById('emergencyStop');
GhostSweepUI.prototype.filterResults = function(filterType) {
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const username = item.querySelector('.username')?.textContent.slice(1);
        const isSelected = this.selectedUsers.has(username);
        const isWhitelisted = this.whitelist.has(username?.toLowerCase());
        
        item.classList.toggle('hidden', (
            (filterType === 'selected' && !isSelected) ||
            (filterType === 'whitelisted' && !isWhitelisted)
        ));
    });
};

GhostSweepUI.prototype.toggleQueuePause = function() {
    if (this.actionQueue) {
        this.actionQueue.running = !this.actionQueue.running;
        const btn = document.getElementById('pauseQueue');
        
        if (this.actionQueue.running) {
            btn.textContent = '⏸ Pause';
            btn.classList.replace('btn-warning', 'btn-secondary');
            this.processActionQueue();
        } else {
            btn.textContent = '▶ Resume';
            btn.classList.replace('btn-secondary', 'btn-warning');
        }
    }
};
    if (btn) btn.remove();
};

GhostSweepUI.prototype.updateActionProgress = function() {
    const progress = (this.actionQueue.completed / this.actionQueue.users.length) * 100;
    this.showProgress(progress);
    
    document.getElementById('resultsSummary').innerHTML = `
        <p>Processed ${this.actionQueue.completed} of ${this.actionQueue.users.length}</p>
        <p>Errors: ${this.actionQueue.errors}</p>
        <p>Next action in ~${Math.round(
            (35000 - (Date.now() - this.actionQueue.lastActionTime)) / 1000
        )}s</p>
    `;
};

GhostSweepUI.prototype.showActionCompletion = function() {
    if (this.actionQueue.errors > 0) {
        this.showStatus(
            `Completed with ${this.actionQueue.errors} errors (${this.actionQueue.completed} successful)`,
            'error'
        );
    } else {
        this.showStatus(
            `Successfully processed ${this.actionQueue.completed} accounts`,
            'success'
        );
    }
    
    setTimeout(() => {
        this.showConfigSection();
        this.hideResults();
        this.actionQueue = null;
    }, 3000);
};

// UI Helper Methods
GhostSweepUI.prototype.showLoginSection = function() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('configSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    this.hideStatus();
};

GhostSweepUI.prototype.showConfigSection = function() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('configSection').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    this.hideStatus();
};

GhostSweepUI.prototype.hideConfig = function() {
    document.getElementById('configSection').classList.add('hidden');
};

GhostSweepUI.prototype.hideResults = function() {
    document.getElementById('resultsSection').classList.add('hidden');
};

GhostSweepUI.prototype.showStatus = function(message, type) {
    const statusSection = document.getElementById('statusSection');
    const statusText = document.getElementById('statusText');
    
    statusText.textContent = message;
    statusText.className = `status ${type}`;
    statusSection.classList.remove('hidden');
};

GhostSweepUI.prototype.hideStatus = function() {
    document.getElementById('statusSection').classList.add('hidden');
};

GhostSweepUI.prototype.showProgress = function(percentage) {
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${percentage}%`;
};

GhostSweepUI.prototype.showError = function(message) {
    this.showStatus(message, 'error');
};