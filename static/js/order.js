// ═══════════════════════════════════════════════════════════
//  ORDER PAGE — Beans & Butter Cafe
// ═══════════════════════════════════════════════════════════

// ── State (cart, paymentMethod, allProducts, allCategories declared in globals.js) ──
// order.js-specific state:
let selectedMemberId  = null;
let memberSearchTimer = null;
let lastRes = null;

// ── Bootstrap ──────────────────────────────────────────────
async function loadProductsForOrder() {
    allProducts   = await api('/api/products')   || [];
    allCategories = await api('/api/categories') || [];
    renderCatFilter();
    renderProducts(allProducts);
}

// ── Category filter bar ────────────────────────────────────
function renderCatFilter() {
    const bar = document.getElementById('cat-filter');
    if (!bar) return;

    bar.innerHTML = `
        <button class="cat-btn active" data-cat="" onclick="filterByCat(this,'')">All</button>
        ${allCategories.map(c => `
            <button class="cat-btn" data-cat="${c.id}"
                    onclick="filterByCat(this,'${c.id}')">
                ${c.name}
            </button>
        `).join('')}
    `;
}

let activeCatId = '';

function filterByCat(btn, catId) {
    activeCatId = catId;
    document.querySelectorAll('#cat-filter .cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, catId);
}

// ── Search ─────────────────────────────────────────────────
function handleSearch(val) {
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
    applyFilters(val.toLowerCase().trim(), activeCatId);
}

function clearSearch() {
    const inp = document.getElementById('product-search');
    if (inp) inp.value = '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    applyFilters('', activeCatId);
}

function applyFilters(search, catId) {
    let filtered = allProducts;
    if (catId)   filtered = filtered.filter(p => p.category_id === catId);
    if (search)  filtered = filtered.filter(p => p.name.toLowerCase().includes(search));

    const countEl = document.getElementById('search-result-count');
    if (countEl) {
        if (search || catId) {
            countEl.style.display = 'block';
            countEl.textContent   = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
        } else {
            countEl.style.display = 'none';
        }
    }

    renderProducts(filtered);
}

// ── Products grid ──────────────────────────────────────────
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">😔 No products found</div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const cat    = p.categories || {};
        const color  = cat.color || '#C8916A';
        const inCart = cart.find(c => c.product_id === p.id);
        const qty    = inCart ? inCart.quantity : 0;
        return `
  <div class="product-card"
       style="
         border-radius:14px;
         border:1px solid ${inCart ? color : 'var(--border)'};
         ${inCart ? 'box-shadow:0 0 0 1px '+color+'33;' : ''}
         background:var(--bg-surface);
         padding:14px;
         display:flex;flex-direction:column;gap:8px;
         cursor:pointer;
         transition:transform 0.15s,border-color 0.2s;
       "
       onmouseover="this.style.transform='translateY(-2px)'"
       onmouseout="this.style.transform=''"
       onclick="addToCart('${p.id}','${escHtml(p.name)}',${p.price},'${p.category_id||''}')">

    <!-- Category dot + label (top-left) -->
    <div style="display:flex;align-items:center;gap:5px">
      <div style="width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0"></div>
      ${cat.name ? `<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.7px;color:${color}">${cat.name}</span>` : ''}
    </div>

    <!-- Product name -->
    <div style="font-family:'Times New Roman',serif;font-size:15px;font-weight:600;line-height:1.25;color:var(--text);flex:1">
      ${escHtml(p.name)}
    </div>

    <!-- Price + qty btn (always at bottom) -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto">
      <div style="font-size:17px;font-weight:600;color:var(--text);letter-spacing:-0.3px">
        ৳${parseFloat(p.price).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0})}
      </div>
      <button style="
          width:28px;height:28px;border-radius:50%;
          ${qty>0 ? 'background:'+color+';border:none;color:#fff;font-size:12px;font-weight:700;' : 'background:transparent;border:1.5px solid var(--border);color:var(--text-faint);font-size:16px;'}
          display:flex;align-items:center;justify-content:center;cursor:pointer;
          transition:transform 0.15s;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform=''"
        onclick="event.stopPropagation();addToCart('${p.id}','${escHtml(p.name)}',${p.price}','${p.category_id||''}')">
        ${qty > 0 ? qty : '+'}
      </button>
    </div>
  </div>
`;
    }).join('');
}

// ── Cart ───────────────────────────────────────────────────
function addToCart(productId, name, price, catId) {
    const existing = cart.find(c => c.product_id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ product_id: productId, name, price, quantity: 1 });
    }
    renderCart();
    // re-render products so badge updates
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, activeCatId);
}

function removeFromCart(productId) {
    const idx = cart.findIndex(c => c.product_id === productId);
    if (idx === -1) return;
    if (cart[idx].quantity > 1) {
        cart[idx].quantity--;
    } else {
        cart.splice(idx, 1);
    }
    renderCart();
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, activeCatId);
}

function clearCart() {
    cart = [];
    document.getElementById('discount-type').value = 'none';
    document.getElementById('discount-val').value  = '';
    document.getElementById('order-note').value    = '';
    clearMember();
    // reset table selection
    document.querySelectorAll('#table-select button').forEach(b => b.classList.remove('active'));
    renderCart();
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, activeCatId);
}

function renderCart() {
    const itemsEl   = document.getElementById('cart-items');
    const summaryEl = document.getElementById('cart-summary');
    if (!itemsEl || !summaryEl) return;

    if (!cart.length) {
        itemsEl.innerHTML   = '<div class="cart-empty">Add items to order</div>';
        summaryEl.style.display = 'none';
        return;
    }

    itemsEl.innerHTML = cart.map(item => {
        const isFree = item.product_id.endsWith('-bogo') || item.price === 0;
        return `
        <div class="cart-item">
            <div class="cart-item-name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                ${escHtml(item.name)}
                ${isFree ? '<span style="font-size:10px;font-weight:700;background:#d4edda;color:#155724;padding:1px 6px;border-radius:20px;letter-spacing:0.3px">FREE</span>' : ''}
                ${!isFree ? `<span style="font-size:10px;color:var(--text-muted);cursor:pointer;text-decoration:underline;text-underline-offset:2px" onclick="applyBogo('${item.product_id}','${escHtml(item.name)}')">BOGO?</span>` : ''}
            </div>
            <div class="qty-ctrl">
                ${!isFree ? `
                    <button class="qty-btn" onclick="removeFromCart('${item.product_id}')">−</button>
                    <span class="qty-num">${item.quantity}</span>
                    <button class="qty-btn" onclick="addToCart('${item.product_id}','${escHtml(item.name)}',${item.price},'')">+</button>
                ` : `<span style="font-size:11px;color:var(--text-muted);padding:0 4px">×1</span>`}
            </div>
            <span class="cart-item-price" style="${isFree ? 'color:var(--green);font-weight:700' : ''}">
                ${isFree ? '৳0' : fmt(item.price * item.quantity)}
            </span>
        </div>
    `}).join('');

    summaryEl.style.display = 'block';
    recalcTotal();
}

function recalcTotal() {
    const subtotal      = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discountType  = document.getElementById('discount-type').value;
    const discountVal   = parseFloat(document.getElementById('discount-val').value) || 0;
    let   discountAmt   = 0;

    if (discountType === 'percent') {
        discountAmt = subtotal * discountVal / 100;
    } else if (discountType === 'flat') {
        discountAmt = Math.min(discountVal, subtotal);
    }

    const total = subtotal - discountAmt;

    document.getElementById('s-subtotal').textContent = fmt(subtotal);
    document.getElementById('s-total').textContent    = fmt(total);

    const discRow = document.getElementById('discount-row');
    if (discountAmt > 0) {
        discRow.style.display = 'flex';
        document.getElementById('s-discount').textContent = '-' + fmt(discountAmt);
    } else {
        discRow.style.display = 'none';
    }
}

// ── Table select ───────────────────────────────────────────
function renderTableSelect() {
    const wrap = document.getElementById('table-select');
    if (!wrap) return;
    wrap.innerHTML = TABLES.map(t => `
        <button data-table="${t.id}" onclick="selectTable(this,'${t.id}')">
            ${t.icon} ${t.label}
        </button>
    `).join('');
}

function selectTable(btn, tableId) {
    // toggle selection
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('#table-select button').forEach(b => { b.classList.remove('active'); });
    if (!wasActive) btn.classList.add('active');
}

function getSelectedTable() {
    const active = document.querySelector('#table-select button.active');
    return active ? active.dataset.table : null;
}

// ── Payment method ─────────────────────────────────────────
function setPayment(method) {
    paymentMethod = method;
    ['cash','card','mobile'].forEach(m => {
        document.getElementById('pay-'+m)?.classList.toggle('active', m === method);
    });
}

// ── Member lookup ──────────────────────────────────────────
function searchMember(val) {
    clearTimeout(memberSearchTimer);
    if (!val || val.length < 5) {
        document.getElementById('member-info').style.display = 'none';
        selectedMemberId = null;
        return;
    }
    memberSearchTimer = setTimeout(async () => {
        const member = await api('/api/members?phone=' + encodeURIComponent(val));
        const infoEl = document.getElementById('member-info');
        if (member && member.id) {
            selectedMemberId      = member.id;
            infoEl.style.display  = 'block';
            infoEl.innerHTML      = `
                <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 12px;background:var(--bg-surface2);border-radius:var(--radius);border:1px solid var(--green);color:var(--green);font-size:13px;font-weight:600">
                    <span>✓</span>
                    <span>${escHtml(member.name || 'Member')}</span>
                    <span style="font-size:11px;color:var(--text-muted);font-weight:400;margin-left:auto">${member.phone}</span>
                </div>`;
        } else {
            selectedMemberId      = null;
            infoEl.style.display  = 'block';
            infoEl.innerHTML      = `
                <div style="margin-top:8px;padding:8px 12px;background:var(--bg-surface2);border-radius:var(--radius);font-size:12px;color:var(--text-muted)">
                    No member found.
                    <button class="btn btn-xs btn-amber" style="margin-left:8px"
                            onclick="addNewMember('${escHtml(val)}')">Add Member</button>
                </div>`;
        }
    }, 400);
}

async function addNewMember(phone) {
    const name = prompt('Enter member name:');
    if (!name) return;
    const member = await api('/api/members', {
        method: 'POST',
        body:   JSON.stringify({ name: name.trim(), phone })
    });
    if (member && member.id) {
        selectedMemberId = member.id;
        const infoEl = document.getElementById('member-info');
        infoEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 12px;background:var(--bg-surface2);border-radius:var(--radius);border:1px solid var(--green);color:var(--green);font-size:13px;font-weight:600">
                <span>✓</span>
                <span>${escHtml(member.name)}</span>
                <span style="font-size:11px;color:var(--text-muted);font-weight:400;margin-left:auto">${member.phone}</span>
            </div>`;
        toast('Member added!', 'success');
    }
}

function clearMember() {
    selectedMemberId = null;
    const inp = document.getElementById('member-phone');
    if (inp) inp.value = '';
    const infoEl = document.getElementById('member-info');
    if (infoEl) { infoEl.style.display = 'none'; infoEl.innerHTML = ''; }
}

// ── Place order ────────────────────────────────────────────
async function placeOrder() {
    if (!cart.length) { toast('Add items first', 'error'); return; }

    // ── Table validation ──
    const tableNumber = getSelectedTable();
    if (!tableNumber) {
        // shake the table section to draw attention
        const tableWrap = document.getElementById('table-select');
        if (tableWrap) {
            tableWrap.style.animation = 'none';
            void tableWrap.offsetWidth;
            tableWrap.style.animation = 'tableShake 0.4s ease';
        }
        // show inline warning below the table grid
        let warn = document.getElementById('table-required-warn');
        if (!warn) {
            warn = document.createElement('div');
            warn.id = 'table-required-warn';
            warn.style.cssText = `
                display:flex;align-items:center;gap:8px;
                margin-top:8px;padding:9px 13px;
                background:#FFF3CD;border:1px solid #F59E0B;
                border-radius:var(--radius);
                font-size:12px;font-weight:600;color:#92400E;
            `;
            warn.innerHTML = `<span>⚠️</span><span>Please select a table before placing the order</span>`;
            document.getElementById('table-select').after(warn);
        }
        warn.style.display = 'flex';
        setTimeout(() => { if (warn) warn.style.display = 'none'; }, 4000);
        return;
    }

    // hide warning if it was shown
    const warn = document.getElementById('table-required-warn');
    if (warn) warn.style.display = 'none';

    const discountType  = document.getElementById('discount-type').value;
    const discountValue = parseFloat(document.getElementById('discount-val').value) || 0;
    const note          = document.getElementById('order-note').value.trim();

    const payload = {
        items:          cart,
        discount_type:  discountType,
        discount_value: discountValue,
        payment_method: paymentMethod,
        note,
        table_number:   tableNumber,
        member_id:      selectedMemberId
    };

    const btn = document.querySelector('#page-order .btn-primary');
    if (btn) { btn.disabled = true; btn.textContent = 'Placing…'; }

    // ── Show progress bar ──
    showOrderProgress(true, 0);

    try {
        showOrderProgress(true, 1);  // Saving order
        const res = await api('/api/orders', {
            method: 'POST',
            body:   JSON.stringify(payload)
        });

        showOrderProgress(true, 2);  // Confirming
        await new Promise(r => setTimeout(r, 400));
        showOrderProgress(true, 3);  // Done
        await new Promise(r => setTimeout(r, 300));

        if (res && res.success) {
            showOrderProgress(false);
            lastRes = res;
            const token = getDailyToken();
            showKitchenSlip(res, token);
            showReceipt(res, token);
            clearCart();
            toast('Order placed!', 'success');
        }else {
            showOrderProgress(false);
            toast(res?.message || 'Failed to place order', 'error');
        }
    } catch(e) {
        showOrderProgress(false);
        toast('Something went wrong', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '✓ Place Order'; }
    }
}
// ── Receipt modal ──────────────────────────────────────────
function showReceipt(res, token) {
    const now        = new Date();
    const tableNum   = getSelectedTable();
    const tableLabel = tableNum ? (TABLES.find(t => t.id === tableNum)?.label || tableNum) : '—';

    const itemsHtml = cart.map(i => {
        const isFree = i.price === 0;
        return `
        <div style="padding:5px 0;border-bottom:1px dashed #e0d5c5">
          <div style="display:flex;justify-content:space-between;font-size:20px">
                <span>${escHtml(i.name)} × ${i.quantity}</span>
                <span>${isFree ? '৳0' : fmt(i.price * i.quantity)}</span>
            </div>
            ${!isFree && i.quantity > 1 ? `
  <div style="font-size:13px;color:#aaa;margin-top:2px">

                ৳${parseFloat(i.price).toLocaleString('en-IN')} × ${i.quantity}
            </div>` : ''}
        </div>
    `}).join('');

    const discountHtml = res.discount_amount > 0 ? `
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#c0392b">
            <span>Discount</span>
            <span>-${fmt(res.discount_amount)}</span>
        </div>
    ` : '';

    document.getElementById('receipt-content').innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
        <div style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#2C1810">Beans &amp; Butter</div>
        <div style="font-size:14px;color:#888;margin-top:2px">Cafe</div>
        <div style="font-size:14px;color:#999;margin-top:6px;line-height:1.5">
            227, 2nd Floor, M.A. Gofur Market, Staff Quarter, Demra, Dhaka
        </div>
        <div style="margin-top:6px;font-size:13px;color:#888">
            <i class="ti ti-brand-instagram" style="font-size:14px;vertical-align:-1px"></i> beans_and_butter_bd &nbsp;|&nbsp;
            <i class="ti ti-phone" style="font-size:14px;vertical-align:-1px"></i> 01343-437706
        </div>
        <div style="font-size:14px;color:#aaa;margin-top:2px">beansandbutter2025@gmail.com</div>
       <div style="margin-top:7px;padding:6px 12px;background:#faf6f0;border-radius:6px;display:inline-block;font-size:13px;color:#888">
            <i class="ti ti-wifi" style="font-size:14px;vertical-align:-1px"></i> WiFi: Beans &amp; butter cafe-Bubblemilktea
        </div>
    </div>
    <hr style="border:none;border-top:1px dashed #e0d5c5;margin:10px 0">
   <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888;padding-bottom:8px">
        <span style="font-weight:700;color:#2C1810;font-size:12px">${res.order_number}</span>
        <span style="font-size:11px;font-weight:600;color:#2C1810;background:#faf6f0;border:1px solid #e0d5c5;padding:2px 10px;border-radius:20px">
            Token: ${token}
        </span>
        <span>${now.toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
    </div>
    ${tableNum ? `<div style="font-size:11px;color:#888;margin-bottom:8px">Table: <strong style="color:#2C1810">${tableLabel}</strong></div>` : ''}
    <div style="margin-bottom:12px">${itemsHtml}</div>
    <hr style="border:none;border-top:1px dashed #e0d5c5;margin:10px 0">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;padding:3px 0">
        <span>Subtotal</span><span>${fmt(res.subtotal)}</span>
    </div>
    ${discountHtml}
    <hr style="border:none;border-top:1.5px solid #2C1810;margin:8px 0">
    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;padding:4px 0;color:#2C1810">
        <span>Total</span><span>${fmt(res.total)}</span>
    </div>
    <hr style="border:none;border-top:1px dashed #e0d5c5;margin:10px 0">
    <div style="font-size:11px;color:#888;padding:4px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
        <span>Payment: <strong style="color:#2C1810;text-transform:capitalize">${paymentMethod}</strong></span>
${paymentMethod === 'cash' ? `
        <div style="margin-top:6px;display:flex;flex-direction:column;gap:4px;font-size:11px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
                <label style="color:#888;min-width:70px">Cash Given</label>
                <div style="display:flex;align-items:center;gap:6px">
                    <input id="cash-given" type="number" placeholder="Enter amount"
                        style="width:100px;padding:4px 8px;border:1px solid #e0d5c5;border-radius:6px;font-size:11px;text-align:right"
                        oninput="calcChange(${res.total})"/>
                    <span id="cash-given-display" style="font-size:12px;font-weight:700;color:#2C1810;min-width:60px;text-align:right;display:none"></span>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
                <label style="color:#888">Return</label>
                <span id="change-amount" style="font-size:12px;font-weight:700;color:#16A34A;min-width:60px;text-align:right">—</span>
            </div>
        </div>` : ''}
    </div>
<div style="text-align:center;margin-top:6px;font-size:13px;color:#bbb;line-height:1.6">
    Thank you for visiting!<br><span style="font-size:12px">Come back soon</span>
    </div>
`;

    document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
}

function printReceipt() {
    const printArea = document.getElementById('print-area');
    const customerHtml = document.getElementById('receipt-content').innerHTML;
    const kitchenHtml  = document.getElementById('kitchen-print-area').innerHTML;

    printArea.innerHTML = `
        <!-- Kitchen slip — page 1 -->
        <div style="font-family:'Georgia',serif;width:76mm;margin:0;padding:0;page-break-after:always;break-after:page;">
            ${kitchenHtml}
        </div>

        <!-- Customer receipt — page 2 -->
        <div style="font-family:'Georgia',serif;width:76mm;margin:0;padding:0;">
            ${customerHtml}
        </div>
    `;

    window.print();
    printArea.innerHTML = '';
}

// ── Utilities ──────────────────────────────────────────────
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

function showOrderProgress(show, step) {
    let wrap = document.getElementById('order-progress-wrap');

    if (!show) {
        if (wrap) wrap.style.display = 'none';
        return;
    }

    // Create the progress UI once
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'order-progress-wrap';
        wrap.style.cssText = `
            margin-bottom:12px;padding:14px;
            border:1px solid var(--border);
            border-radius:var(--radius);
            background:var(--bg-surface2);
        `;
        wrap.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:10px" id="op-steps">
                ${['Validating','Saving order','Confirming','Done'].map((s,i) => `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                        <div id="op-dot-${i}" style="
                            width:20px;height:20px;border-radius:50%;
                            border:2px solid var(--border);
                            background:var(--bg-surface);
                            display:flex;align-items:center;justify-content:center;
                            font-size:10px;font-weight:700;
                            transition:all 0.3s;color:transparent;
                        "></div>
                        <div id="op-txt-${i}" style="font-size:10px;color:var(--text-muted);font-weight:500">${s}</div>
                    </div>
                `).join('')}
            </div>
            <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
                <div id="op-bar" style="height:100%;width:0%;background:#6F4E37;border-radius:99px;transition:width 0.4s ease"></div>
            </div>
        `;
        const summary = document.getElementById('cart-summary');
        const placeBtn = summary?.querySelector('.btn-primary');
        if (placeBtn) placeBtn.before(wrap);
    }

    wrap.style.display = 'block';

    const pcts = [10, 35, 70, 100];
    document.getElementById('op-bar').style.width = pcts[step] + '%';

    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('op-dot-' + i);
        const txt = document.getElementById('op-txt-' + i);
        if (i < step) {
            dot.style.background = '#6F4E37';
            dot.style.borderColor = '#6F4E37';
            dot.style.color = '#fff';
            dot.textContent = '✓';
            txt.style.color = '#6F4E37';
            txt.style.fontWeight = '600';
        } else if (i === step) {
            dot.style.borderColor = '#6F4E37';
            dot.style.background = 'var(--bg-surface)';
            dot.style.color = 'transparent';
            txt.style.color = 'var(--text)';
            txt.style.fontWeight = '600';
        } else {
            dot.style.background = 'var(--bg-surface)';
            dot.style.borderColor = 'var(--border)';
            dot.style.color = 'transparent';
            txt.style.color = 'var(--text-muted)';
            txt.style.fontWeight = '500';
        }
    }
}

// Render combo buttons above the product grid (in loadProductsForOrder)
async function loadCombos() {
    const combos = JSON.parse(localStorage.getItem('bb_combos') || '[]');
    if (!combos.length) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding:12px;background:var(--bg-surface2);border-radius:var(--radius);border:1px solid var(--border)';
    wrap.innerHTML = '<div style="width:100%;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--text-muted);margin-bottom:4px">🎁 Combo Offers</div>'
        + combos.map(c => `
        <button class="btn btn-amber btn-sm" onclick='addComboToCart(${JSON.stringify(c)})'>
            ${c.name} — ${fmt(c.price)}
        </button>`).join('');
    document.getElementById('cat-filter').before(wrap);
}

function addComboToCart(combo) {
    combo.items.forEach(item => {
        cart.push({
            product_id: 'combo-' + item.name.replace(/\s/g,'') + '-' + Date.now(),
            name: item.name,
            price: item.type === 'free' ? 0 : item.price,
            quantity: 1
        });
    });
    renderCart();
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, activeCatId);
    toast(`${combo.name} added!`, 'success');
}

function applyBogo(productId, name) {
    const bogoId = productId + '-bogo';
    if (cart.find(c => c.product_id === bogoId)) {
        toast('BOGO already applied for this item', 'error');
        return;
    }
    cart.push({
        product_id: bogoId,
        name: '[Free] ' + name,
        price: 0,
        quantity: 1
    });
    renderCart();
    const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
    applyFilters(search, activeCatId);
    toast('BOGO applied — free item added!', 'success');
}

function showKitchenSlip(res, token) {
    const tableNum   = getSelectedTable();
    const tableLabel = tableNum ? (TABLES.find(t => t.id === tableNum)?.label || tableNum) : '—';
    const now        = new Date();

    const itemsHtml = cart.map(i => `
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;border-bottom:1px dashed #ccc;font-size:14px">
            <span style="font-weight:600">${escHtml(i.name)}</span>
            <span style="font-size:16px;font-weight:700;margin-left:12px">×${i.quantity}</span>
        </div>
    `).join('');

    const kitchenArea = document.getElementById('kitchen-print-area');
    kitchenArea.innerHTML = `
    <div style="font-family:'Georgia',serif;color:#000;width:54mm;margin:0;padding:8px 4px">
        <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:6px;margin-bottom:8px">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.5px">KITCHEN ORDER</div>
            <div style="font-size:8px;color:#555;margin-top:1px">Beans &amp; Butter</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:6px;border-bottom:1px dashed #ccc">
            <div>
                <div style="font-size:7px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Table</div>
                <div style="font-size:13px;font-weight:700;line-height:1.2">${tableLabel}</div>
            </div>
            <div style="text-align:center">
                <div style="font-size:7px;color:#888;text-transform:uppercase;letter-spacing:0.5px">Token</div>
                <div style="font-size:16px;font-weight:700;line-height:1">#${token}</div>
            </div>
            <div style="text-align:right">
                <div style="font-size:8px;color:#888">${res.order_number}</div>
                <div style="font-size:8px;color:#555">${now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
        </div>
        <div style="margin-bottom:8px">
            ${cart.map(i => `
                <div style="display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px dashed #ddd">
<span style="font-size:18px;font-weight:600">${escHtml(i.name)}</span>
<span style="font-size:18px;font-weight:700;margin-left:8px">×${i.quantity}</span>
                </div>
            `).join('')}
        </div>
        <div style="text-align:center;margin-top:6px;font-size:7px;color:#aaa;border-top:1px dashed #ccc;padding-top:5px">
            — kitchen copy —
        </div>
    </div>
`;
}

function printKitchenSlip() {
    document.body.classList.add('print-kitchen');
    window.print();
    document.body.classList.remove('print-kitchen');
}

function calcChange(total) {
    const input   = document.getElementById('cash-given');
    const given   = parseFloat(input?.value) || 0;
    const changeEl = document.getElementById('change-amount');
    const givenDisplay = document.getElementById('cash-given-display');
    if (!changeEl) return;

    if (given > 0) {
        // Show given amount as text alongside the input
        if (givenDisplay) {
            givenDisplay.textContent = '৳' + given.toLocaleString('en-IN');
            givenDisplay.style.display = 'inline';
        }
        if (given >= total) {
            changeEl.textContent = '৳' + (given - total).toLocaleString('en-IN');
            changeEl.style.color = '#16A34A';
        } else {
            changeEl.textContent = 'Short ৳' + (total - given).toLocaleString('en-IN');
            changeEl.style.color = '#DC2626';
        }
    } else {
        if (givenDisplay) { givenDisplay.style.display = 'none'; }
        changeEl.textContent = '—';
        changeEl.style.color = '#16A34A';
    }
}
function getDailyToken() {
    const today = new Date().toISOString().slice(0, 10); // "2026-05-30"
    const stored = JSON.parse(localStorage.getItem('bb_token') || '{}');

    if (stored.date !== today) {
        // New day — reset to 11
        const newToken = { date: today, counter: 11 };
        localStorage.setItem('bb_token', JSON.stringify(newToken));
        return 11;
    } else {
        stored.counter++;
        localStorage.setItem('bb_token', JSON.stringify(stored));
        return stored.counter;
    }
}