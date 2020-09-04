// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {localizeMessage} from 'utils/utils.jsx';
import AutosizeTextarea from 'components/autosize_textarea.jsx';
import SaveButton from 'components/save_button.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import * as WebsocketActions from 'actions/websocket_actions.jsx';

import {Constants, SocketEvents } from 'utils/constants.jsx';
// import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';
// import TeamMembersDropdown from 'components/team_members_dropdown';
import AutoResponderStatusCheckbox from 'components/auto_responder_status_checkbox'
const USERS_PER_PAGE = 50;
const MESSAGE_MAX_LENGTH = 200;

export default class AutoResponseMemberListTeam extends React.Component {
    static propTypes = {
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.arrayOf(PropTypes.object).isRequired,
        teamMembers: PropTypes.object.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        totalTeamMembers: PropTypes.number.isRequired,
        canManageTeamMembers: PropTypes.bool,
        actions: PropTypes.shape({
            searchProfiles: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
            loadProfilesAndTeamMembers: PropTypes.func.isRequired,
            loadStatusesForProfilesList: PropTypes.func.isRequired,
            loadTeamMembersForProfilesList: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;
        this.statusObject = {};

        this.state = {
            loading: true,
            saving: false,
            autoResponderMessage: '',
            autoResponderDuration: '',
        };
    }

    componentDidMount() {
        this.props.actions.loadProfilesAndTeamMembers(0, Constants.PROFILE_CHUNK_SIZE, this.props.currentTeamId).then(({data}) => {
            if (data) {
                console.log('data are: ', data);
                this.loadComplete();
            }
        });

        this.props.actions.getTeamStats(this.props.currentTeamId);
    }

    componentDidUpdate() {

        try {
            if(this.props.users.length) {
                const {users} = this.props;

                let localAutoResponderMessage = (localStorage.getItem('auto_responder_message') ? localStorage.getItem('auto_responder_message') : '');
                let localAutoResponderDuration = (localStorage.getItem('auto_responder_duration') ? localStorage.getItem('auto_responder_duration') : '');;

                // console.log("localAutoResponderMessage: ", localAutoResponderMessage);
                // console.log("localAutoResponderDuration: ", localAutoResponderDuration);

                for (let a = 0; a < users.length; a++) {
                    if(typeof this.statusObject[users[a].id] == "undefined") {
                        this.statusObject[users[a].id] = users[a].notify_props.auto_responder_active;
                    }
                }

                if (this.state.autoResponderMessage != '') {
                    this.state.autoResponderMessage = this.state.autoResponderMessage;
                } else if (localAutoResponderMessage == '' && this.state.autoResponderMessage == '' && ( typeof users[0].notify_props.auto_responder_message != "undefined")) {
                    this.state.autoResponderMessage = users[0].notify_props.auto_responder_message;
                } else if (localAutoResponderMessage != '') {
                    this.state.autoResponderMessage = localAutoResponderMessage;
                }

                if (this.state.autoResponderDuration != '') {
                    this.state.autoResponderDuration = this.state.autoResponderDuration;
                } else if (localAutoResponderDuration == '' && this.state.autoResponderDuration == '' && ( typeof users[0].notify_props.auto_responder_duration != "undefined")) {
                    this.state.autoResponderDuration = users[0].notify_props.auto_responder_duration;
                } else if (localAutoResponderDuration != '') {
                    this.state.autoResponderDuration = localAutoResponderDuration;
                }

            }
        } catch (e) {
            console.log(e);
        }

    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = '';
                return;
            }

            const searchTimeoutId = setTimeout(
                async () => {
                    const {
                        loadStatusesForProfilesList,
                        loadTeamMembersForProfilesList,
                        searchProfiles,
                    } = nextProps.actions;
                    const {data} = await searchProfiles(searchTerm, {team_id: nextProps.currentTeamId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    loadStatusesForProfilesList(data);
                    loadTeamMembersForProfilesList(data, nextProps.currentTeamId).then(({data: membersLoaded}) => {
                        if (membersLoaded) {
                            this.loadComplete();
                        }
                    });
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    loadComplete = () => {
        this.setState({loading: false});
    }

    nextPage = (page) => {
        this.props.actions.loadProfilesAndTeamMembers(page + 1, USERS_PER_PAGE);
    }

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    onStatusUpdate = (user, status) => {
        this.statusObject[user.id]= status.toString();
        console.log('checkbox clicked: ', this.statusObject);

        // localStorage.removeItem('auto_responder_active');
        // localStorage.setItem('auto_responder_active', JSON.stringify(this.statusObject));
    }

    onMessageChanged = (e) => {
        // localStorage.removeItem('auto_responder_message');
        // localStorage.setItem('auto_responder_message', e.target.value);

        this.setState({autoResponderMessage: e.target.value}, () => {console.log(this.state.autoResponderMessage)});
    };

    onDurationChanged = (e) => {
        // localStorage.removeItem('auto_responder_duration');
        // localStorage.setItem('auto_responder_duration', e.target.value);

        this.setState({autoResponderDuration: e.target.value}, () => {console.log(this.state.autoResponderDuration)});
    }

    saveAutoResponseData = (e) => {

        this.setState({saving: true});
        let url = '/api/v4/users/auto_response/save';
        let autoResponseData = {
            status: this.statusObject, // {"4bw1u1dbgibpfkwhj4qugjepmc": "true", "8fif14yoxb81fcnufbswxek8iw": "false"},
            message: this.state.autoResponderMessage,
            duration: this.state.autoResponderDuration,
        };

        // this.setState({
        //     saving: false,
        // });
        //
        // this.sendAutoResponseUpdateToChannels(autoResponseData);
        //
        // this.props.onHide();
        //
        // localStorage.removeItem('auto_responder_message');
        // localStorage.removeItem('auto_responder_duration');
        // localStorage.removeItem('auto_responder_active');
        //
        //
        // localStorage.setItem('auto_responder_message', this.state.autoResponderMessage);
        // localStorage.setItem('auto_responder_duration', this.state.autoResponderDuration);
        // localStorage.setItem('auto_responder_active', JSON.stringify(this.statusObject));
        //
        // return;

        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(autoResponseData),
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);

            // for (let i = 0; i < this.props.users; i++) {
            //     this.props.users[i].notify_props.auto_responder_duration = this.state.autoResponderDuration;
            //     this.props.users[i].notify_props.auto_responder_message = this.state.autoResponderMessage;
            //     const user = Object.assign({}, this.props.users[i]);
            //
            //     // this.props.users[i].notify_props.auto_responder_active = this.state.autoResponderMessage;
            // }


            this.setState({
                saving: false,
                // autoResponderMessage: '',
                // autoResponderDuration: '',
            });

            // this.sendAutoResponseUpdateToChannels(autoResponseData);

            this.props.onHide();

            localStorage.removeItem('auto_responder_message');
            localStorage.removeItem('auto_responder_duration');
            localStorage.removeItem('auto_responder_active');


            localStorage.setItem('auto_responder_message', this.state.autoResponderMessage);
            localStorage.setItem('auto_responder_duration', this.state.autoResponderDuration);
            localStorage.setItem('auto_responder_active', JSON.stringify(this.statusObject));


        }).catch((error) => {
            console.error('Error:', error);
        });

    }

    sendAutoResponseUpdateToChannels = (autoResponseData) => {
        console.log('auto response update: ', autoResponseData);
        // WebSocketClient.autoResponseUpdate(autoResponseData);

        const us = this.props.users;
        console.log('us are: ', us);
        for (let i = 0; i < us.length; i++) {
            let user = us[i];

            user.notify_props.auto_responder_active = "true";
            user.notify_props.auto_responder_message = autoResponseData.message;
            user.notify_props.auto_responder_duration = autoResponseData.duration;

            let msg = {
                event: SocketEvents.USER_UPDATED, // USER_UPDATED,
                data: {
                    user: user,
                },
                broadcast: {
                    omit_users: null,
                    user_id: user.id,
                    "channel_id": "",
                    "team_id": ""
                },
                "seq": i,
            };

            // WebsocketActions.handleEvent(msg);
            console.log('user no: ', msg);
        }




        // const payload = {
        //     type: 'auto-response-update',
        //     message: {
        //         autoResponseData,
        //     }
        // };
        // window.postMessage(payload, '*');

        console.log('window is: ', window);

    }



    render() {

        console.log('users: ', this.props.users);

        let autoResponderStatusCheckbox = null;
        if (this.props.canManageTeamMembers) {
            autoResponderStatusCheckbox = [AutoResponderStatusCheckbox];
        }

        const teamMembers = this.props.teamMembers;
        const users = this.props.users;
        const actionUserProps = {};

        let usersToDisplay;
        if (this.state.loading) {
            usersToDisplay = null;
        } else {
            usersToDisplay = [];

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (teamMembers[user.id] && user.delete_at === 0) {
                    usersToDisplay.push(user);
                    actionUserProps[user.id] = {
                        // teamMember: teamMembers[user.id],
                        onStatusUpdate: this.onStatusUpdate
                    };
                }
            }
        }

        return (
            <div>

                <div className='auto-responder-user-list-scroll'>
                    <SearchableUserList
                        users={usersToDisplay}
                        usersPerPage={USERS_PER_PAGE}
                        total={this.props.totalTeamMembers}
                        nextPage={this.nextPage}
                        search={this.search}
                        actions={autoResponderStatusCheckbox}
                        actionUserProps={actionUserProps}
                        focusOnMount={!UserAgent.isMobile()}
                    />
                </div>
                <div id='autoResponderMessage' key='autoResponderMessage'>
                    <div style={{padding: '15px', marginTop: '5%'}}>
                        <textarea className='form-control'
                            id='autoResponderMessageInput'
                            className='form-control'
                            rows='5'
                            value={this.state.autoResponderMessage}
                            placeholder={localizeMessage('user.settings.notifications.autoResponderPlaceholder', 'Message')}
                            maxLength={MESSAGE_MAX_LENGTH}
                            onChange={this.onMessageChanged}
                        />

                        {/*<AutosizeTextarea*/}
                        {/*    style={{resize: 'none'}}*/}
                        {/*    id='autoResponderMessageInput'*/}
                        {/*    className='form-control'*/}
                        {/*    rows='5'*/}
                        {/*    placeholder={localizeMessage('user.settings.notifications.autoResponderPlaceholder', 'Message')}*/}
                        {/*    // value={autoResponderMessage}*/}
                        {/*    // maxLength={MESSAGE_MAX_LENGTH}*/}
                        {/*    // onChange={this.onMessageChanged}*/}
                        {/*/>*/}
                    </div>
                </div>
                <div key='autoRespondDuration' className='form-group padding-top'>
                    <label className='col-sm-4 control-label'>
                        <FormattedMessage
                            id='user.settings.notifications.autoRespondDuration'
                            defaultMessage='Auto Response Duration'
                        />
                    </label>
                    <div className='col-sm-2'>
                        <input
                            id='autoRespondDuration'
                            // autoFocus={true}
                            className='form-control'
                            type='text'
                            onChange={this.onDurationChanged}
                            value={this.state.autoResponderDuration}
                        />
                    </div>
                </div>
                <br/>
                <div style={{marginTop: '5%', textAlign: 'center'}}>
                    <SaveButton
                        btnClass='btn-primary'
                        savingMessage="Saving..."
                        saving={this.state.saving}
                        onClick={this.saveAutoResponseData}
                    />
                </div>

            </div>
        );
    }
}
