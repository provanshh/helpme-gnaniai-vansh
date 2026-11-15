const mirrors = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];
const q = `[out:json][timeout:10];
node["amenity"="hospital"](around:3000,28.7383,77.0822);
out 3;`;

for (const endpoint of mirrors) {
  const t = Date.now();
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HelpMe/0.1',
      },
      body: `data=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(12000),
    });
    const j = await r.json();
    console.log(endpoint, 'status', r.status, 'ms', Date.now() - t, 'n', j.elements?.length);
  } catch (e) {
    console.log(endpoint, 'fail', e.message, 'ms', Date.now() - t);
  }
}
