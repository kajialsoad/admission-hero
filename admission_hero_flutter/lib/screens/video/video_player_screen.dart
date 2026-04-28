import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../utils/constants.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String videoUrl;
  final String title;
  final String? description;

  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.title,
    this.description,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  bool _isPlaying = false;
  bool _showControls = true;
  double _currentPosition = 0.0;
  double _totalDuration = 100.0; // Mock duration
  bool _isFullscreen = false;

  @override
  void initState() {
    super.initState();
    // TODO: Initialize actual video player here
    // For now, we'll create a mock video player UI
  }

  @override
  void dispose() {
    // TODO: Dispose video player
    super.dispose();
  }

  void _togglePlayPause() {
    setState(() {
      _isPlaying = !_isPlaying;
    });
    // TODO: Implement actual play/pause
  }

  void _toggleFullscreen() {
    setState(() {
      _isFullscreen = !_isFullscreen;
    });
    
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersive);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
      ]);
    }
  }

  void _onSeek(double value) {
    setState(() {
      _currentPosition = value;
    });
    // TODO: Implement actual seek
  }

  String _formatDuration(double seconds) {
    final minutes = (seconds / 60).floor();
    final remainingSeconds = (seconds % 60).floor();
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    if (_isFullscreen) {
      return _buildFullscreenPlayer();
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(
          widget.title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: Column(
        children: [
          // Video Player
          _buildVideoPlayer(),
          
          // Video Info
          Expanded(
            child: Container(
              color: Colors.white,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    
                    if (widget.description != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        widget.description!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          height: 1.5,
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 24),
                    
                    // Video Actions
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              // TODO: Add to favorites
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Added to favorites'),
                                ),
                              );
                            },
                            icon: const Icon(Icons.favorite_border),
                            label: const Text('Favorite'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              // TODO: Download video
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Download started'),
                                ),
                              );
                            },
                            icon: const Icon(Icons.download),
                            label: const Text('Download'),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Related Videos Section
                    const Text(
                      'Related Videos',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Mock related videos
                    ...List.generate(3, (index) => _buildRelatedVideoCard(index)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoPlayer() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: Colors.black,
        child: Stack(
          children: [
            // Video placeholder (in real app, this would be the video widget)
            Center(
              child: Container(
                width: double.infinity,
                height: double.infinity,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.grey[800]!,
                      Colors.grey[900]!,
                    ],
                  ),
                ),
                child: const Center(
                  child: Icon(
                    Icons.play_circle_outline,
                    size: 80,
                    color: Colors.white54,
                  ),
                ),
              ),
            ),
            
            // Video Controls Overlay
            if (_showControls)
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.3),
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
                child: Column(
                  children: [
                    const Spacer(),
                    
                    // Play/Pause Button
                    Center(
                      child: GestureDetector(
                        onTap: _togglePlayPause,
                        child: Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.5),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _isPlaying ? Icons.pause : Icons.play_arrow,
                            color: Colors.white,
                            size: 30,
                          ),
                        ),
                      ),
                    ),
                    
                    const Spacer(),
                    
                    // Bottom Controls
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Progress Bar
                          Row(
                            children: [
                              Text(
                                _formatDuration(_currentPosition),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                              ),
                              Expanded(
                                child: Slider(
                                  value: _currentPosition,
                                  max: _totalDuration,
                                  onChanged: _onSeek,
                                  activeColor: Theme.of(context).colorScheme.primary,
                                  inactiveColor: Colors.white30,
                                ),
                              ),
                              Text(
                                _formatDuration(_totalDuration),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                          
                          // Control Buttons
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  IconButton(
                                    onPressed: () {
                                      // TODO: Rewind 10 seconds
                                    },
                                    icon: const Icon(
                                      Icons.replay_10,
                                      color: Colors.white,
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: _togglePlayPause,
                                    icon: Icon(
                                      _isPlaying ? Icons.pause : Icons.play_arrow,
                                      color: Colors.white,
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: () {
                                      // TODO: Forward 10 seconds
                                    },
                                    icon: const Icon(
                                      Icons.forward_10,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                              
                              Row(
                                children: [
                                  IconButton(
                                    onPressed: () {
                                      // TODO: Toggle subtitles
                                    },
                                    icon: const Icon(
                                      Icons.subtitles,
                                      color: Colors.white,
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: () {
                                      // TODO: Change quality
                                    },
                                    icon: const Icon(
                                      Icons.settings,
                                      color: Colors.white,
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: _toggleFullscreen,
                                    icon: const Icon(
                                      Icons.fullscreen,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            
            // Tap to show/hide controls
            GestureDetector(
              onTap: () {
                setState(() {
                  _showControls = !_showControls;
                });
              },
              child: Container(
                width: double.infinity,
                height: double.infinity,
                color: Colors.transparent,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFullscreenPlayer() {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Center(child: _buildVideoPlayer()),
          
          // Exit fullscreen button
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 10,
            child: IconButton(
              onPressed: _toggleFullscreen,
              icon: const Icon(
                Icons.fullscreen_exit,
                color: Colors.white,
                size: 30,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRelatedVideoCard(int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          // Thumbnail
          Container(
            width: 120,
            height: 68,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.play_circle_outline,
              color: Colors.grey,
              size: 30,
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Video Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Related Video ${index + 1}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  'Video explanation for question ${index + 1}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  '${5 + index}:30',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}