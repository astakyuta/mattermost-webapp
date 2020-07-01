// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannelStats} from 'mattermost-redux/actions/channels';
import {
    getMyTeamMembers,
    getMyTeamUnreads,
    getTeamStats,
    getTeamMember,
    updateTeamMemberSchemeRoles,
} from 'mattermost-redux/actions/teams';
import {getUser, updateUserActive} from 'mattermost-redux/actions/users';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentRelativeTeamUrl, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {removeUserFromTeamAndGetStats} from 'actions/team_actions.jsx';

import AutoResponderStatusCheckbox from './aute_responder_status_checkbox.jsx';

function mapStateToProps(state) {
    return {
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
        currentTeam: getCurrentTeam(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMyTeamMembers,
            getMyTeamUnreads,
            getUser,
            getTeamMember,
            getTeamStats,
            getChannelStats,
            updateUserActive,
            updateTeamMemberSchemeRoles,
            removeUserFromTeamAndGetStats,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoResponderStatusCheckbox);
