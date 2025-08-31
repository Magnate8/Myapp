import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from src.models.user import db
from src.routes.user import user_bp
from src.routes.message import message_bp
from src.routes.group import group_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
CORS(app)
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(message_bp, url_prefix='/api')
app.register_blueprint(group_bp, url_prefix='/api')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Import all models to ensure they are created
from src.models.message import Message
from src.models.chat_group import ChatGroup

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    user_id = session.get('user_id')
    if user_id:
        # Join user to their personal room for direct messages
        join_room(f"user_{user_id}")
        
        # Join user to all their group rooms
        from src.models.user import User
        user = User.query.get(user_id)
        if user:
            for group in user.groups:
                join_room(f"group_{group.id}")
        
        emit('connected', {'message': 'Connected to chat server'})

@socketio.on('disconnect')
def handle_disconnect():
    user_id = session.get('user_id')
    if user_id:
        leave_room(f"user_{user_id}")
        
        # Leave all group rooms
        from src.models.user import User
        user = User.query.get(user_id)
        if user:
            for group in user.groups:
                leave_room(f"group_{group.id}")

@socketio.on('send_direct_message')
def handle_direct_message(data):
    user_id = session.get('user_id')
    if not user_id:
        return
    
    from src.models.user import User
    from src.models.message import Message
    
    receiver_id = data.get('receiver_id')
    content = data.get('content')
    
    if not receiver_id or not content:
        return
    
    # Create message
    message = Message(
        content=content,
        sender_id=user_id,
        receiver_id=receiver_id
    )
    db.session.add(message)
    db.session.commit()
    
    # Send to both sender and receiver
    message_data = message.to_dict()
    emit('new_message', message_data, room=f"user_{user_id}")
    emit('new_message', message_data, room=f"user_{receiver_id}")

@socketio.on('send_group_message')
def handle_group_message(data):
    user_id = session.get('user_id')
    if not user_id:
        return
    
    from src.models.user import User
    from src.models.message import Message
    from src.models.chat_group import ChatGroup
    
    group_id = data.get('group_id')
    content = data.get('content')
    
    if not group_id or not content:
        return
    
    # Check if user is a member of the group
    user = User.query.get(user_id)
    group = ChatGroup.query.get(group_id)
    
    if not user or not group or user not in group.members:
        return
    
    # Create message
    message = Message(
        content=content,
        sender_id=user_id,
        group_id=group_id
    )
    db.session.add(message)
    db.session.commit()
    
    # Send to all group members
    message_data = message.to_dict()
    emit('new_message', message_data, room=f"group_{group_id}")

@socketio.on('join_group')
def handle_join_group(data):
    user_id = session.get('user_id')
    group_id = data.get('group_id')
    
    if user_id and group_id:
        join_room(f"group_{group_id}")

@socketio.on('leave_group')
def handle_leave_group(data):
    user_id = session.get('user_id')
    group_id = data.get('group_id')
    
    if user_id and group_id:
        leave_room(f"group_{group_id}")


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
