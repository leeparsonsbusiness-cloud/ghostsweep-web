async function testLiveFetch(username) {
  console.log(`\n=== Testing Live Fetch for @${username} ===`);

  // Strategy 1: Instagram public web_profile_info API
  try {
    console.log('1. Trying web_profile_info API...');
    const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'x-ig-app-id': '936619743392459',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      }
    });

    console.log('web_profile_info Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      const user = data?.data?.user;
      if (user) {
        console.log('SUCCESS with web_profile_info:');
        console.log({
          username: user.username,
          fullName: user.full_name,
          followers: user.edge_followed_by?.count,
          following: user.edge_follow?.count,
          isVerified: user.is_verified,
          avatar: user.profile_pic_url_hd || user.profile_pic_url,
          bio: user.biography,
        });
        return;
      }
    }
  } catch (err) {
    console.log('Strategy 1 failed:', err.message);
  }

  // Strategy 2: Direct Instagram HTML Scraping
  try {
    console.log('\n2. Trying Direct Instagram HTML OpenGraph Scraping...');
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    console.log('HTML Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);

    // Parse og:description: "1,234 Followers, 567 Following, 89 Posts - See Instagram photos and videos from Lee Parsons (@theleeparsons)"
    const descMatch = html.match(/<meta\s+(?:property="og:description"|name="description")\s+content="([^"]+)"/i) 
      || html.match(/content="([^"]+)"\s+(?:property="og:description"|name="description")/i);

    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    console.log('Desc match:', descMatch ? descMatch[1] : 'none');
    console.log('Title match:', titleMatch ? titleMatch[1] : 'none');
    console.log('Image match:', imgMatch ? imgMatch[1] : 'none');

    if (descMatch) {
      const desc = descMatch[1];
      // e.g. "9,876 Followers, 1,234 Following, 34 Posts"
      const followersMatch = desc.match(/([\d,KMkm.]+)\s*Followers/i);
      const followingMatch = desc.match(/([\d,KMkm.]+)\s*Following/i);
      const postsMatch = desc.match(/([\d,KMkm.]+)\s*Posts/i);

      console.log('Parsed metrics from HTML:');
      console.log({
        followers: followersMatch ? followersMatch[1] : null,
        following: followingMatch ? followingMatch[1] : null,
        posts: postsMatch ? postsMatch[1] : null,
      });
    }
  } catch (err) {
    console.log('Strategy 2 failed:', err.message);
  }
}

testLiveFetch('theleeparsons').then(() => testLiveFetch('instagram'));
