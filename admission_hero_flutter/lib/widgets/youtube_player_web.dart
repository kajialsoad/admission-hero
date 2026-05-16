import 'package:flutter/material.dart';
import 'dart:ui_web' as ui_web;
import 'dart:html' as html;

class YoutubePlayerWeb extends StatefulWidget {
  final String videoUrl;
  
  const YoutubePlayerWeb({
    super.key,
    required this.videoUrl,
  });

  @override
  State<YoutubePlayerWeb> createState() => _YoutubePlayerWebState();
}

class _YoutubePlayerWebState extends State<YoutubePlayerWeb> {
  late String viewType;

  @override
  void initState() {
    super.initState();
    viewType = 'youtube-player-${widget.videoUrl.hashCode}';
    _registerViewFactory();
  }

  void _registerViewFactory() {
    final videoId = _convertUrlToId(widget.videoUrl);
    final embedUrl = 'https://www.youtube.com/embed/$videoId?autoplay=1&mute=0&rel=0';

    // Register view factory for web
    ui_web.platformViewRegistry.registerViewFactory(
      viewType,
      (int viewId) {
        final iframe = html.IFrameElement()
          ..src = embedUrl
          ..style.border = 'none'
          ..style.width = '100%'
          ..style.height = '100%'
          ..allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
          ..allowFullscreen = true;
        
        return iframe;
      },
    );
  }

  String _convertUrlToId(String url) {
    // Basic conversion logic if YoutubePlayer.convertUrlToId is not available
    // or to ensure it works consistently on web
    if (url.contains('v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.contains('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.contains('embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }
    return url;
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(
      viewType: viewType,
    );
  }
}
