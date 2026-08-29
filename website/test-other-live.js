async function testOtherProfiles() {
  for (const user of ['zendaya', 'cristiano', 'natgeo']) {
    const res = await fetch(`http://localhost:3000/api/audit?username=${user}`);
    const json = await res.json();
    console.log(`\nAudit for @${user}:`);
    console.log({
      username: json.data.username,
      fullName: json.data.fullName,
      followers: json.data.followers,
      following: json.data.following,
      ratio: json.data.ratio,
      isLiveRealData: json.data.isLiveRealData,
      isVerified: json.data.isVerified,
    });
  }
}

testOtherProfiles();
