from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.message import Message
from src.models.chat_group import ChatGroup

message_bp = Blueprint('message', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@message_bp.route('/messages/direct', methods=['POST'])
def send_direct_message():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    
    if not receiver_id or not content:
        return jsonify({'error': 'Receiver ID and content are required'}), 400
    
    # Check if receiver exists
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'error': 'Receiver not found'}), 404
    
    # Create message
    message = Message(
        content=content,
        sender_id=user.id,
        receiver_id=receiver_id
    )
    db.session.add(message)
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

@message_bp.route('/messages/group', methods=['POST'])
def send_group_message():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    group_id = data.get('group_id')
    content = data.get('content')
    
    if not group_id or not content:
        return jsonify({'error': 'Group ID and content are required'}), 400
    
    # Check if group exists and user is a member
    group = ChatGroup.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user not in group.members:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    # Create message
    message = Message(
        content=content,
        sender_id=user.id,
        group_id=group_id
    )
    db.session.add(message)
    db.session.commit()
    
    return jsonify(message.to_dict()), 201

@message_bp.route('/messages/direct/<int:other_user_id>', methods=['GET'])
def get_direct_messages(other_user_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get messages between current user and other user
    messages = Message.query.filter(
        ((Message.sender_id == user.id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == user.id))
    ).order_by(Message.created_at.asc()).all()
    
    return jsonify([message.to_dict() for message in messages])

@message_bp.route('/messages/group/<int:group_id>', methods=['GET'])
def get_group_messages(group_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Check if group exists and user is a member
    group = ChatGroup.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    if user not in group.members:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    # Get group messages
    messages = Message.query.filter_by(group_id=group_id).order_by(Message.created_at.asc()).all()
    
    return jsonify([message.to_dict() for message in messages])

@message_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    # Get direct message conversations
    direct_conversations = db.session.query(Message.sender_id, Message.receiver_id).filter(
        (Message.sender_id == user.id) | (Message.receiver_id == user.id)
    ).distinct().all()
    
    conversations = []
    
    # Process direct conversations
    other_user_ids = set()
    for conv in direct_conversations:
        if conv.sender_id == user.id:
            other_user_ids.add(conv.receiver_id)
        else:
            other_user_ids.add(conv.sender_id)
    
    for other_user_id in other_user_ids:
        other_user = User.query.get(other_user_id)
        if other_user:
            # Get last message
            last_message = Message.query.filter(
                ((Message.sender_id == user.id) & (Message.receiver_id == other_user_id)) |
                ((Message.sender_id == other_user_id) & (Message.receiver_id == user.id))
            ).order_by(Message.created_at.desc()).first()
            
            conversations.append({
                'type': 'direct',
                'id': other_user_id,
                'name': other_user.username,
                'last_message': last_message.to_dict() if last_message else None
            })
    
    # Get group conversations
    for group in user.groups:
        last_message = Message.query.filter_by(group_id=group.id).order_by(Message.created_at.desc()).first()
        conversations.append({
            'type': 'group',
            'id': group.id,
            'name': group.name,
            'last_message': last_message.to_dict() if last_message else None
        })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x['last_message']['created_at'] if x['last_message'] else '', reverse=True)
    
    return jsonify(conversations)

