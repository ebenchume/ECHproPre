// =========================================================================
// ECHpro ERP – Service Worker Offline-First Architecture
// PGC-NIRF & Gestão Integrada de RH (Moçambique)
// =========================================================================

const CACHE_VERSION = 'echpro-v3.2-offline';
const STATIC_CACHE_NAME = `echpro-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `echpro-dynamic-${CACHE_VERSION}`;

// Pre-caching essencial do App Shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell para Offline-First...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Falha no pre-cache inicial:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removendo cache obsoleto:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Inteligente de Intercepção de Requisições (Offline-First)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Apenas requisições GET com esquemas http/https são tratadas
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  const url = new URL(request.url);

  // 1. Navegação de Páginas (SPA HTML Fallback)
  // Se for uma requisição de navegação (ex: recarregar página offline ou aceder a qualquer rota)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback garantido para o App Shell offline
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
          return caches.match(request);
        })
    );
    return;
  }

  // 2. Arquivos Estáticos (Scripts JS, CSS, Fontes, SVGs e Imagens)
  // Estratégia: Stale-While-Revalidate com Cache Dinâmico
  const isStaticAsset =
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Em caso de falha de rede offline, retorna o cache existente
            return cachedResponse;
          });

        // Retorna imediatamente do cache se existir (Offline-First ultra rápido)
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Demais Requisições (Network-First com Fallback de Cache)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Comunicação com a UI para sincronização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
