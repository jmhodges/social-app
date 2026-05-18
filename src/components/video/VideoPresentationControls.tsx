import {Pressable, type StyleProp, View, type ViewStyle} from 'react-native'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'

import {HITSLOP_30} from '#/lib/constants'
import {atoms as a, useTheme} from '#/alf'
import {Mute_Stroke2_Corner0_Rounded as MuteIcon} from '#/components/icons/Mute'
import {Pause_Filled_Corner0_Rounded as PauseIcon} from '#/components/icons/Pause'
import {Play_Filled_Corner0_Rounded as PlayIcon} from '#/components/icons/Play'
import {SpeakerVolumeFull_Stroke2_Corner0_Rounded as UnmuteIcon} from '#/components/icons/Speaker'
import {TimeIndicator} from '#/components/Post/Embed/VideoEmbed/VideoEmbedInner/TimeIndicator'

export function VideoPresentationControls({
  enterFullscreen,
  toggleMuted,
  togglePlayback,
  timeRemaining,
  isPlaying,
  muted,
}: {
  enterFullscreen: () => void
  toggleMuted: () => void
  togglePlayback: () => void
  timeRemaining: number
  isPlaying: boolean
  muted: boolean
}) {
  const {_} = useLingui()
  const t = useTheme()

  const showTime = !isNaN(timeRemaining)

  return (
    <View style={[a.absolute, a.inset_0]}>
      <Pressable
        onPress={enterFullscreen}
        style={a.flex_1}
        accessibilityLabel={_(msg`Video`)}
        accessibilityHint={_(msg`Enters full screen`)}
        accessibilityRole="button"
      />
      <ControlButton
        onPress={togglePlayback}
        label={isPlaying ? _(msg`Pause`) : _(msg`Play`)}
        accessibilityHint={_(msg`Plays or pauses the video`)}
        style={{left: 6}}>
        {isPlaying ? (
          <PauseIcon width={13} fill={t.palette.white} />
        ) : (
          <PlayIcon width={13} fill={t.palette.white} />
        )}
      </ControlButton>
      {showTime && <TimeIndicator time={timeRemaining} style={{left: 33}} />}

      <ControlButton
        onPress={toggleMuted}
        label={
          muted
            ? _(msg({message: `Unmute`, context: 'video'}))
            : _(msg({message: `Mute`, context: 'video'}))
        }
        accessibilityHint={_(msg`Toggles the sound`)}
        style={{right: 6}}>
        {muted ? (
          <MuteIcon width={13} fill={t.palette.white} />
        ) : (
          <UnmuteIcon width={13} fill={t.palette.white} />
        )}
      </ControlButton>
    </View>
  )
}

function ControlButton({
  onPress,
  children,
  label,
  accessibilityHint,
  style,
}: {
  onPress: () => void
  children: React.ReactNode
  label: string
  accessibilityHint: string
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View
      style={[
        a.absolute,
        a.rounded_full,
        a.justify_center,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          paddingHorizontal: 4,
          paddingVertical: 4,
          bottom: 6,
          minHeight: 21,
          minWidth: 21,
        },
        style,
      ]}>
      <Pressable
        onPress={onPress}
        style={a.flex_1}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        hitSlop={HITSLOP_30}>
        {children}
      </Pressable>
    </View>
  )
}
