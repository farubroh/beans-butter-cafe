// ═══════════════════════════════════════════════════════════
//  COSTS PAGE  — DB-driven vendors & items
// ═══════════════════════════════════════════════════════════

let vendors        = [];   // loaded from /api/vendors
let dbItems        = [];   // loaded from /api/vendors/:id/items
let selectedVendor = null;
let selectedItem   = null;
let miscCat        = '';

// ── STEP FLOW ─────────────────────────────────────────────
function setStep(n) {
    [1,2,3].forEach(i => {
        const circle = document.getElementById('sc'+i);
        const label  = document.getElementById('sl'+i);
        if (i < n)        { circle.className='step-circle done';   circle.textContent='✓'; label.className='step-label done'; }
        else if (i === n) { circle.className='step-circle active'; circle.textContent=i;   label.className='step-label active'; }
        else              { circle.className='step-circle';        circle.textContent=i;   label.className='step-label'; }
    });
    [1,2].forEach(i => {
        document.getElementById('sline'+i).className = 'step-line'+(i<n?' done':'');
    });
    document.getElementById('step1-panel').style.display = 'block';
    document.getElementById('step2-panel').style.display = n>=2 ? 'block' : 'none';
    document.getElementById('step3-panel').style.display = n>=3 ? 'block' : 'none';
}

// ── VENDOR GRID ────────────────────────────────────────────
function renderVendorGrid() {
    document.getElementById('vendor-grid').innerHTML = vendors.map(v => `
        <div class="vendor-card ${selectedVendor?.id===v.id?'selected':''}"
             onclick='selectVendor(${JSON.stringify(v).replace(/'/g,"&#39;")})'>
            <div class="v-name">${v.name}</div>
        </div>
    `).join('');
}

async function selectVendor(v) {
    selectedVendor = v;
    selectedItem   = null;
    miscCat        = '';
    renderVendorGrid();

    const ICONS = {
        'chittagong road vendor':'🛒','miyaji vendor':'🏪','polar vendor':'❄️',
        'arong vendor':'🥛','dncc vendor':'🏬','chairman market vendor':'🏢',
        'runcha vendor':'🧃','a one chocolate vendor':'🍫','north end vendor':'☕',
        'sharulia vendor':'🧇','islam plaza vendor':'🏠','local shop / vendor':'🏘️',
        'other / one-time':'📦'
    };
    const icon = ICONS[v.name.toLowerCase()] || '🏪';
    document.getElementById('vendor-badge').textContent = v.name;

    const isOther = v.name.toLowerCase().includes('other');
    document.getElementById('misc-cats-wrap').style.display = isOther ? 'block' : 'none';
   <!--document.getElementById('product-search-section').style.display = 'block';-->
    document.querySelectorAll('.misc-cat-chip').forEach(b => b.classList.remove('active'));
    document.getElementById('item-search').value = '';
    document.getElementById('item-clear-btn').classList.remove('vis');
    document.getElementById('prod-results').classList.remove('open');
    document.getElementById('selected-item-chip').style.display = 'none';

    // Load items for this vendor from DB
    // Load items for this vendor from DB
    dbItems = await api('/api/vendors/' + v.id + '/items') || [];

    setStep(2);
    searchItems(''); // ← add this line to show all items right away
    setTimeout(() => document.getElementById('item-search').focus(), 100);
}

function resetVendor() {
    selectedVendor = null;
    selectedItem   = null;
    dbItems        = [];
    renderVendorGrid();
    setStep(1);
}

// ── MISC CATEGORY CHIPS (for "Other" vendor) ───────────────
function setMiscCat(btn, cat) {
    document.querySelectorAll('.misc-cat-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    miscCat = cat;
    const labels = {
        kitchen:'Kitchen', decor:'Decor', salary:'HR',
        rent:'Fixed Cost', transport:'Transport',
        utility:'Fixed Cost', charity:'HR', other:'Other'
    };
    searchItems(labels[cat] || '');
    document.getElementById('item-search').value = labels[cat] || '';
}

// ── ITEM SEARCH ────────────────────────────────────────────
// ── ITEM SEARCH ────────────────────────────────────────────
function searchItems(q) {
    const clearBtn  = document.getElementById('item-clear-btn');
    const resultsEl = document.getElementById('prod-results');
    if (clearBtn) clearBtn.classList.toggle('vis', q.length > 0);

    const term = q.trim().toLowerCase();
    let matches = dbItems;
    if (term) {
        matches = dbItems.filter(item =>
            item.name.toLowerCase().includes(term) ||
            (item.cost_categories?.name || '').toLowerCase().includes(term)
        );
    }

    if (!resultsEl) return;

    if (!dbItems.length && !term) {
        resultsEl.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:13px">No items for this vendor</div>';
        return;
    }

    if (term && !matches.length) {
        resultsEl.innerHTML = `
            <div style="padding:10px 12px;font-size:13px;color:var(--text-muted)">No match found.</div>
            <div class="prod-add-new" onclick="openAddItemModal('${q.trim().replace(/'/g,"&#39;")}')">
                ＋ Add "<strong>${q.trim()}</strong>" as new item
            </div>`;
        return;
    }

    resultsEl.innerHTML = matches.map(item => `
        <div class="prod-result-item" onclick='pickItem(${JSON.stringify(item).replace(/'/g,"&#39;")})'>
            <div>
                <div class="pri-name">
                    <i class="ti ti-package" style="font-size:13px;vertical-align:-2px;margin-right:4px"></i>${item.name}
                </div>
                <div style="font-size:11px;color:var(--text-muted)">${item.cost_categories?.name||''}</div>
            </div>
            ${item.cost_categories ? `
            <span style="
                background:${item.cost_categories.color}18;
                border:1px solid ${item.cost_categories.color}40;
                color:${item.cost_categories.color};
                font-size:10px;font-weight:700;
                padding:2px 8px;border-radius:20px;
                text-transform:uppercase;letter-spacing:0.5px;
                white-space:nowrap;flex-shrink:0;
            ">${item.cost_categories.name}</span>` : ''}
        </div>
    `).join('');

    if (!term) {
        resultsEl.innerHTML += `<div class="prod-add-new" onclick="openAddItemModal('')">
            ＋ Add a new item for this vendor
        </div>`;
    }
}

function clearItemSearch() {
    const inp = document.getElementById('item-search');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('item-clear-btn');
    if (clearBtn) clearBtn.classList.remove('vis');
    searchItems('');
}

function pickItem(item) {
    selectedItem = item;
    const chip = document.getElementById('selected-item-chip');
    chip.style.display = 'flex';
    document.getElementById('chip-icon').innerHTML = '<i class="ti ti-package"></i>';
    document.getElementById('chip-name').textContent         = item.name;
    document.getElementById('chip-vendor-label').textContent = item.cost_categories?.name || '';
    if (item.unit) document.getElementById('cost-unit').value = item.unit;
    setStep(3);
    setTimeout(() => document.getElementById('cost-qty').focus(), 100);
}


// function addCustomItem(name) {
//     pickItem({
//         name:            name || 'Custom Item',
//         icon:            '📦',
//         unit:            '',
//         cost_categories: null,
//         cost_category_id: null,
//         id:              null
//     });
// }

function clearSelectedItem() {
    selectedItem = null;
    document.getElementById('selected-item-chip').style.display = 'none';
    document.getElementById('item-search').value = '';
    document.getElementById('item-clear-btn').classList.remove('vis');
    document.getElementById('prod-results').classList.remove('open');
    setStep(2);
}

// ── UNIT PRICE CALC ────────────────────────────────────────
function calcUnitPrice() {
    const total = parseFloat(document.getElementById('cost-amount').value) || 0;
    const qty   = parseFloat(document.getElementById('cost-qty').value)    || 0;
    const unit  = document.getElementById('cost-unit').value               || 'unit';
    document.getElementById('cost-unit-price').value =
        (total > 0 && qty > 0) ? `৳${(total/qty).toFixed(2)} / ${unit}` : '—';
}

// ── ADD COST ───────────────────────────────────────────────
async function addCost() {
    if (!selectedVendor) { toast('Select a vendor first','error'); return; }
    if (!selectedItem)   { toast('Select or type an item','error'); return; }
    const amount = parseFloat(document.getElementById('cost-amount').value);
    if (!amount || amount <= 0) { toast('Enter a valid amount','error'); return; }

    const qty        = parseFloat(document.getElementById('cost-qty').value) || 0;
    const unit       = document.getElementById('cost-unit').value.trim();
    const date       = document.getElementById('cost-date').value || today();
    const note       = document.getElementById('cost-note').value;
    const unit_price = qty > 0 ? amount / qty : 0;

    await api('/api/costs', { method:'POST', body: JSON.stringify({
            description:      selectedItem.name,
            amount,
            quantity:         qty || 1,
            unit,
            unit_price,
            cost_category_id: selectedItem.cost_category_id || null,
            vendor_name:      selectedVendor.name,
            date,
            note
        })});

    toast(`✅ Added: ${selectedItem.name} — ${fmt(amount)}`, 'success');
    document.getElementById('cost-qty').value        = '';
    document.getElementById('cost-unit').value       = '';
    document.getElementById('cost-amount').value     = '';
    document.getElementById('cost-unit-price').value = '—';
    document.getElementById('cost-note').value       = '';
    clearSelectedItem();
    await loadCosts();
}

// ── DELETE COST ────────────────────────────────────────────
async function deleteCost(id) {
    await api('/api/costs/'+id, { method:'DELETE' });
    toast('Deleted');
    await loadCosts();
}

// ── LOAD COSTS TABLE ───────────────────────────────────────
async function loadCosts() {
    const date     = document.getElementById('costs-view-date').value || today();
    const catId    = document.getElementById('costs-filter-cat')?.value  || '';
    const vendorId = document.getElementById('costs-filter-vendor')?.value || '';
    let url = '/api/costs?date='+date;
    if (catId)    url += '&cat='+catId;
    if (vendorId) url += '&vendor='+vendorId;
    const data = await api(url);
    const list = document.getElementById('costs-list');
    if (!data || !data.length) {
        list.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-icon">💸</div>No costs for this date</div>';
        document.getElementById('costs-total').textContent = fmt(0);
        return;
    }
    const total = data.reduce((s,c) => s+parseFloat(c.amount), 0);
    list.innerHTML = `
        <div style="overflow-x:auto">
        <table class="data-table">
            <thead><tr>
                <th>Category</th><th>Vendor</th><th>Item</th>
                <th>Qty</th><th>Unit Price</th><th>Total</th><th>Note</th><th></th>
            </tr></thead>
            <tbody>
                ${data.map(c => `
                    <tr>
                        <td><div style="display:flex;align-items:center;gap:6px">
                            ${c.cost_categories ? `<span class="color-dot" style="background:${c.cost_categories.color}"></span>` : ''}
                            <span style="font-size:13px">${c.cost_categories?.name||'—'}</span>
                        </div></td>
                        <td style="font-size:13px;font-weight:600">${c.vendor_name||'—'}</td>
                        <td style="font-weight:500">${c.description}</td>
                        <td style="font-size:13px">${c.quantity>0 ? c.quantity+' '+(c.unit||'') : '—'}</td>
                        <td style="font-size:13px;color:black">${c.quantity>0&&c.unit_price>0 ? fmt(c.unit_price) : '—'}</td>
                        <td><strong style="color:var(--red)">${fmt(c.amount)}</strong></td>
                        <td style="font-size:12px;color:var(--gray-400)">${c.note||'—'}</td>
                        <td><button class="btn btn-xs btn-red" onclick="deleteCost('${c.id}')">✕</button></td>
                    </tr>`).join('')}
            </tbody>
        </table>
        </div>`;
    document.getElementById('costs-total').textContent = fmt(total);
}

// ── PAGE BOOTSTRAP ─────────────────────────────────────────
async function loadCostPage() {
    await Promise.all([loadCostCategories(), loadVendors()]);
    await loadCosts();
}

async function loadVendors() {
    const data = await api('/api/vendors');
    if (!data) return;
    vendors = data;

    // Populate vendor filter dropdown
    const filterVendor = document.getElementById('costs-filter-vendor');
    if (filterVendor) {
        filterVendor.innerHTML = '<option value="">All Vendors</option>' +
            vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }

    // Render vendors management list
    const list = document.getElementById('vendors-list');
    if (list) {
        const ICONS = {
            'chittagong road vendor':'🛒','miyaji vendor':'🏪','polar vendor':'❄️',
            'arong vendor':'🥛','dncc vendor':'🏬','chairman market vendor':'🏢',
            'runcha vendor':'🧃','a one chocolate vendor':'🍫','north end vendor':'☕',
            'sharulia vendor':'🧇','islam plaza vendor':'🏠','local shop / vendor':'🏘️',
            'other / one-time':'📦'
        };
        list.innerHTML = vendors.length ? `
    <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${vendors.map(v => `
            <div style="display:flex;align-items:center;gap:6px;background:var(--gray-50);padding:8px 14px;border-radius:20px;border:2px solid var(--gray-100)">
                <span style="font-size:13px;font-weight:500">${v.name}</span>
                <button class="btn-logout" style="font-size:12px;padding:2px 8px;margin-left:4px" onclick="deleteVendor('${v.id}')">✕</button>
            </div>`).join('')}
    </div>` : '<div class="empty-state" style="padding:20px">No vendors yet.</div>';
    }

    renderVendorGrid();
}

async function addVendorInline() {
    const name = document.getElementById('new-vendor-name').value.trim();
    if (!name) { toast('Enter vendor name','error'); return; }
    await api('/api/vendors', { method:'POST', body: JSON.stringify({name}) });
    document.getElementById('new-vendor-name').value = '';
    toast('Vendor added!');
    await loadVendors();
}

async function deleteVendor(id) {
    await api('/api/vendors/'+id, { method:'DELETE' });
    toast('Vendor deleted');
    await loadVendors();
}

async function loadCostCategories() {
    const data = await api('/api/cost-categories');
    if (!data) return;
    const opts = data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const filterCat = document.getElementById('costs-filter-cat');
    if (filterCat) filterCat.innerHTML = '<option value="">All Categories</option>'+opts;
    const list = document.getElementById('cost-cats-list');
    if (list) {
        list.innerHTML = data.length ? `
            <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${data.map(c=>`
                    <div style="display:flex;align-items:center;gap:6px;background:var(--gray-50);padding:8px 14px;border-radius:20px;border:2px solid var(--gray-100)">
                        <span class="color-dot" style="background:${c.color}"></span>
                        <span style="font-size:13px;font-weight:500">${c.name}</span>
                        <button class="btn-logout" style="font-size:12px;padding:2px 8px;margin-left:4px" onclick="deleteCostCat('${c.id}')">✕</button>
                    </div>`).join('')}
            </div>` : '<div class="empty-state" style="padding:20px">No categories yet</div>';
    }
}

async function addCostCategory() {
    const name  = document.getElementById('new-cost-cat').value.trim();
    const color = document.getElementById('new-cost-cat-color').value;
    if (!name) { toast('Enter category name','error'); return; }
    await api('/api/cost-categories', { method:'POST', body: JSON.stringify({name, color}) });
    document.getElementById('new-cost-cat').value = '';
    toast('Category added!');
    await loadCostCategories();
}

async function deleteCostCat(id) {
    await api('/api/cost-categories/'+id, { method:'DELETE' });
    toast('Deleted');
    await loadCostCategories();
}

// Close item dropdown on outside click
    // `document.addEventListener('click', e => {
    //     if (!e.target.closest('#item-search') && !e.target.closest('#prod-results')) {
    //         const r = document.getElementById('prod-results');
    //         if (r) r.classList.remove('open');
    //     }
    // });`


// ── ADD ITEM MODAL ─────────────────────────────────────────
let costCatsCache = [];

async function openAddItemModal(prefillName) {
    // load categories for the dropdown
    if (!costCatsCache.length) {
        costCatsCache = await api('/api/cost-categories') || [];
    }

    // build or reuse modal
    let modal = document.getElementById('add-item-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-item-modal';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:1000;
            background:rgba(0,0,0,0.45);
            display:flex;align-items:center;justify-content:center;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="
            background:var(--bg-surface);
            border-radius:var(--radius-lg);
            padding:24px;
            width:min(420px,90vw);
            box-shadow:0 20px 60px rgba(0,0,0,0.2);
        ">
            <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:18px;display:flex;justify-content:space-between;align-items:center">
                <span><i class="ti ti-plus" style="margin-right:6px"></i>Add New Item</span>
                <button onclick="closeAddItemModal()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted)">✕</button>
            </div>

            <div class="form-group" style="margin-bottom:12px">
                <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);display:block;margin-bottom:6px">Item Name</label>
                <input type="text" id="new-item-name" value="${prefillName}"
                    placeholder="e.g. Butter, Tissue, Rent..."
                    style="width:100%;padding:10px 13px;border:1px solid var(--border);border-radius:var(--radius);font-family:'Jost',sans-serif;background:var(--bg-surface2);color:var(--text);box-sizing:border-box"/>
            </div>

            <div class="form-group" style="margin-bottom:12px">
                <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);display:block;margin-bottom:6px">Cost Category</label>
                <select id="new-item-cat" style="width:100%;padding:10px 13px;border:1px solid var(--border);border-radius:var(--radius);font-family:'Jost',sans-serif;background:var(--bg-surface2);color:var(--text)">
                    <option value="">— Select category —</option>
                    ${costCatsCache.map(c => `
                        <option value="${c.id}" data-color="${c.color}">${c.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-group" style="margin-bottom:18px">
                <label style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);display:block;margin-bottom:6px">Default Unit <span style="font-weight:400;text-transform:none">(optional)</span></label>
                <input type="text" id="new-item-unit" placeholder="kg / L / pcs / bag / month..."
                    style="width:100%;padding:10px 13px;border:1px solid var(--border);border-radius:var(--radius);font-family:'Jost',sans-serif;background:var(--bg-surface2);color:var(--text);box-sizing:border-box"/>
            </div>

            <div style="display:flex;gap:10px">
                <button class="btn btn-amber" style="flex:1;padding:11px" onclick="saveNewItem()">
                    <i class="ti ti-check" style="margin-right:4px"></i>Save Item
                </button>
                <button class="btn btn-outline" onclick="closeAddItemModal()">Cancel</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('new-item-name')?.focus(), 50);
}

function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) modal.style.display = 'none';
}

async function saveNewItem() {
    const name   = document.getElementById('new-item-name')?.value.trim();
    const catId  = document.getElementById('new-item-cat')?.value;
    const unit   = document.getElementById('new-item-unit')?.value.trim();

    if (!name) { toast('Enter item name', 'error'); return; }
    if (!catId) { toast('Select a cost category', 'error'); return; }
    if (!selectedVendor) { toast('No vendor selected', 'error'); return; }

    const res = await api('/api/items', {
        method: 'POST',
        body: JSON.stringify({
            name,
            unit:             unit || null,
            cost_category_id: catId,
            vendor_ids:       [selectedVendor.id]
        })
    });

    if (res?.success) {
        toast(`✅ "${name}" added!`, 'success');
        closeAddItemModal();
        // reload items for this vendor and pick the new one
        dbItems = await api('/api/vendors/' + selectedVendor.id + '/items') || [];
        searchItems('');
        // auto-pick the newly added item
        const newItem = dbItems.find(i => i.name === name);
        if (newItem) pickItem(newItem);
    } else {
        toast('Failed to save item', 'error');
    }
}

// close modal on backdrop click
document.addEventListener('click', e => {
    const modal = document.getElementById('add-item-modal');
    if (modal && e.target === modal) closeAddItemModal();
});