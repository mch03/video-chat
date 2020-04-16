import React, { Component } from 'react';
import {
    TwilioVideo
} from 'react-native-twilio-video-webrtc';
import {
    StyleSheet,
    View,
    Alert
} from 'react-native';
import { RemoteView } from './RemoteView';
import { ToolBox } from './ToolBox';
import { LocalView } from './LocalView';

export default class TwilioMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAudioEnabled: true,
            isVideoEnabled: true,
            participants: new Map(),
            videoTracks: new Map(),
            roomName: props.token.room_name,
            token: props.token.token
        };
    }

    componentDidMount() {
        this.refs.twilioVideo.connect({
            roomName: this.state.roomName,
            accessToken: this.state.token
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

    onRoomDidConnect = () => {
        this.props.onRoomDidConnect();
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
        console.log('onParticipantAddedVideoTrack: ', participant, track);
        this.setState({
            videoTracks: new Map([
                ...this.state.videoTracks,
                [ track.trackSid, {
                    participantSid: participant.sid,
                    videoTrackSid: track.trackSid
                } ]
            ])
        });
    };

    onParticipantRemovedVideoTrack = ({ participant, track }) => {
        console.log('onParticipantRemovedVideoTrack: ', participant, track);
        const videoTracks = this.state.videoTracks;
        videoTracks.delete(track.trackSid);
        this.setState({ videoTracks: new Map([ ...videoTracks ]) });
    };

    render() {
        return (
            <View style={styles.container}>
                {
                    <View style={styles.callContainer}>
                        <RemoteView videoTracks={this.state.videoTracks}/>
                        <LocalView isVideoEnabled={this.state.isVideoEnabled}/>
                        <ToolBox onEndButtonPress={this.onEndButtonPress}
                                 onMuteButtonPress={this.onMuteButtonPress}
                                 onFlipButtonPress={this.onFlipButtonPress}
                                 onVideoMuteButtonPress={this.onVideoMuteButtonPress}
                                 isAudioEnabled={this.state.isAudioEnabled}
                                 isVideoEnabled={this.state.isVideoEnabled}/>
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
