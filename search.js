// Common search functionality for games and utilities
const debounce = (fn, wait=120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

function createItemElement(item) {
    const link = document.createElement('a');
    link.href = '#';
    
    // Determine if this is a game (has category) or utility (no category)
    const isGame = item.category !== undefined;
    
    link.className = isGame ? 'item game-card' : 'item item-card';
    
    if (localStorage.getItem('celestrium-animations') !== 'false') {
        link.classList.add('hoverable');
    }
    link.dataset.url = item.url + '?login.live.com';
    
    const iconPath = item.url.endsWith('/') ? `${item.url}favicon.png?login.live.com` : `${item.url}/favicon.png?login.live.com`;
    
    const iconWrapperClass = isGame ? 'game-icon-wrapper' : 'item-icon-wrapper';
    const iconClass = isGame ? 'game-icon' : 'item-icon';
    const infoClass = isGame ? 'game-info' : 'item-info';
    const titleClass = isGame ? 'game-title' : 'item-title';
    const categoryClass = isGame ? 'game-category-label' : 'item-category-label';
    
    let innerHtml = `
        <div class="${iconWrapperClass}">
            <img src="${iconPath}" alt="${item.name}" class="${iconClass}">
        </div>
        <div class="${infoClass}">
            <div class="${titleClass}">${item.name}</div>
    `;
    
    if (item.category) {
        innerHtml += `<div class="${categoryClass}">${item.category}</div>`;
    }
    
    innerHtml += `</div>`;
    link.innerHTML = innerHtml;
    return link;
}

function renderItems(items, searchEl, listEl, noResultsEl) {
    const q = (searchEl.value || '').toLowerCase();
    listEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    let count = 0;

    // Check if items have categories (games) or not (utilities)
    const hasCategories = items.some(item => item.category);

    if (hasCategories) {
        // Games: organize by category
        const categoryOrder = [
            'action', 'adventure', 'emulator', 'platformer', 'strategy', 'racing', 
            'puzzle', 'sports', 'io', 'roblox', 'other'
        ];

        const groups = {};
        categoryOrder.forEach(c => groups[c] = []);
        
        items.forEach(item => {
            if (item.name.toLowerCase().includes(q)) {
                let cat = (item.category || 'other').toLowerCase();
                if (!groups[cat]) cat = 'other';
                groups[cat].push(item);
                count++;
            }
        });

        categoryOrder.forEach(cat => {
            if (groups[cat].length > 0) {
                const section = document.createElement('div');
                section.className = 'category-section';
                
                const header = document.createElement('div');
                header.className = 'category-header';
                
                const title = document.createElement('div');
                title.className = 'category-title';
                title.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                
                const countEl = document.createElement('div');
                countEl.className = 'category-count';
                countEl.textContent = groups[cat].length;
                
                header.appendChild(title);
                header.appendChild(countEl);
                section.appendChild(header);
                
                const grid = document.createElement('div');
                grid.className = 'games-grid';
                
                groups[cat].forEach(item => {
                    grid.appendChild(createItemElement(item));
                });
                
                section.appendChild(grid);
                frag.appendChild(section);
            }
        });
    } else {
        // Utilities: just display in a grid
        const grid = document.createElement('div');
        grid.className = 'games-grid';
        
        items.forEach(item => {
            if (item.name.toLowerCase().includes(q)) {
                grid.appendChild(createItemElement(item));
                count++;
            }
        });
        
        frag.appendChild(grid);
    }

    listEl.appendChild(frag);
    noResultsEl.classList.toggle('hidden', count !== 0);
}

function openItem(url) {
    window.parent.postMessage({type: 'openItem', url: url}, '*');
}

function toggleAnimations(enabled) {
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        if (enabled) {
            item.classList.add('hoverable');
        } else {
            item.classList.remove('hoverable');
        }
    });
}

function initializeSearch(items, searchEl, listEl, noResultsEl) {
    function render() {
        renderItems(items, searchEl, listEl, noResultsEl);
    }

    listEl.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('.item');
        if (!a) return;
        e.preventDefault();
        openItem(a.dataset.url);
    });

    searchEl.addEventListener('input', debounce(render));
    render();
}
