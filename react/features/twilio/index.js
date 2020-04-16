import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import TwilioMain from './component/TwilioMain';
import { WelcomePage } from './component/WelcomePage';
import { getTokenFromJane } from './function';

export default class TwilioApp extends Component {
    state = {
        token: null,
        status: 'connecting'
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
                    status: 'connected'
                });
            }, 1000);
        } catch (e) {
            setTimeout(() => {
                this.setState({
                    status: 'disconnected'
                }, () => {
                    // Alert.alert('Something wrong.');
                });
            }, 1000);
        }
    }

    disconnect = () => {
        this.setState({ status: 'disconnected' });
    };

    connect = () => {
        this.setState({ status: 'connected' });
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
                    this.state.status === 'connected' &&
                    <TwilioMain token={this.state.token}
                                onRoomDidDisconnect={this.disconnect}
                                onRoomDidConnect={this.connect}/>
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
