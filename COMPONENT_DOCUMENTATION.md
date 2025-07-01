# UI Components Documentation

## 📋 Overview

This document provides detailed documentation for all UI components in the Railway Signal Control Facility Work Log application, including their properties, methods, events, and usage examples.

## 🎨 Form Components

### 1. WorkLogForm Component

#### Structure
```html
<section id="workLogForm" class="card p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4 text-blue-700">작업 정보 입력</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Form inputs -->
    </div>
    <div class="flex flex-wrap gap-3 justify-center mt-6">
        <!-- Action buttons -->
    </div>
</section>
```

#### Properties
- **ID**: `workLogForm`
- **Classes**: `card p-6 mb-8`
- **Layout**: CSS Grid (1 column on mobile, 2 columns on desktop)
- **Responsive**: Tailwind CSS responsive classes

#### Child Components
- Date/Time Input
- Temperature Input
- Humidity Input
- Work Target Input
- Workers Input
- Work Content Textarea
- Tester Used Input
- Measurement Method Input
- Notes Textarea
- Action Buttons

### 2. DateTime Input Component

#### HTML Structure
```html
<div class="mb-4">
    <label for="dateTime" class="block text-gray-700 text-sm font-bold mb-2">날짜/시간:</label>
    <input type="datetime-local" id="dateTime" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
</div>
```

#### Properties
- **Type**: `datetime-local`
- **ID**: `dateTime`
- **Format**: YYYY-MM-DDTHH:MM
- **Auto-initialization**: Current date/time on page load

#### Methods
```javascript
// Initialize with current date/time
setInitialDateTime();

// Get value
const currentDateTime = document.getElementById('dateTime').value;

// Set value
document.getElementById('dateTime').value = '2025-01-15T14:30';
```

#### Events
- **change**: Triggered when user changes date/time
- **input**: Triggered on each input change

#### Usage Example
```javascript
// Listen for date changes
document.getElementById('dateTime').addEventListener('change', function(e) {
    console.log('Date changed to:', e.target.value);
    // Auto-save or validation logic here
});
```

### 3. Numeric Input Components

#### Temperature Input
```html
<div class="mb-4">
    <label for="temperature" class="block text-gray-700 text-sm font-bold mb-2">온도 (℃):</label>
    <input type="number" step="0.1" id="temperature" placeholder="예: 22.5" 
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
</div>
```

#### Properties
- **Type**: `number`
- **Step**: `0.1` (decimal precision)
- **Placeholder**: `예: 22.5`
- **Validation**: HTML5 number validation

#### Humidity Input
```html
<div class="mb-4">
    <label for="humidity" class="block text-gray-700 text-sm font-bold mb-2">습도 (%):</label>
    <input type="number" step="1" id="humidity" placeholder="예: 55" 
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
</div>
```

#### Properties
- **Type**: `number`
- **Step**: `1` (integer values)
- **Placeholder**: `예: 55`
- **Range**: 0-100 (implied for humidity)

#### Usage Example
```javascript
// Set temperature with validation
function setTemperature(temp) {
    const tempInput = document.getElementById('temperature');
    if (temp >= -50 && temp <= 60) { // Reasonable range
        tempInput.value = temp;
    } else {
        showToast('온도 값이 범위를 벗어났습니다.');
    }
}

// Set humidity with validation
function setHumidity(humidity) {
    const humidityInput = document.getElementById('humidity');
    if (humidity >= 0 && humidity <= 100) {
        humidityInput.value = humidity;
    } else {
        showToast('습도 값은 0-100% 사이여야 합니다.');
    }
}
```

### 4. Text Input Components

#### Work Target Input
```html
<div class="mb-4">
    <label for="workTarget" class="block text-gray-700 text-sm font-bold mb-2">작업대상:</label>
    <input type="text" id="workTarget" placeholder="예: 신호기 상1" 
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
</div>
```

#### Workers Input
```html
<div class="mb-4 col-span-1 md:col-span-2">
    <label for="workers" class="block text-gray-700 text-sm font-bold mb-2">작업자 및 인원:</label>
    <input type="text" id="workers" placeholder="예: 김철수/5명" 
           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
</div>
```

#### Properties
- **Type**: `text`
- **Responsive**: Full width, spans 2 columns on desktop
- **Placeholder**: Korean business examples
- **Validation**: Client-side validation available

#### Usage Example
```javascript
// Auto-format workers input
document.getElementById('workers').addEventListener('blur', function(e) {
    const value = e.target.value;
    // Auto-format if pattern matches
    const match = value.match(/^([^\/]+)\/(\d+)$/);
    if (match) {
        const [, name, count] = match;
        e.target.value = `${name.trim()}/${count}명`;
    }
});
```

### 5. Grid-lined Textarea Components

#### Work Content Textarea
```html
<div class="mb-4 col-span-1 md:col-span-2">
    <label for="workContent" class="block text-gray-700 text-sm font-bold mb-2">작업내용:</label>
    <textarea id="workContent" placeholder="작업 내용을 입력하세요." rows="5" 
              class="grid-line-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
</div>
```

#### Notes Textarea
```html
<div class="mb-4 col-span-1 md:col-span-2">
    <label for="notes" class="block text-gray-700 text-sm font-bold mb-2">특이사항:</label>
    <textarea id="notes" placeholder="특이사항을 입력하세요." rows="6" 
              class="grid-line-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
</div>
```

#### Properties
- **Grid Lines**: CSS background with grid pattern
- **Resizable**: Vertical resize enabled
- **Min Height**: 120px (work content), 144px (notes)
- **Line Height**: 24px matching grid pattern

#### CSS Implementation
```css
.grid-line-1 {
    background-image: linear-gradient(to bottom, transparent 98%, #ccc 98%);
    background-size: 100% 24px;
    line-height: 24px;
    resize: vertical;
    min-height: 120px;
}

.grid-line-3 {
    background-image: linear-gradient(to bottom, transparent 98%, #ccc 98%);
    background-size: 100% 24px;
    line-height: 24px;
    resize: vertical;
    min-height: 144px;
}
```

#### Usage Example
```javascript
// Auto-resize textarea based on content
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 120) + 'px';
}

// Apply to both textareas
document.getElementById('workContent').addEventListener('input', function() {
    autoResizeTextarea(this);
});

document.getElementById('notes').addEventListener('input', function() {
    autoResizeTextarea(this);
});
```

## 🎛️ Action Button Components

### 1. Save Button Component

#### HTML Structure
```html
<button id="saveManualBtn" 
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
    수동 저장
</button>
```

#### Properties
- **ID**: `saveManualBtn`
- **Color Scheme**: Green (success)
- **States**: Normal, Hover, Focus, Active
- **Transition**: 200ms duration

#### Events
- **click**: Triggers manual save with filename prompt

#### Usage Example
```javascript
// Custom save handler
document.getElementById('saveManualBtn').addEventListener('click', function() {
    // Validate form before saving
    if (validateForm()) {
        // Proceed with save
        const filename = prompt("저장할 파일 이름을 입력하세요:");
        if (filename) {
            saveWorkLog(filename);
        }
    } else {
        showToast('필수 항목을 입력해주세요.');
    }
});

function validateForm() {
    const required = ['dateTime', 'workTarget', 'workers'];
    return required.every(id => document.getElementById(id).value.trim());
}
```

### 2. Load Button Component

#### HTML Structure
```html
<button id="loadBtn" 
        class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
    데이터 불러오기
</button>
```

#### Properties
- **ID**: `loadBtn`
- **Color Scheme**: Yellow (warning/action)
- **Modal Trigger**: Opens load modal

#### Events
- **click**: Opens load modal with saved logs

### 3. Print Button Component

#### HTML Structure
```html
<button id="printPdfBtn" 
        class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
    PDF 출력 (A4 2-up)
</button>
```

#### Properties
- **ID**: `printPdfBtn`
- **Color Scheme**: Purple (utility)
- **Print Layout**: A4 2-up format

#### Events
- **click**: Generates print layout and opens print dialog

## 🪟 Modal Components

### 1. Load Modal Component

#### HTML Structure
```html
<div id="loadModal" class="modal">
    <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2 class="text-xl font-bold mb-4">저장된 작업일지 불러오기</h2>
        <select id="savedLogsDropdown" class="w-full p-2 border rounded mb-4">
            <option value="">-- 작업일지 선택 --</option>
        </select>
        <button id="confirmLoadBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            불러오기
        </button>
        <button id="deleteSelectedLogBtn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mt-2">
            선택된 로그 삭제
        </button>
    </div>
</div>
```

#### Properties
- **ID**: `loadModal`
- **Display**: Hidden by default (`display: none`)
- **Position**: Fixed overlay
- **Z-index**: 1000

#### CSS Implementation
```css
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 500px;
}
```

#### Methods
```javascript
// Show modal
function showLoadModal() {
    populateSavedLogsDropdown();
    document.getElementById('loadModal').style.display = 'flex';
}

// Hide modal
function hideLoadModal() {
    document.getElementById('loadModal').style.display = 'none';
}

// Populate dropdown with saved logs
function populateSavedLogsDropdown() {
    const dropdown = document.getElementById('savedLogsDropdown');
    dropdown.innerHTML = '<option value="">-- 작업일지 선택 --</option>';
    
    const logs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
    Object.keys(logs).forEach(filename => {
        const option = document.createElement('option');
        option.value = filename;
        option.textContent = filename;
        dropdown.appendChild(option);
    });
}
```

#### Events
- **click** (close button): Closes modal
- **click** (outside modal): Closes modal
- **click** (confirm load): Loads selected log
- **click** (delete): Deletes selected log with confirmation

### 2. Dropdown Component

#### HTML Structure
```html
<select id="savedLogsDropdown" class="w-full p-2 border rounded mb-4">
    <option value="">-- 작업일지 선택 --</option>
    <!-- Dynamic options populated by JavaScript -->
</select>
```

#### Properties
- **ID**: `savedLogsDropdown`
- **Dynamic Content**: Populated from localStorage
- **Styling**: Full width, padded, rounded borders

#### Usage Example
```javascript
// Listen for selection changes
document.getElementById('savedLogsDropdown').addEventListener('change', function(e) {
    const selectedLog = e.target.value;
    if (selectedLog) {
        // Enable action buttons
        document.getElementById('confirmLoadBtn').disabled = false;
        document.getElementById('deleteSelectedLogBtn').disabled = false;
    } else {
        // Disable action buttons
        document.getElementById('confirmLoadBtn').disabled = true;
        document.getElementById('deleteSelectedLogBtn').disabled = true;
    }
});
```

## 🔔 Toast Notification Component

### HTML Structure
```html
<div id="toast" class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-md transition-opacity duration-300 opacity-0 hidden">
    알림 메시지
</div>
```

### Properties
- **ID**: `toast`
- **Position**: Fixed at bottom center
- **Animation**: Opacity transition (300ms)
- **Auto-hide**: 3 seconds

### CSS Implementation
```css
#toast {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: #374151;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: opacity 300ms;
    opacity: 0;
    z-index: 1001;
}

#toast.show {
    opacity: 1;
}
```

### Methods
```javascript
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, duration);
}
```

### Usage Examples
```javascript
// Success message
showToast('데이터가 성공적으로 저장되었습니다.');

// Error message
showToast('오류가 발생했습니다. 다시 시도해주세요.');

// Custom duration
showToast('잠시만 기다려주세요...', 5000);
```

## 🖨️ Print Layout Components

### Print Area Structure
```html
<div id="printPreviewArea" class="print-area hidden">
    <div class="print-page">
        <!-- Left page content -->
    </div>
    <div class="print-page">
        <!-- Right page content -->
    </div>
</div>
```

### Print Page Component
```html
<div class="print-page">
    <h3 class="text-center font-bold text-lg mb-3 hide-on-print">정밀진단작업일지</h3>
    <div class="field-container flex">
        <label>날짜/시간:</label>
        <span id="printDateTimeLeft"></span>
    </div>
    <!-- More field containers -->
</div>
```

### CSS Implementation
```css
@media print {
    .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-around;
        padding: 10mm;
    }
    
    .print-page {
        width: 48%;
        border: 1px solid black;
        box-sizing: border-box;
        padding: 5mm;
    }
    
    .field-container {
        margin-bottom: 8px;
    }
    
    .hide-on-print {
        display: none !important;
    }
}
```

### Usage Example
```javascript
function preparePrintLayout() {
    const data = collectFormData();
    
    // Populate both pages with same data (2-up layout)
    ['Left', 'Right'].forEach(side => {
        document.getElementById(`printDateTime${side}`).textContent = data.dateTime;
        document.getElementById(`printTemperature${side}`).textContent = data.temperature;
        // ... populate other fields
    });
    
    // Show print area
    document.getElementById('printPreviewArea').classList.remove('hidden');
    
    // Trigger print
    window.print();
    
    // Hide print area after printing
    setTimeout(() => {
        document.getElementById('printPreviewArea').classList.add('hidden');
    }, 500);
}
```

## 📱 Responsive Behavior

### Breakpoints
- **Mobile**: < 768px (1 column layout)
- **Tablet**: 768px - 1024px (2 column layout)
- **Desktop**: > 1024px (2 column layout with more spacing)

### Grid System
```css
.grid {
    display: grid;
    grid-template-columns: 1fr; /* Mobile: 1 column */
    gap: 1rem;
}

@media (min-width: 768px) {
    .grid {
        grid-template-columns: repeat(2, 1fr); /* Desktop: 2 columns */
    }
}
```

### Mobile Optimizations
- **Touch Targets**: Minimum 44px height for buttons
- **Input Sizing**: Full width inputs with adequate padding
- **Viewport**: Optimized meta viewport tag
- **Gestures**: Scroll-friendly textarea components

## 🎨 Theming and Customization

### Color Scheme
```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --text-color: #374151;
    --background-color: #f9fafb;
}
```

### Button Variants
```javascript
const buttonVariants = {
    primary: 'bg-blue-500 hover:bg-blue-700',
    success: 'bg-green-500 hover:bg-green-700',
    warning: 'bg-yellow-500 hover:bg-yellow-700',
    danger: 'bg-red-500 hover:bg-red-700'
};
```

### Custom CSS Classes
- **`.card`**: White background with rounded corners and shadow
- **`.grid-line-1`**: 5-line grid background for textareas
- **`.grid-line-3`**: 6-line grid background for textareas
- **`.header-bg`**: Gradient background for header
- **`.modal`**: Full-screen overlay for modals

## 🔧 Component Extension

### Adding New Input Components
```javascript
function createInputComponent(config) {
    const container = document.createElement('div');
    container.className = 'mb-4';
    
    const label = document.createElement('label');
    label.textContent = config.label;
    label.className = 'block text-gray-700 text-sm font-bold mb-2';
    
    const input = document.createElement('input');
    input.type = config.type || 'text';
    input.id = config.id;
    input.placeholder = config.placeholder || '';
    input.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
}

// Usage
const newInput = createInputComponent({
    label: '새 필드:',
    id: 'newField',
    type: 'text',
    placeholder: '예시 값'
});
```

### Custom Validation
```javascript
function addValidation(inputId, validationFn, errorMessage) {
    const input = document.getElementById(inputId);
    input.addEventListener('blur', function() {
        if (!validationFn(this.value)) {
            this.classList.add('border-red-500');
            showToast(errorMessage);
        } else {
            this.classList.remove('border-red-500');
        }
    });
}

// Usage
addValidation('temperature', 
    value => value >= -50 && value <= 60,
    '온도는 -50°C에서 60°C 사이여야 합니다.'
);
```

---

*This component documentation provides detailed information about all UI components in the Railway Signal Work Log application. Each component includes structure, properties, methods, events, and usage examples for easy implementation and customization.*