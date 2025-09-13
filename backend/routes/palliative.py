"""
Palliative health records routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from services.file_service import FileService

palliative_bp = Blueprint('palliative', __name__)


def init_palliative_routes(app, collections):
    """Initialize palliative health records routes"""
    file_service = FileService()

    # Create record (supports multipart with attachments)
    @palliative_bp.route('/api/palliative/records', methods=['POST'])
    @jwt_required()
    def create_record():
        try:
            user_id = get_jwt_identity()
            content_type = request.content_type or ''

            if 'multipart/form-data' in content_type:
                form = request.form
                date = (form.get('date') or '').strip()
                testType = (form.get('testType') or '').strip()
                notes = (form.get('notes') or '').strip()
                value = form.get('value')
                unit = (form.get('unit') or '').strip()
                systolic = form.get('systolic')
                diastolic = form.get('diastolic')
                pulse = form.get('pulse')
                # Subvalues: provided as JSON-like or separate fields
                subvalues = {}
                for k in request.form:
                    if k.startswith('subvalues[') and k.endswith(']'):
                        key = k[len('subvalues['):-1]
                        subvalues[key] = request.form.get(k)
            else:
                data = request.get_json() or {}
                date = (data.get('date') or '').strip()
                testType = (data.get('testType') or '').strip()
                notes = (data.get('notes') or '').strip()
                value = data.get('value')
                unit = (data.get('unit') or '').strip()
                systolic = data.get('systolic')
                diastolic = data.get('diastolic')
                pulse = data.get('pulse')
                subvalues = data.get('subvalues') or {}

            if not date:
                return jsonify({'error': 'date is required'}), 400
            if not testType:
                return jsonify({'error': 'testType is required'}), 400

            # Save attachments if any
            attachments = []
            if 'multipart/form-data' in (request.content_type or ''):
                for key in request.files:
                    for file in request.files.getlist(key):
                        url = file_service.save_uploaded_file(file, 'palliative')
                        if url:
                            attachments.append({'name': file.filename, 'url': url})

            doc = {
                'userId': ObjectId(user_id),
                'date': date,  # YYYY-MM-DD
                'testType': testType,
                'notes': notes,
                'value': float(value) if value not in [None, '', 'null'] else None,
                'unit': unit or None,
                'systolic': float(systolic) if systolic not in [None, '', 'null'] else None,
                'diastolic': float(diastolic) if diastolic not in [None, '', 'null'] else None,
                'pulse': float(pulse) if pulse not in [None, '', 'null'] else None,
                'subvalues': subvalues,
                'attachments': attachments,
                'createdAt': datetime.now(timezone.utc),
                'updatedAt': datetime.now(timezone.utc),
            }

            res = collections['palliative_records'].insert_one(doc)
            return jsonify({'id': str(res.inserted_id), 'message': 'Record created'}), 201
        except Exception as e:
            return jsonify({'error': f'Failed to create record: {str(e)}'}), 500

    # List my records
    @palliative_bp.route('/api/palliative/records', methods=['GET'])
    @jwt_required()
    def list_records():
        try:
            user_id = get_jwt_identity()
            testType = (request.args.get('testType') or '').strip()

            query = {'userId': ObjectId(user_id)}
            if testType:
                query['testType'] = testType

            cursor = collections['palliative_records'].find(query).sort('date', -1)
            items = []
            for doc in cursor:
                items.append({
                    'id': str(doc['_id']),
                    'date': doc.get('date'),
                    'testType': doc.get('testType'),
                    'notes': doc.get('notes'),
                    'value': doc.get('value'),
                    'unit': doc.get('unit'),
                    'systolic': doc.get('systolic'),
                    'diastolic': doc.get('diastolic'),
                    'pulse': doc.get('pulse'),
                    'subvalues': doc.get('subvalues') or {},
                    'attachments': doc.get('attachments') or [],
                    'createdAt': doc.get('createdAt').isoformat() if doc.get('createdAt') else None,
                })
            return jsonify({'records': items}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to list records: {str(e)}'}), 500

    # Delete my record
    @palliative_bp.route('/api/palliative/records/<record_id>', methods=['DELETE'])
    @jwt_required()
    def delete_record(record_id):
        try:
            user_id = get_jwt_identity()
            try:
                _id = ObjectId(record_id)
            except Exception:
                return jsonify({'error': 'Invalid record id'}), 400

            existing = collections['palliative_records'].find_one({'_id': _id})
            if not existing:
                return jsonify({'error': 'Record not found'}), 404
            if str(existing.get('userId')) != str(ObjectId(user_id)):
                return jsonify({'error': 'Not allowed'}), 403

            collections['palliative_records'].delete_one({'_id': _id})
            return jsonify({'message': 'Record deleted'}), 200
        except Exception as e:
            return jsonify({'error': f'Failed to delete record: {str(e)}'}), 500

    # Register blueprint
    app.register_blueprint(palliative_bp)