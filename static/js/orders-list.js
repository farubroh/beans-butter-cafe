// ═══════════════════════════════════════════════════════════
//  ORDERS LIST PAGE
// ═══════════════════════════════════════════════════════════
async function loadOrders() {
    const date = document.getElementById('orders-date').value || today();
    const data = await api('/api/orders?date='+date);
    const wrap = document.getElementById('orders-table-wrap');
    if (!data || !data.length) {
        wrap.innerHTML = '<div class="empty-state"><div class="empty-icon"></div>No orders for this date</div>';
        return;
    }

    const totalSale    = data.reduce((s,o) => s+parseFloat(o.total), 0);
    const totalDiscount= data.reduce((s,o) => s+parseFloat(o.discount_amount||0), 0);
    const totalCash    = data.filter(o => o.payment_method==='cash').reduce((s,o) => s+parseFloat(o.total), 0);
    const totalCard    = data.filter(o => o.payment_method==='card').reduce((s,o) => s+parseFloat(o.total), 0);
    const totalMobile  = data.filter(o => o.payment_method==='mobile').reduce((s,o) => s+parseFloat(o.total), 0);
    const countCash    = data.filter(o => o.payment_method==='cash').length;
    const countCard    = data.filter(o => o.payment_method==='card').length;
    const countMobile  = data.filter(o => o.payment_method==='mobile').length;

    wrap.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px">
            <div style="background:linear-gradient(135deg,#2C1810,#6F4E37);border-radius:var(--radius-lg);padding:16px 20px;color:white">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;opacity:0.75;margin-bottom:6px">Total Sales</div>
                <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">${fmt(totalSale)}</div>
                <div style="font-size:11px;opacity:0.65;margin-top:4px">${data.length} orders</div>
            </div>
            <div style="background:linear-gradient(135deg,#C0392B,#e74c3c);border-radius:var(--radius-lg);padding:16px 20px;color:white">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;opacity:0.75;margin-bottom:6px">Total Discount</div>
                <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">${fmt(totalDiscount)}</div>
                <div style="font-size:11px;opacity:0.65;margin-top:4px">given away</div>
            </div>
            <div style="background:linear-gradient(135deg,#1a6b3a,#2E7D50);border-radius:var(--radius-lg);padding:16px 20px;color:white">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;opacity:0.75;margin-bottom:6px">💵 Cash</div>
                <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">${fmt(totalCash)}</div>
                <div style="font-size:11px;opacity:0.65;margin-top:4px">${countCash} orders</div>
            </div>
            <div style="background:linear-gradient(135deg,#1a4a8a,#2563eb);border-radius:var(--radius-lg);padding:16px 20px;color:white">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;opacity:0.75;margin-bottom:6px">💳 Card</div>
                <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">${fmt(totalCard)}</div>
                <div style="font-size:11px;opacity:0.65;margin-top:4px">${countCard} orders</div>
            </div>
            <div style="background:linear-gradient(135deg,#7b3fa0,#9b59b6);border-radius:var(--radius-lg);padding:16px 20px;color:white">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;opacity:0.75;margin-bottom:6px">📱 Mobile</div>
                <div style="font-family:'Playfair Display',serif;font-size:24px;font-weight:700">${fmt(totalMobile)}</div>
                <div style="font-size:11px;opacity:0.65;margin-top:4px">${countMobile} orders</div>
            </div>
        </div>
        <div style="overflow-x:auto">
        <table class="data-table">
            <thead><tr>
                <th>Order #</th><th>Table</th><th>Seated</th>
                <th>Subtotal</th><th>Discount</th><th>Total</th>
                <th>Payment</th><th>Note</th><th>Duration</th>
            </tr></thead>
            <tbody>
                ${data.map(o => {
        const tableInfo = TABLES.find(t => t.id===o.table_number);
        const seatedAt  = new Date(o.created_at);
        const leftAt    = o.left_at ? new Date(o.left_at) : null;
        const mins      = leftAt ? Math.round((leftAt-seatedAt)/60000) : null;
        return `<tr>
                        <td>
                            <strong>${o.order_number}</strong>
                            <div style="display:flex;gap:4px;margin-top:4px">
                                <button class="btn btn-xs btn-outline" onclick="viewOrderDetails('${o.id}')">👁 View</button>
                                <button class="btn btn-xs btn-amber" onclick="editOrder('${o.id}')">✏ Edit</button>
                            </div>
                        </td>
                        <td>${tableInfo ? `<span class="badge badge-amber">${tableInfo.icon} ${tableInfo.label}</span>` : '<span style="color:var(--gray-400)">—</span>'}</td>
                        <td style="font-size:13px">${fmtTime(o.created_at)}</td>
                        <td>${fmt(o.subtotal)}</td>
                        <td>${parseFloat(o.discount_amount||0) > 0 ? `<span style="color:var(--red);font-weight:600">-${fmt(o.discount_amount)}</span>` : '—'}</td>
                        <td><strong>${fmt(o.total)}</strong></td>
                        <td><span class="badge badge-green">${o.payment_method}</span></td>
                        <td style="font-size:13px;color:var(--gray-600)">${o.note||'—'}</td>
                        <td>${!o.left_at
            ? `<button class="btn btn-xs btn-amber" onclick="checkoutTable('${o.id}')">Checkout</button>`
            : `<div style="text-align:center"><div style="font-size:12px;color:var(--green);font-weight:700">✓ ${mins}m</div><div style="font-size:10px;color:var(--gray-400)">${fmtTime(o.left_at)}</div></div>`
        }</td>
                    </tr>`;
    }).join('')}
            </tbody>
            <tfoot><tr>
                <td colspan="4" style="padding:12px 16px;font-weight:700">TOTAL (${data.length} orders)</td>
                <td style="padding:12px 16px;font-weight:700;color:var(--red)">-${fmt(totalDiscount)}</td>
                <td style="padding:12px 16px;font-weight:700;color:var(--amber);font-size:16px">${fmt(totalSale)}</td>
                <td colspan="3"></td>
            </tr></tfoot>
        </table>
        </div>`;
}

async function checkoutTable(orderId) {
    await api('/api/orders/'+orderId+'/checkout', { method:'POST' });
    toast('Table checked out!','success');
    await loadOrders();
}

async function viewOrderDetails(orderId) {
    const o = await api('/api/orders/' + orderId);
    if (!o) { toast('Could not load order', 'error'); return; }

    const tableInfo = TABLES.find(t => t.id === o.table_number);
    const tableLabel = tableInfo ? `${tableInfo.icon} ${tableInfo.label}` : o.table_number || '—';

    const itemsHtml = (o.order_items || []).map(i => `
        <tr>
           <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px">${escHtml(i.products?.name || i.product_name || i.name || '—')}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px;text-align:center">×${i.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:13px;text-align:right">${fmt(i.unit_price * i.quantity)}</td>
        </tr>
    `).join('');

    const discHtml = parseFloat(o.discount_amount || 0) > 0 ? `
        <tr>
            <td colspan="2" style="padding:4px 0;font-size:12px;color:#c0392b">Discount</td>
            <td style="padding:4px 0;font-size:12px;color:#c0392b;text-align:right">-${fmt(o.discount_amount)}</td>
        </tr>` : '';

    // Create modal
    let modal = document.getElementById('order-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'order-detail-modal';
        modal.style.cssText = `
            position:fixed;inset:0;background:rgba(0,0,0,0.5);
            display:flex;align-items:center;justify-content:center;
            z-index:1000;padding:16px;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;max-width:420px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #f0e8e0">
                <div>
                    <div style="font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#2C1810">${o.order_number}</div>
                    <div style="font-size:11px;color:#888;margin-top:2px">${new Date(o.created_at).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <button onclick="document.getElementById('order-detail-modal').remove()"
                    style="background:none;border:none;font-size:18px;cursor:pointer;color:#888;padding:4px">✕</button>
            </div>

            <div style="padding:16px 20px">
                <!-- Meta -->
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
                    <span style="background:#faf6f0;border:1px solid #e0d5c5;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:600;color:#2C1810">${tableLabel}</span>
                    <span style="background:#faf6f0;border:1px solid #e0d5c5;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:600;color:#2C1810;text-transform:capitalize">${o.payment_method}</span>
                    ${o.note ? `<span style="background:#fff8e1;border:1px solid #ffe082;border-radius:20px;padding:3px 12px;font-size:11px;color:#92400E">📝 ${escHtml(o.note)}</span>` : ''}
                </div>

                <!-- Items table -->
                <table style="width:100%;border-collapse:collapse">
                    <thead>
                        <tr style="border-bottom:2px solid #2C1810">
                            <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:#888;padding-bottom:6px">Item</th>
                            <th style="text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:#888;padding-bottom:6px">Qty</th>
                            <th style="text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:#888;padding-bottom:6px">Amount</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:6px 0;font-size:12px;color:#888">Subtotal</td>
                            <td style="padding:6px 0;font-size:12px;color:#888;text-align:right">${fmt(o.subtotal)}</td>
                        </tr>
                        ${discHtml}
                        <tr style="border-top:2px solid #2C1810">
                            <td colspan="2" style="padding:8px 0;font-size:15px;font-weight:700;color:#2C1810">Total</td>
                            <td style="padding:8px 0;font-size:15px;font-weight:700;color:#2C1810;text-align:right">${fmt(o.total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div style="padding:12px 20px;border-top:1px solid #f0e8e0;display:flex;gap:8px">
                <button class="btn btn-primary" style="flex:1" onclick="printOrderDetail()">🖨 Print</button>
                <button class="btn btn-outline" onclick="document.getElementById('order-detail-modal').remove()">Close</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function printOrderDetail() {
    const modalContent = document.getElementById('order-detail-modal')?.querySelector('div > div');
    if (!modalContent) return;
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = `
        <div style="font-family:'Georgia',serif;width:76mm;margin:0;padding:0;">
            ${modalContent.innerHTML}
        </div>
    `;
    window.print();
    printArea.innerHTML = '';
}

async function editOrder(orderId) {
    const o = await api('/api/orders/' + orderId);
    if (!o) { toast('Could not load order', 'error'); return; }

    // Switch to order page
    document.querySelector('.nav-tab[data-page="order"]')?.click();

    // Wait for page to be visible
    await new Promise(r => setTimeout(r, 80));

    // Clear existing cart
    clearCart();

    // Restore cart items
    (o.order_items || []).forEach(i => {
        const isFree = i.unit_price === 0 || (i.products?.name || i.name || '').startsWith('[Free]');
        cart.push({
            product_id: i.product_id || ('edit-' + Math.random().toString(36).slice(2)),
            name:       i.products?.name || i.product_name || i.name || '—',
            price:      parseFloat(i.unit_price ?? i.product_price ?? 0),
            quantity:   i.quantity
        });
    });

    // Restore discount
    if (o.discount_type && o.discount_type !== 'none') {
        document.getElementById('discount-type').value = o.discount_type;
        document.getElementById('discount-val').value  = o.discount_value || '';
    }

    // Restore payment method
    if (o.payment_method) setPayment(o.payment_method);

    // Restore table
    await new Promise(r => setTimeout(r, 50));
    const tableBtn = document.querySelector(`#table-select button[data-table="${o.table_number}"]`);
    if (tableBtn) selectTable(tableBtn, o.table_number);

    // Restore note
    if (o.note) document.getElementById('order-note').value = o.note;

    // Show a banner so staff knows they're editing
    let banner = document.getElementById('edit-order-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'edit-order-banner';
        banner.style.cssText = `
            padding:10px 16px;margin-bottom:14px;
            background:#FFF3CD;border:1px solid #F59E0B;border-radius:var(--radius);
            font-size:12px;font-weight:600;color:#92400E;
            display:flex;align-items:center;justify-content:space-between;gap:8px;
        `;
        document.querySelector('#page-order .order-layout')?.prepend(banner);
    }
    banner.innerHTML = `
        <span>⚠️ Editing order <strong>${o.order_number}</strong> — place a new order to replace it, or cancel below.</span>
        <button class="btn btn-xs" style="background:#DC2626;color:#fff;border:none"
            onclick="cancelOriginalOrder('${o.id}','${o.order_number}')">Cancel Original</button>
    `;
    banner.style.display = 'flex';

    renderCart();
    recalcTotal();
    toast(`Loaded order ${o.order_number} for editing`, 'success');
}

async function cancelOriginalOrder(orderId, orderNumber) {
    if (!confirm(`Cancel order ${orderNumber}? This cannot be undone.`)) return;
    const res = await api('/api/orders/' + orderId + '/cancel', { method: 'POST' });
    if (res && res.success) {
        toast(`Order ${orderNumber} cancelled`, 'success');
        document.getElementById('edit-order-banner')?.remove();
    } else {
        toast(res?.message || 'Cancel failed', 'error');
    }
}