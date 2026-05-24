// ═══════════════════════════════════════════════════════════
//  DASHBOARD PAGE (OWNER ONLY)
// ═══════════════════════════════════════════════════════════
async function loadDashboard() {
    const date = document.getElementById('dash-date').value || today();
    const data = await api('/api/dashboard/daily?date='+date);
    if (!data) return;

    document.getElementById('d-sales').textContent  = fmt(data.total_sales);
    document.getElementById('d-costs').textContent  = fmt(data.total_costs);
    document.getElementById('d-orders').textContent = data.order_count;
    document.getElementById('d-avg').textContent    = fmt(data.avg_order);

    const profitEl = document.getElementById('d-profit');
    profitEl.textContent = fmt(data.net_profit);
    profitEl.className   = 'stat-value '+(data.net_profit>=0?'green':'red');

    const wrap = document.getElementById('dash-orders-table');
    if (!data.orders || !data.orders.length) {
        wrap.innerHTML = '<div class="empty-state">No orders today</div>';
    } else {
        wrap.innerHTML = `
            <div style="overflow-x:auto">
            <table class="data-table">
                <thead><tr><th>Order #</th><th>Time</th><th>Total</th><th>Payment</th><th>Discount</th></tr></thead>
                <tbody>
                    ${data.orders.map(o => `
                        <tr>
                            <td><strong>${o.order_number}</strong></td>
                            <td>${new Date(o.created_at).toLocaleTimeString()}</td>
                            <td><strong style="color:var(--amber)">${fmt(o.total)}</strong></td>
                            <td><span class="badge badge-green">${o.payment_method}</span></td>
                            <td>${o.discount_amount>0 ? fmt(o.discount_amount) : '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>`;
    }

    await loadMonthly();
    await loadTopProducts();
}

async function loadMonthly() {
    const month    = document.getElementById('dash-month').value || thisMonth();
    const [year,m] = month.split('-');
    const data     = await api(`/api/dashboard/monthly?year=${year}&month=${m}`);
    if (!data) return;

    document.getElementById('m-sales').textContent = fmt(data.total_sales);
    document.getElementById('m-costs').textContent = fmt(data.total_costs);
    const mpEl = document.getElementById('m-profit');
    mpEl.textContent = fmt(data.net_profit);
    mpEl.className   = 'stat-value '+(data.net_profit>=0?'green':'red');

    const chartEl = document.getElementById('monthly-chart');
    if (!data.chart_data || !data.chart_data.length) {
        chartEl.innerHTML = '<div class="empty-state" style="padding:20px">No data for this month</div>';
        return;
    }
    const maxVal = Math.max(...data.chart_data.map(d => Math.max(d.sales, d.costs, 0.1)));
    chartEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto">
            ${data.chart_data.map(d => `
                <div>
                    <div style="font-size:11px;color:var(--gray-400);margin-bottom:3px">${d.date.slice(5)}</div>
                    <div class="chart-bar-row" style="margin-bottom:2px">
                        <div class="chart-bar-track" style="flex:1">
                            <div class="chart-bar-fill" style="width:${(d.sales/maxVal*100).toFixed(1)}%;background:var(--amber)"></div>
                        </div>
                        <div style="width:80px;font-size:11px;text-align:right;color:var(--amber);font-weight:600">${fmt(d.sales)}</div>
                    </div>
                    <div class="chart-bar-row">
                        <div class="chart-bar-track" style="flex:1">
                            <div class="chart-bar-fill" style="width:${(d.costs/maxVal*100).toFixed(1)}%;background:var(--red)"></div>
                        </div>
                        <div style="width:80px;font-size:11px;text-align:right;color:var(--red);font-weight:600">${fmt(d.costs)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="display:flex;gap:16px;margin-top:12px;font-size:12px">
            <span><span style="display:inline-block;width:12px;height:12px;background:var(--amber);border-radius:2px;margin-right:4px"></span>Sales</span>
            <span><span style="display:inline-block;width:12px;height:12px;background:var(--red);border-radius:2px;margin-right:4px"></span>Costs</span>
        </div>`;
}

async function loadTopProducts() {
    const data = await api('/api/dashboard/top-products');
    const el   = document.getElementById('top-products-chart');
    if (!data || !data.length) {
        el.innerHTML = '<div class="empty-state">No data</div>';
        return;
    }
    const maxRev = Math.max(...data.map(p => p.revenue));
    el.innerHTML = `
        <div class="chart-bar-wrap">
            ${data.map(p => `
                <div class="chart-bar-row">
                    <div class="chart-bar-label">${p.name.slice(0,10)}</div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width:${(p.revenue/maxRev*100).toFixed(1)}%;background:var(--brown)"></div>
                    </div>
                    <div class="chart-bar-val">${fmt(p.revenue)}</div>
                </div>
            `).join('')}
        </div>`;
}