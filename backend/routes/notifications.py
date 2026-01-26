"""
Notification management routes
Handles in-app notifications for users
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId

notifications_bp = Blueprint('notifications', __name__)


def init_notification_routes(app, collections):
    """Initialize notification routes with dependencies"""
    
    @notifications_bp.route('/api/notifications', methods=['GET'])
    @jwt_required()
    def get_notifications():
        """Get all notifications for the current user"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            user_type = claims.get('userType', 'user')
            
            # Build query based on user type
            # Regular users get notifications targeted to them
            # ASHA workers can see their own notifications
            query = {
                '$or': [
                    {'recipientId': user_id},  # Direct notifications
                    {'recipientType': user_type}  # Role-based notifications
                ]
            }
            
            # Optional filters
            if request.args.get('unreadOnly') == 'true':
                query['isRead'] = False
            
            # Get notifications sorted by newest first
            cursor = collections['notifications'].find(query).sort('createdAt', -1).limit(50)
            
            notifications = []
            for doc in cursor:
                notifications.append({
                    'id': str(doc['_id']),
                    'title': doc.get('title', ''),
                    'message': doc.get('message', ''),
                    'type': doc.get('type', 'info'),  # info, success, warning, event
                    'isRead': doc.get('isRead', False),
                    'relatedEntity': doc.get('relatedEntity'),  # {type: 'event'|'class'|'camp', id: '...'}
                    'createdAt': doc.get('createdAt').isoformat() if isinstance(doc.get('createdAt'), datetime) else doc.get('createdAt'),
                })
            
            # Count unread notifications
            unread_count = collections['notifications'].count_documents({
                **query,
                'isRead': False
            })
            
            return jsonify({
                'notifications': notifications,
                'unreadCount': unread_count
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to fetch notifications: {str(e)}'}), 500
    
    @notifications_bp.route('/api/notifications/<notification_id>/read', methods=['PUT'])
    @jwt_required()
    def mark_notification_read(notification_id):
        """Mark a specific notification as read"""
        try:
            user_id = get_jwt_identity()
            
            # Verify the notification belongs to this user
            notification = collections['notifications'].find_one({
                '_id': ObjectId(notification_id),
                'recipientId': user_id
            })
            
            if not notification:
                return jsonify({'error': 'Notification not found'}), 404
            
            collections['notifications'].update_one(
                {'_id': ObjectId(notification_id)},
                {'$set': {'isRead': True, 'readAt': datetime.now(timezone.utc)}}
            )
            
            return jsonify({'message': 'Notification marked as read'}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to mark notification as read: {str(e)}'}), 500
    
    @notifications_bp.route('/api/notifications/mark-all-read', methods=['PUT'])
    @jwt_required()
    def mark_all_notifications_read():
        """Mark all notifications as read for the current user"""
        try:
            user_id = get_jwt_identity()
            claims = get_jwt() or {}
            user_type = claims.get('userType', 'user')
            
            # Update all unread notifications for this user
            result = collections['notifications'].update_many(
                {
                    '$or': [
                        {'recipientId': user_id},
                        {'recipientType': user_type}
                    ],
                    'isRead': False
                },
                {'$set': {'isRead': True, 'readAt': datetime.now(timezone.utc)}}
            )
            
            return jsonify({
                'message': 'All notifications marked as read',
                'count': result.modified_count
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to mark all notifications as read: {str(e)}'}), 500
    
    @notifications_bp.route('/api/notifications/<notification_id>', methods=['DELETE'])
    @jwt_required()
    def delete_notification(notification_id):
        """Delete a specific notification"""
        try:
            user_id = get_jwt_identity()
            
            # Verify the notification belongs to this user
            result = collections['notifications'].delete_one({
                '_id': ObjectId(notification_id),
                'recipientId': user_id
            })
            
            if result.deleted_count == 0:
                return jsonify({'error': 'Notification not found'}), 404
            
            return jsonify({'message': 'Notification deleted'}), 200
            
        except Exception as e:
            return jsonify({'error': f'Failed to delete notification: {str(e)}'}), 500
    
    # Register blueprint with app
    app.register_blueprint(notifications_bp)


def create_notification(collections, title, message, recipient_id=None, recipient_type=None, notification_type='info', related_entity=None):
    """
    Helper function to create a notification
    
    Args:
        collections: Database collections dict
        title: Notification title
        message: Notification message
        recipient_id: Specific user ID to notify (optional)
        recipient_type: User type to notify (e.g., 'maternity_user', 'palliative_user') (optional)
        notification_type: Type of notification ('info', 'success', 'warning', 'event')
        related_entity: Related entity info (e.g., {'type': 'event', 'id': 'event_id'})
    """
    try:
        notification_doc = {
            'title': title,
            'message': message,
            'type': notification_type,
            'isRead': False,
            'createdAt': datetime.now(timezone.utc),
        }
        
        # Add recipient targeting
        if recipient_id:
            notification_doc['recipientId'] = recipient_id
        if recipient_type:
            notification_doc['recipientType'] = recipient_type
        
        # Add related entity if provided
        if related_entity:
            notification_doc['relatedEntity'] = related_entity
        
        collections['notifications'].insert_one(notification_doc)
        return True
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
        return False


def notify_all_users(collections, title, message, user_type=None, notification_type='info', related_entity=None):
    """
    Helper function to create notifications for all users of a specific type
    
    Args:
        collections: Database collections dict
        title: Notification title
        message: Notification message
        user_type: Filter by user type (e.g., 'maternity_user', 'palliative_user')
        notification_type: Type of notification
        related_entity: Related entity info
    """
    try:
        # Query all users
        query = {}
        if user_type:
            query['userType'] = user_type
        
        users = collections['users'].find(query)
        
        # Create notification for each user
        for user in users:
            create_notification(
                collections,
                title=title,
                message=message,
                recipient_id=str(user['_id']),
                recipient_type=user_type,
                notification_type=notification_type,
                related_entity=related_entity
            )
        
        return True
    except Exception as e:
        print(f"Error notifying all users: {str(e)}")
        return False
