import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../providers/video_provider.dart';
import '../../models/models.dart';

// Conditional imports for web
import 'web_video_helper.dart' if (dart.library.io) 'web_video_helper_stub.dart';

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
  // Mobile controllers
  VideoPlayerController? _videoController;
  YoutubePlayerController? _youtubeController;
  
  bool _isYoutube = false;
  bool _isInitialized = false;
  String? _errorMessage;
  String? _youtubeId;

  @override
  void initState() {
    super.initState();
    _youtubeId = YoutubePlayer.convertUrlToId(widget.videoUrl);
    _isYoutube = _youtubeId != null;

    if (kIsWeb && _isYoutube) {
      registerYoutubeWebPlayer(_youtubeId!);
      setState(() {
        _isInitialized = true;
      });
    } else {
      _initializeMobilePlayer();
    }
  }

  void _initializeMobilePlayer() {
    final String url = widget.videoUrl;

    if (_isYoutube) {
      _youtubeController = YoutubePlayerController(
        initialVideoId: _youtubeId!,
        flags: const YoutubePlayerFlags(
          autoPlay: true,
          mute: false,
          disableDragSeek: false,
          loop: false,
          isLive: false,
          forceHD: false,
          enableCaption: true,
        ),
      );
      setState(() {
        _isInitialized = true;
      });
    } else {
      // Direct video URL (MP4, etc.)
      _videoController = VideoPlayerController.networkUrl(Uri.parse(url))
        ..initialize().then((_) {
          setState(() {
            _isInitialized = true;
            _videoController?.play();
          });
        }).catchError((error) {
          setState(() {
            _errorMessage = 'Error loading video: $error';
          });
        });
    }
  }

  @override
  void dispose() {
    _youtubeController?.dispose();
    _videoController?.dispose();
    
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.background,
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontSize: 16)),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Video Player Section
            Container(
              color: Colors.black,
              width: double.infinity,
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: _buildPlayer(),
              ),
            ),
            
            // Native Video Progress Indicator
            if (!kIsWeb && !_isYoutube && _isInitialized && _videoController != null)
              VideoProgressIndicator(
                _videoController!,
                allowScrubbing: true,
                colors: const VideoProgressColors(
                  playedColor: AppColors.primary,
                  bufferedColor: Colors.white24,
                  backgroundColor: Colors.white10,
                ),
              ),
              
            _buildInfoSection(),
            
            _buildRelatedVideosSection(),
            
            // Space at bottom
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildPlayer() {
    if (_errorMessage != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.white, size: 48),
          const SizedBox(height: 16),
          Text(_errorMessage!, style: const TextStyle(color: Colors.white70)),
        ],
      );
    }

    if (!_isInitialized) {
      return const CircularProgressIndicator(color: AppColors.primary);
    }

    if (kIsWeb && _isYoutube) {
      return getYoutubeWebPlayer(_youtubeId!);
    }

    if (_isYoutube && _youtubeController != null) {
      return YoutubePlayer(
        controller: _youtubeController!,
        showVideoProgressIndicator: true,
        progressIndicatorColor: AppColors.primary,
      );
    } else if (_videoController != null) {
      return AspectRatio(
        aspectRatio: _videoController!.value.aspectRatio,
        child: Stack(
          alignment: Alignment.bottomCenter,
          children: [
            VideoPlayer(_videoController!),
            _buildVideoControls(),
          ],
        ),
      );
    }

    return const Text('Player not available', style: TextStyle(color: Colors.white));
  }

  Widget _buildVideoControls() {
    if (kIsWeb || _videoController == null) return const SizedBox.shrink();
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _videoController!.value.isPlaying
              ? _videoController!.pause()
              : _videoController!.play();
        });
      },
      child: Container(
        color: Colors.transparent,
        child: Center(
          child: AnimatedOpacity(
            opacity: _videoController!.value.isPlaying ? 0.0 : 1.0,
            duration: const Duration(milliseconds: 300),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.black45,
                shape: BoxShape.circle,
              ),
              child: Icon(
                _videoController!.value.isPlaying ? Icons.pause : Icons.play_arrow,
                color: Colors.white,
                size: 40,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Text(
            widget.title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildActionButton(Icons.thumb_up_outlined, 'Like'),
              _buildActionButton(Icons.share_outlined, 'Share'),
              _buildActionButton(Icons.download_outlined, 'Download'),
              _buildActionButton(Icons.playlist_add_outlined, 'Save'),
            ],
          ),
          
          const Divider(height: 32),
          
          // Description Header
          Text(
            'Description',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
          
          const SizedBox(height: 10),
          
          // Description Content
          Text(
            (widget.description != null && widget.description!.isNotEmpty)
                ? widget.description!
                : 'No description available for this video.',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Tip Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.primaryBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.primary.withOpacity(0.1),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.lightbulb_outline, 
                  color: isDark ? AppColors.darkPrimary : AppColors.primary, 
                  size: 24
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pro Tip',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Rotate your phone for a better viewing experience.',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRelatedVideosSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final videos = context.watch<VideoProvider>().videos;
    
    // Filter out the current video if possible (using URL as proxy for ID since we might not have ID in widget)
    final relatedVideos = videos.where((v) => v.url != widget.videoUrl).toList();
    
    if (relatedVideos.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text(
            'Related Videos',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 160,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: relatedVideos.length,
            itemBuilder: (context, index) {
              final video = relatedVideos[index];
              return GestureDetector(
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/video-player', arguments: {
                    'videoUrl': video.url,
                    'title': video.title,
                    'description': 'More preparation content for you.',
                  });
                },
                child: Container(
                  width: 200,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          height: 100,
                          color: Colors.black,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Image.network(
                                'https://img.youtube.com/vi/${_extractVideoId(video.url)}/hqdefault.jpg',
                                fit: BoxFit.cover,
                                width: double.infinity,
                                errorBuilder: (_, __, ___) => const Icon(Icons.play_circle, color: Colors.white, size: 30),
                              ),
                              const Icon(Icons.play_arrow, color: Colors.white, size: 20),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        video.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _extractVideoId(String url) {
    if (url.contains('v=')) return url.split('v=')[1].split('&')[0];
    if (url.contains('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    return '';
  }

  Widget _buildActionButton(IconData icon, String label) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$label feature coming soon!'), duration: const Duration(seconds: 1)),
        );
      },
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon, 
              size: 24, 
              color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}