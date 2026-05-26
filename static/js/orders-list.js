// ═══════════════════════════════════════════════════════════
//  ORDERS LIST PAGE
// ═══════════════════════════════════════════════════════════
async function loadOrders() {
    const date = document.getElementById('orders-date').value || today();
    const data = await api('/api/orders?date='+date);
    const wrap = document.getElementById('orders-table-wrap');
    if (!data || !data.length) {
        wrap.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="ti ti-clipboard-list"></i></div>No orders for this date</div>';
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
                        <td><strong>${o.order_number}</strong></td>
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