import 'package:flutter/material.dart';
import 'dart:ui_web' as ui;
import 'dart:html' as html;

void registerYoutubeWebPlayer(String videoId) {
  // ignore: undefined_prefixed_name
  ui.platformViewRegistry.registerViewFactory(
    'youtube-player-$videoId',
    (int viewId) => html.IFrameElement()
      ..width = '100%'
      ..height = '100%'
      ..src = 'https://www.youtube.com/embed/$videoId?autoplay=1'
      ..style.border = 'none'
      ..allowFullscreen = true,
  );
}

Widget getYoutubeWebPlayer(String videoId) {
  return HtmlElementView(viewType: 'youtube-player-$videoId');
}
