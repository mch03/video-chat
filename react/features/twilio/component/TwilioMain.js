import React, { Component } from 'react';
import {
    TwilioVideo
} from 'react-native-twilio-video-webrtc';
import {
    StyleSheet,
    View,
    Alert
} from 'react-native';
import { FullScreenView } from './FullScreenView';
import { ToolBox } from './ToolBox';
import { BottomView } from './BottomView';

export default class TwilioMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAudioEnabled: true,
            isVideoEnabled: true,
            participants: [],
            videoTracks: new Map(),
            roomName: props.token.room_name,
            token: props.token.token,
            showToolBox: true,
            fullScreenSessionId: 'self'
        };
    }

    componentDidMount() {
        this.refs.twilioVideo.connect({
            roomName: this.state.roomName,
            accessToken: this.state.token
        }, () => {
            console.log(this.state.videoTracks);
        });
    }

    onEndButtonPress = () => {
        try {
            this.refs.twilioVideo.disconnect();

        } catch (error) {
            Alert.alert(error);
        } finally {
            this.props.onRoomDidDisconnect();
        }
    };

    onMuteButtonPress = () => {
        this.refs.twilioVideo.setLocalAudioEnabled(!this.state.isAudioEnabled)
            .then(isEnabled => this.setState({ isAudioEnabled: isEnabled }));
    };

    onVideoMuteButtonPress = () => {
        this.refs.twilioVideo.setLocalVideoEnabled(!this.state.isVideoEnabled)
            .then(isEnabled => this.setState({ isVideoEnabled: isEnabled }));
    };

    onFlipButtonPress = () => {
        this.refs.twilioVideo.flipCamera();
    };

    onRoomDidConnect = ({ roomName, participants }) => {
        this.props.onRoomDidConnect();
        this.setState({
            participants: [ ...this.state.participants, ...participants ]
        });
    };

    onRoomDidDisconnect = ({ roomName, error }) => {
        Alert.alert(error);
        this.props.onRoomDidDisconnect();
    };

    onRoomDidFailToConnect = (error) => {
        Alert.alert(error);
        this.props.onRoomDidDisconnect();
    };

    onParticipantAddedVideoTrack = ({ participant, track }) => {
        this.setState({
            videoTracks: new Map([
                ...this.state.videoTracks,
                [ track.trackSid, {
                    participantSid: participant.sid,
                    videoTrackSid: track.trackSid
                } ]
            ]),
            participants: [ ...this.state.participants, participant ],
            fullScreenSessionId: track.trackSid
        });
    };

    onParticipantRemovedVideoTrack = ({ participant, track }) => {
        console.log('onParticipantRemovedVideoTrack: ', participant, track);
        const videoTracks = this.state.videoTracks;
        videoTracks.delete(track.trackSid);
        this.setState({ videoTracks: new Map([ ...videoTracks ]) });
    };

    onFullScreenViewPress = () => {
        const { showToolBox } = this.state;
        this.setState({
            showToolBox: !showToolBox
        });
    };

    onBottomViewCellPress = (SessionId) => {
        this.setState({
            fullScreenSessionId: SessionId
        });
    };

    render() {
        const { videoTracks, isVideoEnabled, isAudioEnabled, token, participants, showToolBox, fullScreenSessionId } = this.state;
        return (
            <View style={styles.container}>
                {
                    <View style={styles.callContainer}>
                        <FullScreenView videoTracks={videoTracks}
                                        jwtToken={token}
                                        participants={participants}
                                        fullScreenSessionId={fullScreenSessionId}
                                        onPress={this.onFullScreenViewPress}
                        />
                        <BottomView isVideoEnabled={isVideoEnabled}
                                    jwtToken={token}
                                    videoTracks={videoTracks}
                                    participants={participants}
                                    onBottomViewCellPress={this.onBottomViewCellPress}/>
                        {
                            showToolBox &&
                            <ToolBox onEndButtonPress={this.onEndButtonPress}
                                     onMuteButtonPress={this.onMuteButtonPress}
                                     onFlipButtonPress={this.onFlipButtonPress}
                                     onVideoMuteButtonPress={this.onVideoMuteButtonPress}
                                     isAudioEnabled={isAudioEnabled}
                                     isVideoEnabled={isVideoEnabled}/>
                        }
                    </View>
                }
                <TwilioVideo
                    ref="twilioVideo"
                    onRoomDidConnect={this.onRoomDidConnect}
                    onRoomDidDisconnect={this.onRoomDidDisconnect}
                    onRoomDidFailToConnect={this.onRoomDidFailToConnect}
                    onParticipantAddedVideoTrack={this.onParticipantAddedVideoTrack}
                    onParticipantRemovedVideoTrack={this.onParticipantRemovedVideoTrack}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#303030'
    },
    callContainer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        top: 0,
        left: 0,
        right: 0
    }
});
