// ═══════════════════════════════════════════════════════════
//  CATEGORIES PAGE
// ═══════════════════════════════════════════════════════════
async function loadCategoriesPage() {
    const data = await api('/api/categories');
    const list = document.getElementById('cats-list');
    if (!data || !data.length) {
        list.innerHTML = '<div class="empty-state">No categories yet</div>';
        return;
    }
    list.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px">
            ${data.map(c => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-100)">
                    <div style="display:flex;align-items:center;gap:8px">
                        <span class="color-dot" style="background:${c.color}"></span>
                        <span style="font-weight:600;font-size:14px">${c.name}</span>
                    </div>
                    <button class="btn btn-xs btn-red" onclick="deleteCategory('${c.id}')">✕</button>
                </div>
            `).join('')}
        </div>`;
}

async function addCategory() {
    const name  = document.getElementById('new-cat-name').value.trim();
    const color = document.getElementById('new-cat-color').value;
    if (!name) { toast('Enter category name','error'); return; }
    await api('/api/categories', {method:'POST', body: JSON.stringify({name, color})});
    document.getElementById('new-cat-name').value = '';
    toast('Category added!');
    await loadCategoriesPage();
}

async function deleteCategory(id) {
    await api('/api/categories/'+id, {method:'DELETE'});
    toast('Deleted');
    await loadCategoriesPage();
}