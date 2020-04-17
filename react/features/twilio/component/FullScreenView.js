import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView
} from 'react-native-twilio-video-webrtc';
import React from 'react';
import { getCurrentUserInfo } from '../function';

export const FullScreenView = ({ videoTracks, participants, onPress, fullScreenSessionId, jwtToken }) => {
    return <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.fullScreenContainer}>
            {
                fullScreenSessionId === 'self' &&
                <View style={styles.fullScreenContainer}>
                    <TwilioVideoLocalView
                        enabled={true}
                        style={styles.remoteVideo}
                    />
                    <View style={styles.participantHeaderContainer}>
                        <Text style={styles.participantHeader}>
                            {
                                jwtToken && getCurrentUserInfo(jwtToken) && getCurrentUserInfo(jwtToken).identity
                            }
                        </Text>
                    </View>
                </View>
            }
            {
                fullScreenSessionId !== 'self' && Array.from(videoTracks, ([ trackSid, trackIdentifier ]) => {
                    const participantName = participants.filter(v => {
                        return v.sid === trackIdentifier.participantSid;
                    })[0].identity;
                    if (fullScreenSessionId === trackSid) {
                        return (
                            <View style={styles.fullScreenContainer}>
                                <TwilioVideoParticipantView
                                    style={styles.remoteVideo}
                                    key={trackSid}
                                    trackIdentifier={trackIdentifier}
                                />
                                <View style={styles.participantHeaderContainer}>
                                    <Text style={styles.participantHeader}>
                                        {participantName}
                                    </Text>
                                </View>
                            </View>
                        );
                    }
                })
            }
        </View>
    </TouchableWithoutFeedback>;
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        alignItems: 'stretch',
        width: '100%',
        height: '100%'
    },
    remoteVideo: {
        flex: 1,
        backgroundColor: 'red'
    },
    participantHeaderContainer: {
        width: '100%',
        position: 'absolute',
        top: '7%',
        left: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    participantHeader: {
        fontSize: 24,
        color: '#e0e0e0'
    }
});
