const CACHE_NAME = 'translate-app-v1';
const RUNTIME_CACHE = 'translate-runtime-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// CDN 资源模式
const CDN_PATTERNS = [
  /^https:\/\/esm\.run\//,
  /^https:\/\/cdn\./,
  /^https:\/\/unpkg\./,
  /^https:\/\/.*\.jsdelivr\.net\//
];

// Install 事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// Activate 事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch 事件 - 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过 Chrome extension 请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 检查是否是 CDN 资源
  const isCDNResource = CDN_PATTERNS.some(pattern => pattern.test(request.url));

  if (isCDNResource) {
    // CDN 资源：使用 Network First 策略（网络优先，失败时使用缓存）
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 只缓存成功的响应
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // 网络失败，尝试从缓存获取
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving CDN resource from cache:', request.url);
                return cachedResponse;
              }
              // 如果缓存也没有，返回错误
              return new Response('Network error and no cache available', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  } else {
    // 静态资源：使用 Cache First 策略（缓存优先）
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // 缓存中没有，从网络获取
          return fetch(request)
            .then((response) => {
              // 只缓存成功的响应
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            })
            .catch((error) => {
              console.error('[Service Worker] Fetch failed:', error);
              // 返回离线页面或错误信息
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Message 事件 - 与页面通信
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          return Promise.all(
            urls.map(url =>
              fetch(url)
                .then(response => cache.put(url, response))
                .catch(err => console.log('Failed to cache:', url, err))
            )
          );
        })
    );
  }
});
