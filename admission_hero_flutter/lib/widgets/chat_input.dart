import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'custom_toast.dart'; // We will create this next

class ChatInput extends StatefulWidget {
  final String chatId;
  final String? productId;
  final String? receiverId;
  final VoidCallback? onMessageSent;

  const ChatInput({
    super.key,
    required this.chatId,
    this.productId,
    this.receiverId,
    this.onMessageSent,
  });

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final TextEditingController _controller = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleSend() async {
    final text = _controller.text.trim();
    if (text.isEmpty) {
      CustomToast.show(context, message: 'অনুগ্রহ করে একটি বার্তা লিখুন', type: ToastType.error);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final messageData = <String, dynamic>{
        'content': text,
      };

      if (widget.productId != null) {
        messageData['productId'] = widget.productId;
      }

      if (widget.chatId.startsWith('admin_')) {
        messageData['receiverId'] = 'admin';
      } else if (widget.receiverId != null) {
        messageData['receiverId'] = widget.receiverId;
      }

      // Add endpoint in ApiService later
      await ApiService.sendMessage(messageData);

      _controller.clear();
      widget.onMessageSent?.call();

      if (mounted) {
        CustomToast.show(context, message: 'বার্তা পাঠানো হয়েছে ✅', type: ToastType.success);
      }
    } catch (e) {
      if (mounted) {
        CustomToast.show(context, message: 'বার্তা পাঠাতে ব্যর্থ হয়েছে', type: ToastType.error);
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderLight)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Container(
              constraints: const BoxConstraints(maxHeight: 100),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Scrollbar(
                child: TextField(
                  controller: _controller,
                  enabled: !_isLoading,
                  maxLines: null,
                  maxLength: 1000,
                  decoration: const InputDecoration(
                    hintText: 'বার্তা লিখুন...',
                    hintStyle: TextStyle(color: AppColors.textMuted),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    counterText: '',
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _isLoading ? null : _handleSend,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: _isLoading ? AppColors.border : AppColors.success,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _isLoading ? '...' : 'পাঠান',
                style: TextStyle(
                  color: _isLoading ? AppColors.textMuted : Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
