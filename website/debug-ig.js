async function testUserAgents() {
  const uas = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    'Instagram 320.0.0.38.109 Android (31/12; 480dpi; 1080x2400; samsung; SM-G998B; p3s; exynos2100; en_US)',
  ];

  for (const ua of uas) {
    try {
      const res = await fetch('https://www.instagram.com/api/v1/users/web_profile_info/?username=theleeparsons', {
        headers: {
          'User-Agent': ua,
          'X-IG-App-ID': '936619743392459',
          'x-ig-app-id': '936619743392459',
          'x-asbd-id': '129477',
          'x-ig-www-claim': '0',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
        }
      });
      console.log(`UA: ${ua.slice(0, 40)} -> Status: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        console.log('SUCCESS! Followers:', json?.data?.user?.edge_followed_by?.count);
      } else {
        const t = await res.text();
        console.log('FAIL:', t.slice(0, 100));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

testUserAgents();
