document.addEventListener('DOMContentLoaded', function() {
    function pad(n) { return n.toString().padStart(2, '0'); }

    // Получаем только дату из строки
    function getDateOnly(dateStr) {
        if (!dateStr) return null;
        return dateStr.split(' ')[0];
    }

    // Проверяем, есть ли время в строке
    function hasTime(dateStr) {
        if (!dateStr) return false;
        return dateStr.includes(' ');
    }

    // Форматируем дату для ICS
    function toICalDate(dateStr) {
        if (!dateStr) return '19700101';
        
        const dateOnly = getDateOnly(dateStr);
        if (!dateOnly) return '19700101';
        
        const parts = dateOnly.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        
        return `${year}${pad(month)}${pad(day)}`;
    }

    function buildIcs(events, fileName) {
        if (!events || events.length === 0) return null;
        
        let ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            `PRODID:-//${fileName}//RU`,
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];
        
        events.forEach(ev => {
            const node = ev.node || {};
            const startRaw = node.start || '';
            const endRaw = node.end || startRaw;
            
            // Определяем, есть ли время
            const hasStartTime = hasTime(startRaw);
            const hasEndTime = hasTime(endRaw);
            
            // Если время есть - используем его, иначе только дата
            const isAllDay = !hasStartTime || (startRaw.includes('00:30') && endRaw.includes('23:59'));
            
            let dtstart, dtend;
            
            // Формируем summary
            let summary = ev.html || 'Event';
            summary = summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            if (summary.length > 80) summary = summary.slice(0, 80) + '…';
            
            if (isAllDay) {
                // Только дата (без времени)
                dtstart = toICalDate(startRaw);
                dtend = toICalDate(endRaw);
                
                ics.push(
                    'BEGIN:VEVENT',
                    `UID:${Date.now()}-${Math.random().toString(36).slice(2,8)}@${fileName}`,
                    `DTSTAMP:${toICalDate(new Date().toISOString().slice(0,10))}`,
                    `DTSTART;VALUE=DATE:${dtstart}`,
                    `DTEND;VALUE=DATE:${dtend}`,
                    `SUMMARY:${summary}`,
                    'END:VEVENT'
                );
            } else {
                // Событие с временем
                dtstart = toICalDate(startRaw);
                dtend = toICalDate(endRaw);
                
                ics.push(
                    'BEGIN:VEVENT',
                    `UID:${Date.now()}-${Math.random().toString(36).slice(2,8)}@${fileName}`,
                    `DTSTAMP:${toICalDate(new Date().toISOString().slice(0,10))}`,
                    `DTSTART:${dtstart}`,
                    `DTEND:${dtend}`,
                    `SUMMARY:${summary}`,
                    'END:VEVENT'
                );
            }
        });
        
        ics.push('END:VCALENDAR');
        return ics.join('\r\n');
    }

    function filterEventsByRow(data, row) {
        const events = [];
        if (data.months && Array.isArray(data.months)) {
            data.months.forEach(month => {
                if (month.events && Array.isArray(month.events)) {
                    month.events.forEach(ev => {
                        const evRow = ev.node?.row;
                        const bgColor = ev.node?.bgColor || '';
                        
                        // Исключаем события с цветом #F39C4B (регистронезависимо)
                        const isExcluded = bgColor.toUpperCase() === '#F39C4B';
                        
                        if (evRow !== undefined && Number(evRow) === row && !isExcluded) {
                            events.push(ev);
                        }
                    });
                }
            });
        }
        return events;
    }

    async function downloadIcs(row, fileName, button) {
        const originalText = button.innerHTML;
        button.innerHTML = '⏳...';
        button.disabled = true;
        try {
            const response = await fetch('./events.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const events = filterEventsByRow(data, row);
            if (events.length === 0) {
                alert(`Нет событий с row = ${row} в events.json`);
                button.innerHTML = originalText;
                button.disabled = false;
                return;
            }
            const icsContent = buildIcs(events, fileName);
            if (!icsContent) {
                alert('Ошибка генерации ICS');
                button.innerHTML = originalText;
                button.disabled = false;
                return;
            }
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            button.innerHTML = '✅';
            setTimeout(() => { button.innerHTML = originalText; }, 2000);
        } catch (err) {
            console.error(err);
            alert('Ошибка: ' + err.message);
            button.innerHTML = originalText;
        }
        button.disabled = false;
    }

    // Назначение кнопок
    document.getElementById('exportArenaBtn').addEventListener('click', function() { downloadIcs(1, 'ARENA', this); });
    document.getElementById('exportKHLBtn').addEventListener('click', function() { downloadIcs(2, 'KHL', this); });
    document.getElementById('exportMHLBtn').addEventListener('click', function() { downloadIcs(3, 'MHL', this); });
    document.getElementById('exportVHLBtn').addEventListener('click', function() { downloadIcs(4, 'VHL', this); });
    document.getElementById('exportSKKBtn').addEventListener('click', function() { downloadIcs(5, 'SKK', this); });
    document.getElementById('exportPdfBtn').addEventListener('click', function() {  });
});