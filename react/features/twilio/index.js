import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator, Linking
} from 'react-native';
import TwilioMain from './component/TwilioMain';
import { WelcomePage } from './component/WelcomePage';
import {
    getInfoFromDeepLinkJwt,
    _getJwtFromDeepLink
} from './util';
import { sendBeaconRn, getTokenFromJane } from './service';

export default class TwilioApp extends Component {
    state = {
        token: null,
        status: 'connecting',
        startedAt: null
    };

    componentDidMount() {
        this.getToken();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.deepLinkUpdatedTimeStamp !== this.props.deepLinkUpdatedTimeStamp && this.props.twilioDeepLink) {
            this.setState({
                status: 'connecting'
            }, async () => {
                this.getToken();
            });
        }
    }

    async getToken() {
        try {
            const res = await getTokenFromJane(this.props.twilioDeepLink);
            setTimeout(() => {
                this.setState({
                    token: res,
                    status: 'hasToken'
                });
            }, 500);
        } catch (error) {
            setTimeout(() => {
                this.setState({
                    status: 'disconnected'
                }, () => {
                    // Alert.alert(JSON.stringify(error));
                });
            }, 500);
        }
    }

    disconnect = async () => {
        try {
            const { twilioDeepLink } = this.props;
            const { startedAt } = this.state;
            const leaveUrl = `https:${getInfoFromDeepLinkJwt(twilioDeepLink, 'leave_url')}`;
            const surveyUrl = `https:${getInfoFromDeepLinkJwt(twilioDeepLink, 'survey_url')}`;
            const jwt = _getJwtFromDeepLink(twilioDeepLink.url);
            this.setState({ status: 'disconnected' }, async () => {
                if (jwt) {
                    const obj = {
                        jwt,
                        started_at: startedAt
                    };
                    const data = new Blob([ JSON.stringify(obj, null, 2) ], { type: 'text/plain; charset=UTF-8' });
                    if (leaveUrl && surveyUrl) {
                        await Linking.openURL(surveyUrl);
                        startedAt && await sendBeaconRn(leaveUrl, data);
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    getStartedAtTime = (startedAt) => {
        this.setState({
            startedAt
        });
    };

    render() {
        return (
            <View style={styles.container}>
                {
                    this.state.status === 'connecting' &&
                    <Loader/>
                }
                {
                    this.state.status === 'disconnected' &&
                    <WelcomePage/>
                }
                {
                    this.state.status === 'hasToken' &&
                    <TwilioMain token={this.state.token}
                                onRoomDidDisconnect={this.disconnect}
                                getStartedAtTime={this.getStartedAtTime}/>
                }
            </View>
        );
    }
}

const Loader = () => {
    return <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
    </View>;
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00c1ca'
    },
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});
