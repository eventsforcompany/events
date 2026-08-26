document.getElementById('exportPdfBtn').addEventListener('click', function() {
    console.log('📄 Экспорт начат (JPEG)...');
    
    // ============================================================
    // 🔧 НАСТРОЙКИ ДЛЯ JPEG (играйте с этими параметрами)
    // ============================================================
    var CONFIG = {
        // Ширина контейнера для скриншота
        containerWidth: 3000,        // Попробуйте: 3000, 4000, 4500, 5000
        
        // Отступы внутри контейнера
        containerPadding: '5px 5px 5px 5px',
        
        // Масштаб скриншота (1-3)
        screenshotScale: 3,        // 2 = хорошо, 2.5 = отлично, 3 = превосходно
        
        // Качество JPEG (0.7-1.0)
        jpegQuality: 0.95,           // 0.95 = отличное качество
        
        // Задержка перед скриншотом (мс)
        renderDelay: 1500,
        
        // Имя файла
        fileName: 'calendar_' + new Date().toISOString().slice(0,10) + '.jpg',
    };
    // ============================================================
    
    var containers = document.querySelectorAll('.timeline-container');
    if (containers.length === 0) {
        alert('❌ Нет данных для экспорта');
        return;
    }
    
    var exportContainers = Array.from(containers).slice(1, 10);
    
    // Создаем контейнер
    var wrapper = document.createElement('div');
    wrapper.style.cssText = `
        position: relative;
        left: 0;
        top: 0;
        width: ${CONFIG.containerWidth}px;
        background: #ffffff;
        z-index: 999999;
        padding: ${CONFIG.containerPadding};
        font-family: Arial, sans-serif;
    `;
    
    // ---- Заголовок ----
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;padding:0 2px;';
    

    
    var date = document.createElement('span');
    var now = new Date();
    date.textContent = now.toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' });
    date.style.cssText = 'color:#555;font-size:8px;';
    header.appendChild(date);
    wrapper.appendChild(header);
    
    // ---- Копируем контейнеры ----
    exportContainers.forEach(function(c, index) {
        var clone = c.cloneNode(true);
        clone.style.cssText = `
            margin-bottom: 1px;
            border: 1px solid #ccc;
            padding: 5px 5px 5px 5px;
            border-radius: 1px;
            background: #fff;
            width: 100%;
            overflow: visible;
        `;
        
        var monthTitle = clone.querySelector('.month-title');
        if (monthTitle) {
            monthTitle.style.cssText = 'font-size:16px;color:#555;font-weight:bold;margin:0 0 8px 0;padding:0;';
        }
        
        var innerContainer = clone.querySelector('.jqtl-container');
        if (innerContainer) {
            innerContainer.style.cssText = `
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
            `;
        }
        
        var canvases = clone.querySelectorAll('canvas');
        canvases.forEach(function(canvas) {
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.background = '#fff'; // фон календаря
        });
        
        var eventNodes = clone.querySelectorAll('.jqtl-event-node');
        eventNodes.forEach(function(node) {
            node.style.margin = '0';
            node.style.padding = '2px 0';
            var labels = node.querySelectorAll('.jqtl-event-label, .event-label');
            labels.forEach(function(label) {
                label.style.fontSize = '9px';
                label.style.fontWeight = 'bold';
            });
            var contents = node.querySelectorAll('.jqtl-event-content, .event-content');
            contents.forEach(function(content) {
                content.style.fontSize = '10px';
            });
        });
        
        var sidebar = clone.querySelector('.jqtl-side-index');
        if (sidebar) {
            sidebar.style.margin = '0';
            sidebar.style.padding = '0 2px 0 0';
            sidebar.style.background = '#000'; // фон бар
            var items = sidebar.querySelectorAll('.jqtl-side-index-item');
            items.forEach(function(item) {
                item.style.fontSize = '10px';
                item.style.padding = '1px 0';
                item.style.margin = '0';
                item.style.background = '#fff'; // фон бар
            });
        }
        
        wrapper.appendChild(clone);
        console.log('  ✅ Контейнер ' + (index + 1) + ' скопирован');
    });
    
    document.body.appendChild(wrapper);
    console.log('✅ Контейнер создан, размер:', CONFIG.containerWidth + 'px');
    
    var btn = this;
    var origText = btn.textContent;
    btn.textContent = '⏳ Создание JPEG...';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    
    setTimeout(function() {
        var wrapperHeight = wrapper.scrollHeight;
        var wrapperWidth = wrapper.scrollWidth;
        console.log('📐 Размеры:', wrapperWidth + 'x' + wrapperHeight);
        
        html2canvas(wrapper, {
            scale: CONFIG.screenshotScale,
            useCORS: true,
            logging: false,
            width: wrapperWidth,
            height: wrapperHeight,
            windowWidth: wrapperWidth,
            windowHeight: wrapperHeight,
            onclone: function(doc) {
                doc.querySelectorAll('canvas').forEach(function(c) {
                    c.style.width = '100%';
                    c.style.height = 'auto';
                });
            }
        }).then(function(canvas) {
            console.log('✅ Скриншот создан');
            
            // Создаем ссылку для скачивания JPEG
            var link = document.createElement('a');
            link.download = CONFIG.fileName;
            link.href = canvas.toDataURL('image/jpeg', CONFIG.jpegQuality);
            link.click();
            
            document.body.removeChild(wrapper);
            btn.textContent = origText;
            btn.disabled = false;
            btn.style.opacity = '1';
            console.log('✅ JPEG сохранен!');
            
        }).catch(function(err) {
            console.error('❌ Ошибка:', err);
            alert('❌ Ошибка: ' + err.message);
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
            btn.textContent = origText;
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }, CONFIG.renderDelay);
});