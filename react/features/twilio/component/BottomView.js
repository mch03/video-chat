import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView
} from 'react-native-twilio-video-webrtc';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { getCurrentUserInfo } from '../util';

export const BottomView = ({ isVideoEnabled, jwtToken, videoTracks, participants, onBottomViewCellPress }) => {
    return <View style={styles.bottomVideoContainer}>
        <TouchableOpacity onPress={() => {
            onBottomViewCellPress('self');
        }}>
            <View style={styles.bottomVideoCell}>
                <TwilioVideoLocalView
                    enabled={isVideoEnabled}
                    style={styles.bottomVideoInnerCell}
                />
                <View style={styles.bottomVideoUserNameWrapper}>
                    <Text style={styles.bottomVideoUserNameText}>
                        {
                            jwtToken && getCurrentUserInfo(jwtToken) && getCurrentUserInfo(jwtToken).identity
                        }
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
        {
            videoTracks && Array.from(videoTracks, ([ trackSid, trackIdentifier ]) => {
                const participantName = participants.filter(v => {
                    return v.sid === trackIdentifier.participantSid;
                })[0].identity;
                return (
                    <TouchableOpacity onPress={() => {
                        onBottomViewCellPress(trackSid);
                    }}>
                        <View style={styles.bottomVideoCell}>
                            <TwilioVideoParticipantView
                                style={styles.bottomVideoInnerCell}
                                key={trackSid}
                                trackIdentifier={trackIdentifier}
                            />
                            <View style={styles.bottomVideoUserNameWrapper}>
                                <Text style={styles.bottomVideoUserNameText}>
                                    {participantName}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })
        }
    </View>;
};

const styles = StyleSheet.create({
    bottomVideoContainer: {
        flex: 1,
        width: '100%',
        height: 100,
        position: 'absolute',
        left: 0,
        bottom: '5%',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        flexDirection: 'row'
    },
    bottomVideoCell: {
        width: 100,
        height: 100,
        backgroundColor: '#303030',
        marginHorizontal: 5,
        borderRadius: 10,
        overflow: 'hidden'
    },
    bottomVideoInnerCell: {
        width: 100,
        height: 100,
        borderRadius: 10
    },
    bottomVideoUserNameWrapper: {
        position: 'absolute',
        bottom: 10,
        width: 100,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomVideoUserNameText: {
        color: '#e0e0e0',
        textAlign: 'center'
    }
});
