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
import * as Utils from "../../utils/utils";
import SaveButton from "../save_button";
import FormError from "../form_error";
import LocalStorageStore from "../../stores/local_storage_store";
import * as GlobalActions from 'actions/global_actions.jsx';

// import SelectTeamItem from './components/select_team_item.jsx';

// const TEAMS_PER_PAGE = 200;
// const TEAM_MEMBERSHIP_DENIAL_ERROR_ID = 'api.team.add_members.user_denied';

export default class UpdateProfileByAdmin extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
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

        actions: PropTypes.shape({
            // getMe: PropTypes.func.isRequired,
            updateMe: PropTypes.func.isRequired,
            getUser: PropTypes.func.isRequired,
            patchUser: PropTypes.func.isRequired,
            // getAuthorizedOAuthApps: PropTypes.func.isRequired,
            // deauthorizeOAuthApp: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = this.getDefaultState();
        this.userId = this.props.match.params.userid;
        console.log('this userId: ', this.userId);
    }

    getDefaultState() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            passwordError: '',
            serverError: '',
            tokenError: '',
            // authService: this.props.user.auth_service,
            savingName: false,
            nameUpdated: '',
            passwordsNull: '',
            username: '',
            currentUser: ''
        };
    }

    componentDidMount() {
        this.getUserDetails();
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

    submitName = async (e) => {
        e.preventDefault();

        console.log('props userdata: ', this.props);
        const user = this.state.currentUser;
        const currentPassword = 'Admin'; // this.state.currentPassword;
        const firstName = this.state.firstName;
        const lastName = this.state.lastName;
        const userId = this.userId;
        console.log('current user 1', user);

        const updatedUser = {...user, first_name: firstName, last_name: lastName, password: '@max10@f'};
        console.log('updated user', updatedUser);

        // if (currentPassword === '') {
        //     this.setState({passwordError: Utils.localizeMessage('user.settings.security.currentPasswordError', 'Please enter your current password.'), serverError: ''});
        //     return;
        // }
        //
        // const {valid, error} = Utils.isValidPassword(newPassword, this.props.passwordConfig);
        // if (!valid && error) {
        //     this.setState({
        //         passwordError: error,
        //         serverError: '',
        //     });
        //     return;
        // }

        if(lastName === '' || firstName === '') {
            const defaultState = Object.assign(this.getDefaultState(), {passwordsNull: true});
            this.setState(defaultState);
            return;
        }

        // if (newPassword !== confirmPassword) {
        //     const defaultState = Object.assign(this.getDefaultState(), {passwordError: Utils.localizeMessage('user.settings.security.passwordMatchError', 'The new passwords you entered do not match.'), serverError: ''});
        //     this.setState(defaultState);
        //     return;
        // }

        this.setState({savingName: true});

        const {data, error: err} = await this.props.actions.patchUser(
            updatedUser
        );
        if (data) {
            console.log('data is: ', data);

            const defaultState = Object.assign(this.getDefaultState(), {nameUpdated: true});
            this.setState(defaultState);

            const timer = setTimeout(() => {
                GlobalActions.back();
            }, 1000);
            return () => clearTimeout(timer);


            // const teamId = LocalStorageStore.getPreviousTeamId(this.props.currentUserId);
            // let channelName = LocalStorageStore.getPreviousChannelName(this.props.currentUserId, teamId);

            // this.props.updateSection('');
            // this.props.actions.getMe();
            // this.setState(this.getDefaultState());
        } else if (err) {
            console.log('error is: ', err);
            const state = this.getDefaultState();
            if (err.message) {
                state.serverError = err.message;
            } else {
                state.serverError = err;
            }
            state.nameError = '';
            this.setState(state);
        }
    }

    // updateCurrentPassword = (e) => {
    //     this.setState({currentPassword: e.target.value});
    // }

    updateFirstName = (e) => {
        this.setState({firstName: e.target.value, nameError: false});
    }

    updateLastName = (e) => {
        this.setState({lastName: e.target.value, nameError: false});
    }


    handleBack = (e) => {
        e.preventDefault();
        GlobalActions.back();
    };

    getUserDetails = async () => {
        this.user = await this.props.actions.getUser(this.props.match.params.userid);

        this.setState({
            username: this.user.data.username,
            currentUser: this.user.data
        });
    }

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

        let nameError = null;
        if (this.state.nameError) {
            nameError = <label className='control-label' style={{color: 'red'}}>{this.state.nameError}</label>;
            // passwordDivStyle += ' has-error';
        }

        let nameUpdated = null;
        if (this.state.nameUpdated) {
            nameUpdated = <label className='control-label' style={{color: 'red'}}><b>Name has been updated.</b></label>;
        }

        let nameErrorNull = null;
        if (this.state.nameErrorNull) {
            nameErrorNull = <label className='control-label' style={{color: 'red'}}><b>The First Name and Last Name fields cannot be empty.</b></label>;
        }

        let headerButton;
        headerButton = (
            <div className='signup-header'>
                <a
                    href='#'
                    id='logout'
                    onClick={this.handleBack}
                >
                    <LogoutIcon/>
                    <FormattedMessage
                        id='back'
                        defaultMessage='Back'
                    />
                </a>
            </div>
        );

        return (
            <div>
                <AnnouncementBar/>
                {/*<BackButton/>*/}
                {headerButton}
                <div
                    id='signup_email_section'
                    className='col-sm-12'
                >

                    <div className='signup-team__container padding--less'>
                        <SiteNameAndDescription
                            customDescriptionText="Change Name"
                            siteName={'Change Name [ '+ this.state.username +' ]'}
                        />

                        <form>
                            <div className='inner__content'>
                                <div className='margin--extra'>
                                    <h5 id='email_label'>
                                        <strong>
                                            <FormattedMessage
                                                id='user.settings.security.firstName'
                                                defaultMessage='First Name'
                                            />
                                        </strong>
                                    </h5>
                                    <div className='form-group'>
                                        <input
                                            id='firstName'
                                            className='form-control'
                                            type='text'
                                            onChange={this.updateFirstName}
                                            value={this.state.firstName}
                                            aria-label={Utils.localizeMessage('user.settings.security.firstName', 'First Name')}
                                            autoFocus={true}
                                            spellCheck='false'
                                        />

                                    </div>
                                </div>


                                <div className='margin--extra'>
                                    <h5 id='password_label'>
                                        <strong>
                                            <FormattedMessage
                                                id='user.settings.security.lastName'
                                                defaultMessage='Last Name'
                                            />
                                        </strong>
                                    </h5>
                                    <div className='form-group'>
                                        <input
                                            id='lastName'
                                            className='form-control'
                                            type='text'
                                            onChange={this.updateLastName}
                                            value={this.state.lastName}
                                            aria-label={Utils.localizeMessage('user.settings.security.lastName', 'Last Name')}
                                            spellCheck='false'
                                        />
                                        {nameError}
                                        {nameErrorNull}
                                    </div>
                                </div>

                                <div className='margin--extra' style={{marginTop: '5%', textAlign: 'center'}}>
                                    <SaveButton
                                        btnClass='btn-primary'
                                        savingMessage="Saving..."
                                        saving={this.state.savingName}
                                        onClick={this.submitName}
                                    />
                                    <br/>
                                    <br/>
                                    {nameUpdated}
                                </div>

                            </div>
                        </form>
                    </div>

                </div>
            </div>
        );
    }
}
