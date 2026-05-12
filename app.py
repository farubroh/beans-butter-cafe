from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import httpx
from datetime import datetime
import json

app = Flask(__name__, static_folder='static')
CORS(app)

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://mkpomfgvoquqvgfjdfjd.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'sb_publishable_v8OAx50LfTWdN2bwUkEOCw_Na6ssKEW')

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def sb_get(table, params=''):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    r = httpx.get(url, headers=HEADERS)
    return r.json()

def sb_post(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = httpx.post(url, headers=HEADERS, json=data)
    return r.json()

def sb_patch(table, id_val, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id_val}"
    r = httpx.patch(url, headers=HEADERS, json=data)
    return r.json()

def sb_delete(table, id_val):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{id_val}"
    r = httpx.delete(url, headers=HEADERS)
    return r.status_code

# ── SERVE FRONTEND ────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

# ── AUTH ──────────────────────────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    users = sb_get('users', f"username=eq.{data['username']}&password=eq.{data['password']}&select=id,username,role")
    if users:
        user = users[0] if isinstance(users, list) else users
        return jsonify({'success': True, 'user': user})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

# ── CATEGORIES ────────────────────────────────────────────────────────────────
@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify(sb_get('categories', 'order=name'))

@app.route('/api/categories', methods=['POST'])
def add_category():
    result = sb_post('categories', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/categories/<id>', methods=['PUT'])
def update_category(id):
    result = sb_patch('categories', id, request.json)
    return jsonify({'success': True})

@app.route('/api/categories/<id>', methods=['DELETE'])
def delete_category(id):
    sb_delete('categories', id)
    return jsonify({'success': True})

# ── PRODUCTS ──────────────────────────────────────────────────────────────────
@app.route('/api/products', methods=['GET'])
def get_products():
    data = sb_get('products', 'active=eq.true&order=name&select=*,categories(name,color)')
    return jsonify(data)

@app.route('/api/products', methods=['POST'])
def add_product():
    result = sb_post('products', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/products/<id>', methods=['PUT'])
def update_product(id):
    sb_patch('products', id, request.json)
    return jsonify({'success': True})

@app.route('/api/products/<id>', methods=['DELETE'])
def delete_product(id):
    sb_patch('products', id, {'active': False})
    return jsonify({'success': True})

# ── ORDERS ────────────────────────────────────────────────────────────────────
@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    now = datetime.now()
    order_number = f"BB{now.strftime('%Y%m%d%H%M%S')}"

    subtotal = sum(float(item['price']) * int(item['quantity']) for item in data['items'])
    discount_type = data.get('discount_type', 'none')
    discount_value = float(data.get('discount_value', 0))
    discount_amount = 0

    if discount_type == 'percent':
        discount_amount = subtotal * discount_value / 100
    elif discount_type == 'flat':
        discount_amount = min(discount_value, subtotal)

    total = subtotal - discount_amount

    order_data = {
        'order_number': order_number,
        'subtotal': subtotal,
        'discount_type': discount_type,
        'discount_value': discount_value,
        'discount_amount': discount_amount,
        'total': total,
        'payment_method': data.get('payment_method', 'cash'),
        'note': data.get('note', '')
    }

    order_result = sb_post('orders', order_data)
    if not order_result or (isinstance(order_result, list) and len(order_result) == 0):
        return jsonify({'success': False, 'message': 'Failed to create order'}), 500

    order = order_result[0] if isinstance(order_result, list) else order_result
    order_id = order['id']

    items_to_insert = []
    for item in data['items']:
        items_to_insert.append({
            'order_id': order_id,
            'product_id': item.get('product_id'),
            'product_name': item['name'],
            'product_price': float(item['price']),
            'quantity': int(item['quantity']),
            'subtotal': float(item['price']) * int(item['quantity'])
        })

    sb_post('order_items', items_to_insert)

    return jsonify({'success': True, 'order': order, 'order_number': order_number,
                    'total': total, 'subtotal': subtotal, 'discount_amount': discount_amount})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    date_filter = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    data = sb_get('orders', f"created_at=gte.{date_filter}T00:00:00&created_at=lte.{date_filter}T23:59:59&order=created_at.desc")
    return jsonify(data)

@app.route('/api/orders/<id>/items', methods=['GET'])
def get_order_items(id):
    return jsonify(sb_get('order_items', f"order_id=eq.{id}"))

# ── COST CATEGORIES ───────────────────────────────────────────────────────────
@app.route('/api/cost-categories', methods=['GET'])
def get_cost_categories():
    return jsonify(sb_get('cost_categories', 'order=name'))

@app.route('/api/cost-categories', methods=['POST'])
def add_cost_category():
    result = sb_post('cost_categories', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/cost-categories/<id>', methods=['DELETE'])
def delete_cost_category(id):
    sb_delete('cost_categories', id)
    return jsonify({'success': True})

# ── DAILY COSTS ───────────────────────────────────────────────────────────────
@app.route('/api/costs', methods=['GET'])
def get_costs():
    date_filter = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    data = sb_get('daily_costs', f"date=eq.{date_filter}&order=created_at.desc&select=*,cost_categories(name,color)")
    return jsonify(data)

@app.route('/api/costs', methods=['POST'])
def add_cost():
    result = sb_post('daily_costs', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/costs/<id>', methods=['DELETE'])
def delete_cost(id):
    sb_delete('daily_costs', id)
    return jsonify({'success': True})

# ── DASHBOARD / ANALYTICS ─────────────────────────────────────────────────────
@app.route('/api/dashboard/daily', methods=['GET'])
def dashboard_daily():
    date_filter = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    orders = sb_get('orders', f"created_at=gte.{date_filter}T00:00:00&created_at=lte.{date_filter}T23:59:59&status=eq.completed")
    costs = sb_get('daily_costs', f"date=eq.{date_filter}")

    total_sales = sum(float(o['total']) for o in orders) if orders else 0
    total_costs = sum(float(c['amount']) for c in costs) if costs else 0
    order_count = len(orders) if orders else 0
    avg_order = total_sales / order_count if order_count > 0 else 0
    net_profit = total_sales - total_costs

    return jsonify({
        'total_sales': total_sales,
        'total_costs': total_costs,
        'net_profit': net_profit,
        'order_count': order_count,
        'avg_order': avg_order,
        'orders': orders or []
    })

@app.route('/api/dashboard/monthly', methods=['GET'])
def dashboard_monthly():
    year = request.args.get('year', datetime.now().year)
    month = request.args.get('month', datetime.now().month)
    month_str = f"{year}-{str(month).zfill(2)}"

    orders = sb_get('orders', f"created_at=gte.{month_str}-01T00:00:00&created_at=lte.{month_str}-31T23:59:59&status=eq.completed")
    costs = sb_get('daily_costs', f"date=gte.{month_str}-01&date=lte.{month_str}-31")

    # Group by day
    daily_sales = {}
    daily_costs_map = {}

    if orders:
        for o in orders:
            day = o['created_at'][:10]
            daily_sales[day] = daily_sales.get(day, 0) + float(o['total'])

    if costs:
        for c in costs:
            day = c['date']
            daily_costs_map[day] = daily_costs_map.get(day, 0) + float(c['amount'])

    all_days = sorted(set(list(daily_sales.keys()) + list(daily_costs_map.keys())))
    chart_data = []
    for day in all_days:
        chart_data.append({
            'date': day,
            'sales': daily_sales.get(day, 0),
            'costs': daily_costs_map.get(day, 0),
            'profit': daily_sales.get(day, 0) - daily_costs_map.get(day, 0)
        })

    total_sales = sum(float(o['total']) for o in orders) if orders else 0
    total_costs = sum(float(c['amount']) for c in costs) if costs else 0

    return jsonify({
        'chart_data': chart_data,
        'total_sales': total_sales,
        'total_costs': total_costs,
        'net_profit': total_sales - total_costs,
        'order_count': len(orders) if orders else 0
    })

@app.route('/api/dashboard/top-products', methods=['GET'])
def top_products():
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    items = sb_get('order_items', f"select=product_name,quantity,subtotal")

    product_map = {}
    if items:
        for item in items:
            name = item['product_name']
            if name not in product_map:
                product_map[name] = {'name': name, 'quantity': 0, 'revenue': 0}
            product_map[name]['quantity'] += item['quantity']
            product_map[name]['revenue'] += float(item['subtotal'])

    top = sorted(product_map.values(), key=lambda x: x['revenue'], reverse=True)[:8]
    return jsonify(top)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)