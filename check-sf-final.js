async function run() {
    const pkg = 'com.empresasbsf.mobile';
    const r = await fetch(`https://play.google.com/store/apps/details?id=${pkg}&hl=es-419&gl=AR`);
    const h = await r.text();
    const m = h.match(/\[\[\["([\d\.]+)"\]/);
    console.log('Match:', m ? m[1] : 'null');
    const idx = h.indexOf('softwareVersion');
    if (idx !== -1) {
        console.log('Snippet:', h.substring(idx - 20, idx + 50));
    } else {
        console.log('softwareVersion not found');
    }
}
run();
