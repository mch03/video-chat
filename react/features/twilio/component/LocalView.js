import { TwilioVideoLocalView } from 'react-native-twilio-video-webrtc';
import { StyleSheet, View } from 'react-native';
import React from 'react';

export const LocalView = ({ isVideoEnabled }) => {
    return <View style={styles.localVideo}>
        <TwilioVideoLocalView
            enabled={isVideoEnabled}
            style={styles.localVideo}
        />
    </View>;
};

const styles = StyleSheet.create({
    localVideo: {
        flex: 1,
        width: 150,
        height: 250,
        position: 'absolute',
        right: 10,
        bottom: 10
    }
});
