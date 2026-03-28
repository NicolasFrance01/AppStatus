
async function triggerSync() {
  console.log('Triggering main sync...');
  const res = await fetch('http://localhost:3000/api/sync?task=true');
  const data = await res.json();
  console.log('Sync Result:', JSON.stringify(data, null, 2));
}

triggerSync().catch(console.error);
