import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum ToastType { success, error, info }

class CustomToast {
  static void show(BuildContext context, {required String message, required ToastType type}) {
    final entry = OverlayEntry(builder: (context) => _ToastWidget(message: message, type: type));
    Overlay.of(context).insert(entry);
    Future.delayed(const Duration(seconds: 3), () {
      if (entry.mounted) {
        entry.remove();
      }
    });
  }
}

class _ToastWidget extends StatefulWidget {
  final String message;
  final ToastType type;

  const _ToastWidget({required this.message, required this.type});

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _offsetAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 300), vsync: this);
    _offsetAnimation = Tween<Offset>(begin: const Offset(0, -1.0), end: Offset.zero)
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    
    _controller.forward();
    Future.delayed(const Duration(milliseconds: 2700), () {
      if (mounted) _controller.reverse();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    IconData icon;

    switch (widget.type) {
      case ToastType.success:
        bgColor = AppColors.success;
        icon = Icons.check_circle;
        break;
      case ToastType.error:
        bgColor = AppColors.error;
        icon = Icons.cancel;
        break;
      case ToastType.info:
        bgColor = AppColors.primary;
        icon = Icons.info;
        break;
    }

    return Positioned(
      top: MediaQuery.of(context).padding.top + 10,
      left: 20,
      right: 20,
      child: Material(
        color: Colors.transparent,
        child: SlideTransition(
          position: _offsetAnimation,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Row(
              children: [
                Icon(icon, color: Colors.white, size: 24),
                const SizedBox(width: 12),
                Expanded(child: Text(widget.message, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 16))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
