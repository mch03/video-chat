import LocalVideoTrackUnderlay
    from '../../welcome/components/LocalVideoTrackUnderlay.native';
import { Image, SafeAreaView, View } from 'react-native';
import styles from '../../welcome/components/styles';
import { Text } from '../../base/react/components/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faIdBadge, faUser } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const _headerStyles = {
    'disabledButtonText': { 'opacity': 0.6 },
    'headerButtonIcon': {
        'alignSelf': 'center',
        'color': '#FFFFFF',
        'fontSize': 22,
        'marginRight': 12,
        'padding': 8
    },
    'headerButtonText': {
        'color': '#FFFFFF',
        'fontSize': 18
    },
    'headerOverlay': { 'backgroundColor': '#17A0DB' },
    'headerText': {
        'color': '#FFFFFF',
        'fontSize': 18
    },
    'headerTextWrapper': {
        'alignItems': 'center',
        'justifyContent': 'center',
        'left': 0,
        'position': 'absolute',
        'right': 0
    },
    'page': {
        'alignItems': 'stretch',
        'bottom': 0,
        'flex': 1,
        'flexDirection': 'column',
        'left': 0,
        'overflow': 'hidden',
        'position': 'absolute',
        'right': 0,
        'top': 0
    },
    'screenHeader': {
        'alignItems': 'center',
        'backgroundColor': '#17A0DB',
        'flexDirection': 'row',
        'height': 48,
        'justifyContent': 'space-between',
        'paddingHorizontal': 10,
        'paddingVertical': 5
    },
    'statusBar': '#1081b2',
    'statusBarContent': '#FFFFFF'
};
export const WelcomePage = () => {
    return (
            <View style={_headerStyles.page}>
                <SafeAreaView
                    style={[ styles.blankPageWrapper, styles.welcomePage ]}>
                    <View style={styles.welcomePageContainer}>

                        <Image
                            style={styles.logo}
                            source={require('../../../../images/jane-video-logo.png')}
                        />
                        <Text style={styles.bigText}>
                            Welcome to
                            {'\n'}
                            Jane Online Appointments
                        </Text>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <FontAwesomeIcon icon={faIdBadge} size={45}
                                                 color='white'/>
                            </View>
                            <View style={[ styles.column, styles.columnText ]}>
                                <Text style={[ styles.whiteText, styles.bold ]}>Staff
                                    Member</Text>
                                <Text style={styles.whiteText}>Please find the
                                    scheduled appointment in a web browser and
                                    tap <Text style={styles.bold}>Begin</Text>.</Text>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.column}>
                                <FontAwesomeIcon icon={faUser} size={45}
                                                 color='white'/>
                            </View>
                            <View style={[ styles.column, styles.columnText ]}>
                                <Text
                                    style={[ styles.whiteText, styles.bold ]}>Client</Text>
                                <Text style={styles.whiteText}>You will receive
                                    an email 30 minutes prior to your
                                    appointment with a link to begin. You can
                                    also sign in to your Jane account with a web
                                    browser and tap <Text
                                        style={styles.bold}>Begin</Text>.</Text>
                            </View>
                        </View>

                    </View>
                </SafeAreaView>
            </View>
    );
};
