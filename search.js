// Common search functionality for games and utilities
const debounce = (fn, wait=120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

function createItemElement(item) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'item game-card';
    // Apply hoverable class if animations are enabled
    if (localStorage.getItem('celestrium-animations') !== 'false') {
        link.classList.add('hoverable');
    }
    link.dataset.url = item.url + '?login.live.com';
    
    const iconPath = item.url.endsWith('/') ? `${item.url}favicon.png?login.live.com` : `${item.url}/favicon.png?login.live.com`;
    
    link.innerHTML = `
        <div class="game-icon-wrapper">
            <img src="${iconPath}" alt="${item.name}" class="game-icon">
        </div>
        <div class="game-info">
            <div class="game-title">${item.name}</div>
            <div class="game-category-label">${item.category || 'other'}</div>
        </div>
    `;
    return link;
}

function renderItems(items, searchEl, listEl, noResultsEl) {
    const q = (searchEl.value || '').toLowerCase();
    listEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    let count = 0;

    // Create grid wrapper
    const grid = document.createElement('div');
    grid.className = 'games-grid';

    for (const item of items) {
        if (item.name.toLowerCase().includes(q)) {
            grid.appendChild(createItemElement(item));
            count++;
        }
    }

    frag.appendChild(grid);
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
