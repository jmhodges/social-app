import {useRef, useState} from 'react'
import {View} from 'react-native'
import {Image} from 'expo-image'
import {type ImagePickerAsset} from 'expo-image-picker'
import {BlueskyVideoView} from '@bsky.app/video'

import {type CompressedVideo} from '#/lib/media/video/types'
import {useAutoplayDisabled} from '#/state/preferences'
import {ExternalEmbedRemoveBtn} from '#/view/com/composer/ExternalEmbedRemoveBtn'
import {atoms as a} from '#/alf'
import {ConstrainedImage} from '#/components/images/AutoSizedImage'
import {useVideoMuteState} from '#/components/Post/Embed/VideoEmbed/VideoVolumeContext'
import {VideoPresentationControls} from '#/components/video/VideoPresentationControls'
import {VideoTranscodeBackdrop} from './VideoTranscodeBackdrop'

export function VideoPreview({
  asset,
  video,
  clear,
  isActivePost,
}: {
  asset: ImagePickerAsset
  video: CompressedVideo
  isActivePost: boolean
  clear: () => void
}) {
  const playerRef = useRef<BlueskyVideoView>(null)
  const autoplayDisabled = useAutoplayDisabled()
  const [muted, setMuted] = useVideoMuteState()
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  let aspectRatio: number | undefined
  if (asset.width && asset.height) {
    const raw = asset.width / asset.height
    if (!Number.isNaN(raw)) {
      aspectRatio = raw
    }
  }

  let constrained: number | undefined
  if (aspectRatio !== undefined) {
    const ratio = 1 / 2 // max of 1:2 ratio in feeds
    constrained = Math.max(aspectRatio, ratio)
  }

  return (
    <View style={[a.pt_xs]}>
      <ConstrainedImage
        aspectRatio={constrained || 1}
        minMobileAspectRatio={14 / 9}>
        <View style={[a.flex_1, {backgroundColor: 'black'}]}>
          <View style={[a.absolute, a.inset_0]}>
            <VideoTranscodeBackdrop uri={asset.uri} />
          </View>
          {isActivePost && (
            <>
              {video.mimeType === 'image/gif' ? (
                <Image
                  style={[a.flex_1]}
                  autoplay={!autoplayDisabled}
                  source={{uri: video.uri}}
                  accessibilityIgnoresInvertColors
                  cachePolicy="none"
                  contentFit="contain"
                />
              ) : (
                <>
                  <BlueskyVideoView
                    url={video.uri}
                    autoplay={!autoplayDisabled}
                    beginMuted={autoplayDisabled ? false : muted}
                    forceTakeover={true}
                    ref={playerRef}
                    onMutedChange={e => {
                      setMuted(e.nativeEvent.isMuted)
                    }}
                    onStatusChange={e => {
                      setIsPlaying(e.nativeEvent.status === 'playing')
                    }}
                    onTimeRemainingChange={e => {
                      setTimeRemaining(e.nativeEvent.timeRemaining)
                    }}
                  />
                  <VideoPresentationControls
                    enterFullscreen={() => {
                      playerRef.current?.enterFullscreen(true)
                    }}
                    toggleMuted={() => {
                      playerRef.current?.toggleMuted()
                    }}
                    togglePlayback={() => {
                      playerRef.current?.togglePlayback()
                    }}
                    isPlaying={isPlaying}
                    timeRemaining={timeRemaining}
                    muted={muted}
                  />
                </>
              )}
            </>
          )}
          <ExternalEmbedRemoveBtn onRemove={clear} />
        </View>
      </ConstrainedImage>
    </View>
  )
}
