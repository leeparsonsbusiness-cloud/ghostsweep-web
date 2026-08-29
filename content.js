// GhostSweep Content Engine - Native Scraper & Action Relay
console.log('GhostSweep Native Scraper & Action Relay active.');

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getUsernameFromDOM() {
  const profileLinks = document.querySelectorAll('a[href^="/"][role="link"]');
  for (const link of profileLinks) {
    const href = link.getAttribute('href');
    if (href && !['/direct/', '/explore/', '/reels/', '/stories/'].some(p => href.startsWith(p)) && href.length > 2) {
      return href.replaceAll('/', '').trim();
    }
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'START_FULL_AUDIT') {
    sendResponse({ success: true, status: 'started' });
    runAudit(request.mode);
    return true;
  }

  if (request.action === 'EXECUTE_UNFOLLOW') {
    executeNativeUnfollow(request.userId).then(sendResponse);
    return true;
  }
});

async function executeNativeUnfollow(targetUserId) {
  const csrfToken = getCookie('csrftoken') || '';

  const headers = {
    'X-IG-App-ID': '936619743392459',
    'X-ASBD-ID': '129477',
    'X-CSRFToken': csrfToken,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    let res = await fetch(`https://www.instagram.com/api/v1/web/friendships/${targetUserId}/unfollow/`, {
      method: 'POST',
      headers,
      body: `user_id=${targetUserId}`,
      credentials: 'include'
    });

    if (!res.ok) {
      res = await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${targetUserId}/`, {
        method: 'POST',
        headers,
        body: `user_id=${targetUserId}`,
        credentials: 'include'
      });
    }

    if (res.status === 429) {
      return { success: false, status: 429, error: 'rate_limit' };
    }

    const data = await res.json();

    if (data.message === 'feedback_required' || data.spam === true || data.status === 'fail') {
      return { success: false, status: res.status, error: 'feedback_required', data };
    }

    const isSuccess = data.status === 'ok' || data.friendship_status?.following === false;
    return { success: isSuccess, data, status: res.status };
  } catch (err) {
    console.error('GhostSweep Unfollow Execution Error:', err);
    return { success: false, error: err.message };
  }
}

function sendProgress(text, pct) {
  chrome.runtime.sendMessage({ action: 'AUDIT_PROGRESS', text, pct }).catch(() => {});
}

async function runAudit(mode = 'non_reciprocal') {
  let userId = getCookie('ds_user_id');
  let csrfToken = getCookie('csrftoken') || '';

  const headers = {
    'X-IG-App-ID': '936619743392459',
    'X-ASBD-ID': '129477',
    'X-CSRFToken': csrfToken,
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (!userId) {
    const username = getUsernameFromDOM();
    if (username) {
      sendProgress(`Resolving ID for @${username}...`, 5);
      try {
        const userRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, { headers, credentials: 'include' });
        const userData = await userRes.json();
        userId = userData.data?.user?.id;
      } catch (e) {
        console.warn('Profile lookup fallback failed:', e);
      }
    }
  }

  if (!userId) {
    chrome.runtime.sendMessage({
      action: 'AUDIT_ERROR',
      error: 'Could not find Instagram User ID. Ensure you are logged into Instagram.'
    }).catch(() => {});
    return;
  }

  try {
    sendProgress('Fetching accounts you follow...', 15);
    let following = [];
    let maxId = '';
    do {
      const url = `https://www.instagram.com/api/v1/friendships/${userId}/following/?count=100${maxId ? `&max_id=${maxId}` : ''}`;
      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) throw new Error(`Following fetch returned HTTP ${res.status}`);
      const data = await res.json();
      if (data.users) following.push(...data.users);
      sendProgress(`Fetched ${following.length} following accounts...`, 40);
      maxId = data.next_max_id || '';
      if (maxId) await new Promise(r => setTimeout(r, 350));
    } while (maxId);

    const formatUser = (u, index) => ({
      id: String(u.pk || u.id || u.pk_id),
      username: u.username,
      full_name: u.full_name || '',
      profile_pic_url: u.profile_pic_url || '',
      is_verified: u.is_verified || false,
      has_anonymous_profile_picture: u.has_anonymous_profile_picture || false,
      orderIndex: index
    });
    const followingFormatted = following.map(formatUser);

    let followersCount = 0;
    let targets = [];

    if (mode === 'non_reciprocal' || mode === 'verified_shield') {
      sendProgress('Fetching followers for comparison...', 60);
      let followers = [];
      maxId = '';
      do {
        const url = `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=100${maxId ? `&max_id=${maxId}` : ''}`;
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) throw new Error(`Followers fetch returned HTTP ${res.status}`);
        const data = await res.json();
        if (data.users) followers.push(...data.users);
        sendProgress(`Fetched ${followers.length} followers...`, 80);
        maxId = data.next_max_id || '';
        if (maxId) await new Promise(r => setTimeout(r, 350));
      } while (maxId);

      followersCount = followers.length;
      const followerIds = new Set(followers.map(u => String(u.pk || u.id || u.pk_id)));

      if (mode === 'verified_shield') {
        targets = followingFormatted.filter(u => !followerIds.has(u.id) && !u.is_verified);
      } else {
        targets = followingFormatted.filter(u => !followerIds.has(u.id));
      }
    } else if (mode === 'mutuals') {
      sendProgress('Fetching mutual connections...', 60);
      let followers = [];
      maxId = '';
      do {
        const url = `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=100${maxId ? `&max_id=${maxId}` : ''}`;
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) throw new Error(`Followers fetch returned HTTP ${res.status}`);
        const data = await res.json();
        if (data.users) followers.push(...data.users);
        sendProgress(`Fetched ${followers.length} followers...`, 80);
        maxId = data.next_max_id || '';
        if (maxId) await new Promise(r => setTimeout(r, 350));
      } while (maxId);

      followersCount = followers.length;
      const followerIds = new Set(followers.map(u => String(u.pk || u.id || u.pk_id)));
      targets = followingFormatted.filter(u => followerIds.has(u.id));
    } else if (mode === 'no_avatar') {
      followersCount = '-';
      targets = followingFormatted.filter(u => !u.profile_pic_url || u.profile_pic_url.includes('anonymous') || u.has_anonymous_profile_picture);
    }

    sendProgress('Audit ready!', 100);

    const auditPayload = {
      followingCount: followingFormatted.length,
      followersCount: followersCount,
      targets: targets,
      timestamp: Date.now()
    };

    await chrome.storage.local.set({ ghostsweep_last_audit: auditPayload });

    chrome.runtime.sendMessage({
      action: 'AUDIT_COMPLETE',
      data: auditPayload
    }).catch(() => {});

  } catch (err) {
    console.error('Audit Scraper error:', err);
    chrome.runtime.sendMessage({
      action: 'AUDIT_ERROR',
      error: err.message
    }).catch(() => {});
  }
}