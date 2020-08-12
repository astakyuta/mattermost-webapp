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

export default class UpdateAutoLogoutUser extends React.Component {
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
            updateUserPassword: PropTypes.func.isRequired,
            getUser: PropTypes.func.isRequired,
            // getAuthorizedOAuthApps: PropTypes.func.isRequired,
            // deauthorizeOAuthApp: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = this.getDefaultState();
        this.user = '';
        this.userId = '';
    }

    getDefaultState() {
        return {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            passwordError: '',
            serverError: '',
            tokenError: '',
            // authService: this.props.user.auth_service,
            savingPassword: false,
            durationUpdated: false,
            nullDuration: '',
            username: '',
            autoLogoutDuration: '',
        };
    }

    componentDidMount() {
        this.getUserDetails();
        // console.log('user data is: ', this.user);
        this.userId = this.props.match.params.userid;
        console.log('this userId: ', this.userId);
    }

    UNSAFE_componentWillMount() { // eslint-disable-line camelcase
        // const {
        //     actions,
        //     currentUserRoles,
        // } = this.props;
        //
        // actions.loadRolesIfNeeded(currentUserRoles.split(' '));
    }


    saveAutoLogoutData = async (e) => {

        e.preventDefault();
        // this.setState({saving: true});

        if(this.state.autoLogoutDuration === '') {
            this.setState({nullDuration: true});
            return;
        }

        this.setState({savingPassword: true, nullDuration: false});

        console.log('this.user: ', this.user);
        // return ;

        // let source = {auto_logout_data: this.state.autoLogoutDuration};
        // const returnedTarget = Object.assign(this.user.data.notify_props, source);
        // // this.user.notify_props.auto_logout_data = this.state.autoLogoutDuration;
        //
        // console.log('this.user after: ', this.user);
        // console.log('const returnedTarget: ', returnedTarget);
        // return;

        let url = 'https://teamcomm.ga/api/v4/users/'+ this.userId +'/auto_logout';
        let putData = {
            auto_logout_duration: this.state.autoLogoutDuration,
            //user: this.user.data, // {"4bw1u1dbgibpfkwhj4qugjepmc": "true", "8fif14yoxb81fcnufbswxek8iw": "false"},
        };


        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(putData),
        })
            .then((response) => {
                console.log('response is: ', response);
                return response.json();
            })
            .then((data) => {
                console.log('data is: ', data);

                this.setState({
                    saving: false,
                    durationUpdated: true,
                });

                const timer = setTimeout(() => {
                    GlobalActions.back();
                }, 1000);
                return () => clearTimeout(timer);



                // this.sendAutoResponseUpdateToChannels(autoResponseData);

            }).catch((error) => {
            console.error('Error:', error);
        });

    }



    updateLogoutDuration = (e) => {
        this.setState({autoLogoutDuration: e.target.value});
    }



    handleBack = (e) => {
        e.preventDefault();
        GlobalActions.back();
    };

    clearError = (e) => {
        // e.preventDefault();
        //
        // this.setState({
        //     error: null,
        // });
    };

    getUserDetails = async () => {
        this.user = await this.props.actions.getUser(this.props.match.params.userid);

        if(this.user.data.notify_props.auto_logout_duration !== 'undefined' ||
            this.user.data.notify_props.auto_logout_duration !== '')
        {
            this.setState({
                autoLogoutDuration: this.user.data.notify_props.auto_logout_duration,
                username: this.user.data.username,
            });
        }
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

        // this.getUserDetails();
        // console.log('user data is: ', user);

        // let passwordError = null;
        // if (this.state.passwordError) {
        //     passwordError = <label className='control-label' style={{color: 'red'}}>{this.state.passwordError}</label>;
        //     // passwordDivStyle += ' has-error';
        // }

        let durationUpdated = null;
        if (this.state.durationUpdated) {
            durationUpdated = <label className='control-label' style={{color: 'red'}}><b>Auto logout duration has been set.</b></label>;
        }

        let nullDuration = null;
        if (this.state.nullDuration) {
            nullDuration = <label className='control-label' style={{color: 'red'}}><b>Duration field cannot be empty.</b></label>;
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



        // let user = await this.props.actions.getUser(this.props.match.params.userid).then(() => {
        //     this.setState({autoLogoutDuration: false});
        // });

        console.log('this state of logout duration: ', this.state.autoLogoutDuration);
        console.log('this user: ', this.user);

        console.log('param userid is: ', this.props.match.params);

        let currentDuration = parseInt(this.state.autoLogoutDuration)
            ? `${this.state.autoLogoutDuration} Minutes`
            : 'N/A';


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
                            // customDescriptionText="Enter the value in terms of minutes"
                            customDescriptionText={'Duration Now: '+ currentDuration}
                            siteName={'Set Auto Logout [ '+ this.state.username +' ]'}
                            // siteName='Set Auto Logout'
                        />

                        <form>
                            <div className='inner__content'>
                                <div className='margin--extra'>
                                    <h5 id='email_label'>
                                        <strong>
                                            <FormattedMessage
                                                id='user.settings.general.autoLogoutDuration'
                                                defaultMessage='Duration [In Minutes] [Enter 0 to Disable]'
                                            />
                                        </strong>
                                    </h5>
                                    <div className='form-group'>
                                        <input
                                            id='autoLogoutDuration'
                                            className='form-control'
                                            type='text'
                                            onChange={this.updateLogoutDuration}
                                            value={this.state.autoLogoutDuration}
                                            aria-label={Utils.localizeMessage('user.settings.security.newPassword', 'New Password')}
                                            // autoFocus={true}
                                            maxLength='128'
                                            spellCheck='false'
                                        />
                                        {nullDuration}

                                    </div>
                                </div>

                                <div className='margin--extra' style={{marginTop: '5%', textAlign: 'center'}}>
                                    <SaveButton
                                        btnClass='btn-primary'
                                        savingMessage="Saving..."
                                        saving={this.state.savingPassword}
                                        onClick={this.saveAutoLogoutData}
                                    />
                                    <br/>
                                    <br/>
                                    {durationUpdated}
                                </div>

                            </div>
                        </form>
                    </div>

                </div>
            </div>
        );
    }
}
