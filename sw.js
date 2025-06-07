const CACHE_NAME = 'railway-signal-work-log-mobile-v1.5';
const STATIC_CACHE = 'static-cache-v1.5';
const DYNAMIC_CACHE = 'dynamic-cache-v1.5';

// 모바일 최적화된 캐시 파일들
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com/2.2.19/tailwind.min.css'
];

// 모바일 환경 감지
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 네트워크 연결 상태 확인
const isOnline = () => {
    return navigator.onLine;
};

// 배터리 API 지원 확인 (모바일 배터리 절약)
const getBatteryInfo = async () => {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return {
                level: battery.level,
                charging: battery.charging
            };
        } catch (error) {
            return null;
        }
    }
    return null;
};

// Service Worker 설치 (모바일 최적화)
self.addEventListener('install', function(event) {
    console.log('🚂 Service Worker: 모바일 최적화 설치 중...');
    event.waitUntil(
        Promise.all([
            // 정적 파일 캐시
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📱 모바일 정적 파일 캐시 중...');
                return cache.addAll(urlsToCache);
            }),
            // 동적 캐시 생성
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🔄 동적 캐시 준비 완료');
                return cache;
            })
        ]).then(() => {
            console.log('✅ Service Worker: 모바일 최적화 설치 완료');
            return self.skipWaiting();
        }).catch(error => {
            console.error('❌ Service Worker 설치 오류:', error);
        })
    );
});

// Service Worker 활성화 (모바일 최적화)
self.addEventListener('activate', function(event) {
    console.log('🔄 Service Worker: 모바일 최적화 활성화 중...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // 현재 버전이 아닌 캐시들 삭제 (모바일 저장공간 최적화)
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== CACHE_NAME) {
                        console.log('🗑️ 이전 캐시 삭제 (저장공간 최적화):', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('✅ Service Worker: 모바일 최적화 활성화 완료');
            // 모바일에서 즉시 새 Service Worker 적용
            return self.clients.claim();
        }).catch(error => {
            console.error('❌ Service Worker 활성화 오류:', error);
        })
    );
});

// 모바일 최적화된 네트워크 요청 처리
self.addEventListener('fetch', function(event) {
    // Chrome extension, data URLs 제외
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.startsWith('data:')) {
        return;
    }
    
    // GET 요청만 캐시 처리
    if (event.request.method !== 'GET') {
        return;
    }

    // 모바일 최적화된 캐시 전략
    event.respondWith(
        handleMobileRequest(event.request)
    );
});

// 모바일 최적화 요청 처리 함수
async function handleMobileRequest(request) {
    try {
        // 1. 정적 파일 (HTML, CSS, JS, 이미지) - 캐시 우선
        if (isStaticResource(request.url)) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log('📱 캐시에서 정적 파일 제공:', request.url);
                return cachedResponse;
            }
        }

        // 2. 네트워크 연결 확인
        if (!isOnline()) {
            console.log('📴 오프라인 모드: 캐시에서 제공');
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            // 오프라인에서 메인 페이지 요청시 index.html 제공
            if (request.destination === 'document') {
                return caches.match('./index.html');
            }
            throw new Error('오프라인 상태이며 캐시된 리소스가 없습니다.');
        }

        // 3. 모바일 배터리 상태 고려
        const batteryInfo = await getBatteryInfo();
        const isLowBattery = batteryInfo && batteryInfo.level < 0.2 && !batteryInfo.charging;

        // 4. 네트워크에서 리소스 가져오기
        const networkResponse = await fetch(request);
        
        if (!networkResponse || networkResponse.status !== 200) {
            // 네트워크 실패시 캐시에서 대체
            const cachedResponse = await caches.match(request);
            return cachedResponse || networkResponse;
        }

        // 5. 모바일 저장공간 최적화된 캐시 저장
        if (shouldCache(request.url, isLowBattery)) {
            const responseToCache = networkResponse.clone();
            
            // 정적 파일은 STATIC_CACHE에, 동적 파일은 DYNAMIC_CACHE에 저장
            const cacheName = isStaticResource(request.url) ? STATIC_CACHE : DYNAMIC_CACHE;
            
            caches.open(cacheName).then(cache => {
                cache.put(request, responseToCache);
                console.log('💾 모바일 캐시 저장:', request.url);
                
                // 동적 캐시 크기 제한 (모바일 저장공간 절약)
                if (cacheName === DYNAMIC_CACHE) {
                    limitCacheSize(cacheName, 20); // 최대 20개 항목
                }
            });
        }

        return networkResponse;

    } catch (error) {
        console.log('❌ 모바일 요청 처리 오류:', error);
        
        // 오류 발생시 캐시에서 대체
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('🔄 오류 복구: 캐시에서 제공');
            return cachedResponse;
        }
        
        // 메인 페이지 요청시 기본 페이지 제공
        if (request.destination === 'document') {
            return caches.match('./index.html');
        }
        
        throw error;
    }
}

// 정적 리소스 여부 확인
function isStaticResource(url) {
    return url.includes('.html') || 
           url.includes('.css') || 
           url.includes('.js') || 
           url.includes('.png') || 
           url.includes('.jpg') || 
           url.includes('.svg') ||
           url.includes('tailwindcss') ||
           url.includes('manifest.json');
}

// 캐시 저장 여부 결정 (모바일 최적화)
function shouldCache(url, isLowBattery) {
    // 배터리가 부족하면 필수 파일만 캐시
    if (isLowBattery) {
        return url.includes('index.html') || 
               url.includes('tailwindcss') || 
               url.includes('manifest.json');
    }
    
    // 일반적으로 모든 리소스 캐시
    return true;
}

// 캐시 크기 제한 (모바일 저장공간 최적화)
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // 오래된 항목부터 삭제
        const itemsToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(itemsToDelete.map(key => cache.delete(key)));
        console.log(`🧹 캐시 정리: ${itemsToDelete.length}개 항목 삭제`);
    }
}

// 모바일 최적화 메시지 처리
self.addEventListener('message', function(event) {
    console.log('📱 Service Worker 메시지 수신:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            cached: urlsToCache,
            mobile: true
        });
    }
    
    // 모바일 특화 메시지 처리
    if (event.data && event.data.type === 'MOBILE_OPTIMIZE') {
        handleMobileOptimization(event.data.options);
    }
    
    // 배터리 절약 모드
    if (event.data && event.data.type === 'BATTERY_SAVE') {
        console.log('🔋 배터리 절약 모드 활성화');
        enableBatterySaveMode();
    }
    
    // 캐시 정리 요청
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearDynamicCache();
    }
});

// 모바일 최적화 처리
async function handleMobileOptimization(options = {}) {
    const { 
        reduceBandwidth = true, 
        optimizeImages = true, 
        limitCacheSize = true 
    } = options;
    
    console.log('📱 모바일 최적화 적용:', options);
    
    if (limitCacheSize) {
        await limitCacheSize(DYNAMIC_CACHE, 15); // 더 적은 캐시
    }
}

// 배터리 절약 모드
async function enableBatterySaveMode() {
    // 동적 캐시 크기를 더 줄임
    await limitCacheSize(DYNAMIC_CACHE, 10);
    
    // 불필요한 백그라운드 작업 최소화
    console.log('🔋 배터리 절약: 캐시 크기 최소화 완료');
}

// 동적 캐시 정리
async function clearDynamicCache() {
    try {
        await caches.delete(DYNAMIC_CACHE);
        await caches.open(DYNAMIC_CACHE); // 빈 캐시 다시 생성
        console.log('🧹 동적 캐시 정리 완료');
    } catch (error) {
        console.error('❌ 캐시 정리 오류:', error);
    }
}

// 백그라운드 동기화 (향후 확장 가능)
self.addEventListener('sync', function(event) {
    console.log('Service Worker: 백그라운드 동기화 -', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // 백그라운드에서 실행할 작업
            console.log('백그라운드 동기화 실행')
        );
    }
});

// 모바일 최적화 푸시 알림 처리
self.addEventListener('push', function(event) {
    console.log('📱 모바일 푸시 알림 수신');
    
    // 모바일 친화적 알림 옵션
    const options = {
        body: event.data ? event.data.text() : '📋 철도신호제어시설 작업일지가 업데이트되었습니다',
        icon: './icon-192.png',
        badge: './icon-72.png',
        vibrate: [200, 100, 200], // 모바일에서 느낄 수 있는 진동 패턴
        tag: 'railway-work-log', // 중복 알림 방지
        renotify: true,
        requireInteraction: false, // 모바일에서 자동 닫힘 허용
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1',
            mobile: true
        },
        actions: [
            {
                action: 'open', 
                title: '📋 작업일지 열기',
                icon: './icon-check.png'
            },
            {
                action: 'dismiss', 
                title: '닫기',
                icon: './icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('🚂 철도신호제어시설 작업일지', options)
    );
});

// 모바일 최적화 알림 클릭 처리
self.addEventListener('notificationclick', function(event) {
    console.log('📱 모바일 알림 클릭됨:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        // 모바일에서 앱 열기 (기존 탭 활용)
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // 이미 열린 탭이 있으면 그 탭으로 이동 (모바일 메모리 절약)
                    for (let client of clientList) {
                        if (client.url.includes('index.html') || client.url.endsWith('/')) {
                            return client.focus();
                        }
                    }
                    // 열린 탭이 없으면 새로 열기
                    return clients.openWindow('./');
                })
        );
    } else if (event.action === 'dismiss') {
        // 알림만 닫기
        console.log('📱 모바일 알림 닫기');
    } else {
        // 기본 동작: 스마트 앱 열기
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(clientList => {
                    if (clientList.length > 0) {
                        return clientList[0].focus();
                    }
                    return clients.openWindow('./');
                })
        );
    }
});

// 모바일 환경에서의 성능 모니터링
self.addEventListener('activate', function(event) {
    // 기존 activate 이벤트에 추가
    if (self.performance && self.performance.mark) {
        self.performance.mark('sw-mobile-activated');
    }
});

// 네트워크 상태 변경 감지 (모바일 데이터 절약)
self.addEventListener('online', function(event) {
    console.log('📶 네트워크 연결됨 - 모바일 동기화 시작');
    // 온라인 복구시 필요한 작업 수행
});

self.addEventListener('offline', function(event) {
    console.log('📴 오프라인 모드 - 캐시 모드로 전환');
    // 오프라인시 배터리 절약 모드 활성화
});

console.log('📱 모바일 최적화 Service Worker 등록됨:', CACHE_NAME); 