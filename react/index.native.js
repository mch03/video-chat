// @flow

// FIXME The bundler-related (and the browser-related) polyfills were born at
// the very early days of prototyping the execution of lib-jitsi-meet on
// react-native. Today, the feature base/lib-jitsi-meet should not be
// responsible for such polyfills because it is not the only feature relying on
// them. Additionally, the polyfills are usually necessary earlier than the
// execution of base/lib-jitsi-meet (which is understandable given that the
// polyfills are globals). The remaining problem to be solved here is where to
// collect the polyfills' files.
import './features/base/lib-jitsi-meet/native/polyfills-bundler';

import React, { PureComponent } from 'react';
import { AppRegistry, Linking } from 'react-native';

import { App } from './features/app';
import { IncomingCallApp } from './features/mobile/incoming-call';

// It's crucial that the native loggers are created ASAP, not to lose any data.
import { _initLogging } from './features/base/logging/functions';
import { toURLString } from './features/base/util';
import TwilioApp from './features/twilio';

declare var __DEV__;

/**
 * The type of the React {@code Component} props of {@link Root}.
 */
type Props = {

    /**
     * The URL, if any, with which the app was launched.
     */
    url: Object | string
};

/**
 * React Native doesn't support specifying props to the main/root component (in
 * the JS/JSX source code). So create a wrapper React Component (class) around
 * features/app's App instead.
 *
 * @extends Component
 */
class Root extends PureComponent<Props> {
    constructor() {
        super();
        this.state = {
            twilioDeepLink: '',
            deepLinkUpdatedTimeStamp: null
        };
        Linking.addEventListener('url', this.handleTwilioOpenUrl.bind(this));
    }

    handleTwilioOpenUrl(url) {
        console.log(url, '++__urlurl');
        this.setState({
            twilioDeepLink: url,
            deepLinkUpdatedTimeStamp: Date.now()
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) {
        if (nextProps.url) {
            this.setState({
                twilioDeepLink: ''
            });
        }
    }

    render() {
        const { twilioDeepLink, deepLinkUpdatedTimeStamp } = this.state;
        if (twilioDeepLink) {
            return <TwilioApp
                deepLinkUpdatedTimeStamp={deepLinkUpdatedTimeStamp}
                twilioDeepLink={twilioDeepLink}/>;
        }
        return (
            <App {...this.props} />
        );
    }
}

// Initialize logging.
_initLogging();

// HORRIBLE HACK ALERT! React Native logs the initial props with `console.log`. Here we are quickly patching it
// to avoid logging potentially sensitive information.
if (!__DEV__) {
    /* eslint-disable */

    const __orig_console_log = console.log;
    const __orig_appregistry_runapplication = AppRegistry.runApplication;

    AppRegistry.runApplication = (...args) => {
        // $FlowExpectedError
        console.log = () => {
        };
        __orig_appregistry_runapplication(...args);
        // $FlowExpectedError
        console.log = __orig_console_log;
    };

    /* eslint-enable */
}


// Register the main/root Component of JitsiMeetView.
AppRegistry.registerComponent('App', () => Root);

// Register the main/root Component of IncomingCallView.
AppRegistry.registerComponent('IncomingCallApp', () => IncomingCallApp);
