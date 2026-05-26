// ═══════════════════════════════════════════════════════════
//  COSTS PAGE
// ═══════════════════════════════════════════════════════════
const VENDORS_SEED = [
    { key:'chittagong', name:'Chittagong Road Vendor', icon:'🛒' },
    { key:'miyaji',     name:'Miyaji Vendor',          icon:'🏪' },
    { key:'polar',      name:'Polar Vendor',           icon:'❄️' },
    { key:'arong',      name:'Arong Vendor',           icon:'🥛' },
    { key:'dncc',       name:'DNCC Vendor',            icon:'🏬' },
    { key:'chairman',   name:'Chairman Market Vendor', icon:'🏢' },
    { key:'runcha',     name:'Runcha Vendor',          icon:'🧃' },
    { key:'aone',       name:'A One Chocolate Vendor', icon:'🍫' },
    { key:'northend',   name:'North End Vendor',       icon:'☕' },
    { key:'sharulia',   name:'Sharulia Vendor',        icon:'🧇' },
    { key:'islomplaza', name:'Islam Plaza Vendor',     icon:'🏠' },
    { key:'local',      name:'Local Shop / Vendor',    icon:'🏘️' },
    { key:'other',      name:'Other / One-time',       icon:'📦' },
];

const ITEM_CATALOG = [
    { name:'Butter',                     vendors:['chittagong'],            category:'Ingredients', unit:'pcs',     icon:'🧈' },
    { name:'Yogurt',                     vendors:['miyaji'],                category:'Ingredients', unit:'kg',      icon:'🥛' },
    { name:'Vanilla Ice Cream',          vendors:['miyaji','polar'],        category:'Ingredients', unit:'pcs',     icon:'🍦' },
    { name:'Whip Cream',                 vendors:['chittagong'],            category:'Ingredients', unit:'can',     icon:'🍦' },
    { name:'Pasteurized Milk',           vendors:['arong'],                 category:'Ingredients', unit:'L',       icon:'🥛' },
    { name:'Coffee Special Milk',        vendors:['arong'],                 category:'Ingredients', unit:'L',       icon:'🥛' },
    { name:'Egg',                        vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🥚' },
    { name:'Flour',                      vendors:['miyaji'],                category:'Ingredients', unit:'kg',      icon:'🌾' },
    { name:'White Sugar',                vendors:['miyaji'],                category:'Ingredients', unit:'kg',      icon:'🍚' },
    { name:'Oil',                        vendors:['miyaji'],                category:'Ingredients', unit:'L',       icon:'🫙' },
    { name:'Baking Soda',                vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🧪' },
    { name:'Vanilla Essence',            vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🫙' },
    { name:'Corn Flour',                 vendors:['miyaji'],                category:'Ingredients', unit:'kg',      icon:'🌽' },
    { name:'Savoy Chocolate Bar',        vendors:['chittagong'],            category:'Ingredients', unit:'pcs',     icon:'🍫' },
    { name:'White Chocolate Chips',      vendors:['chittagong'],            category:'Ingredients', unit:'kg',      icon:'🍫' },
    { name:'Dark Chocolate Chips',       vendors:['chittagong'],            category:'Ingredients', unit:'kg',      icon:'🍫' },
    { name:'Blue Bell Milk Choc Bar',    vendors:['chittagong'],            category:'Ingredients', unit:'pcs',     icon:'🍫' },
    { name:'Blue Bell Dark Choc Bar',    vendors:['chittagong'],            category:'Ingredients', unit:'pcs',     icon:'🍫' },
    { name:'KitKat',                     vendors:['miyaji','dncc'],         category:'Ingredients', unit:'pcs',     icon:'🍫' },
    { name:'Nutella',                    vendors:['chairman'],              category:'Ingredients', unit:'pcs',     icon:'🍫' },
    { name:'Oreo Biscuit (Original)',    vendors:['dncc'],                  category:'Ingredients', unit:'pcs',     icon:'🍪' },
    { name:'Oreo Biscuit (Local)',       vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🍪' },
    { name:'Bread',                      vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🍞' },
    { name:'Waffle Stick',               vendors:['sharulia','chittagong'], category:'Ingredients', unit:'pcs',     icon:'🧇' },
    { name:'Wafer',                      vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🍪' },
    { name:'Mango Syrup',                vendors:['runcha'],                category:'Ingredients', unit:'bottle',  icon:'🥭' },
    { name:'Chocolate Syrup',            vendors:['aone'],                  category:'Ingredients', unit:'bottle',  icon:'🍫' },
    { name:'Coffee Beans',               vendors:['northend'],              category:'Ingredients', unit:'kg',      icon:'☕' },
    { name:'Black Tea',                  vendors:['runcha'],                category:'Ingredients', unit:'pcs',     icon:'🍵' },
    { name:'Tea Packet',                 vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🍵' },
    { name:'7UP / Sprite / Cold Drinks', vendors:['miyaji'],                category:'Ingredients', unit:'pcs',     icon:'🥤' },
    { name:'Banana',                     vendors:['local'],                 category:'Ingredients', unit:'pcs',     icon:'🍌' },
    { name:'Lemon',                      vendors:['local'],                 category:'Ingredients', unit:'pcs',     icon:'🍋' },
    { name:'Tissue',                     vendors:['miyaji'],                category:'Supplies',    unit:'pcs',     icon:'🧻' },
    { name:'Normal Straw',               vendors:['islomplaza'],            category:'Supplies',    unit:'box',     icon:'🥤' },
    { name:'Boba Straw',                 vendors:['dncc'],                  category:'Supplies',    unit:'box',     icon:'🧋' },
    { name:'Wheel Powder',               vendors:['miyaji'],                category:'Supplies',    unit:'pcs',     icon:'🧼' },
    { name:'Hand Wash',                  vendors:['miyaji'],                category:'Supplies',    unit:'pcs',     icon:'🫧' },
    { name:'Shop 1 Rent',                vendors:['other'],                 category:'Fixed Cost',  unit:'month',   icon:'🏠' },
    { name:'Shop 2 Rent',                vendors:['other'],                 category:'Fixed Cost',  unit:'month',   icon:'🏠' },
    { name:'AC EMI',                     vendors:['other'],                 category:'Fixed Cost',  unit:'month',   icon:'❄️' },
    { name:'Salary',                     vendors:['other'],                 category:'HR',          unit:'month',   icon:'👤' },
    { name:'Allowance',                  vendors:['other'],                 category:'HR',          unit:'month',   icon:'💵' },
    { name:'Charity',                    vendors:['other'],                 category:'HR',          unit:'occasion',icon:'🤲' },
    { name:'Transportation (Owner)',     vendors:['other'],                 category:'Transport',   unit:'trip',    icon:'🚗' },
    { name:'Transportation (Manager)',   vendors:['other'],                 category:'Transport',   unit:'trip',    icon:'🚗' },
    { name:'Transportation (Products)',  vendors:['other'],                 category:'Transport',   unit:'trip',    icon:'🚚' },
    { name:'Kitchen Supplies',           vendors:['other'],                 category:'Kitchen',     unit:'pcs',     icon:'🍳' },
    { name:'Cafe Decoration',            vendors:['other'],                 category:'Decor',       unit:'pcs',     icon:'🎨' },
    { name:'Menu Card Design',           vendors:['other'],                 category:'Marketing',   unit:'pcs',     icon:'📋' },
    { name:'Espresso Cups',              vendors:['other'],                 category:'Kitchen',     unit:'pcs',     icon:'☕' },
];

let vendors        = [...VENDORS_SEED];
let selectedVendor = null;
let selectedItem   = null;
let miscCat        = '';

// ── STEP FLOW ─────────────────────────────────────────────
function setStep(n) {
    [1,2,3].forEach(i => {
        const circle = document.getElementById('sc'+i);
        const label  = document.getElementById('sl'+i);
        if (i < n)       { circle.className='step-circle done';   circle.textContent='✓'; label.className='step-label done'; }
        else if (i === n){ circle.className='step-circle active'; circle.textContent=i;   label.className='step-label active'; }
        else             { circle.className='step-circle';        circle.textContent=i;   label.className='step-label'; }
    });
    [1,2].forEach(i => {
        document.getElementById('sline'+i).className = 'step-line'+(i<n?' done':'');
    });
    document.getElementById('step1-panel').style.display = 'block';
    document.getElementById('step2-panel').style.display = n>=2 ? 'block' : 'none';
    document.getElementById('step3-panel').style.display = n>=3 ? 'block' : 'none';
}

function renderVendorGrid() {
    document.getElementById('vendor-grid').innerHTML = vendors.map(v => `
        <div class="vendor-card ${selectedVendor?.key===v.key?'selected':''}"
             onclick='selectVendor(${JSON.stringify(v).replace(/'/g,"&#39;")})'>
            <div class="v-icon">${v.icon}</div>
            <div class="v-name">${v.name}</div>
        </div>
    `).join('');
}

function selectVendor(v) {
    selectedVendor = v;
    selectedItem   = null;
    miscCat        = '';
    renderVendorGrid();
    document.getElementById('vendor-badge').textContent = v.icon+' '+v.name;
    document.getElementById('misc-cats-wrap').style.display = v.key==='other' ? 'block' : 'none';
    document.getElementById('product-search-section').style.display = 'block';
    document.querySelectorAll('.misc-cat-chip').forEach(b => b.classList.remove('active'));
    document.getElementById('item-search').value = '';
    document.getElementById('item-clear-btn').classList.remove('vis');
    document.getElementById('prod-results').classList.remove('open');
    document.getElementById('selected-item-chip').style.display = 'none';
    setStep(2);
    setTimeout(() => document.getElementById('item-search').focus(), 100);
}

function resetVendor() {
    selectedVendor = null;
    selectedItem   = null;
    renderVendorGrid();
    setStep(1);
}

function setMiscCat(btn, cat) {
    document.querySelectorAll('.misc-cat-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    miscCat = cat;
    const labels = { kitchen:'Kitchen', decor:'Decoration', salary:'Salary', rent:'Rent', transport:'Transport', utility:'EMI', charity:'Charity', other:'' };
    const q = labels[cat] || '';
    document.getElementById('item-search').value = q;
    searchItems(q);
}

function searchItems(q) {
    const clearBtn  = document.getElementById('item-clear-btn');
    const resultsEl = document.getElementById('prod-results');
    clearBtn.classList.toggle('vis', q.length>0);

    const vendorKey = selectedVendor?.key;
    const term      = q.trim().toLowerCase();

    let matches = ITEM_CATALOG.filter(item => {
        const vendorMatch = !vendorKey || vendorKey==='other'
            ? true
            : item.vendors.includes(vendorKey);
        const nameMatch = !term || item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
        return vendorMatch && nameMatch;
    });

    if (!matches.length && !term) {
        resultsEl.innerHTML = '<div style="padding:16px;text-align:center;color:var(--gray-400);font-size:13px">Type to search items...</div>';
        resultsEl.classList.add('open');
        return;
    }

    const shown = matches.slice(0, 14);
    let html = shown.map(item => `
        <div class="prod-result-item" onclick='pickItem(${JSON.stringify(item).replace(/'/g,"&#39;")})'>
            <div>
                <div class="pri-name">${item.icon||'📦'} ${item.name}</div>
                <div class="pri-vendor">${item.vendors.map(k=>vendors.find(v=>v.key===k)?.name||k).join(' / ')}</div>
            </div>
            <span class="pri-cat">${item.category}</span>
        </div>
    `).join('');

    html += `<div class="prod-add-new" onclick="addCustomItem('${q.trim().replace(/'/g,"&#39;")}')">
        ＋ Add "<strong>${q.trim()||'new item'}</strong>" as custom entry
    </div>`;

    resultsEl.innerHTML = html;
    resultsEl.classList.add('open');
}

function clearItemSearch() {
    document.getElementById('item-search').value = '';
    document.getElementById('item-clear-btn').classList.remove('vis');
    document.getElementById('prod-results').classList.remove('open');
}

function pickItem(item) {
    selectedItem = item;
    document.getElementById('prod-results').classList.remove('open');
    document.getElementById('item-search').value = item.name;
    const chip = document.getElementById('selected-item-chip');
    chip.style.display = 'flex';
    document.getElementById('chip-icon').textContent         = item.icon||'📦';
    document.getElementById('chip-name').textContent         = item.name;
    document.getElementById('chip-vendor-label').textContent = item.vendors.map(k=>vendors.find(v=>v.key===k)?.name||k).join(' / ');
    if (item.unit) document.getElementById('cost-unit').value = item.unit;
    setStep(3);
    setTimeout(() => document.getElementById('cost-qty').focus(), 100);
}

function addCustomItem(name) {
    pickItem({
        name: name || 'Custom Item',
        vendors: [selectedVendor?.key||'other'],
        category: miscCat||'Other',
        icon: '📦'
    });
}

function clearSelectedItem() {
    selectedItem = null;
    document.getElementById('selected-item-chip').style.display = 'none';
    document.getElementById('item-search').value = '';
    document.getElementById('item-clear-btn').classList.remove('vis');
    document.getElementById('prod-results').classList.remove('open');
    setStep(2);
}

function calcUnitPrice() {
    const total = parseFloat(document.getElementById('cost-amount').value) || 0;
    const qty   = parseFloat(document.getElementById('cost-qty').value) || 0;
    const unit  = document.getElementById('cost-unit').value || 'unit';
    document.getElementById('cost-unit-price').value = (total>0&&qty>0) ? `৳${(total/qty).toFixed(2)} / ${unit}` : '—';
}

async function addCost() {
    if (!selectedVendor) { toast('Select a vendor first','error'); return; }
    if (!selectedItem)   { toast('Select or type an item','error'); return; }
    const amount = parseFloat(document.getElementById('cost-amount').value);
    if (!amount || amount<=0) { toast('Enter a valid amount','error'); return; }

    const qty        = parseFloat(document.getElementById('cost-qty').value) || 0;
    const unit       = document.getElementById('cost-unit').value.trim();
    const date       = document.getElementById('cost-date').value || today();
    const note       = document.getElementById('cost-note').value;
    const unit_price = qty>0 ? amount/qty : 0;

    const catName = selectedItem.category || '';
    const catData = await api('/api/cost-categories');
    const matched = catData ? catData.find(c => c.name.toLowerCase()===catName.toLowerCase()) : null;

    await api('/api/costs', { method:'POST', body: JSON.stringify({
            description:      selectedItem.name,
            amount,
            quantity:         qty || 1,
            unit,
            unit_price,
            cost_category_id: matched?.id || null,
            vendor_id:        null,
            vendor_name:      selectedVendor.name,
            date,
            note
        })});

    toast(`✅ Added: ${selectedItem.name} — ${fmt(amount)}`,'success');
    document.getElementById('cost-qty').value        = '';
    document.getElementById('cost-unit').value       = '';
    document.getElementById('cost-amount').value     = '';
    document.getElementById('cost-unit-price').value = '—';
    document.getElementById('cost-note').value       = '';
    clearSelectedItem();
    await loadCosts();
}

async function deleteCost(id) {
    await api('/api/costs/'+id, { method:'DELETE' });
    toast('Deleted');
    await loadCosts();
}

async function loadCosts() {
    const date     = document.getElementById('costs-view-date').value || today();
    const catId    = document.getElementById('costs-filter-cat')?.value || '';
    const vendorId = document.getElementById('costs-filter-vendor')?.value || '';
    let url = '/api/costs?date='+date;
    if (catId)    url += '&cat='+catId;
    if (vendorId) url += '&vendor='+vendorId;
    const data = await api(url);
    const list = document.getElementById('costs-list');
    if (!data || !data.length) {
        list.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-icon"></div>No costs for this date</div>';
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
                        <td style="font-size:13px;color:var(--brown)">${c.quantity>0&&c.unit_price>0 ? fmt(c.unit_price) : '—'}</td>
                        <td><strong style="color:var(--red)">${fmt(c.amount)}</strong></td>
                        <td style="font-size:12px;color:var(--gray-400)">${c.note||'—'}</td>
                        <td><button class="btn btn-xs btn-red" onclick="deleteCost('${c.id}')">✕</button></td>
                    </tr>`).join('')}
            </tbody>
        </table>
        </div>`;
    document.getElementById('costs-total').textContent = fmt(total);
}

async function loadCostPage() {
    await Promise.all([loadCostCategories(), loadVendors()]);
    await loadCosts();
}

async function loadVendors() {
    const data = await api('/api/vendors');
    if (!data) return;

    data.forEach(v => {
        const key = v.name.toLowerCase().replace(/\s+/g,'-');
        const exists = vendors.find(x => x.name===v.name);
        if (!exists) vendors.push({ key, name:v.name, id:v.id, icon:'🏪' });
        else if (!exists.id) exists.id = v.id;
    });

    const filterVendor = document.getElementById('costs-filter-vendor');
    if (filterVendor) {
        filterVendor.innerHTML = '<option value="">All Vendors</option>' +
            vendors.map(v => `<option value="${v.id||v.name}">${v.name}</option>`).join('');
    }

    const list = document.getElementById('vendors-list');
    if (list) {
        const dbVendors = vendors.filter(v => v.id);
        list.innerHTML = dbVendors.length ? `
            <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${dbVendors.map(v=>`
                    <div style="display:flex;align-items:center;gap:6px;background:var(--gray-50);padding:8px 14px;border-radius:20px;border:2px solid var(--gray-100)">
                        <span>${v.icon}</span>
                        <span style="font-size:13px;font-weight:500">${v.name}</span>
                        <button class="btn-logout" style="font-size:12px;padding:2px 8px;margin-left:4px" onclick="deleteVendor('${v.id}')">✕</button>
                    </div>`).join('')}
            </div>` : '<div class="empty-state" style="padding:20px">No vendors in database yet.</div>';
    }

    renderVendorGrid();
}

async function addVendorInline() {
    const name = document.getElementById('new-vendor-name').value.trim();
    if (!name) { toast('Enter vendor name','error'); return; }
    const res = await api('/api/vendors', { method:'POST', body: JSON.stringify({name}) });
    const created = Array.isArray(res) ? res[0] : res;
    const key = name.toLowerCase().replace(/\s+/g,'-');
    vendors.push({ key, name, id: created?.id, icon:'🏪' });
    document.getElementById('new-vendor-name').value = '';
    toast('Vendor added!');
    await loadVendors();
}

async function deleteVendor(id) {
    await api('/api/vendors/'+id, { method:'DELETE' });
    vendors = vendors.filter(v => v.id !== id);
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
document.addEventListener('click', e => {
    if (!e.target.closest('#item-search') && !e.target.closest('#prod-results')) {
        const r = document.getElementById('prod-results');
        if (r) r.classList.remove('open');
    }
});