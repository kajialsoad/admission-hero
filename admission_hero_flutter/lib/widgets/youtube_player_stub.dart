import 'package:flutter/material.dart';

// Stub for mobile - not used since we use youtube_player_flutter on mobile
class YoutubePlayerWeb extends StatelessWidget {
  final String videoUrl;
  
  const YoutubePlayerWeb({
    super.key,
    required this.videoUrl,
  });

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
