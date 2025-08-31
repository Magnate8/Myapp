from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from src.models.chat_group import ChatGroup

group_bp = Blueprint('group', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@group_bp.route('/groups', methods=['POST'])
def create_group():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({'error': 'Group name is required'}), 400
    
    # Create group
    group = ChatGroup(
        name=name,
        description=description,
        created_by=user.id
    )
    
    # Add creator as a member
    group.members.append(user)
    
    db.session.add(group)
    db.session.commit()
    
    return jsonify(group.to_dict()), 201

@group_bp.route('/groups', methods=['GET'])
def get_user_groups():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    groups = user.groups
    return jsonify([group.to_dict() for group in groups])

@group_bp.route('/groups/<int:group_id>', methods=['GET'])
def get_group(group_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    group = ChatGroup.query.get_or_404(group_id)
    
    # Check if user is a member
    if user not in group.members:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    return jsonify(group.to_dict())

@group_bp.route('/groups/<int:group_id>/join', methods=['POST'])
def join_group(group_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    group = ChatGroup.query.get_or_404(group_id)
    
    # Check if user is already a member
    if user in group.members:
        return jsonify({'error': 'You are already a member of this group'}), 400
    
    # Add user to group
    group.members.append(user)
    db.session.commit()
    
    return jsonify({'message': 'Successfully joined the group'})

@group_bp.route('/groups/<int:group_id>/leave', methods=['POST'])
def leave_group(group_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    group = ChatGroup.query.get_or_404(group_id)
    
    # Check if user is a member
    if user not in group.members:
        return jsonify({'error': 'You are not a member of this group'}), 400
    
    # Remove user from group
    group.members.remove(user)
    db.session.commit()
    
    return jsonify({'message': 'Successfully left the group'})

@group_bp.route('/groups/<int:group_id>/members', methods=['POST'])
def add_member(group_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    group = ChatGroup.query.get_or_404(group_id)
    
    # Check if user is the creator or a member
    if user not in group.members:
        return jsonify({'error': 'You are not a member of this group'}), 403
    
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    # Find user to add
    new_member = User.query.filter_by(username=username).first()
    if not new_member:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user is already a member
    if new_member in group.members:
        return jsonify({'error': 'User is already a member of this group'}), 400
    
    # Add user to group
    group.members.append(new_member)
    db.session.commit()
    
    return jsonify({'message': f'Successfully added {username} to the group'})

@group_bp.route('/groups/search', methods=['GET'])
def search_groups():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    query = request.args.get('q', '')
    
    if not query:
        return jsonify([])
    
    groups = ChatGroup.query.filter(
        ChatGroup.name.contains(query),
        ChatGroup.is_active == True
    ).all()
    
    return jsonify([group.to_dict() for group in groups])

