async function inspectData() {
  const res = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'theleeparsons' })
  });
  const json = await res.json();
  console.log(json.data);
}
inspectData();
