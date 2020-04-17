import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faMicrophone,
    faMicrophoneSlash, faPhoneSlash, faVideo, faVideoSlash
} from '@fortawesome/free-solid-svg-icons';

export const ToolBox = (props) => {
    return <View
        style={styles.optionsContainer}>
        <Button onPress={props.onMuteButtonPress} onVideoMuteButtonPress
                icon={props.isAudioEnabled ? faMicrophone : faMicrophoneSlash}/>
        <Button onPress={props.onEndButtonPress} icon={faPhoneSlash} endBtn/>
        {/*<Button onPress={props.onFlipButtonPress} btnText={'Flip'} icon={faCamera} />*/}
        <Button onPress={props.onVideoMuteButtonPress}
                icon={props.isVideoEnabled ? faVideo : faVideoSlash}/>
    </View>;
};

const Button = ({ onPress, icon, endBtn }) => {
    return <TouchableOpacity
        style={endBtn ? { ...styles.optionButton, ...styles.optionEndButton } : styles.optionButton}
        onPress={onPress}>
        <FontAwesomeIcon icon={icon}
                         style={endBtn ? { ...styles.optionButtonText, ...styles.optionEndButtonText } : styles.optionButtonText}
                         size={20}/>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    optionsContainer: {
        position: 'absolute',
        left: 0,
        bottom: 150,
        right: 0,
        height: 100,
        width: '100%',
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionButton: {
        width: 60,
        height: 60,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 100 / 2,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionEndButton: {
        backgroundColor: 'red'
    },
    optionButtonText: {
        color: 'rgba(0, 0, 0, 0.87)'
    },
    optionEndButtonText: {
        color: '#fff'
    }
});
