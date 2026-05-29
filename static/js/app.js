// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const page = tab.dataset.page;
        if (!page) return;

        // Block dashboard for non-owners
        if (page === 'dashboard' && window.currentUserRole !== 'owner') {
            toast('Access denied', 'error');
            return;
        }

        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('page-' + page).classList.add('active');

        if (page === 'orders-list') loadOrders();
        if (page === 'costs')       loadCostPage();
        if (page === 'addremove')   initAddRemovePage();
        if (page === 'dashboard')   { loadDashboard(); loadMonthly(); }
    });
});

// ═══════════════════════════════════════════════════════════
//  ADD / REMOVE PAGE
// ═══════════════════════════════════════════════════════════
function initAddRemovePage() {
    // Always open on Products tab first
    const firstTab = document.querySelector('.ar-tab');
    if (firstTab) switchArTab(firstTab, 'ar-products');
}

function switchArTab(btn, sectionId) {
    document.querySelectorAll('.ar-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.ar-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'ar-products')   { loadProductsPage(); }
    if (sectionId === 'ar-categories') { loadCategoriesPage(); }
    if (sectionId === 'ar-vendors')    { loadVendors(); }
    if (sectionId === 'ar-costcats')   { loadCostCategories(); }
}

// Vendor add button on Add/Remove page (separate input id from costs page)
// async function addVendorAr() {
//     const name = document.getElementById('new-vendor-name-ar').value.trim();
//     if (!name) { toast('Enter vendor name', 'error'); return; }
//     await api('/api/vendors', { method: 'POST', body: JSON.stringify({ name }) });
//     document.getElementById('new-vendor-name-ar').value = '';
//     toast('Vendor added!');
//     await loadVendors();
// }

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