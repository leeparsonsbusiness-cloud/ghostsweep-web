async function testFetch() {
  const cleanUser = 'theleeparsons';
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(cleanUser)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Instagram 320.0.0.38.109 Android (31/12; 480dpi; 1080x2400; samsung; SM-G998B; p3s; exynos2100; en_US)",
      "X-IG-App-ID": "936619743392459",
      "x-ig-app-id": "936619743392459",
      "x-asbd-id": "129477",
      "x-ig-www-claim": "0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body preview:', text.slice(0, 200));
}
testFetch();
