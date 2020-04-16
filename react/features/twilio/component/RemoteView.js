import { StyleSheet, View } from 'react-native';
import { TwilioVideoParticipantView } from 'react-native-twilio-video-webrtc';
import React from 'react';

export const RemoteView = ({ videoTracks }) => {
    return <View style={styles.remoteGrid}>
        {
            Array.from(videoTracks, ([ trackSid, trackIdentifier ]) => {
                return (
                    <TwilioVideoParticipantView
                        style={styles.remoteVideo}
                        key={trackSid}
                        trackIdentifier={trackIdentifier}
                    />
                );
            })
        }
    </View>;
};


const styles = StyleSheet.create({
    remoteGrid: {
        flex: 1,
        alignItems: 'stretch'
    },
    remoteVideo: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'red'
    }
});
