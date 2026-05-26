// ═══════════════════════════════════════════════════════════
//  PRODUCTS PAGE
// ═══════════════════════════════════════════════════════════
async function loadProductsPage() {
    const data = await api('/api/products');
    const cats = await api('/api/categories');
    const catSel = document.getElementById('prod-cat');
    catSel.innerHTML = '<option value="">No Category</option>' +
        (cats||[]).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const list = document.getElementById('products-manage-list');
    if (!data || !data.length) {
        list.innerHTML = '<div class="empty-state">No products yet</div>';
        return;
    }
    list.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:8px;max-height:500px;overflow-y:auto">
            ${data.map(p => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-100)">
                    <div>
                        <div style="font-weight:600;font-size:14px">${p.name}</div>
                        <div style="font-size:12px;color:var(--gray-400)">${p.categories?.name||'Uncategorized'}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px">
                        <span style="font-weight:700;color:var(--amber)">${fmt(p.price)}</span>
                        <button class="btn btn-xs btn-outline" onclick='editProduct(${JSON.stringify(p).replace(/'/g,"&apos;")})'>Edit</button>
                        <button class="btn btn-xs btn-red" onclick="deleteProduct('${p.id}')">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

function editProduct(p) {
    document.getElementById('edit-product-id').value = p.id;
    document.getElementById('prod-name').value       = p.name;
    document.getElementById('prod-price').value      = p.price;
    document.getElementById('prod-cat').value        = p.category_id||'';
    document.getElementById('prod-desc').value       = p.description||'';
    document.getElementById('product-form-title').textContent = '✏️ Edit Product';
}

function resetProductForm() {
    document.getElementById('edit-product-id').value = '';
    document.getElementById('prod-name').value       = '';
    document.getElementById('prod-price').value      = '';
    document.getElementById('prod-desc').value       = '';
    document.getElementById('product-form-title').textContent = 'Add Product';
}

async function saveProduct() {
    const id          = document.getElementById('edit-product-id').value;
    const name        = document.getElementById('prod-name').value.trim();
    const price       = parseFloat(document.getElementById('prod-price').value);
    const category_id = document.getElementById('prod-cat').value || null;
    const description = document.getElementById('prod-desc').value;
    if (!name)            { toast('Enter product name','error'); return; }
    if (!price||price<=0) { toast('Enter valid price','error'); return; }
    const body = JSON.stringify({name, price, category_id, description});
    if (id) {
        await api('/api/products/'+id, {method:'PUT', body});
        toast('Product updated!');
    } else {
        await api('/api/products', {method:'POST', body});
        toast('Product added!');
    }
    resetProductForm();
    await loadProductsPage();
    await loadProductsForOrder();
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await api('/api/products/'+id, {method:'DELETE'});
    toast('Deleted');
    await loadProductsPage();
    await loadProductsForOrder();
}