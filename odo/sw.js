/* ODO simple — offline service worker.

   Three rules, each one learned from a way this broke:

   1. Cross-origin requests (the OpenStreetMap tiles the road map uses) are
      never touched. They go straight to the network and are never cached —
      map imagery must not end up inside the app's offline shell.

   2. Stale-while-revalidate for the app shell. The old build was cache-first
      with a network fallback, which never shipped a fix; a plain network-first
      build launches instantly in airplane mode but hangs on a white screen on
      a weak rural signal, where fetch() stalls for a minute before rejecting.
      Serving the cached shell immediately and refreshing it in the background
      is the only version that is both instant in a dead zone and updatable.
      The app shows a "new version ready · Reload" prompt when the refresh
      lands (never mid-drive).

   3. Only a clean same-origin 200 is allowed into the cache. A captive portal
      answers with 200 and its own HTML; caching that replaces the app with a
      wifi login page on every later offline launch. */

const CACHE = "odo-simple-v4";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

self.addEventListener("install", e => {
  /* Cache files individually — addAll() rejects the whole install if any one
     URL fails, which would pin every phone to the previous version forever. */
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheable(res){
  return res && res.ok && !res.redirected && (res.type === "basic" || res.type === "default");
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch(err){ return; }
  if(url.origin !== location.origin) return;            // map tiles: hands off

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, {ignoreSearch:true});

    const fresh = fetch(req).then(res => {
      if(cacheable(res)) cache.put(req, res.clone()).catch(() => {});
      return res;
    }).catch(() => null);

    if(hit){ fresh.catch(() => {}); return hit; }        // instant, even with no signal

    const res = await fresh;
    if(res && res.ok) return res;
    if(req.mode === "navigate"){
      const shell = await cache.match("./index.html");
      if(shell) return shell;
    }
    return res || Response.error();
  })());
});
