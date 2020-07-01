// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {Permissions} from 'mattermost-redux/constants';

import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';

import * as UserAgent from 'utils/user_agent.jsx';
import Constants from 'utils/constants.jsx';

import logoImage from 'images/logo.png';

import AnnouncementBar from 'components/announcement_bar';
import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import LogoutIcon from 'components/icon/logout_icon';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

// import SelectTeamItem from './components/select_team_item.jsx';

// const TEAMS_PER_PAGE = 200;
// const TEAM_MEMBERSHIP_DENIAL_ERROR_ID = 'api.team.add_members.user_denied';

export default class SelectTeam extends React.Component {
    static propTypes = {
        // currentUserId: PropTypes.string.isRequired,
        // currentUserRoles: PropTypes.string,
        // currentUserIsGuest: PropTypes.bool,
        // customDescriptionText: PropTypes.string,
        // isMemberOfTeam: PropTypes.bool.isRequired,
        // listableTeams: PropTypes.array,
        // siteName: PropTypes.string,
        // canCreateTeams: PropTypes.bool.isRequired,
        // canManageSystem: PropTypes.bool.isRequired,
        // canJoinPublicTeams: PropTypes.bool.isRequired,
        // canJoinPrivateTeams: PropTypes.bool.isRequired,
        // history: PropTypes.object,
        // siteURL: PropTypes.string,
        // actions: PropTypes.shape({
        //     getTeams: PropTypes.func.isRequired,
        //     loadRolesIfNeeded: PropTypes.func.isRequired,
        //     addUserToTeam: PropTypes.func.isRequired,
        // }).isRequired,
    };

    constructor(props) {
        super(props);

        // this.state = {
        //     loadingTeamId: '',
        //     error: null,
        // };
    }

    componentDidMount() {
        // this.props.actions.getTeams(0, TEAMS_PER_PAGE);
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        // const {
        //     actions,
        //     currentUserRoles,
        // } = this.props;
        //
        // actions.loadRolesIfNeeded(currentUserRoles.split(' '));
    }
    

    handleLogoutClick = (e) => {
        e.preventDefault();
        emitUserLoggedOutEvent('/login');
    };

    clearError = (e) => {
        // e.preventDefault();
        //
        // this.setState({
        //     error: null,
        // });
    };

    render() {
        // const {
        //     currentUserIsGuest,
        //     canManageSystem,
        //     customDescriptionText,
        //     isMemberOfTeam,
        //     listableTeams,
        //     siteName,
        //     canCreateTeams,
        //     canJoinPublicTeams,
        //     canJoinPrivateTeams,
        // } = this.props;


        let headerButton;
        headerButton = (
            <div className='signup-header'>
                <a
                    href='#'
                    id='logout'
                    onClick={this.handleLogoutClick}
                >
                    <LogoutIcon/>
                    <FormattedMessage
                        id='web.header.logout'
                        defaultMessage='Logout'
                    />
                </a>
            </div>
        );

        return (
            <div>
                <AnnouncementBar/>
                {headerButton}
                <div className='col-sm-12'>
                    <div className={'signup-team__container'}>
                        {/*<img*/}
                        {/*    alt={'signup team logo'}*/}
                        {/*    className='signup-team-logo'*/}
                        {/*    src={logoImage}*/}
                        {/*/>*/}
                        <SiteNameAndDescription
                            customDescriptionText="Please use the link below to download the app!" // {customDescriptionText}
                            siteName="TeamComm"    // {siteName}
                        />
                        <p>For MacOs: </p>
                        <a href="https://teamcommapp.s3.amazonaws.com/mattermost-desktop-4.3.0-develop-mac.dmg" target="_blank">
                            https://teamcommapp.s3.amazonaws.com/mattermost-desktop-4.3.0-develop-mac.dmg
                        </a>
                        <p></p>
                        <p>For Windows: </p>
                        <a href="https://teamcommapp.s3.amazonaws.com/mattermost-desktop-setup-4.3.0-develop-win.exe" target="_blank">
                            https://teamcommapp.s3.amazonaws.com/mattermost-desktop-setup-4.3.0-develop-win.exe
                        </a>


                        {/*{openContent}*/}
                        {/*{teamSignUp}*/}
                        {/*{adminConsoleLink}*/}
                    </div>
                </div>
            </div>
        );
    }
}
