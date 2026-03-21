async function getStoreVersion(packageName) {
  try {
    const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=es-419&gl=AR&nocache=${Date.now()}`;
    console.log(`Checking ${packageName} at ${url}`);
    const r = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const html = await r.text();
    const m = html.match(/\[\[\["([\d\.]+)"\]/);
    const ver = m ? m[1] : null;

    // Also look for other version indicators in HTML
    const m2 = html.match(/"softwareVersion":"([\d\.]+)"/);
    const ver2 = m2 ? m2[1] : null;

    return { ver, ver2 };
  } catch (e) { return { error: e.message }; }
}

async function run() {
    const pkgs = [
        "com.bancosantacruz.mobile",
        "com.bancoentrerios.mobile",
        "com.bancosantafe.mobile",
        "com.empresasbsf.mobile",
        "com.empresasbersa.mobile"
    ];
    for (const p of pkgs) {
        const res = await getStoreVersion(p);
        console.log(`${p}: ${JSON.stringify(res)}`);
    }
}

run();
