// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const page = tab.dataset.page;
        document.getElementById('page-' + page).classList.add('active');
        if (page === 'orders-list') loadOrders();
        if (page === 'costs')       loadCostPage();
        if (page === 'products')    loadProductsPage();
        if (page === 'categories')  loadCategoriesPage();
        if (page === 'dashboard')   loadDashboard();
    });
});

// ═══════════════════════════════════════════════════════════
//  APP INIT
// ═══════════════════════════════════════════════════════════
async function initApp() {
    document.getElementById('dash-date').value       = today();
    document.getElementById('dash-month').value      = thisMonth();
    document.getElementById('orders-date').value     = today();
    document.getElementById('cost-date').value       = today();
    document.getElementById('costs-view-date').value = today();
    renderTableSelect();
    renderVendorGrid();
    setStep(1);
    await loadProductsForOrder();
}