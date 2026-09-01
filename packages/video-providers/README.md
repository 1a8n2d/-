# Video provider contract

Every adapter exposes `generateMotionSegment(keyframe, prompt, duration)` and `continueVideo(currentVideo, newKeyframe, prompt)`. Providers may be selected through `VIDEO_PROVIDER`.
