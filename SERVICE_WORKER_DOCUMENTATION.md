# Service Worker API Documentation

## 📋 Overview

This document provides comprehensive documentation for the Service Worker implementation in the Railway Signal Control Facility Work Log application. The Service Worker provides offline functionality, mobile optimization, and Progressive Web App (PWA) capabilities.

## 🏗️ Service Worker Architecture

### Core Configuration

#### Cache Names and Versioning
```javascript
const CACHE_NAME = 'railway-signal-work-log-mobile-v1.5';
const STATIC_CACHE = 'static-cache-v1.5';
const DYNAMIC_CACHE = 'dynamic-cache-v1.5';
```

**Purpose**: Version-controlled cache management for reliable updates
**Usage**: Update version numbers when deploying new features
**Best Practice**: Increment versions to force cache refresh

#### Cached Resources
```javascript
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com/2.2.19/tailwind.min.css'
];
```

**Static Resources**: Essential files for offline functionality
**External Dependencies**: Tailwind CSS framework
**Manifest**: PWA configuration file

## 🔧 Core Service Worker Functions

### 1. Mobile Detection API

#### `isMobile()`
**Purpose**: Detects mobile devices for optimization
**Returns**: `boolean`
**Implementation**:
```javascript
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
```

**Usage Example**:
```javascript
if (isMobile()) {
    // Apply mobile-specific optimizations
    enableBatterySaveMode();
}
```

#### `isOnline()`
**Purpose**: Checks network connectivity status
**Returns**: `boolean`
**Implementation**:
```javascript
const isOnline = () => navigator.onLine;
```

#### `getBatteryInfo()`
**Purpose**: Retrieves battery information for optimization
**Returns**: `Promise<Object|null>`
**Implementation**:
```javascript
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
```

**Usage Example**:
```javascript
const batteryInfo = await getBatteryInfo();
if (batteryInfo && batteryInfo.level < 0.2 && !batteryInfo.charging) {
    // Enable low battery mode
    enableBatterySaveMode();
}
```

### 2. Cache Management API

#### `handleMobileRequest(request)`
**Purpose**: Handles network requests with mobile optimization
**Parameters**: 
- `request` (Request): The fetch request object
**Returns**: `Promise<Response>`
**Strategy**: Cache-first for static, Network-first for dynamic

**Implementation Flow**:
1. Check if static resource → serve from cache
2. Check network connectivity
3. Consider battery status
4. Fetch from network with fallback to cache
5. Update cache if successful

**Usage Example**:
```javascript
// Automatically called by fetch event listener
self.addEventListener('fetch', function(event) {
    if (event.request.method === 'GET') {
        event.respondWith(handleMobileRequest(event.request));
    }
});
```

#### `limitCacheSize(cacheName, maxItems)`
**Purpose**: Limits cache size for mobile storage optimization
**Parameters**:
- `cacheName` (string): Name of cache to limit
- `maxItems` (number): Maximum number of cached items
**Returns**: `Promise<void>`

**Implementation**:
```javascript
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        const itemsToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(itemsToDelete.map(key => cache.delete(key)));
        console.log(`🧹 캐시 정리: ${itemsToDelete.length}개 항목 삭제`);
    }
}
```

**Usage Example**:
```javascript
// Limit dynamic cache to 20 items
await limitCacheSize(DYNAMIC_CACHE, 20);

// Low battery mode - limit to 10 items
if (isLowBattery) {
    await limitCacheSize(DYNAMIC_CACHE, 10);
}
```

#### `isStaticResource(url)`
**Purpose**: Determines if a URL is a static resource
**Parameters**: 
- `url` (string): URL to check
**Returns**: `boolean`

**Implementation**:
```javascript
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
```

#### `shouldCache(url, isLowBattery)`
**Purpose**: Determines if a resource should be cached
**Parameters**:
- `url` (string): Resource URL
- `isLowBattery` (boolean): Battery status
**Returns**: `boolean`

**Logic**:
- Low battery: Cache only essential files
- Normal: Cache all resources
- Configurable based on device capabilities

## 📱 Mobile Optimization Features

### 1. Battery Optimization

#### `enableBatterySaveMode()`
**Purpose**: Activates battery saving optimizations
**Actions**:
- Reduces cache size limits
- Minimizes background processing
- Prioritizes essential resources only

**Implementation**:
```javascript
async function enableBatterySaveMode() {
    await limitCacheSize(DYNAMIC_CACHE, 10);
    console.log('🔋 배터리 절약: 캐시 크기 최소화 완료');
}
```

**Automatic Activation**:
```javascript
const batteryInfo = await getBatteryInfo();
const isLowBattery = batteryInfo && batteryInfo.level < 0.2 && !batteryInfo.charging;

if (isLowBattery) {
    enableBatterySaveMode();
}
```

### 2. Storage Optimization

#### Dynamic Cache Management
- **Default Limit**: 20 items
- **Low Battery**: 15 items
- **Critical Battery**: 10 items

#### Static Cache Strategy
- **Permanent Storage**: Essential app files
- **Version Control**: Automatic cleanup of old versions
- **Selective Caching**: Based on device capabilities

### 3. Network Optimization

#### Offline-First Strategy
```javascript
// 1. Try cache first for static resources
const cachedResponse = await caches.match(request);
if (cachedResponse && isStaticResource(request.url)) {
    return cachedResponse;
}

// 2. Try network with cache fallback
try {
    const networkResponse = await fetch(request);
    // Update cache with fresh content
    updateCache(request, networkResponse.clone());
    return networkResponse;
} catch (error) {
    // Fallback to cache
    return cachedResponse || createOfflineResponse();
}
```

## 🎯 Service Worker Events

### 1. Install Event

#### Purpose
- Initial cache setup
- Resource pre-caching
- Service Worker activation

#### Implementation
```javascript
self.addEventListener('install', function(event) {
    console.log('🚂 Service Worker: 모바일 최적화 설치 중...');
    event.waitUntil(
        Promise.all([
            // Static cache setup
            caches.open(STATIC_CACHE).then(cache => {
                return cache.addAll(urlsToCache);
            }),
            // Dynamic cache initialization
            caches.open(DYNAMIC_CACHE)
        ]).then(() => {
            return self.skipWaiting();
        })
    );
});
```

#### Key Features
- **Parallel Caching**: Multiple cache operations simultaneously
- **Skip Waiting**: Immediate activation for updates
- **Error Handling**: Graceful failure management

### 2. Activate Event

#### Purpose
- Cache cleanup
- Version management
- Client claiming

#### Implementation
```javascript
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});
```

#### Cleanup Strategy
- **Version Comparison**: Remove outdated caches
- **Storage Optimization**: Free up mobile storage
- **Immediate Control**: Claim existing clients

### 3. Fetch Event

#### Purpose
- Request interception
- Cache strategy implementation
- Offline support

#### Implementation
```javascript
self.addEventListener('fetch', function(event) {
    // Filter requests
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.startsWith('data:') ||
        event.request.method !== 'GET') {
        return;
    }
    
    // Apply mobile-optimized caching
    event.respondWith(handleMobileRequest(event.request));
});
```

#### Request Filtering
- **Extension URLs**: Ignored
- **Data URLs**: Bypassed
- **Non-GET Methods**: Not cached
- **Valid Requests**: Processed through mobile optimization

### 4. Message Event

#### Purpose
- Client-to-SW communication
- Dynamic configuration
- Feature control

#### Supported Messages

##### Skip Waiting
```javascript
if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
}
```

##### Version Information
```javascript
if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
        version: CACHE_NAME,
        cached: urlsToCache,
        mobile: true
    });
}
```

##### Mobile Optimization
```javascript
if (event.data && event.data.type === 'MOBILE_OPTIMIZE') {
    handleMobileOptimization(event.data.options);
}
```

##### Battery Save Mode
```javascript
if (event.data && event.data.type === 'BATTERY_SAVE') {
    enableBatterySaveMode();
}
```

##### Cache Management
```javascript
if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearDynamicCache();
}
```

#### Client Usage Examples
```javascript
// Get version information
navigator.serviceWorker.ready.then(registration => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = event => {
        console.log('SW Version:', event.data.version);
    };
    registration.active.postMessage(
        { type: 'GET_VERSION' }, 
        [messageChannel.port2]
    );
});

// Enable mobile optimization
navigator.serviceWorker.ready.then(registration => {
    registration.active.postMessage({
        type: 'MOBILE_OPTIMIZE',
        options: {
            reduceBandwidth: true,
            optimizeImages: true,
            limitCacheSize: true
        }
    });
});

// Activate battery save mode
navigator.serviceWorker.ready.then(registration => {
    registration.active.postMessage({
        type: 'BATTERY_SAVE'
    });
});
```

## 🔔 Push Notification API

### 1. Push Event Handler

#### Purpose
- Handle incoming push notifications
- Mobile-optimized notification display
- User engagement features

#### Implementation
```javascript
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : '📋 철도신호제어시설 작업일지가 업데이트되었습니다',
        icon: './icon-192.png',
        badge: './icon-72.png',
        vibrate: [200, 100, 200],
        tag: 'railway-work-log',
        renotify: true,
        requireInteraction: false,
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
```

#### Mobile Optimization Features
- **Vibration Pattern**: Tactile feedback for mobile devices
- **Auto-dismiss**: Prevents notification buildup
- **Action Buttons**: Quick access to common actions
- **Icon Support**: Visual notification enhancement

### 2. Notification Click Handler

#### Purpose
- Handle notification interactions
- Smart app opening
- Memory optimization

#### Implementation
```javascript
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // Focus existing tab if available
                    for (let client of clientList) {
                        if (client.url.includes('index.html') || client.url.endsWith('/')) {
                            return client.focus();
                        }
                    }
                    // Open new tab if none exists
                    return clients.openWindow('./');
                })
        );
    }
});
```

#### Smart Tab Management
- **Existing Tab Detection**: Prevents duplicate tabs
- **Focus Management**: Brings existing tab to foreground
- **Memory Efficiency**: Reuses existing app instances

## 🚀 Performance Optimization

### 1. Caching Strategies

#### Static Resources (Cache-First)
```javascript
// Check cache first, fallback to network
const cachedResponse = await caches.match(request);
if (cachedResponse && isStaticResource(request.url)) {
    return cachedResponse;
}
```

#### Dynamic Content (Network-First)
```javascript
// Try network first, fallback to cache
try {
    const networkResponse = await fetch(request);
    updateCache(request, networkResponse.clone());
    return networkResponse;
} catch (error) {
    return caches.match(request);
}
```

### 2. Mobile-Specific Optimizations

#### Battery-Aware Caching
```javascript
const batteryInfo = await getBatteryInfo();
const isLowBattery = batteryInfo && batteryInfo.level < 0.2;

if (isLowBattery) {
    // Reduce cache operations
    return shouldCacheEssentialOnly(url);
}
```

#### Storage Management
```javascript
// Automatic cache size management
if (cacheName === DYNAMIC_CACHE) {
    limitCacheSize(cacheName, 20);
}

// Low battery mode
if (isLowBattery) {
    limitCacheSize(cacheName, 10);
}
```

### 3. Network Optimization

#### Request Filtering
- Skip extension and data URLs
- Process only GET requests
- Ignore non-cacheable resources

#### Bandwidth Consideration
- Compress responses when possible
- Prioritize essential resources
- Defer non-critical assets

## 🔧 Advanced Features

### 1. Background Sync

#### Setup
```javascript
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Background synchronization tasks
            performBackgroundSync()
        );
    }
});
```

#### Usage
```javascript
// Register background sync from client
navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('background-sync');
});
```

### 2. Cache Management Utilities

#### Clear Dynamic Cache
```javascript
async function clearDynamicCache() {
    try {
        await caches.delete(DYNAMIC_CACHE);
        await caches.open(DYNAMIC_CACHE);
        console.log('🧹 동적 캐시 정리 완료');
    } catch (error) {
        console.error('❌ 캐시 정리 오류:', error);
    }
}
```

#### Handle Mobile Optimization
```javascript
async function handleMobileOptimization(options = {}) {
    const { 
        reduceBandwidth = true, 
        optimizeImages = true, 
        limitCacheSize = true 
    } = options;
    
    if (limitCacheSize) {
        await limitCacheSize(DYNAMIC_CACHE, 15);
    }
}
```

## 🛠️ Development and Debugging

### 1. Debug Tools

#### Service Worker Status
```javascript
// Check registration status
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Active Service Workers:', registrations);
});

// Check cache contents
caches.keys().then(names => {
    console.log('Available Caches:', names);
    names.forEach(name => {
        caches.open(name).then(cache => {
            cache.keys().then(keys => {
                console.log(`Cache ${name}:`, keys.map(k => k.url));
            });
        });
    });
});
```

#### Performance Monitoring
```javascript
// Mark performance events
if (self.performance && self.performance.mark) {
    self.performance.mark('sw-mobile-activated');
}

// Measure cache operations
console.time('cache-operation');
// ... cache operation
console.timeEnd('cache-operation');
```

### 2. Error Handling

#### Graceful Degradation
```javascript
try {
    const response = await handleMobileRequest(request);
    return response;
} catch (error) {
    console.error('Service Worker Error:', error);
    // Fallback to network or cached response
    return fetch(request).catch(() => caches.match(request));
}
```

#### Logging Strategy
```javascript
// Structured logging for mobile debugging
function logMobileEvent(type, data) {
    console.log(`📱 Mobile SW [${type}]:`, data);
}

// Usage
logMobileEvent('CACHE_HIT', { url: request.url, cache: cacheName });
logMobileEvent('NETWORK_FALLBACK', { url: request.url, reason: 'cache_miss' });
```

## 📊 Monitoring and Analytics

### 1. Performance Metrics

#### Cache Hit Rates
```javascript
let cacheHits = 0;
let cacheMisses = 0;

// Track in handleMobileRequest
if (cachedResponse) {
    cacheHits++;
} else {
    cacheMisses++;
}

// Report periodically
const hitRate = cacheHits / (cacheHits + cacheMisses);
console.log(`Cache Hit Rate: ${(hitRate * 100).toFixed(2)}%`);
```

#### Network Usage
```javascript
let networkRequests = 0;
let offlineServed = 0;

// Track in fetch handler
if (isOnline()) {
    networkRequests++;
} else {
    offlineServed++;
}
```

### 2. User Experience Metrics

#### Offline Usage
```javascript
self.addEventListener('offline', () => {
    console.log('📴 App went offline');
    // Track offline usage patterns
});

self.addEventListener('online', () => {
    console.log('📶 App back online');
    // Sync offline changes
});
```

## 🔒 Security Considerations

### 1. Request Validation

#### URL Filtering
```javascript
// Block suspicious requests
if (request.url.includes('malicious-domain.com')) {
    return new Response('Blocked', { status: 403 });
}

// Validate request origins
if (!request.url.startsWith(self.location.origin)) {
    // Handle external requests carefully
}
```

### 2. Cache Security

#### Sensitive Data Handling
```javascript
// Don't cache sensitive endpoints
function shouldCache(url) {
    const sensitivePatterns = ['/api/auth/', '/api/private/'];
    return !sensitivePatterns.some(pattern => url.includes(pattern));
}
```

## 📱 Mobile PWA Integration

### 1. Installation Prompts

#### Client-Side Integration
```javascript
// Listen for beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // Show custom install prompt
    showInstallPrompt(e);
});

// Track installation
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    // Send analytics event
});
```

### 2. App Updates

#### Service Worker Updates
```javascript
// Check for updates
navigator.serviceWorker.addEventListener('controllerchange', () => {
    // New service worker activated
    window.location.reload();
});

// Manual update check
async function checkForUpdates() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
        await registration.update();
    }
}
```

---

*This Service Worker documentation provides comprehensive coverage of all PWA functionality, mobile optimization features, and implementation details for the Railway Signal Work Log application.*