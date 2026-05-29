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
                    <div style="display:flex;gap:6px">
                        <button class="btn btn-xs btn-outline" onclick='editCategory(${JSON.stringify(c).replace(/'/g,"&apos;")})'>Edit</button>
                        <button class="btn btn-xs btn-red" onclick="deleteCategory('${c.id}')">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

function editCategory(c) {
    document.getElementById('edit-cat-id').value    = c.id;
    document.getElementById('new-cat-name').value   = c.name;
    document.getElementById('new-cat-color').value  = c.color;
    document.getElementById('cat-form-title').textContent = 'Edit Category';
    document.getElementById('cat-save-btn').textContent   = 'Update Category';
    document.getElementById('cat-reset-btn').style.display = 'inline-flex';
}

function resetCategoryForm() {
    document.getElementById('edit-cat-id').value   = '';
    document.getElementById('new-cat-name').value  = '';
    document.getElementById('new-cat-color').value = '#C8916A';
    document.getElementById('cat-form-title').textContent = 'Add Product Category';
    document.getElementById('cat-save-btn').textContent   = '+ Add Category';
    document.getElementById('cat-reset-btn').style.display = 'none';
}

async function addCategory() {
    const id    = document.getElementById('edit-cat-id').value;
    const name  = document.getElementById('new-cat-name').value.trim();
    const color = document.getElementById('new-cat-color').value;
    if (!name) { toast('Enter category name', 'error'); return; }
    if (id) {
        await api('/api/categories/' + id, { method: 'PUT', body: JSON.stringify({ name, color }) });
        toast('Category updated!');
    } else {
        await api('/api/categories', { method: 'POST', body: JSON.stringify({ name, color }) });
        toast('Category added!');
    }
    resetCategoryForm();
    await loadCategoriesPage();
}

async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await api('/api/categories/' + id, { method: 'DELETE' });
    toast('Deleted');
    await loadCategoriesPage();
}

// ═══════════════════════════════════════════════════════════
//  VENDORS  (in Add/Remove page)
// ═══════════════════════════════════════════════════════════
async function renderVendorsList() {
    const list = document.getElementById('vendors-list');
    if (!list) return;
    list.innerHTML = vendors.length ? `
        <div style="display:flex;flex-direction:column;gap:8px">
            ${vendors.map(v => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-100)">
                    <span style="font-size:14px;font-weight:600">${v.name}</span>
                    <div style="display:flex;gap:6px">
                        <button class="btn btn-xs btn-outline" onclick='editVendor(${JSON.stringify(v).replace(/'/g,"&apos;")})'>Edit</button>
                        <button class="btn btn-xs btn-red" onclick="deleteVendor('${v.id}')">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>` : '<div class="empty-state" style="padding:20px">No vendors yet.</div>';
}

function editVendor(v) {
    document.getElementById('edit-vendor-id').value      = v.id;
    document.getElementById('new-vendor-name-ar').value  = v.name;
    document.getElementById('vendor-form-title').textContent  = 'Edit Vendor';
    document.getElementById('vendor-save-btn').textContent    = 'Update Vendor';
    document.getElementById('vendor-reset-btn').style.display = 'inline-flex';
}

function resetVendorForm() {
    document.getElementById('edit-vendor-id').value      = '';
    document.getElementById('new-vendor-name-ar').value  = '';
    document.getElementById('vendor-form-title').textContent  = 'Add Vendor';
    document.getElementById('vendor-save-btn').textContent    = '+ Add Vendor';
    document.getElementById('vendor-reset-btn').style.display = 'none';
}

async function addVendorAr() {
    const id   = document.getElementById('edit-vendor-id').value;  // ✅ checks for edit
    const name = document.getElementById('new-vendor-name-ar').value.trim();
    if (!name) { toast('Enter vendor name', 'error'); return; }
    if (id) {
        await api('/api/vendors/' + id, { method: 'PUT', body: JSON.stringify({ name }) }); // ✅ PUT
        toast('Vendor updated!');
    } else {
        await api('/api/vendors', { method: 'POST', body: JSON.stringify({ name }) }); // ✅ POST
        toast('Vendor added!');
    }
    resetVendorForm();
    await loadVendors();
}

async function deleteVendor(id) {
    if (!confirm('Delete this vendor?')) return;
    await api('/api/vendors/' + id, { method: 'DELETE' });
    toast('Vendor deleted');
    await loadVendors();
}

// ═══════════════════════════════════════════════════════════
//  COST CATEGORIES  (in Add/Remove page)
// ═══════════════════════════════════════════════════════════
function editCostCat(c) {
    document.getElementById('edit-cost-cat-id').value    = c.id;
    document.getElementById('new-cost-cat').value        = c.name;
    document.getElementById('new-cost-cat-color').value  = c.color;
    document.getElementById('cost-cat-form-title').textContent  = 'Edit Cost Category';
    document.getElementById('cost-cat-save-btn').textContent    = 'Update Category';
    document.getElementById('cost-cat-reset-btn').style.display = 'inline-flex';
}

function resetCostCatForm() {
    document.getElementById('edit-cost-cat-id').value   = '';
    document.getElementById('new-cost-cat').value       = '';
    document.getElementById('new-cost-cat-color').value = '#C8916A';
    document.getElementById('cost-cat-form-title').textContent  = 'Add Cost Category';
    document.getElementById('cost-cat-save-btn').textContent    = '+ Add Category';
    document.getElementById('cost-cat-reset-btn').style.display = 'none';
}

async function addCostCategory() {
    const id    = document.getElementById('edit-cost-cat-id').value;
    const name  = document.getElementById('new-cost-cat').value.trim();
    const color = document.getElementById('new-cost-cat-color').value;
    if (!name) { toast('Enter category name', 'error'); return; }
    if (id) {
        await api('/api/cost-categories/' + id, { method: 'PUT', body: JSON.stringify({ name, color }) });
        toast('Cost category updated!');
    } else {
        await api('/api/cost-categories', { method: 'POST', body: JSON.stringify({ name, color }) });
        toast('Category added!');
    }
    resetCostCatForm();
    await loadCostCategories();
}

async function deleteCostCat(id) {
    if (!confirm('Delete this cost category?')) return;
    await api('/api/cost-categories/' + id, { method: 'DELETE' });
    toast('Deleted');
    await loadCostCategories();
}

async function loadCostCategories() {
    const data = await api('/api/cost-categories');
    if (!data) return;

    // Populate filter dropdowns
    const opts = data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const filterCat = document.getElementById('costs-filter-cat');
    if (filterCat) filterCat.innerHTML = '<option value="">All Categories</option>' + opts;

    // Render list in Add/Remove page
    const list = document.getElementById('cost-cats-list');
    if (list) {
        list.innerHTML = data.length ? `
            <div style="display:flex;flex-direction:column;gap:8px">
                ${data.map(c => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-100)">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span class="color-dot" style="background:${c.color}"></span>
                            <span style="font-size:14px;font-weight:600">${c.name}</span>
                        </div>
                        <div style="display:flex;gap:6px">
                            <button class="btn btn-xs btn-outline" onclick='editCostCat(${JSON.stringify(c).replace(/'/g,"&apos;")})'>Edit</button>
                            <button class="btn btn-xs btn-red" onclick="deleteCostCat('${c.id}')">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>` : '<div class="empty-state" style="padding:20px">No categories yet</div>';
    }
}