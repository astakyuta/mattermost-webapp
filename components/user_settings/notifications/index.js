// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateMe} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsNotifications from './user_settings_notifications.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const siteName = config.SiteName;
    const sendPushNotifications = config.SendPushNotifications === 'true';
    console.log('config value: ', config);
    console.log('ExperimentalEnableAutomaticReplies: ', config.ExperimentalEnableAutomaticReplies);
    const enableAutoResponder = true; // config.ExperimentalEnableAutomaticReplies === 'true';

    return {
        siteName,
        sendPushNotifications,
        enableAutoResponder,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({updateMe}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettingsNotifications);
