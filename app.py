from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import httpx
from datetime import datetime, timezone, timedelta

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

DHAKA = timezone(timedelta(hours=6))


def dhaka_date_of(utc_str):
    utc_str = utc_str.replace(' ', 'T')
    if utc_str.endswith('+00'):
        utc_str += ':00'
    dt = datetime.fromisoformat(utc_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(DHAKA).strftime('%Y-%m-%d')


def utc_window_for_dhaka_date(date_filter):
    y, m, d = map(int, date_filter.split('-'))
    dhaka_start = datetime(y, m, d, 0, 0, 0, tzinfo=DHAKA)
    dhaka_end   = datetime(y, m, d, 23, 59, 59, tzinfo=DHAKA)
    utc_start = dhaka_start.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    utc_end   = dhaka_end.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    return utc_start, utc_end

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

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/api/login', methods=['POST'])
def login():
    body = request.json
    users = sb_get('users', f"username=eq.{body['username']}&password=eq.{body['password']}&select=id,username,role")
    if users:
        user = users[0] if isinstance(users, list) else users
        return jsonify({'success': True, 'user': user})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/categories', methods=['GET'])
def get_categories():
    return jsonify(sb_get('categories', 'order=name'))

@app.route('/api/categories', methods=['POST'])
def add_category():
    result = sb_post('categories', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/categories/<cat_id>', methods=['PUT'])
def update_category(cat_id):
    sb_patch('categories', cat_id, request.json)
    return jsonify({'success': True})

@app.route('/api/categories/<cat_id>', methods=['DELETE'])
def delete_category(cat_id):
    sb_delete('categories', cat_id)
    return jsonify({'success': True})

@app.route('/api/products', methods=['GET'])
def get_products():
    data = sb_get('products', 'active=eq.true&order=name&select=*,categories(name,color)')
    return jsonify(data)

@app.route('/api/products', methods=['POST'])
def add_product():
    result = sb_post('products', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/products/<prod_id>', methods=['PUT'])
def update_product(prod_id):
    sb_patch('products', prod_id, request.json)
    return jsonify({'success': True})

@app.route('/api/products/<prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    sb_patch('products', prod_id, {'active': False})
    return jsonify({'success': True})

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    now = datetime.now(DHAKA)
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
        'note': data.get('note', ''),
        'table_number': data.get('table_number'),
        'member_id': data.get('member_id'),
        'status': 'completed'
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
    date_filter = request.args.get('date', datetime.now(DHAKA).strftime('%Y-%m-%d'))
    utc_start, utc_end = utc_window_for_dhaka_date(date_filter)

    all_orders = sb_get('orders',
                        f"created_at=gte.{utc_start}"
                        f"&created_at=lte.{utc_end}"
                        f"&order=created_at.desc")

    filtered = [o for o in (all_orders or [])
                if dhaka_date_of(o['created_at']) == date_filter]

    return jsonify(filtered)


@app.route('/api/orders/<order_id>/checkout', methods=['POST'])
def checkout_order(order_id):
    sb_patch('orders', order_id, {'left_at': datetime.now(DHAKA).isoformat()})
    return jsonify({'success': True})

@app.route('/api/members', methods=['GET'])
def get_member():
    phone = request.args.get('phone', '')
    data = sb_get('members', f"phone=eq.{phone}&limit=1")
    if data and len(data) > 0:
        return jsonify(data[0])
    return jsonify(None)

@app.route('/api/members', methods=['POST'])
def add_member():
    result = sb_post('members', request.json)
    member = result[0] if isinstance(result, list) else result
    return jsonify(member)

@app.route('/api/orders/<order_id>/items', methods=['GET'])
def get_order_items(order_id):
    return jsonify(sb_get('order_items', f"order_id=eq.{order_id}"))

@app.route('/api/cost-categories', methods=['GET'])
def get_cost_categories():
    return jsonify(sb_get('cost_categories', 'order=name'))

@app.route('/api/cost-categories', methods=['POST'])
def add_cost_category():
    result = sb_post('cost_categories', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/cost-categories/<cat_id>', methods=['DELETE'])
def delete_cost_category(cat_id):
    sb_delete('cost_categories', cat_id)
    return jsonify({'success': True})

@app.route('/api/costs', methods=['GET'])
def get_costs():
    date_filter = request.args.get('date', datetime.now(DHAKA).strftime('%Y-%m-%d'))
    cat_id      = request.args.get('cat', '')
    vendor_id   = request.args.get('vendor', '')

    params = f"date=eq.{date_filter}&order=created_at.desc&select=*,cost_categories(name,color)"
    if cat_id:    params += f"&cost_category_id=eq.{cat_id}"
    if vendor_id: params += f"&vendor_id=eq.{vendor_id}"

    data = sb_get('daily_costs', params)
    return jsonify(data)

@app.route('/api/costs', methods=['POST'])
def add_cost():
    result = sb_post('daily_costs', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/costs/<cost_id>', methods=['DELETE'])
def delete_cost(cost_id):
    sb_delete('daily_costs', cost_id)
    return jsonify({'success': True})

@app.route('/api/dashboard/daily', methods=['GET'])
def dashboard_daily():
    date_filter = request.args.get('date', datetime.now(DHAKA).strftime('%Y-%m-%d'))
    utc_start, utc_end = utc_window_for_dhaka_date(date_filter)

    all_orders = sb_get('orders',
                        f"created_at=gte.{utc_start}"
                        f"&created_at=lte.{utc_end}"
                        f"&status=eq.completed")

    orders = [o for o in (all_orders or [])
              if dhaka_date_of(o['created_at']) == date_filter]

    costs = sb_get('daily_costs', f"date=eq.{date_filter}")

    total_sales = sum(float(o['total']) for o in orders)
    total_costs = sum(float(c['amount']) for c in costs) if costs else 0
    order_count = len(orders)
    avg_order = total_sales / order_count if order_count > 0 else 0

    return jsonify({
        'total_sales': total_sales,
        'total_costs': total_costs,
        'net_profit': total_sales - total_costs,
        'order_count': order_count,
        'avg_order': avg_order,
        'orders': orders
    })


@app.route('/api/dashboard/monthly', methods=['GET'])
def dashboard_monthly():
    year  = int(request.args.get('year',  datetime.now(DHAKA).year))
    month = int(request.args.get('month', datetime.now(DHAKA).month))
    month_str = f"{year}-{str(month).zfill(2)}"

    dhaka_start = datetime(year, month, 1, 0, 0, 0, tzinfo=DHAKA)
    if month == 12:
        dhaka_end = datetime(year + 1, 1, 1, 0, 0, 0, tzinfo=DHAKA) - timedelta(seconds=1)
    else:
        dhaka_end = datetime(year, month + 1, 1, 0, 0, 0, tzinfo=DHAKA) - timedelta(seconds=1)

    utc_start = dhaka_start.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
    utc_end   = dhaka_end.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')

    all_orders = sb_get('orders',
                        f"created_at=gte.{utc_start}"
                        f"&created_at=lte.{utc_end}"
                        f"&status=eq.completed")

    costs = sb_get('daily_costs', f"date=gte.{month_str}-01&date=lte.{month_str}-31")

    daily_sales = {}
    daily_costs_map = {}

    if all_orders and isinstance(all_orders, list):
        for o in all_orders:
            day = dhaka_date_of(o['created_at'])
            if day.startswith(month_str):
                daily_sales[day] = daily_sales.get(day, 0) + float(o['total'])

    if costs:
        for c in costs:
            day = c['date']
            daily_costs_map[day] = daily_costs_map.get(day, 0) + float(c['amount'])

    all_days = sorted(set(list(daily_sales.keys()) + list(daily_costs_map.keys())))
    chart_data = [
        {
            'date': day,
            'sales': daily_sales.get(day, 0),
            'costs': daily_costs_map.get(day, 0),
            'profit': daily_sales.get(day, 0) - daily_costs_map.get(day, 0)
        }
        for day in all_days
    ]

    total_sales = sum(daily_sales.values())
    total_costs = sum(float(c['amount']) for c in costs) if costs else 0

    return jsonify({
        'chart_data': chart_data,
        'total_sales': total_sales,
        'total_costs': total_costs,
        'net_profit': total_sales - total_costs,
        'order_count': len(all_orders) if all_orders else 0
    })


@app.route('/api/dashboard/top-products', methods=['GET'])
def top_products():
    items = sb_get('order_items', 'select=product_name,quantity,subtotal')

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


@app.route('/api/debug', methods=['GET'])
def debug():
    now = datetime.now(DHAKA)
    date_filter = now.strftime('%Y-%m-%d')
    utc_start, utc_end = utc_window_for_dhaka_date(date_filter)
    orders_raw = sb_get('orders', f'created_at=gte.{utc_start}&created_at=lte.{utc_end}&order=created_at.desc&limit=5')
    parsed = []
    if orders_raw and isinstance(orders_raw, list):
        for o in orders_raw:
            parsed.append({
                'order_number': o['order_number'],
                'created_at_utc': o['created_at'],
                'dhaka_date': dhaka_date_of(o['created_at']),
                'total': o['total']
            })
    return jsonify({
        'dhaka_now': now.isoformat(),
        'date_filter': date_filter,
        'utc_start': utc_start,
        'utc_end': utc_end,
        'orders_found': parsed
    })

@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    return jsonify(sb_get('vendors', 'order=name'))

@app.route('/api/vendors', methods=['POST'])
def add_vendor():
    result = sb_post('vendors', request.json)
    return jsonify({'success': True, 'data': result})

@app.route('/api/vendors/<vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    sb_delete('vendors', vendor_id)
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

