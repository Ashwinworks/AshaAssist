"""
StockService: business logic for Anganwadi stock/inventory management
"""
from datetime import datetime, timezone
from typing import Tuple, Dict, Any
from bson import ObjectId


class StockService:
    # Default ration items given to mothers — matches monthly_ration_service.py
    DEFAULT_STOCK_ITEMS = [
        {'itemName': 'Rice',                              'category': 'Grains',      'unit': 'kg',      'quantity': 0, 'minThreshold': 10},
        {'itemName': 'Wheat',                             'category': 'Grains',      'unit': 'kg',      'quantity': 0, 'minThreshold': 5},
        {'itemName': 'Lentils',                           'category': 'Pulses',      'unit': 'kg',      'quantity': 0, 'minThreshold': 3},
        {'itemName': 'Oil',                               'category': 'Oils',        'unit': 'L',       'quantity': 0, 'minThreshold': 3},
        {'itemName': 'Sugar',                             'category': 'Grains',      'unit': 'kg',      'quantity': 0, 'minThreshold': 3},
        {'itemName': 'Child Oil',                         'category': 'Oils',        'unit': 'ml',      'quantity': 0, 'minThreshold': 500},
        {'itemName': 'Iron and Folic Acid (IFA) tablets', 'category': 'Supplements', 'unit': 'tablets', 'quantity': 0, 'minThreshold': 50},
        {'itemName': 'Calcium tablets',                   'category': 'Supplements', 'unit': 'tablets', 'quantity': 0, 'minThreshold': 50},
        {'itemName': 'Vitamin A',                         'category': 'Supplements', 'unit': 'tablets', 'quantity': 0, 'minThreshold': 30},
        {'itemName': 'Amrutham Nutrimix (Amrutham Podi)', 'category': 'Supplements', 'unit': 'packets', 'quantity': 0, 'minThreshold': 10},
    ]

    def __init__(self, stock_collection):
        self.stock = stock_collection

    def _seed_default_items(self):
        """Seed stock collection with default ration items if collection is empty"""
        if self.stock.count_documents({}) > 0:
            return  # Already has data

        now = datetime.now(timezone.utc)
        docs = []
        for item in self.DEFAULT_STOCK_ITEMS:
            docs.append({
                'itemName': item['itemName'],
                'category': item['category'],
                'quantity': item['quantity'],
                'unit': item['unit'],
                'minThreshold': item['minThreshold'],
                'usageLog': [],
                'lastUpdated': now,
                'createdAt': now,
                'updatedAt': now,
            })
        if docs:
            self.stock.insert_many(docs)
            print(f"[Stock] Seeded {len(docs)} default ration items into stock collection")

    def get_all_stock(self) -> Tuple[Dict[str, Any], int]:
        """Get all stock items sorted by category, with low-stock flags"""
        # Auto-seed on first access if empty
        self._seed_default_items()

        items = list(self.stock.find().sort([('category', 1), ('itemName', 1)]))
        result = []
        for item in items:
            qty = item.get('quantity', 0)
            threshold = item.get('minThreshold', 0)
            if qty <= 0:
                status = 'out_of_stock'
            elif qty <= threshold:
                status = 'low'
            else:
                status = 'ok'

            result.append({
                'id': str(item['_id']),
                'itemName': item.get('itemName', ''),
                'category': item.get('category', 'Other'),
                'quantity': qty,
                'unit': item.get('unit', ''),
                'minThreshold': threshold,
                'status': status,
                'lastUpdated': item.get('lastUpdated').isoformat() if isinstance(item.get('lastUpdated'), datetime) else item.get('lastUpdated'),
                'usageLog': item.get('usageLog', [])[-5:],  # Last 5 entries
                'createdAt': item.get('createdAt').isoformat() if isinstance(item.get('createdAt'), datetime) else item.get('createdAt'),
            })

        return {'items': result}, 200

    def add_stock_item(self, data: dict) -> Tuple[Dict[str, Any], int]:
        """Add a new stock item"""
        item_name = data.get('itemName', '').strip()
        if not item_name:
            return {'error': 'Item name is required'}, 400

        # Check for duplicate
        existing = self.stock.find_one({'itemName': {'$regex': f'^{item_name}$', '$options': 'i'}})
        if existing:
            return {'error': f'Item "{item_name}" already exists'}, 400

        now = datetime.now(timezone.utc)
        doc = {
            'itemName': item_name,
            'category': data.get('category', 'Other'),
            'quantity': max(0, float(data.get('quantity', 0))),
            'unit': data.get('unit', 'kg'),
            'minThreshold': max(0, float(data.get('minThreshold', 0))),
            'usageLog': [],
            'lastUpdated': now,
            'createdAt': now,
            'updatedAt': now,
        }
        result = self.stock.insert_one(doc)
        doc['id'] = str(result.inserted_id)
        doc.pop('_id', None)
        doc['lastUpdated'] = now.isoformat()
        doc['createdAt'] = now.isoformat()
        doc['updatedAt'] = now.isoformat()
        doc['status'] = 'ok' if doc['quantity'] > doc['minThreshold'] else ('low' if doc['quantity'] > 0 else 'out_of_stock')

        return {'message': 'Stock item added', 'item': doc}, 201

    def update_stock_item(self, item_id: str, data: dict) -> Tuple[Dict[str, Any], int]:
        """Update an existing stock item's details"""
        try:
            oid = ObjectId(item_id)
        except Exception:
            return {'error': 'Invalid item ID'}, 400

        item = self.stock.find_one({'_id': oid})
        if not item:
            return {'error': 'Stock item not found'}, 404

        update_fields: Dict[str, Any] = {'updatedAt': datetime.now(timezone.utc), 'lastUpdated': datetime.now(timezone.utc)}

        for field in ['itemName', 'category', 'unit']:
            if field in data and data[field]:
                update_fields[field] = data[field].strip() if isinstance(data[field], str) else data[field]

        for field in ['quantity', 'minThreshold']:
            if field in data:
                update_fields[field] = max(0, float(data[field]))

        self.stock.update_one({'_id': oid}, {'$set': update_fields})
        return {'message': 'Stock item updated'}, 200

    def delete_stock_item(self, item_id: str) -> Tuple[Dict[str, Any], int]:
        """Delete a stock item"""
        try:
            oid = ObjectId(item_id)
        except Exception:
            return {'error': 'Invalid item ID'}, 400

        result = self.stock.delete_one({'_id': oid})
        if result.deleted_count == 0:
            return {'error': 'Stock item not found'}, 404

        return {'message': 'Stock item deleted'}, 200

    def get_low_stock_items(self) -> Tuple[Dict[str, Any], int]:
        """Get items where quantity is at or below the minimum threshold"""
        pipeline = [
            {'$addFields': {
                'isLow': {'$lte': ['$quantity', '$minThreshold']}
            }},
            {'$match': {'isLow': True}},
            {'$sort': {'quantity': 1}}
        ]
        items = list(self.stock.aggregate(pipeline))
        result = []
        for item in items:
            qty = item.get('quantity', 0)
            result.append({
                'id': str(item['_id']),
                'itemName': item.get('itemName', ''),
                'category': item.get('category', 'Other'),
                'quantity': qty,
                'unit': item.get('unit', ''),
                'minThreshold': item.get('minThreshold', 0),
                'status': 'out_of_stock' if qty <= 0 else 'low',
                'lastUpdated': item.get('lastUpdated').isoformat() if isinstance(item.get('lastUpdated'), datetime) else item.get('lastUpdated'),
            })

        return {'items': result}, 200

    def record_stock_usage(self, item_id: str, data: dict) -> Tuple[Dict[str, Any], int]:
        """Deduct stock and log usage"""
        try:
            oid = ObjectId(item_id)
        except Exception:
            return {'error': 'Invalid item ID'}, 400

        item = self.stock.find_one({'_id': oid})
        if not item:
            return {'error': 'Stock item not found'}, 404

        quantity_used = float(data.get('quantityUsed', 0))
        if quantity_used <= 0:
            return {'error': 'Quantity used must be greater than 0'}, 400

        current_qty = item.get('quantity', 0)
        if quantity_used > current_qty:
            return {'error': f'Insufficient stock. Available: {current_qty} {item.get("unit", "")}'}, 400

        new_qty = current_qty - quantity_used
        now = datetime.now(timezone.utc)

        log_entry = {
            'date': now.isoformat(),
            'quantityUsed': quantity_used,
            'reason': data.get('reason', 'General usage'),
            'balanceAfter': new_qty,
        }

        self.stock.update_one(
            {'_id': oid},
            {
                '$set': {
                    'quantity': new_qty,
                    'lastUpdated': now,
                    'updatedAt': now,
                },
                '$push': {'usageLog': log_entry}
            }
        )

        return {
            'message': f'Recorded usage of {quantity_used} {item.get("unit", "")}. Remaining: {new_qty}',
            'newQuantity': new_qty,
            'usageEntry': log_entry,
        }, 200
