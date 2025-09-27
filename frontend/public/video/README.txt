Place your hero background trailer video file here.

Recommended encoding:
- Format: MP4 (H.264 AVC High Profile, level 4.1 for wide compatibility)
- Resolution: 1920x1080 (provide a 1280x720 fallback if size > 6MB)
- Duration: 12-20 seconds seamless loop if possible
- Bitrate target: 3-5 Mbps (reduce for mobile)
- Audio: Strip or keep silent track; must be muted for autoplay

Files used by component:
- hero-trailer.mp4  (main video)
- hero-poster.jpg   (poster frame before playback)

You can generate an optimized version with (FFmpeg example):
ffmpeg -i input.mp4 -vf "scale=1920:-2,format=yuv420p" -c:v libx264 -profile:v high -level 4.1 -b:v 4000k -c:a aac -ar 44100 -ac 2 -movflags +faststart hero-trailer.mp4

Poster extraction:
ffmpeg -i hero-trailer.mp4 -ss 00:00:01.000 -vframes 1 hero-poster.jpg
