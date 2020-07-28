// @flow
/* eslint-disable */
import React, { Component } from 'react/index';
import { Animated, Easing, Text, SafeAreaView } from 'react-native';
import styles from './styles';
import { getLocalizedDateFormatter, translate } from '../../../i18n';
import { connect } from '../../../redux';
import { getParticipantCount } from '../../../participants';
import { getRemoteTracks } from '../../../tracks';
import jwtDecode from 'jwt-decode';

type Props = {
    _isGuest: boolean,
    jwt: Object,
    conferenceHasStarted: boolean,
    isWelcomePage: boolean
};

type State = {
    beforeAppointmentStart: boolean,
    appointmentStartAt: string
};

class WaitingMessage extends Component<Props, State> {

    _interval;

    constructor(props: Props) {
        super(props);

        this.state = {
            beforeAppointmentStart: false,
            appointmentStartAt: '',
            fadeAnim: new Animated.Value(0)
        };
        this.animatedValue = new Animated.Value(0)
    }

    componentDidMount() {
        this._startTimer();
        this._animate()
    }

    _animate() {
        this.animatedValue.setValue(0);
        Animated.timing(
            this.animatedValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this._animate())
    }

    _startTimer() {
        const { jwt, conferenceHasStarted } = this.props;
        const jwtPayload = jwt && jwtDecode(jwt);

        if (jwtPayload && jwtPayload.context && !conferenceHasStarted) {
            const { start_at } = jwtPayload.context || 0;
            const appointmentStartTimeStamp = new Date(start_at).getTime();
            const now = new Date().getTime();

            if (now < appointmentStartTimeStamp) {
                this.setState({
                    beforeAppointmentStart: true,
                    appointmentStartAt: start_at
                }, () => {
                    this._setInterval(appointmentStartTimeStamp);
                });
            }
        }
    }

    _setInterval(appointmentStartTimeStamp) {
        this._interval = setInterval(() => {
            const { conferenceHasStarted } = this.props;
            const now = new Date().getTime();

            if ((appointmentStartTimeStamp < now) || conferenceHasStarted) {
                this.setState({
                    beforeAppointmentStart: false
                }, () => {
                    this._stopTimer();
                });
            }
        }, 1000);
    }

    _stopTimer() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    render() {
        const { conferenceHasStarted } = this.props;

        if (conferenceHasStarted) {
            return null;
        }

        return (
            <SafeAreaView>
                {
                    this._renderWaitingMessage()
                }
            </SafeAreaView>
        );
    }

    _renderWaitingMessage() {
        const { beforeAppointmentStart, appointmentStartAt } = this.state;
        const animate = this.animatedValue.interpolate({
            inputRange: [0, .2, .5, .8, 1],
            outputRange: [.5, .8, 1, 1, .5]
        });
        
        let header = <Text style={styles.waitingMessageHeader}>Waiting for the other participant to join...</Text>;

        if (beforeAppointmentStart && appointmentStartAt) {
            header = (<Text style={styles.waitingMessageHeader}>Your appointment will begin
                at {getLocalizedDateFormatter(appointmentStartAt).format('hh:mm A')}</Text>);
        }

        return (<Animated.View className = 'waitingMessage' style={[styles.waitingMessageContainer,{
            opacity: animate
        }]}>
            {
                header
            }
            <Text style={styles.waitingMessageText}>Sit back, relax and take a moment for yourself.</Text>
        </Animated.View>);
    }
}

function _mapStateToProps(state) {
    const { jwt } = state['features/base/jwt'];
    const participantCount = getParticipantCount(state);
    const remoteTracks = getRemoteTracks(state['features/base/tracks']);

    return {
        jwt,
        conferenceHasStarted: participantCount > 1 && remoteTracks.length > 0
    };
}

export default connect(_mapStateToProps)(translate(WaitingMessage));
