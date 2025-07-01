# Railway Signal Control Facility Work Log - API Documentation

## 📋 Overview

This document provides comprehensive documentation for the Railway Signal Control Facility Work Log application (정밀진단작업일지). This is a Progressive Web App (PWA) designed for mobile-responsive railway signal maintenance logging.

## 🏗️ Application Architecture

### Core Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS v2.2.19
- **PWA Features**: Service Worker, Web App Manifest
- **Storage**: localStorage API
- **Print**: CSS Print Media Queries

### File Structure
```
/
├── index.html          # Main application file
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── README.md          # Project documentation
```

## 🎯 Public APIs and Functions

### 1. Form Data Management API

#### `setInitialDateTime()`
**Purpose**: Sets the current date and time in the datetime input field
**Parameters**: None
**Returns**: void
**Usage**:
```javascript
setInitialDateTime();
// Sets dateTime input to current date/time in format: YYYY-MM-DDTHH:MM
```

#### `loadDataFromKey(key)`
**Purpose**: Loads form data from localStorage using a specific key
**Parameters**: 
- `key` (string): localStorage key to retrieve data from
**Returns**: boolean - true if data loaded successfully, false otherwise
**Usage**:
```javascript
const success = loadDataFromKey('myWorkLog_20250115');
if (success) {
    console.log('Data loaded successfully');
}
```

#### `resetForm()`
**Purpose**: Clears all form fields and resets to initial state
**Parameters**: None
**Returns**: void
**Usage**:
```javascript
resetForm();
// Clears all inputs and sets current date/time
```

### 2. Data Persistence API

#### Manual Save Function
**Trigger**: `saveManualBtn` click event
**Purpose**: Saves current form data with user-specified filename
**Process**:
1. Prompts user for filename
2. Collects all form data
3. Stores in localStorage under `railwaySignalSavedLogs` key
4. Shows success/failure toast message

**Data Structure**:
```javascript
{
  "filename": {
    dateTime: "2025-01-15T14:30",
    temperature: "22.5",
    humidity: "55",
    workTarget: "신호기 상1",
    workers: "김철수/5명",
    workContent: "신호기 점검 및 청소",
    testerUsed: "FLUKE 15B+ 테스터기",
    measurementMethod: "절연저항 1,000V 기준 측정",
    notes: "특이사항 내용"
  }
}
```

#### Load Data Function
**Trigger**: `loadBtn` click event
**Purpose**: Opens modal to select and load previously saved work logs
**Features**:
- Dropdown list of saved logs
- Load selected log
- Delete selected log with confirmation

### 3. Print/PDF Generation API

#### `printPdfBtn` Event Handler
**Purpose**: Generates PDF-ready print layout in A4 2-up format
**Process**:
1. Collects current form data
2. Populates hidden print areas (left and right pages)
3. Triggers browser print dialog
4. Hides print area after printing

**Print Layout Features**:
- A4 paper size optimization
- 2-up layout (two forms per page)
- Grid-lined text areas
- Professional formatting
- Print-specific CSS styling

### 4. Toast Notification API

#### `showToast(message)`
**Purpose**: Displays temporary notification messages
**Parameters**:
- `message` (string): Message to display
**Returns**: void
**Duration**: 3 seconds
**Usage**:
```javascript
showToast('데이터가 저장되었습니다.');
showToast('오류가 발생했습니다.');
```

### 5. Modal Management API

#### Load Modal Functions
- **Open**: `loadBtn` click → `populateSavedLogsDropdown()` → show modal
- **Close**: Click close button or outside modal area
- **Actions**: Load selected log or delete selected log

#### `populateSavedLogsDropdown()`
**Purpose**: Populates dropdown with available saved logs
**Parameters**: None
**Returns**: void
**Data Source**: localStorage `railwaySignalSavedLogs`

## 🎨 UI Components

### 1. Form Input Components

#### Date/Time Input
```html
<input type="datetime-local" id="dateTime">
```
- **Purpose**: Work date and time entry
- **Format**: YYYY-MM-DDTHH:MM
- **Auto-initialization**: Current date/time on load

#### Numeric Inputs
```html
<input type="number" step="0.1" id="temperature" placeholder="예: 22.5">
<input type="number" step="1" id="humidity" placeholder="예: 55">
```
- **Temperature**: Decimal precision (0.1°C)
- **Humidity**: Integer percentage

#### Text Inputs
```html
<input type="text" id="workTarget" placeholder="예: 신호기 상1">
<input type="text" id="workers" placeholder="예: 김철수/5명">
<input type="text" id="testerUsed" placeholder="예: FLUKE 15B+ 테스터기">
<input type="text" id="measurementMethod" placeholder="예: 절연저항 1,000V 기준 측정">
```

#### Grid-lined Text Areas
```html
<textarea id="workContent" class="grid-line-1" rows="5"></textarea>
<textarea id="notes" class="grid-line-3" rows="6"></textarea>
```
- **grid-line-1**: 5-line textarea with grid background
- **grid-line-3**: 6-line textarea with grid background
- **Features**: Resizable, grid-lined for neat writing

### 2. Action Buttons

#### Save Button
```html
<button id="saveManualBtn" class="bg-green-500 hover:bg-green-700">수동 저장</button>
```
- **Color**: Green theme
- **Action**: Manual save with filename prompt

#### Load Button
```html
<button id="loadBtn" class="bg-yellow-500 hover:bg-yellow-700">데이터 불러오기</button>
```
- **Color**: Yellow theme
- **Action**: Opens load modal

#### Print Button
```html
<button id="printPdfBtn" class="bg-purple-500 hover:bg-purple-700">PDF 출력 (A4 2-up)</button>
```
- **Color**: Purple theme
- **Action**: Generates PDF print layout

### 3. Modal Components

#### Load Modal Structure
```html
<div id="loadModal" class="modal">
  <div class="modal-content">
    <span class="close-button">&times;</span>
    <h2>저장된 작업일지 불러오기</h2>
    <select id="savedLogsDropdown">...</select>
    <button id="confirmLoadBtn">불러오기</button>
    <button id="deleteSelectedLogBtn">선택된 로그 삭제</button>
  </div>
</div>
```

## 🔧 Service Worker API

### Cache Management

#### Cache Names
```javascript
const STATIC_CACHE = 'static-cache-v1.5';
const DYNAMIC_CACHE = 'dynamic-cache-v1.5';
const CACHE_NAME = 'railway-signal-work-log-mobile-v1.5';
```

#### Cached Resources
```javascript
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com/2.2.19/tailwind.min.css'
];
```

### Mobile Optimization Functions

#### `handleMobileRequest(request)`
**Purpose**: Handles network requests with mobile optimization
**Features**:
- Cache-first strategy for static resources
- Network-first with cache fallback for dynamic content
- Battery level consideration
- Offline support

#### `limitCacheSize(cacheName, maxItems)`
**Purpose**: Limits cache size for mobile storage optimization
**Parameters**:
- `cacheName` (string): Name of cache to limit
- `maxItems` (number): Maximum number of items to keep
**Returns**: Promise

#### Mobile Detection Functions
```javascript
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isOnline = () => navigator.onLine;
const getBatteryInfo = async () => { /* Battery API implementation */ };
```

### Service Worker Events

#### Install Event
- Caches static resources
- Sets up dynamic cache
- Enables skip waiting for immediate activation

#### Activate Event
- Cleans up old caches
- Claims clients for immediate control
- Optimizes mobile storage

#### Fetch Event
- Implements mobile-optimized caching strategy
- Handles offline scenarios
- Provides fallback responses

#### Message Event
- Handles client-to-SW communication
- Supports mobile optimization commands
- Battery save mode activation

## 📱 PWA Manifest Configuration

### App Identity
```json
{
  "name": "철도신호제어시설 작업일지",
  "short_name": "작업일지",
  "description": "철도신호제어시설 작업일지 작성 및 관리 앱"
}
```

### Display Configuration
```json
{
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2563eb",
  "background_color": "#ffffff"
}
```

### Icons
- **192x192**: Standard app icon
- **512x512**: High-resolution icon
- **Format**: SVG with base64 encoding
- **Theme**: Blue railway signal design

## 💾 Data Storage Schema

### localStorage Keys
- `railwaySignalSavedLogs`: Object containing all saved work logs

### Data Format
```javascript
{
  "20250115_작업일지": {
    dateTime: "2025-01-15T14:30",
    temperature: "22.5",
    humidity: "55",
    workTarget: "신호기 상1",
    workers: "김철수/5명",
    workContent: "신호기 점검 및 청소\n전기 계통 확인",
    testerUsed: "FLUKE 15B+ 테스터기",
    measurementMethod: "절연저항 1,000V 기준 측정",
    notes: "정상 작동 확인\n다음 점검일: 2025-02-15"
  }
}
```

## 🎨 CSS Classes and Styling

### Custom CSS Classes

#### Grid-lined Text Areas
```css
.grid-line-1 {
    background-image: linear-gradient(to bottom, transparent 98%, #ccc 98%);
    background-size: 100% 24px;
    line-height: 24px;
    min-height: 120px;
}

.grid-line-3 {
    background-image: linear-gradient(to bottom, transparent 98%, #ccc 98%);
    background-size: 100% 24px;
    line-height: 24px;
    min-height: 144px;
}
```

#### Card Component
```css
.card {
    background-color: #ffffff;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

#### Header Background
```css
.header-bg {
    background: linear-gradient(to right, #1a73e8, #3f8ce3);
    background-image: url('data:image/svg+xml;utf8,...');
}
```

### Print Styles
- **Media Query**: `@media print`
- **Layout**: A4 2-up format
- **Optimization**: Removes UI elements, optimizes for printing
- **Grid Lines**: Maintained in print version

## 🔍 Usage Examples

### Basic Form Usage
```javascript
// Initialize form
setInitialDateTime();

// Fill form data
document.getElementById('temperature').value = '22.5';
document.getElementById('humidity').value = '55';
document.getElementById('workTarget').value = '신호기 상1';

// Save data
document.getElementById('saveManualBtn').click();
// User will be prompted for filename
```

### Loading Saved Data
```javascript
// Open load modal
document.getElementById('loadBtn').click();

// Select from dropdown and load
document.getElementById('savedLogsDropdown').value = '20250115_작업일지';
document.getElementById('confirmLoadBtn').click();
```

### Printing
```javascript
// Generate PDF
document.getElementById('printPdfBtn').click();
// Browser print dialog will open with A4 2-up layout
```

### Service Worker Integration
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.error('SW registration failed'));
}

// Send message to service worker
navigator.serviceWorker.ready.then(registration => {
    registration.active.postMessage({
        type: 'MOBILE_OPTIMIZE',
        options: { reduceBandwidth: true }
    });
});
```

## 🔒 Security Considerations

### Data Privacy
- All data stored locally in browser
- No external data transmission
- User controls data persistence

### Input Validation
- HTML5 input types provide basic validation
- Numeric inputs have step restrictions
- Required field validation through UI feedback

## 📱 Mobile Optimization Features

### Responsive Design
- **Breakpoints**: 360px minimum width to desktop
- **Grid System**: Tailwind CSS responsive grid
- **Touch-Friendly**: Large buttons and input areas

### PWA Features
- **Offline Support**: Full functionality without internet
- **App-like Experience**: Standalone display mode
- **Fast Loading**: Service worker caching
- **Mobile Installation**: Add to home screen capability

### Battery Optimization
- **Low Battery Mode**: Reduced caching when battery < 20%
- **Efficient Caching**: Size-limited dynamic cache
- **Background Sync**: Minimal background processing

## 🚀 Performance Optimization

### Caching Strategy
- **Static Resources**: Cache-first strategy
- **Dynamic Content**: Network-first with cache fallback
- **Cache Limits**: 20 items for dynamic cache, 15 for low battery

### Mobile-Specific Optimizations
- **Viewport Meta**: Optimized for mobile displays
- **Touch Events**: Responsive touch interactions
- **Storage Management**: Automatic cache cleanup

## 🔧 Development and Extension

### Adding New Form Fields
1. Add HTML input element with unique ID
2. Update data collection in save function
3. Add to print template
4. Update localStorage schema

### Customizing Print Layout
1. Modify print CSS media queries
2. Update print data population
3. Adjust A4 layout dimensions

### Extending Service Worker
1. Add new cache strategies
2. Implement additional offline features
3. Add background sync capabilities

## 📚 Browser Compatibility

### Supported Features
- **Service Workers**: Chrome 40+, Firefox 44+, Safari 11.1+
- **PWA Manifest**: Chrome 39+, Firefox 49+, Safari 11.1+
- **localStorage**: All modern browsers
- **CSS Grid**: Chrome 57+, Firefox 52+, Safari 10.1+

### Fallback Behavior
- **No Service Worker**: Application still functions without offline support
- **No PWA Support**: Works as regular web application
- **Limited CSS Support**: Graceful degradation with basic styling

## 🆘 Troubleshooting

### Common Issues

#### Data Not Saving
- Check localStorage availability
- Verify filename input
- Check browser storage limits

#### Print Not Working
- Verify popup blockers
- Check print CSS media queries
- Try different browsers

#### Offline Mode Issues
- Ensure service worker registration
- Check cache status
- Verify network connectivity

### Debug Tools
```javascript
// Check localStorage
console.log(localStorage.getItem('railwaySignalSavedLogs'));

// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(registrations);
});

// Check cache contents
caches.keys().then(names => console.log(names));
```

## 📞 Support and Maintenance

### Regular Maintenance
- Clear old cache versions
- Update service worker version numbers
- Monitor localStorage usage
- Test print functionality across browsers

### Version Management
- Update cache names for new versions
- Maintain backward compatibility
- Document breaking changes

---

*This documentation covers all public APIs, functions, and components of the Railway Signal Control Facility Work Log application. For additional support or feature requests, please refer to the project repository.*