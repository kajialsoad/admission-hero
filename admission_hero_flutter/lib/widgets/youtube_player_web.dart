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
    // Register view factory for web
    ui_web.platformViewRegistry.registerViewFactory(
      viewType,
      (int viewId) {
        final iframe = html.IFrameElement()
          ..src = widget.videoUrl
          ..style.border = 'none'
          ..style.width = '100%'
          ..style.height = '100%'
          ..allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
          ..allowFullscreen = true;
        
        return iframe;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return HtmlElementView(
      viewType: viewType,
    );
  }
}
