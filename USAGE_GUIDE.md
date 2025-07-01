# Railway Signal Work Log - Usage Guide

## 📋 Getting Started

This comprehensive usage guide will help you understand and effectively use the Railway Signal Control Facility Work Log application. The guide covers everything from basic usage to advanced customization and integration.

## 🚀 Quick Start

### 1. Opening the Application

#### Web Browser
1. Open your web browser
2. Navigate to the application URL
3. The app will automatically load and initialize

#### Mobile Device (PWA)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Install as a Progressive Web App for offline access

### 2. First Time Setup

The application automatically:
- Sets current date and time
- Initializes localStorage for data persistence
- Registers the Service Worker for offline functionality
- Prepares the form for input

## 📝 Basic Usage

### 1. Filling Out a Work Log

#### Step-by-Step Process

1. **Date and Time**
   ```javascript
   // Automatically set to current time, or manually adjust
   document.getElementById('dateTime').value = '2025-01-15T14:30';
   ```

2. **Environmental Conditions**
   ```javascript
   // Temperature in Celsius
   document.getElementById('temperature').value = '22.5';
   
   // Humidity percentage
   document.getElementById('humidity').value = '55';
   ```

3. **Work Information**
   ```javascript
   // Work target
   document.getElementById('workTarget').value = '신호기 상1';
   
   // Workers and count
   document.getElementById('workers').value = '김철수/5명';
   ```

4. **Work Details**
   ```javascript
   // Work content (multi-line with grid background)
   document.getElementById('workContent').value = 
       '신호기 점검 및 청소\n전기 계통 확인\n정상 작동 테스트';
   
   // Testing equipment
   document.getElementById('testerUsed').value = 'FLUKE 15B+ 테스터기';
   
   // Measurement method
   document.getElementById('measurementMethod').value = '절연저항 1,000V 기준 측정';
   ```

5. **Special Notes**
   ```javascript
   // Special observations (multi-line grid)
   document.getElementById('notes').value = 
       '정상 작동 확인\n다음 점검일: 2025-02-15\n교체 필요 부품 없음';
   ```

### 2. Form Validation Examples

#### Built-in Validation
```javascript
// Check required fields before saving
function validateWorkLog() {
    const requiredFields = [
        { id: 'dateTime', name: '날짜/시간' },
        { id: 'workTarget', name: '작업대상' },
        { id: 'workers', name: '작업자 및 인원' }
    ];
    
    for (const field of requiredFields) {
        const value = document.getElementById(field.id).value.trim();
        if (!value) {
            showToast(`${field.name}을(를) 입력해주세요.`);
            document.getElementById(field.id).focus();
            return false;
        }
    }
    return true;
}
```

#### Custom Validation
```javascript
// Validate temperature range
function validateTemperature() {
    const temp = parseFloat(document.getElementById('temperature').value);
    if (temp < -50 || temp > 60) {
        showToast('온도는 -50°C에서 60°C 사이여야 합니다.');
        return false;
    }
    return true;
}

// Validate humidity range
function validateHumidity() {
    const humidity = parseInt(document.getElementById('humidity').value);
    if (humidity < 0 || humidity > 100) {
        showToast('습도는 0%에서 100% 사이여야 합니다.');
        return false;
    }
    return true;
}
```

## 💾 Data Management

### 1. Saving Work Logs

#### Manual Save
```javascript
// Save with custom filename
document.getElementById('saveManualBtn').addEventListener('click', function() {
    if (validateWorkLog()) {
        const filename = prompt("저장할 파일 이름을 입력하세요:");
        if (filename) {
            saveWorkLog(filename);
        }
    }
});

function saveWorkLog(filename) {
    const workLogData = {
        dateTime: document.getElementById('dateTime').value,
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        workTarget: document.getElementById('workTarget').value,
        workers: document.getElementById('workers').value,
        workContent: document.getElementById('workContent').value,
        testerUsed: document.getElementById('testerUsed').value,
        measurementMethod: document.getElementById('measurementMethod').value,
        notes: document.getElementById('notes').value
    };
    
    const savedLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
    savedLogs[filename] = workLogData;
    localStorage.setItem('railwaySignalSavedLogs', JSON.stringify(savedLogs));
    
    showToast(`'${filename}'으로 저장되었습니다.`);
}
```

#### Automatic Filename Generation
```javascript
function generateFilename() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    const target = document.getElementById('workTarget').value.slice(0, 10);
    return `${dateStr}_${timeStr}_${target}`;
}

// Usage
const autoFilename = generateFilename();
saveWorkLog(autoFilename);
```

### 2. Loading Saved Work Logs

#### Using the Load Modal
```javascript
// Open load modal
document.getElementById('loadBtn').addEventListener('click', function() {
    populateSavedLogsDropdown();
    document.getElementById('loadModal').style.display = 'flex';
});

// Load selected log
document.getElementById('confirmLoadBtn').addEventListener('click', function() {
    const selectedFilename = document.getElementById('savedLogsDropdown').value;
    if (selectedFilename) {
        loadWorkLog(selectedFilename);
        document.getElementById('loadModal').style.display = 'none';
    }
});

function loadWorkLog(filename) {
    const savedLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
    const data = savedLogs[filename];
    
    if (data) {
        // Populate all form fields
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key] || '';
            }
        });
        
        showToast(`'${filename}' 작업일지를 불러왔습니다.`);
    }
}
```

#### Programmatic Loading
```javascript
// Load most recent work log
function loadMostRecentLog() {
    const savedLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
    const filenames = Object.keys(savedLogs);
    
    if (filenames.length > 0) {
        // Sort by filename (assuming date-based naming)
        filenames.sort().reverse();
        const mostRecent = filenames[0];
        loadWorkLog(mostRecent);
        return mostRecent;
    }
    return null;
}
```

### 3. Data Export and Backup

#### Export All Data
```javascript
function exportAllData() {
    const savedLogs = localStorage.getItem('railwaySignalSavedLogs');
    if (savedLogs) {
        const dataBlob = new Blob([savedLogs], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `railway_logs_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('데이터가 백업 파일로 다운로드되었습니다.');
    }
}
```

#### Import Data
```javascript
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Merge with existing data
            const existingLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
            const mergedData = { ...existingLogs, ...importedData };
            
            localStorage.setItem('railwaySignalSavedLogs', JSON.stringify(mergedData));
            showToast('데이터가 성공적으로 가져와졌습니다.');
        } catch (error) {
            showToast('파일 형식이 올바르지 않습니다.');
        }
    };
    reader.readAsText(file);
}

// HTML file input handler
document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        importData(file);
    }
});
```

## 🖨️ Printing and PDF Generation

### 1. Basic Printing

#### Using the Print Button
```javascript
document.getElementById('printPdfBtn').addEventListener('click', function() {
    preparePrintLayout();
    window.print();
});

function preparePrintLayout() {
    const formData = collectFormData();
    
    // Populate both pages (2-up layout)
    populatePrintPage('Left', formData);
    populatePrintPage('Right', formData);
    
    // Show print area
    document.getElementById('printPreviewArea').classList.remove('hidden');
}
```

#### Custom Print Function
```javascript
function printWorkLog(filename = null) {
    // Load specific log if filename provided
    if (filename) {
        loadWorkLog(filename);
    }
    
    // Prepare and print
    preparePrintLayout();
    
    // Add print event listeners
    window.addEventListener('beforeprint', function() {
        console.log('Print dialog opened');
    });
    
    window.addEventListener('afterprint', function() {
        // Hide print area after printing
        document.getElementById('printPreviewArea').classList.add('hidden');
        console.log('Print dialog closed');
    });
    
    window.print();
}
```

### 2. Advanced Print Options

#### Print Multiple Logs
```javascript
function printMultipleLogs(filenames) {
    const printContainer = document.createElement('div');
    printContainer.className = 'print-area';
    
    filenames.forEach((filename, index) => {
        const savedLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
        const data = savedLogs[filename];
        
        if (data) {
            const printPage = createPrintPage(data, index);
            printContainer.appendChild(printPage);
        }
    });
    
    document.body.appendChild(printContainer);
    window.print();
    document.body.removeChild(printContainer);
}

function createPrintPage(data, index) {
    const page = document.createElement('div');
    page.className = 'print-page';
    page.innerHTML = `
        <h3>정밀진단작업일지 - ${index + 1}</h3>
        <div class="field-container">
            <label>날짜/시간:</label>
            <span>${data.dateTime}</span>
        </div>
        <!-- Add more fields -->
    `;
    return page;
}
```

#### Print with Custom Formatting
```javascript
function printWithCustomFormat(options = {}) {
    const {
        includeHeader = true,
        includeGridLines = true,
        fontSize = 'normal',
        paperSize = 'A4'
    } = options;
    
    // Apply custom styles
    const customStyles = `
        <style>
            @media print {
                .print-page {
                    font-size: ${fontSize === 'large' ? '1.2em' : '1em'};
                    ${!includeGridLines ? 'background-image: none !important;' : ''}
                }
                ${!includeHeader ? '.print-header { display: none !important; }' : ''}
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', customStyles);
    printWorkLog();
}
```

## 📱 Mobile and PWA Features

### 1. Installing as PWA

#### Check Installation Eligibility
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent automatic prompt
    e.preventDefault();
    deferredPrompt = e;
    
    // Show custom install button
    showInstallButton();
});

function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.textContent = '앱 설치';
    installBtn.onclick = installApp;
    document.body.appendChild(installBtn);
}

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showToast('앱이 설치되었습니다!');
        }
        
        deferredPrompt = null;
    }
}
```

### 2. Offline Usage

#### Check Online Status
```javascript
function updateOnlineStatus() {
    const status = navigator.onLine ? '온라인' : '오프라인';
    const indicator = document.getElementById('onlineStatus');
    
    if (indicator) {
        indicator.textContent = status;
        indicator.className = navigator.onLine ? 'online' : 'offline';
    }
    
    if (!navigator.onLine) {
        showToast('오프라인 모드입니다. 데이터는 로컬에만 저장됩니다.');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
```

#### Offline Data Sync
```javascript
function syncWhenOnline() {
    if (navigator.onLine) {
        // Implement sync logic here
        const pendingData = localStorage.getItem('pendingSync');
        if (pendingData) {
            // Process pending data
            processPendingSync(JSON.parse(pendingData));
        }
    }
}

window.addEventListener('online', syncWhenOnline);
```

### 3. Mobile Optimizations

#### Touch-Friendly Interactions
```javascript
// Add touch feedback
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', function() {
        this.classList.add('touching');
    });
    
    button.addEventListener('touchend', function() {
        this.classList.remove('touching');
    });
});
```

#### Responsive Text Areas
```javascript
function adjustTextAreaForMobile() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        // Auto-resize based on content
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Mobile-specific behavior
        if (window.innerWidth < 768) {
            textarea.addEventListener('focus', function() {
                // Scroll to textarea on mobile
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        }
    });
}
```

## 🔧 Advanced Customization

### 1. Adding Custom Fields

#### Programmatically Add Fields
```javascript
function addCustomField(config) {
    const container = document.getElementById('workLogForm');
    const gridContainer = container.querySelector('.grid');
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = config.fullWidth ? 'mb-4 col-span-1 md:col-span-2' : 'mb-4';
    
    const label = document.createElement('label');
    label.textContent = config.label;
    label.className = 'block text-gray-700 text-sm font-bold mb-2';
    label.setAttribute('for', config.id);
    
    let input;
    if (config.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = config.rows || 3;
    } else {
        input = document.createElement('input');
        input.type = config.type || 'text';
    }
    
    input.id = config.id;
    input.placeholder = config.placeholder || '';
    input.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
    
    fieldDiv.appendChild(label);
    fieldDiv.appendChild(input);
    gridContainer.appendChild(fieldDiv);
    
    return input;
}

// Usage examples
addCustomField({
    id: 'customField1',
    label: '추가 정보:',
    type: 'text',
    placeholder: '추가 정보를 입력하세요',
    fullWidth: true
});

addCustomField({
    id: 'customNotes',
    label: '추가 메모:',
    type: 'textarea',
    rows: 4,
    fullWidth: true
});
```

### 2. Custom Validation Rules

#### Add Field-Specific Validation
```javascript
class FieldValidator {
    constructor() {
        this.rules = new Map();
    }
    
    addRule(fieldId, validationFn, errorMessage) {
        this.rules.set(fieldId, { validationFn, errorMessage });
        
        // Add real-time validation
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => {
                this.validateField(fieldId);
            });
        }
    }
    
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const rule = this.rules.get(fieldId);
        
        if (field && rule) {
            const isValid = rule.validationFn(field.value);
            
            if (!isValid) {
                field.classList.add('border-red-500');
                showToast(rule.errorMessage);
                return false;
            } else {
                field.classList.remove('border-red-500');
                return true;
            }
        }
        
        return true;
    }
    
    validateAll() {
        let allValid = true;
        
        for (const fieldId of this.rules.keys()) {
            if (!this.validateField(fieldId)) {
                allValid = false;
            }
        }
        
        return allValid;
    }
}

// Usage
const validator = new FieldValidator();

validator.addRule('temperature', 
    value => value >= -50 && value <= 60,
    '온도는 -50°C에서 60°C 사이여야 합니다.'
);

validator.addRule('humidity',
    value => value >= 0 && value <= 100,
    '습도는 0%에서 100% 사이여야 합니다.'
);

validator.addRule('workers',
    value => /^.+\/\d+명?$/.test(value),
    '작업자는 "이름/인원수명" 형식으로 입력해주세요.'
);
```

### 3. Custom Themes

#### Theme Management
```javascript
class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                primary: '#2563eb',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444'
            },
            dark: {
                primary: '#3b82f6',
                success: '#34d399',
                warning: '#fbbf24',
                danger: '#f87171'
            },
            highContrast: {
                primary: '#000000',
                success: '#006600',
                warning: '#cc6600',
                danger: '#cc0000'
            }
        };
    }
    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;
        
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });
        
        localStorage.setItem('selectedTheme', themeName);
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        this.applyTheme(savedTheme);
    }
}

// Usage
const themeManager = new ThemeManager();
themeManager.loadSavedTheme();

// Add theme selector
function addThemeSelector() {
    const selector = document.createElement('select');
    selector.innerHTML = `
        <option value="default">기본 테마</option>
        <option value="dark">다크 테마</option>
        <option value="highContrast">고대비 테마</option>
    `;
    
    selector.addEventListener('change', (e) => {
        themeManager.applyTheme(e.target.value);
    });
    
    document.querySelector('header').appendChild(selector);
}
```

## 🔍 Troubleshooting

### 1. Common Issues and Solutions

#### Data Not Saving
```javascript
function debugStorage() {
    // Check localStorage availability
    if (typeof(Storage) === "undefined") {
        console.error('localStorage is not supported');
        showToast('브라우저가 데이터 저장을 지원하지 않습니다.');
        return false;
    }
    
    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
            console.log('Storage quota:', estimate.quota);
            console.log('Storage usage:', estimate.usage);
            
            const usagePercent = (estimate.usage / estimate.quota) * 100;
            if (usagePercent > 90) {
                showToast('저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.');
            }
        });
    }
    
    return true;
}
```

#### Form Reset Issues
```javascript
function forceFormReset() {
    // Clear all form fields
    const form = document.getElementById('workLogForm');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset date to current
    setInitialDateTime();
    
    showToast('폼이 초기화되었습니다.');
}
```

#### Print Issues
```javascript
function debugPrint() {
    // Check if print is supported
    if (!window.print) {
        showToast('이 브라우저는 인쇄를 지원하지 않습니다.');
        return false;
    }
    
    // Check print styles
    const printStyles = Array.from(document.styleSheets).find(sheet => {
        try {
            return Array.from(sheet.cssRules).some(rule => 
                rule.media && rule.media.mediaText.includes('print')
            );
        } catch (e) {
            return false;
        }
    });
    
    if (!printStyles) {
        console.warn('Print styles not found');
    }
    
    return true;
}
```

### 2. Performance Optimization

#### Optimize for Large Datasets
```javascript
function optimizeForLargeDatasets() {
    const savedLogs = JSON.parse(localStorage.getItem('railwaySignalSavedLogs') || '{}');
    const logCount = Object.keys(savedLogs).length;
    
    if (logCount > 100) {
        // Implement pagination for dropdown
        paginateDropdown(savedLogs);
        
        // Show cleanup suggestion
        showToast(`${logCount}개의 저장된 로그가 있습니다. 정리를 권장합니다.`);
    }
}

function paginateDropdown(logs, pageSize = 50) {
    const dropdown = document.getElementById('savedLogsDropdown');
    const filenames = Object.keys(logs).sort().reverse();
    
    // Clear existing options
    dropdown.innerHTML = '<option value="">-- 작업일지 선택 --</option>';
    
    // Add first page
    filenames.slice(0, pageSize).forEach(filename => {
        const option = document.createElement('option');
        option.value = filename;
        option.textContent = filename;
        dropdown.appendChild(option);
    });
    
    // Add "Load More" option if needed
    if (filenames.length > pageSize) {
        const loadMore = document.createElement('option');
        loadMore.value = '__load_more__';
        loadMore.textContent = `-- 더 보기 (${filenames.length - pageSize}개 더) --`;
        dropdown.appendChild(loadMore);
    }
}
```

## 🎯 Best Practices

### 1. Data Management
- Save work logs with descriptive filenames
- Regular backup of important data
- Clean up old or unnecessary logs periodically
- Use validation to ensure data quality

### 2. Mobile Usage
- Install as PWA for better offline experience
- Use landscape mode for easier data entry
- Take advantage of auto-save features
- Keep the app updated for latest features

### 3. Printing
- Preview before printing to save paper
- Use 2-up layout for efficiency
- Check print settings for optimal output
- Consider saving as PDF for digital records

### 4. Performance
- Limit stored logs to reasonable numbers
- Clear browser cache if experiencing issues
- Use latest browser versions for best performance
- Monitor storage usage regularly

---

*This usage guide provides comprehensive instructions for effectively using all features of the Railway Signal Work Log application. For additional support, refer to the API documentation and component guides.*