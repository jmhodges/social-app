import {useImperativeHandle, useRef, useState} from 'react'
import {View} from 'react-native'
import {type AppBskyEmbedVideo} from '@atproto/api'
import {BlueskyVideoView} from '@bsky.app/video'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'

import {useAutoplayDisabled} from '#/state/preferences'
import {atoms as a} from '#/alf'
import {useIsWithinMessage} from '#/components/dms/MessageContext'
import {KeepAwake} from '#/components/KeepAwake'
import {MediaInsetBorder} from '#/components/MediaInsetBorder'
import {useVideoMuteState} from '#/components/Post/Embed/VideoEmbed/VideoVolumeContext'
import {VideoPresentationControls} from '#/components/video/VideoPresentationControls'
import {GifPresentationControls} from '../GifPresentationControls'

export function VideoEmbedInnerNative({
  ref,
  embed,
  setStatus,
  setIsLoading,
  setIsActive,
}: {
  ref: React.Ref<{togglePlayback: () => void}>
  embed: AppBskyEmbedVideo.View
  setStatus: (status: 'playing' | 'paused') => void
  setIsLoading: (isLoading: boolean) => void
  setIsActive: (isActive: boolean) => void
}) {
  const {_} = useLingui()
  const videoRef = useRef<BlueskyVideoView>(null)
  const autoplayDisabled = useAutoplayDisabled()
  const isWithinMessage = useIsWithinMessage()
  const [muted, setMuted] = useVideoMuteState()

  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [error, setError] = useState<string>()

  useImperativeHandle(ref, () => ({
    togglePlayback: () => {
      videoRef.current?.togglePlayback()
    },
  }))

  if (error) {
    throw new Error(error)
  }

  const isGif = embed.presentation === 'gif'

  return (
    <View style={[a.flex_1, a.relative]}>
      <BlueskyVideoView
        url={embed.playlist}
        autoplay={!autoplayDisabled && !isWithinMessage}
        beginMuted={isGif || (autoplayDisabled ? false : muted)}
        style={[a.rounded_sm]}
        onActiveChange={e => {
          setIsActive(e.nativeEvent.isActive)
        }}
        onLoadingChange={e => {
          setIsLoading(e.nativeEvent.isLoading)
        }}
        onMutedChange={e => {
          if (!isGif) {
            setMuted(e.nativeEvent.isMuted)
          }
        }}
        onStatusChange={e => {
          setStatus(e.nativeEvent.status)
          setIsPlaying(e.nativeEvent.status === 'playing')
        }}
        onTimeRemainingChange={e => {
          setTimeRemaining(e.nativeEvent.timeRemaining)
        }}
        onError={e => {
          setError(e.nativeEvent.error)
        }}
        ref={videoRef}
        accessibilityLabel={
          embed.alt ? _(msg`Video: ${embed.alt}`) : _(msg`Video`)
        }
        accessibilityHint=""
      />
      {isGif ? (
        <GifPresentationControls
          onPress={() => {
            videoRef.current?.togglePlayback()
          }}
          isPlaying={isPlaying}
          isLoading={false}
          altText={embed.alt}
        />
      ) : (
        <VideoPresentationControls
          enterFullscreen={() => {
            videoRef.current?.enterFullscreen(true)
          }}
          toggleMuted={() => {
            videoRef.current?.toggleMuted()
          }}
          togglePlayback={() => {
            videoRef.current?.togglePlayback()
          }}
          isPlaying={isPlaying}
          timeRemaining={timeRemaining}
          muted={muted}
        />
      )}
      <MediaInsetBorder />
      <KeepAwake enabled={isPlaying} />
    </View>
  )
}
