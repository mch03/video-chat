// @flow

import React, {Component} from 'react';
import InlineDialog from '@atlaskit/inline-dialog';
import {
    joinConference as joinConferenceAction,
    joinConferenceWithoutAudio as joinConferenceWithoutAudioAction,
    setSkipPrejoin as setSkipPrejoinAction,
    setJoinByPhoneDialogVisiblity as setJoinByPhoneDialogVisiblityAction
} from '../actions';
import {getRoomName} from '../../base/conference';
import {Icon, IconPhone, IconVolumeOff} from '../../base/icons';
import {getLocalizedDateFormatter, translate} from '../../base/i18n';
import {connect} from '../../base/redux';
import {getPreJoinPageDisplayName, updateSettings} from '../../base/settings';
import ActionButton from './buttons/ActionButton';
import {
    isJoinByPhoneButtonVisible,
    isDeviceStatusVisible,
    isJoinByPhoneDialogVisible,
    checkOtherParticipantsReady
} from '../functions';
import {isGuest} from '../../invite';
import CopyMeetingUrl from './preview/CopyMeetingUrl';
import DeviceStatus from './preview/DeviceStatus';
import ParticipantName from './preview/ParticipantName';
import Preview from './preview/Preview';
import {VideoSettingsButton, AudioSettingsButton} from '../../toolbox';
import {Sockets} from '../../../../service/Websocket/socket';
import {parseJWTFromURLParams} from '../../base/jwt';
import jwtDecode from 'jwt-decode';
import messageHandler from '../../../../modules/UI/util/MessageHandler';
import moment from 'moment';
import {Watermarks} from '../../base/react/components/web';

type Props = {

    /**
     * Flag signaling if the device status is visible or not.
     */
    deviceStatusVisible: boolean,

    /**
     * If join by phone button should be visible.
     */
    hasJoinByPhoneButton: boolean,

    /**
     * Flag signaling if a user is logged in or not.
     */
    isAnonymousUser: boolean,

    /**
     * Joins the current meeting.
     */
    joinConference: Function,

    /**
     * Joins the current meeting without audio.
     */
    joinConferenceWithoutAudio: Function,

    /**
     * The name of the user that is about to join.
     */
    name: string,

    /**
     * Updates settings.
     */
    updateSettings: Function,

    /**
     * The name of the meeting that is about to be joined.
     */
    roomName: string,

    /**
     * Sets visibility of the prejoin page for the next sessions.
     */
    setSkipPrejoin: Function,

    /**
     * Sets visibility of the 'JoinByPhoneDialog'.
     */
    setJoinByPhoneDialogVisiblity: Function,

    /**
     * If 'JoinByPhoneDialog' is visible or not.
     */
    showDialog: boolean,

    /**
     * Used for translation.
     */
    t: Function,
};

type State = {

    /**
     * Flag controlling the visibility of the 'join by phone' buttons.
     */
    showJoinByPhoneButtons: boolean
}

/**
 * This component is displayed before joining a meeting.
 */
class Prejoin extends Component<Props, State> {
    /**
     * Initializes a new {@code Prejoin} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            showJoinByPhoneButtons: false,
            localParticipantCanJoin: false
        };
        this.socket = null;
        this._closeDialog = this._closeDialog.bind(this);
        this._showDialog = this._showDialog.bind(this);
        this._onCheckboxChange = this._onCheckboxChange.bind(this);
        this._onDropdownClose = this._onDropdownClose.bind(this);
        this._onOptionsClick = this._onOptionsClick.bind(this);
        this._setName = this._setName.bind(this);
        this._joinConference = this._joinConference.bind(this);
        this._joinConferenceWithoutAudio = this._joinConferenceWithoutAudio.bind(this);
        this._onReadyBtnClick = this._onReadyBtnClick.bind(this);
        this._onMessageUpdate = this._onMessageUpdate.bind(this);
        this._closeWindow = this._closeWindow.bind(this);
    }

    _onCheckboxChange: () => void;

    /**
     * Handler for the checkbox.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onCheckboxChange(e) {
        this.props.setSkipPrejoin(e.target.checked);
    }

    _onDropdownClose: () => void;

    /**
     * Closes the dropdown.
     *
     * @returns {void}
     */
    _onDropdownClose() {
        this.setState({
            showJoinByPhoneButtons: false
        });
    }

    _onOptionsClick: () => void;

    /**
     * Displays the join by phone buttons dropdown.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onOptionsClick(e) {
        e.stopPropagation();

        this.setState({
            showJoinByPhoneButtons: !this.state.showJoinByPhoneButtons
        });
    }

    _setName: () => void;

    /**
     * Sets the guest participant name.
     *
     * @param {string} displayName - Participant name.
     * @returns {void}
     */
    _setName(displayName) {
        this.props.updateSettings({
            displayName
        });
    }

    _closeDialog: () => void;

    /**
     * Closes the join by phone dialog.
     *
     * @returns {undefined}
     */
    _closeDialog() {
        this.props.setJoinByPhoneDialogVisiblity(false);
    }

    _showDialog: () => void;

    /**
     * Displays the dialog for joining a meeting by phone.
     *
     * @returns {undefined}
     */
    _showDialog() {
        this.props.setJoinByPhoneDialogVisiblity(true);
        this._onDropdownClose();
    }

    componentDidMount() {
        const {participantType} = this.props;
        if (participantType === 'Patient') {
            this._sendBeacon();
        }
        this._connectSocket();
    }

    componentWillUnmount() {
        this.socket && this.socket.disconnect();
    }

    _onMessageUpdate(event) {
        const {participantType} = this.props;
        if (event.info === 'practitioner_ready' && participantType === 'Patient') {
            this.setState({
                localParticipantCanJoin: true
            });
        }
        if (event.info === 'patient_ready' && participantType === 'StaffMember') {
            this.setState({
                localParticipantCanJoin: true
            });
        }
    }

    _joinConference() {
        const {
            joinConference
        } = this.props;
        const {participantType} = this.props;
        if (participantType === 'StaffMember') {
            this._sendBeacon();
        }
        joinConference();
    }

    async _connectSocket() {
        const {jwt, jwtPayload} = this.props;
        const socketJwtPayload = jwtDecode(jwtPayload.context.ws_token);
        try {
            const otherParticipantsReady = await checkOtherParticipantsReady(jwt, jwtPayload);
            if (otherParticipantsReady) {
                this.setState({
                    localParticipantCanJoin: true
                });
            } else {
                if (socketJwtPayload) {
                    this.socket = new Sockets({
                        socket_host: jwtPayload.context.ws_host,
                        ws_token: jwtPayload.context.ws_token
                    });
                    this.socket.onMessageUpdateListener = this._onMessageUpdate.bind(this);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    _sendBeacon() {
        const {jwt, jwtPayload, participantType, participant} = this.props;
        if (jwt && jwtPayload) {
            const wsUpdateUrl = jwtPayload.context.participant_ready_url;
            const obj = {
                jwt,
                // eslint-disable-next-line camelcase
                info: participantType === 'StaffMember' ? 'practitioner_ready' : 'patient_ready',
                participant_type: participantType === 'StaffMember' ? 'staff_member' : 'patient',
                participant_id: participant.participant_id,
                participant_name: participant.name,
                room_name: jwtPayload.room
            };
            const data = new Blob([JSON.stringify(obj, null, 2)], {type: 'text/plain; charset=UTF-8'});
            // eslint-disable-next-line no-mixed-operators
            navigator.sendBeacon(wsUpdateUrl, data);
        }
    }

    _onReadyBtnClick() {
        this._sendBeacon();
    }

    _joinConferenceWithoutAudio() {
        const {
            joinConferenceWithoutAudio
        } = this.props;
        this._sendBeacon();
        joinConferenceWithoutAudio();
    }

    _getDialogTitleMsg() {
        const {t, participantType} = this.props;
        const {localParticipantCanJoin} = this.state;
        let title;
        if (!localParticipantCanJoin) {
            title = 'Test your audio and video while you wait.';
        } else {
            if (participantType === 'StaffMember') {
                title = 'When you are ready to begin, click on button below to admit your client into the video session.';
            } else {
                title = '';
            }
        }
        return <div className='prejoin-info-title-msg'>{title}</div>;
    }

    _getDialogTitle() {
        const {t, participantType} = this.props;
        const {localParticipantCanJoin} = this.state;
        let header;
        if (participantType === 'StaffMember') {
            if (!localParticipantCanJoin) {
                header = t('prejoin.pratitionerWaitMsg');
            }
            header = t('prejoin.patientReady');
        } else {
            if (!localParticipantCanJoin) {
                header = t('prejoin.patientWaitMsg');
            }
            header = t('prejoin.pratitionerReady');
        }
        return <div className='prejoin-info-title'>{header}</div>;
    }

    _getStartDate() {
        const {jwtPayload} = this.props;
        const startAt = jwtPayload && jwtPayload.context && jwtPayload.context.start_at || '';
        if (startAt) {
            return <p>
                {
                    getLocalizedDateFormatter(startAt).format('MMMM D, YYYY')
                }
            </p>;
        }
        return null;
    }

    _getStartTimeAndEndTime() {
        const {jwtPayload} = this.props;
        const startAt = jwtPayload && jwtPayload.context && jwtPayload.context.start_at || '';
        const endAt = jwtPayload && jwtPayload.context && jwtPayload.context.end_at || '';
        if (!startAt || !endAt) {
            return null;
        }
        return <p>
            {
                `${getLocalizedDateFormatter(startAt).format('h:mm')} -
            ${getLocalizedDateFormatter(endAt).format('h:mm A')}`
            }
        </p>;
    }

    _getDuration() {
        const {jwtPayload} = this.props;
        const startAt = jwtPayload && jwtPayload.context && jwtPayload.context.start_at || '';
        const endAt = jwtPayload && jwtPayload.context && jwtPayload.context.end_at || '';
        if (!startAt || !endAt) {
            return null;
        }
        const duration = getLocalizedDateFormatter(endAt).valueOf() - getLocalizedDateFormatter(startAt).valueOf();
        return <p>
            {
                `${moment.duration(duration).asMinutes()} Minutes`
            }
        </p>;
    }

    _closeWindow() {
        window.close();
    }

    _getBtnText() {
        const {participantType} = this.props;
        return participantType === 'StaffMember' ? 'Admin Client' : 'Begin';
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            name,
            participantType,
            deviceStatusVisible,
            jwtPayload,
            t
        } = this.props;

        const {_onCheckboxChange, _joinConference, _closeWindow} = this;
        const {localParticipantCanJoin} = this.state;
        const stopAnimation = participantType === 'StaffMember';
        const waitingMessageHeader = participantType === 'StaffMember' ? '' : 'Waiting for the practitioner...';
        return (
            <div className='prejoin-full-page'>
                <Watermarks
                    stopAnimation={stopAnimation || localParticipantCanJoin}
                    waitingMessageHeader={waitingMessageHeader}/>
                <Preview name={name}/>
                <div className='prejoin-info-area-container'>
                    <div className='prejoin-info-area'>
                        <div className='prejoin-info'>
                            <div className='prejoin-info-logo-wrapper'>
                                <div className='prejoin-info-logo'>
                                </div>
                            </div>
                            <div className='prejoin-info-text-wrapper'>
                                {
                                    this._getDialogTitle()
                                }
                                {
                                    this._getDialogTitleMsg()
                                }
                                <div className='prejoin-info-detail'>
                                    <p>
                                        {
                                            jwtPayload && jwtPayload.context && jwtPayload.context.treatment
                                        }
                                    </p>
                                    <p>
                                        {
                                            jwtPayload && jwtPayload.context && jwtPayload.context.practitioner_name
                                        }
                                    </p>
                                    {
                                        this._getStartDate()
                                    }
                                    {
                                        this._getStartTimeAndEndTime()
                                    }
                                    {
                                        this._getDuration()
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            <div className='prejoin-preview-join-btn-container'>
                                {
                                    localParticipantCanJoin && <ActionButton
                                        onClick={_joinConference}
                                        type='primary'>
                                        {this._getBtnText()}
                                    </ActionButton>
                                }
                                {
                                    !localParticipantCanJoin && participantType === 'StaffMember' &&
                                    <ActionButton
                                        onClick={_closeWindow}
                                        type='close'>
                                        Close
                                    </ActionButton>
                                }
                            </div>
                        }
                    </div>
                    <div className='prejoin-preview-btn-container'>
                        <AudioSettingsButton visible={true}/>
                        <VideoSettingsButton visible={true}/>
                    </div>
                    <div className='prejoin-checkbox-container'>
                        <input
                            className='prejoin-checkbox'
                            onChange={_onCheckboxChange}
                            type='checkbox'/>
                        <span>{t('prejoin.doNotShow')}</span>
                    </div>
                </div>
                { deviceStatusVisible && <DeviceStatus /> }
            </div>
        );
    }
}

function mapStateToProps(state): Object {
    const {jwt} = state['features/base/jwt'];
    const jwtPayload = jwt && jwtDecode(jwt) || null;
    const participant = jwtPayload && jwtPayload.context && jwtPayload.context.user || null;
    const participantType = participant && participant.participant_type || null;

    return {
        isAnonymousUser: isGuest(state),
        deviceStatusVisible: isDeviceStatusVisible(state),
        name: getPreJoinPageDisplayName(state),
        roomName: getRoomName(state),
        showDialog: isJoinByPhoneDialogVisible(state),
        hasJoinByPhoneButton: isJoinByPhoneButtonVisible(state),
        jwt, jwtPayload, participantType, participant
    };
}

const mapDispatchToProps = {
    joinConferenceWithoutAudio: joinConferenceWithoutAudioAction,
    joinConference: joinConferenceAction,
    setJoinByPhoneDialogVisiblity: setJoinByPhoneDialogVisiblityAction,
    setSkipPrejoin: setSkipPrejoinAction,
    updateSettings
};

export default connect(mapStateToProps, mapDispatchToProps)(translate(Prejoin));
