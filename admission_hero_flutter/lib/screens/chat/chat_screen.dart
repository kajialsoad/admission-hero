import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/chat_service.dart';
import '../../utils/constants.dart';

class ChatMessage {
  final String id;
  final String message;
  final bool isUser;
  final DateTime timestamp;
  final String? senderName;
  final String senderType;

  ChatMessage({
    required this.id,
    required this.message,
    required this.isUser,
    required this.timestamp,
    this.senderName,
    this.senderType = 'user',
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['_id'] ?? json['id'],
      message: json['message'],
      isUser: json['senderType'] == 'user',
      timestamp: DateTime.parse(json['timestamp']),
      senderName: json['senderName'],
      senderType: json['senderType'] ?? 'user',
    );
  }
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  final ChatService _chatService = ChatService();
  bool _isTyping = false;
  bool _isLoading = true;
  String? _conversationId;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initializeChat() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    
    if (user != null) {
      _conversationId = _chatService.generateConversationId(user.id);
      await _loadMessages();
    }
    
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _loadMessages() async {
    if (_conversationId == null) return;

    try {
      final messages = await _chatService.getMessages(
        conversationId: _conversationId!,
      );

      setState(() {
        _messages.clear();
        for (var messageData in messages) {
          _messages.add(ChatMessage.fromJson(messageData));
        }
      });

      _scrollToBottom();
    } catch (e) {
      print('DEBUG: Error loading messages: $e');
      _loadInitialMessages(); // Fallback to sample messages
    }
  }

  void _loadInitialMessages() {
    // Add welcome message
    setState(() {
      _messages.add(
        ChatMessage(
          id: '1',
          message: 'আসসালামু আলাইকুম! Admission Hero সাপোর্ট টিমে আপনাকে স্বাগতম। আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
          isUser: false,
          timestamp: DateTime.now(),
          senderName: 'Support Team',
        ),
      );
    });
  }

  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty || _conversationId == null) return;

    final user = context.read<AuthProvider>().user;
    
    // Add user message to UI immediately
    final userMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      message: message,
      isUser: true,
      timestamp: DateTime.now(),
      senderName: user?.name ?? 'You',
    );

    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    try {
      // Send message to backend
      final sentMessage = await _chatService.sendMessage(
        message: message,
        conversationId: _conversationId!,
      );

      if (sentMessage != null) {
        // Request auto-response
        final autoResponse = await _chatService.requestAutoResponse(
          message: message,
          conversationId: _conversationId!,
        );

        if (autoResponse != null) {
          setState(() {
            _messages.add(ChatMessage.fromJson(autoResponse));
            _isTyping = false;
          });
          _scrollToBottom();
        } else {
          // Fallback to local auto-response
          _addLocalAutoResponse(message);
        }
      } else {
        // Fallback to local auto-response
        _addLocalAutoResponse(message);
      }
    } catch (e) {
      print('DEBUG: Error sending message: $e');
      _addLocalAutoResponse(message);
    }
  }

  void _addLocalAutoResponse(String userMessage) {
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _messages.add(
            ChatMessage(
              id: DateTime.now().millisecondsSinceEpoch.toString(),
              message: _getAutoResponse(userMessage),
              isUser: false,
              timestamp: DateTime.now(),
              senderName: 'Support Team',
            ),
          );
          _isTyping = false;
        });
        _scrollToBottom();
      }
    });
  }

  String _getAutoResponse(String userMessage) {
    final msg = userMessage.toLowerCase();
    
    if (msg.contains('payment') || msg.contains('bkash') || msg.contains('পেমেন্ট')) {
      return 'পেমেন্ট সংক্রান্ত সমস্যার জন্য আমাদের bKash মার্চেন্ট নম্বর: 01XXXXXXXXX এ যোগাযোগ করুন। অথবা আপনার ট্রানজেকশন ID দিয়ে আমাদের জানান।';
    } else if (msg.contains('exam') || msg.contains('question') || msg.contains('পরীক্ষা')) {
      return 'পরীক্ষা সংক্রান্ত যেকোনো সমস্যার জন্য আমরা আছি। আপনার নির্দিষ্ট সমস্যাটি বলুন, আমরা সাহায্য করব।';
    } else if (msg.contains('subscription') || msg.contains('সাবস্ক্রিপশন')) {
      return 'সাবস্ক্রিপশন সংক্রান্ত তথ্যের জন্য Profile > My Subscription এ যান। আরো সাহায্যের জন্য আমাদের জানান।';
    } else if (msg.contains('login') || msg.contains('লগইন')) {
      return 'লগইন সমস্যার জন্য আপনার ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড চেক করুন। পাসওয়ার্ড ভুলে গেলে "Forgot Password" ব্যবহার করুন।';
    } else {
      return 'আপনার প্রশ্নের জন্য ধন্যবাদ। আমাদের সাপোর্ট টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে। জরুরি সাহায্যের জন্য কল করুন: +880 1XXXXXXXXX';
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Support Chat',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              'Online • Usually replies instantly',
              style: TextStyle(
                fontSize: 12,
                color: Colors.white70,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone),
            onPressed: () {
              // TODO: Implement call functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Call: +880 1XXXXXXXXX'),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return _buildTypingIndicator();
                }
                
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),
          
          // Message Input
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type your message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: Theme.of(context).colorScheme.primary),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: message.isUser 
            ? MainAxisAlignment.end 
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: Theme.of(context).colorScheme.primary,
              child: const Icon(
                Icons.support_agent,
                size: 18,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
          ],
          
          Flexible(
            child: Column(
              crossAxisAlignment: message.isUser 
                  ? CrossAxisAlignment.end 
                  : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: message.isUser 
                        ? Theme.of(context).colorScheme.primary 
                        : Colors.white,
                    borderRadius: BorderRadius.circular(18).copyWith(
                      bottomRight: message.isUser 
                          ? const Radius.circular(4) 
                          : const Radius.circular(18),
                      bottomLeft: message.isUser 
                          ? const Radius.circular(18) 
                          : const Radius.circular(4),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    message.message,
                    style: TextStyle(
                      color: message.isUser ? Colors.white : Colors.black87,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTime(message.timestamp),
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          
          if (message.isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: Colors.grey[300],
              child: const Icon(
                Icons.person,
                size: 18,
                color: Colors.grey,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: const Icon(
              Icons.support_agent,
              size: 18,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18).copyWith(
                bottomLeft: const Radius.circular(4),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 5,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildTypingDot(0),
                const SizedBox(width: 4),
                _buildTypingDot(1),
                const SizedBox(width: 4),
                _buildTypingDot(2),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingDot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 600 + (index * 200)),
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.5 + (0.5 * value),
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Colors.grey[400],
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else {
      return '${time.day}/${time.month}/${time.year}';
    }
  }
}