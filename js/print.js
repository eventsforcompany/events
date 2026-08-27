document.getElementById('exportPdfBtn').addEventListener('click', function() {
    console.log('📄 Экспорт начат (JPEG)...');
    
    // ============================================================
    // 🔧 НАСТРОЙКИ ДЛЯ JPEG
    // ============================================================
    var CONFIG = {
        // Ширина контейнера для скриншота
        containerWidth: 3000,
        
        // Отступы внутри контейнера
        containerPadding: '5px 5px 5px 5px',
        
        // Масштаб скриншота (1-3)
        screenshotScale: 3,
        
        // Качество JPEG (0.7-1.0)
        jpegQuality: 0.95,
        
        // Задержка перед скриншотом (мс)
        renderDelay: 1500,
        
        // Имя файла
        fileName: 'calendar_' + new Date().toISOString().slice(0,10) + '.jpg',
        
        // 🆕 ЦВЕТ ВЕРТИКАЛЬНЫХ ЛИНИЙ МЕЖДУ ДНЯМИ
        verticalLineColor: '#333333',
        
        // 🆕 ТОЛЩИНА ВЕРТИКАЛЬНЫХ ЛИНИЙ
        verticalLineWidth: 0.5,
        
        // 🆕 ПУНКТИРНАЯ ЛИНИЯ (массив с длиной штриха и промежутка)
        verticalLineDash: [ ],
        
        // 🆕 ЦВЕТ ГОРИЗОНТАЛЬНЫХ ЛИНИЙ (только по нижней границе)
        horizontalLineColor: '#222222',
        
        // 🆕 ТОЛЩИНА ГОРИЗОНТАЛЬНЫХ ЛИНИЙ
        horizontalLineWidth: 0.5,
        
        // 🆕 ПУНКТИР ДЛЯ ГОРИЗОНТАЛЬНЫХ ЛИНИЙ
        horizontalLineDash: [4, 6],
        
        // 🆕 ОТСТУП ОТ ВЕРХА ДЛЯ ПЕРВОЙ ГОРИЗОНТАЛЬНОЙ ЛИНИИ
        horizontalLineOffset: 1,  // Высота заголовка с днями недели
        
        // 🆕 ВЫСОТА СТРОКИ ДЛЯ ВЫРАВНИВАНИЯ (в пикселях)
        rowHeight: 50,
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
            position: relative;
        `;
        
        var monthTitle = clone.querySelector('.month-title');
        if (monthTitle) {
            monthTitle.style.cssText = 'font-size:12px;color:#555;font-weight:bold;margin:0 0 8px 0;padding:0;';
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
                position: relative;
            `;
        }
        
        var canvases = clone.querySelectorAll('canvas');
        canvases.forEach(function(canvas) {
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.background = '#fff';
        });
        
        // 🆕 ВЫРАВНИВАЕМ СОБЫТИЯ ПО ВЕРТИКАЛИ
        var eventNodes = clone.querySelectorAll('.jqtl-event-node');
        eventNodes.forEach(function(node) {
            // Убираем лишние отступы
            node.style.margin = '0';
            node.style.padding = '2px 4px';
            
            // 🆕 ВЫРАВНИВАЕМ ПО ЦЕНТРУ СТРОКИ
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = 'flex-start';
            node.style.minHeight = CONFIG.rowHeight + 'px';
            
            // Фиксируем позицию по вертикали (привязываем к сетке)
            var currentTop = parseFloat(node.style.top);
            if (!isNaN(currentTop)) {
                // Округляем до ближайшей строки
                var roundedTop = Math.round(currentTop / CONFIG.rowHeight) * CONFIG.rowHeight;
                node.style.top = roundedTop + 'px';
            }
            
            var labels = node.querySelectorAll('.jqtl-event-label, .event-label');
            labels.forEach(function(label) {
                label.style.fontSize = '9px';
                label.style.fontWeight = 'bold';
                label.style.lineHeight = '1.2';
                label.style.verticalAlign = 'middle';
            });
            
            var contents = node.querySelectorAll('.jqtl-event-content, .event-content');
            contents.forEach(function(content) {
                content.style.fontSize = '9px';
                content.style.lineHeight = '1.2';
                content.style.verticalAlign = 'middle';
            });
        });
        
        // 🆕 ВЫРАВНИВАЕМ ЯЧЕЙКИ ДНЕЙ
        var cells = clone.querySelectorAll('.jqtl-grid-cell, .jqtl-cell, .jqtl-day-cell');
        cells.forEach(function(cell) {
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.minHeight = CONFIG.rowHeight + 'px';
            cell.style.padding = '1px';
        });
        
        // 🆕 ВЫРАВНИВАЕМ СТРОКИ
        var rows = clone.querySelectorAll('.jqtl-grid-row, .jqtl-row');
        rows.forEach(function(row) {
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.minHeight = CONFIG.rowHeight + 'px';
        });
        
        var sidebar = clone.querySelector('.jqtl-side-index');
        if (sidebar) {
            sidebar.style.margin = '0';
            sidebar.style.padding = '0 2px 0 0';
            sidebar.style.background = '#000';
            var items = sidebar.querySelectorAll('.jqtl-side-index-item');
            items.forEach(function(item) {
                item.style.fontSize = '9px';
                item.style.padding = '1px 0';
                item.style.margin = '0';
                item.style.background = '#fff';
                item.style.minHeight = CONFIG.rowHeight + 'px';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'center';
            });
        }
        
        // Добавляем стили для отображения пустых дней и выравнивания
        var styleTag = document.createElement('style');
        styleTag.textContent = `
            .jqtl-bg-grid {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            .jqtl-grid-cell {
                border: 1px solid #d0d0d0 !important;
                background: #ffffff !important;
                min-height: ${CONFIG.rowHeight}px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 2px !important;
            }
            .jqtl-cell-empty,
            .jqtl-empty-cell {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                border: 1px solid #e0e0e0 !important;
                min-height: ${CONFIG.rowHeight}px !important;
                background: #fafafa !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .jqtl-grid-row,
            .jqtl-row {
                display: flex !important;
                border-bottom: 1px solid #e0e0e0 !important;
                min-height: ${CONFIG.rowHeight}px !important;
                align-items: center !important;
            }
            .jqtl-event-container {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            .jqtl-overlay {
                display: none !important;
            }
            .jqtl-main {
                display: block !important;
            }
            canvas {
                background: #ffffff !important;
            }
            /* 🆕 ВЫРАВНИВАНИЕ СОБЫТИЙ */
            .jqtl-event-node {
                display: flex !important;
                align-items: center !important;
                min-height: ${CONFIG.rowHeight - 4}px !important;
                padding: 2px 2px !important;
                margin: 1px 0 !important;
                box-sizing: border-box !important;
            }
            .jqtl-event-label {
                font-size: 9px !important;
                font-weight: bold !important;
                line-height: 1.2 !important;
                vertical-align: middle !important;
            }
            .jqtl-event-content {
                font-size: 9px !important;
                line-height: 1.2 !important;
                vertical-align: middle !important;
            }
            .jqtl-side-index-item {
                min-height: ${CONFIG.rowHeight}px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
        `;
        clone.appendChild(styleTag);
        
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
    
    // 🆕 ФУНКЦИЯ ДЛЯ РИСОВАНИЯ ПУНКТИРНЫХ ВЕРТИКАЛЬНЫХ ЛИНИЙ МЕЖДУ ДНЯМИ
    function drawVerticalLinesOnCanvas(canvas, color, lineWidth, dashArray) {
        try {
            var ctx = canvas.getContext('2d');
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash(dashArray);
            
            // Определяем количество дней
            var container = canvas.closest('.jqtl-container');
            var totalDays = 31;
            
            if (container) {
                var rulerItems = container.querySelectorAll('.jqtl-ruler-line-item');
                if (rulerItems.length > 0) {
                    var days = [];
                    rulerItems.forEach(function(item) {
                        var text = item.textContent.trim();
                        if (text && !isNaN(parseInt(text)) && parseInt(text) > 0 && parseInt(text) <= 31) {
                            var dayNum = parseInt(text);
                            if (days.indexOf(dayNum) === -1) {
                                days.push(dayNum);
                            }
                        }
                    });
                    if (days.length > 0) {
                        totalDays = days.length;
                    }
                }
            }
            
            var dayWidth = canvasWidth / totalDays;
            
            // Рисуем вертикальные линии МЕЖДУ днями
            for (var i = 1; i < totalDays; i++) {
                var x = i * dayWidth;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
                ctx.stroke();
            }
            
            ctx.restore();
            console.log('  ✅ Вертикальные линии нарисованы');
            
        } catch(e) {
            console.warn('  ⚠️ Ошибка вертикальных линий:', e);
        }
    }
    
    // 🆕 ФУНКЦИЯ ДЛЯ РИСОВАНИЯ ГОРИЗОНТАЛЬНЫХ ЛИНИЙ (только по нижней границе)
    function drawHorizontalLinesOnCanvas(canvas, color, lineWidth, dashArray, offset) {
        try {
            var ctx = canvas.getContext('2d');
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            
            // Определяем количество строк в календаре
            var container = canvas.closest('.jqtl-container');
            var totalRows = 5;
            
            if (container) {
                var eventContainer = container.querySelector('.jqtl-event-container');
                if (eventContainer) {
                    var eventNodes = eventContainer.querySelectorAll('.jqtl-event-node');
                    if (eventNodes.length > 0) {
                        var positions = [];
                        eventNodes.forEach(function(node) {
                            var style = window.getComputedStyle(node);
                            var top = parseFloat(style.top);
                            if (!isNaN(top)) {
                                positions.push(top);
                            }
                        });
                        positions.sort(function(a, b) { return a - b; });
                        var uniquePositions = [];
                        for (var i = 0; i < positions.length; i++) {
                            if (i === 0 || positions[i] - positions[i-1] > 5) {
                                uniquePositions.push(positions[i]);
                            }
                        }
                        totalRows = Math.max(totalRows, uniquePositions.length);
                    }
                }
            }
            
            var availableHeight = canvasHeight - offset;
            var rowHeight = availableHeight / totalRows;
            
            console.log('  📐 Строк в календаре:', totalRows, ', высота строки:', rowHeight.toFixed(2) + 'px');
            
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash(dashArray);
            
            // Рисуем ТОЛЬКО по нижней границе каждой строки
            for (var i = 1; i <= totalRows; i++) {
                var y = offset + (i * rowHeight);
                if (y > canvasHeight - 2) break;
                
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvasWidth, y);
                ctx.stroke();
            }
            
            ctx.restore();
            console.log('  ✅ Горизонтальные линии нарисованы (только по нижней границе)');
            
        } catch(e) {
            console.warn('  ⚠️ Ошибка горизонтальных линий:', e);
        }
    }
    
    // Даем время на рендеринг
    setTimeout(function() {
        // 🆕 РИСУЕМ ЛИНИИ НА ВСЕХ CANVAS
        var allCanvases = wrapper.querySelectorAll('canvas');
        allCanvases.forEach(function(canvas, index) {
            setTimeout(function() {
                // Вертикальные линии
                drawVerticalLinesOnCanvas(
                    canvas, 
                    CONFIG.verticalLineColor, 
                    CONFIG.verticalLineWidth,
                    CONFIG.verticalLineDash
                );
                
                // Горизонтальные линии (только по нижней границе)
                drawHorizontalLinesOnCanvas(
                    canvas,
                    CONFIG.horizontalLineColor,
                    CONFIG.horizontalLineWidth,
                    CONFIG.horizontalLineDash,
                    CONFIG.horizontalLineOffset
                );
            }, index * 150);
        });
        
        // Даем время на отрисовку линий
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
                backgroundColor: '#ffffff',
                onclone: function(doc) {
                    // В клоне документа также рисуем линии
                    var clonedCanvases = doc.querySelectorAll('canvas');
                    clonedCanvases.forEach(function(canvas) {
                        try {
                            var ctx = canvas.getContext('2d');
                            var canvasWidth = canvas.width;
                            var canvasHeight = canvas.height;
                            
                            // ===== ВЕРТИКАЛЬНЫЕ ЛИНИИ =====
                            var container = canvas.closest('.jqtl-container');
                            var totalDays = 31;
                            
                            if (container) {
                                var rulerItems = container.querySelectorAll('.jqtl-ruler-line-item');
                                if (rulerItems.length > 0) {
                                    var days = [];
                                    rulerItems.forEach(function(item) {
                                        var text = item.textContent.trim();
                                        if (text && !isNaN(parseInt(text)) && parseInt(text) > 0 && parseInt(text) <= 31) {
                                            var dayNum = parseInt(text);
                                            if (days.indexOf(dayNum) === -1) {
                                                days.push(dayNum);
                                            }
                                        }
                                    });
                                    if (days.length > 0) {
                                        totalDays = days.length;
                                    }
                                }
                            }
                            
                            var dayWidth = canvasWidth / totalDays;
                            
                            ctx.save();
                            ctx.strokeStyle = CONFIG.verticalLineColor;
                            ctx.lineWidth = CONFIG.verticalLineWidth;
                            ctx.setLineDash(CONFIG.verticalLineDash);
                            
                            for (var i = 1; i < totalDays; i++) {
                                var x = i * dayWidth;
                                ctx.beginPath();
                                ctx.moveTo(x, 0);
                                ctx.lineTo(x, canvasHeight);
                                ctx.stroke();
                            }
                            
                            // ===== ГОРИЗОНТАЛЬНЫЕ ЛИНИИ =====
                            var totalRows = 5;
                            if (container) {
                                var eventContainer = container.querySelector('.jqtl-event-container');
                                if (eventContainer) {
                                    var eventNodes = eventContainer.querySelectorAll('.jqtl-event-node');
                                    if (eventNodes.length > 0) {
                                        var positions = [];
                                        eventNodes.forEach(function(node) {
                                            var style = window.getComputedStyle(node);
                                            var top = parseFloat(style.top);
                                            if (!isNaN(top)) {
                                                positions.push(top);
                                            }
                                        });
                                        positions.sort(function(a, b) { return a - b; });
                                        var uniquePositions = [];
                                        for (var i = 0; i < positions.length; i++) {
                                            if (i === 0 || positions[i] - positions[i-1] > 5) {
                                                uniquePositions.push(positions[i]);
                                            }
                                        }
                                        totalRows = Math.max(totalRows, uniquePositions.length);
                                    }
                                }
                            }
                            
                            var availableHeight = canvasHeight - CONFIG.horizontalLineOffset;
                            var rowHeight = availableHeight / totalRows;
                            
                            ctx.strokeStyle = CONFIG.horizontalLineColor;
                            ctx.lineWidth = CONFIG.horizontalLineWidth;
                            ctx.setLineDash(CONFIG.horizontalLineDash);
                            
                            for (var i = 1; i <= totalRows; i++) {
                                var y = CONFIG.horizontalLineOffset + (i * rowHeight);
                                if (y > canvasHeight - 2) break;
                                ctx.beginPath();
                                ctx.moveTo(0, y);
                                ctx.lineTo(canvasWidth, y);
                                ctx.stroke();
                            }
                            
                            ctx.restore();
                        } catch(e) {
                            // Игнорируем ошибки
                        }
                    });
                    
                    // 🆕 ВЫРАВНИВАЕМ ЭЛЕМЕНТЫ В КЛОНЕ
                    var style = doc.createElement('style');
                    style.textContent = `
                        .jqtl-bg-grid {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                        }
                        .jqtl-grid-cell {
                            border: 1px solid #d0d0d0 !important;
                            background: #ffffff !important;
                            min-height: ${CONFIG.rowHeight}px !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                            padding: 2px !important;
                        }
                        .jqtl-cell-empty,
                        .jqtl-empty-cell {
                            display: flex !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            border: 1px solid #e0e0e0 !important;
                            min-height: ${CONFIG.rowHeight}px !important;
                            background: #fafafa !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                        .jqtl-grid-row,
                        .jqtl-row {
                            display: flex !important;
                            border-bottom: 1px solid #e0e0e0 !important;
                            min-height: ${CONFIG.rowHeight}px !important;
                            align-items: center !important;
                        }
                        .jqtl-event-container {
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                        }
                        .jqtl-overlay {
                            display: none !important;
                        }
                        .jqtl-main {
                            display: block !important;
                        }
                        canvas {
                            background: #ffffff !important;
                        }
                        /* 🆕 ВЫРАВНИВАНИЕ СОБЫТИЙ В КЛОНЕ */
                        .jqtl-event-node {
                            display: flex !important;
                            align-items: center !important;
                            min-height: ${CONFIG.rowHeight - 4}px !important;
                            padding: 2px 4px !important;
                            margin: 1px 0 !important;
                            box-sizing: border-box !important;
                        }
                        .jqtl-event-label {
                            font-size: 9px !important;
                            font-weight: bold !important;
                            line-height: 1.2 !important;
                            vertical-align: middle !important;
                        }
                        .jqtl-event-content {
                            font-size: 9px !important;
                            line-height: 1.2 !important;
                            vertical-align: middle !important;
                        }
                        .jqtl-side-index-item {
                            min-height: ${CONFIG.rowHeight}px !important;
                            display: flex !important;
                            align-items: center !important;
                            justify-content: center !important;
                        }
                    `;
                    doc.head.appendChild(style);
                }
            }).then(function(canvas) {
                console.log('✅ Скриншот создан');
                
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
        }, 500);
        
    }, CONFIG.renderDelay);
});