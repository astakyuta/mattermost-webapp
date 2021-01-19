// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getTeam as fetchTeam, membersMinusGroupMembers, patchTeam} from 'mattermost-redux/actions/teams';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import MessageCleanupModal from "./message_cleanup_modal";
import {bindActionCreators} from "redux";
import {
    getGroupsAssociatedToTeam as fetchAssociatedGroups,
    linkGroupSyncable,
    unlinkGroupSyncable
} from "mattermost-redux/actions/groups";
import {setNavigationBlocked} from "../../actions/admin_actions";

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.TEAM_MEMBERS;
    return {
        currentTeam: getCurrentTeam(state),
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            patchTeam
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageCleanupModal);
