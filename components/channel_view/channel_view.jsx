// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';


import * as UserAgent from 'utils/user_agent.jsx';
import deferComponentRender from 'components/deferComponentRender';
import ChannelHeader from 'components/channel_header';
import CreatePost from 'components/create_post';
import FileUploadOverlay from 'components/file_upload_overlay.jsx';
import PostView from 'components/post_view';
import TutorialView from 'components/tutorial';
import {clearMarks, mark, measure, trackEvent} from 'actions/diagnostics_actions.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import store from "../../stores/redux_store";
import Constants from "../../utils/constants";
import {browserHistory} from "../../utils/browser_history";
import {getCurrentRelativeTeamUrl, getCurrentTeamId, getTeam} from "mattermost-redux/selectors/entities/teams";
import {getRedirectChannelNameForTeam} from "mattermost-redux/selectors/entities/channels";
import {getTeamRelativeUrl} from "../../utils/utils";

import * as GlobalActions from 'actions/global_actions.jsx';


import 'rc-notification/assets/index.css';
import Notification from 'rc-notification';
let notification = null;
Notification.newInstance({}, (n) => notification = n);

export default class ChannelView extends React.PureComponent {
    static propTypes = {
        channelId: PropTypes.string.isRequired,
        deactivatedChannel: PropTypes.bool.isRequired,
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }).isRequired,
        showTutorial: PropTypes.bool.isRequired,
        channelIsArchived: PropTypes.bool.isRequired,
        viewArchivedChannels: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);

        this.createDeferredPostView();
        this.channelQueue = [];
        this.currentInQueueChannel = '';

        // this.state = {
        //     counterDuration: '',
        // };

        this.counterDuration = '';


        this.intervalKey = [];
        // this.redirectToChannel = this.redirectToChannel.bind();
    }

    createDeferredPostView = () => {
        this.deferredPostView = deferComponentRender(
            PostView,
            <div
                id='post-list'
                className='a11y__region'
                data-a11y-sort-order='1'
                data-a11y-focus-child={true}
                data-a11y-order-reversed={true}
            />
        );
    }

    redirectToChannel = (channel, teamId, key, action) => {
        // alert(JSON.stringify(channel));
        // alert(JSON.stringify(teamId));
        // alert(JSON.stringify(key));


        // alert(JSON.stringify(this.intervalKey[key]));

        // Clears interval and remove the alert
        clearInterval(this.intervalKey[key]);
        notification.removeNotice(key);



        // alert(JSON.stringify(this.channelQueue));

        let channelArr = [...this.channelQueue];
        let index = channelArr.indexOf(channel.id);
        // alert(JSON.stringify(index));
        channelArr.splice(index, 1);
        this.channelQueue = channelArr;

        if(action === 'close') {
            // alert(JSON.stringify(action));
            GlobalActions.sendAutoResponseToChannel(channel.id);
        } else if(action === 'redirect') {
            GlobalActions.redirectToChannel(channel, teamId);
        }

    }

    componentDidMount() {
        const platform = window.navigator.platform;

        $('body').addClass('app__body');

        // IE Detection
        if (UserAgent.isInternetExplorer() || UserAgent.isEdge()) {
            $('body').addClass('browser--ie');
        }

        // OS Detection
        if (platform === 'Win32' || platform === 'Win64') {
            $('body').addClass('os--windows');
        } else if (platform === 'MacIntel' || platform === 'MacPPC') {
            $('body').addClass('os--mac');
        }

        window.addEventListener('message', ({origin, data: {type, message = {}} = {}} = {}) => {
            // alert("message event fired before origin check 1");

            // alert(JSON.stringify(type));
            // alert(JSON.stringify(message));


            // console.log("messages before origin check: ", message.message);
            if (origin !== window.location.origin) {
                return;
            }
            switch (type) {
                // alert("comes under switch");
                case 'auto_response_update': {
                    // alert("auto_response_update event fired");
                    // console.log('auto_response_update event fired');
                    if (message.data.user.notify_props.auto_responder_duration !== '') {
                        this.counterDuration = message.data.user.notify_props.auto_responder_duration;
                    }
                    // alert(JSON.stringify(this.counterDuration));
                    break;
                }

                case 'auto-response-alert': {

                    // alert("auto_response_alert event fired");
                    // alert(JSON.stringify(message));
                    // console.log('messages are: ', message);

                    // alert(JSON.stringify(message.notifyProps.auto_responder_active));

                    // // For Not showing auto response if the user is present in the same channel
                    // let currentChannel = GlobalActions.getOpenedChannel();
                    // if(currentChannel === message.message.channel.name) {
                    //     // alert(JSON.stringify(message.message.channel.name));
                    //     return;
                    // }


                    // For Not letting auto-response-alert from the same channel, if it's currently showing in alert
                    let channelArr = [...this.channelQueue];
                    if(channelArr.includes(message.message.channel.id)) {
                        return;
                    }

                    // checks if auto responder is activated for the user
                    if(message.notifyProps.auto_responder_active !== "true") {
                        return;
                    }


                    // if(message.message.teamId !== 'undefined' || message.message.teamId !== '') {
                    //     console.log('teamId props exists');
                    //     // alert(JSON.stringify(message.message.teamId));
                    // }
                    //
                    // if(message.notifyProps !== 'undefined' || message.notifyProps !== '') {
                    //     console.log('notify props duration exists');
                    //     alert(JSON.stringify(message.notifyProps));
                    // }

                    // let intervalKey;

                    if(message.message) {

                        // this.channelQueue.push(message.message.channelId);

                        let channel = message.message.channel;
                        this.channelQueue.push(channel.id);

                        // alert(JSON.stringify(channel));
                        let teamId = message.message.teamId;
                        // alert(JSON.stringify(teamId));

                        const key = Date.now();
                        let counter = '';

                        let sender = channel.display_name;

                        if(this.counterDuration === '') {
                            counter = parseInt(message.notifyProps.auto_responder_duration);// counter = 0; // parseInt(payload.notifyProps.auto_responder_duration);
                        } else {
                            counter = parseInt(this.counterDuration);
                        }



                        const initialProps = {
                            // content: `You have a new unread message: ${counter}s`, // `You have a new unread message: ${counter}s`,
                            content: <div>
                                <h5>New Message From <b>{sender}</b></h5>
                                <p>Auto response will be sent in: {--counter} seconds</p>
                                <button style={{backgroundColor: '#ffffff', color: '#145dbf'}}>
                                    View Message
                                </button>
                            </div>,
                            key,
                            duration: counter,
                            closable: false,
                            style: {
                                backgroundColor: '#145dbf',
                                color: '#ffffff',
                                // right: '50%',
                            },
                            onClose: () => {
                                // counter = 0;
                                this.redirectToChannel(channel, teamId, key, 'close');
                            },
                        };

                        notification.notice(initialProps);
                        // this.intervalKey[key] = setInterval(() => {
                        console.log('comes before newInterval');
                        let newInterval = setInterval(() => {
                            notification.notice({ ...initialProps,
                                // content: `You have a new unread message: ${--counter}s` });
                                content: <div>
                                    <h5>New Message From <b>{sender}</b></h5>
                                    <p>Auto response will be sent in: {--counter} seconds</p>
                                    <button
                                        style={{backgroundColor: '#ffffff', color: '#145dbf'}}
                                        onClick={_=> this.redirectToChannel(channel, teamId, key, 'redirect')}>
                                        View Message
                                    </button>
                                </div>
                            });
                        }, 1000);

                        console.log('comes before this intervalKey');
                        // this.intervalKey.push({key: newInterval});
                        this.intervalKey[key] = newInterval;
                        // alert(JSON.stringify(this.intervalKey));
                        console.log('comes after this intervalKey');

                    }
                    break;
                } // end of case

            }
        });
    }

    componentWillUnmount() {
        $('body').removeClass('app__body');
        // window.removeEventListener('message', ());
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.match.url !== nextProps.match.url) {
            this.createDeferredPostView();
        }
    }

    getChannelView = () => {
        return this.refs.channelView;
    }

    onClickCloseChannel = () => {
        this.props.actions.goToLastViewedChannel();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channelId !== this.props.channelId || prevProps.channelIsArchived !== this.props.channelIsArchived) {
            mark('ChannelView#componentDidUpdate');

            const [dur1] = measure('SidebarChannelLink#click', 'ChannelView#componentDidUpdate');
            const [dur2] = measure('TeamLink#click', 'ChannelView#componentDidUpdate');

            clearMarks([
                'SidebarChannelLink#click',
                'ChannelView#componentDidUpdate',
                'TeamLink#click',
            ]);

            if (dur1 !== -1) {
                trackEvent('performance', 'channel_switch', {duration: Math.round(dur1)});
            }
            if (dur2 !== -1) {
                trackEvent('performance', 'team_switch', {duration: Math.round(dur2)});
            }
            if (this.props.channelIsArchived && !this.props.viewArchivedChannels) {
                this.props.actions.goToLastViewedChannel();
            }
        }

        // window.addEventListener('message', ({origin, data: {type, message = {}} = {}} = {}) => {
        //     if (origin !== window.location.origin) {
        //         return;
        //     }
        //     switch (type) {
        //
        //         case 'auto_response_update': {
        //             console.log('auto_response_update event fired');
        //             if (message.data.user.notify_props.auto_responder_duration !== '') {
        //                 this.counterDuration = message.data.user.notify_props.auto_responder_duration;
        //             }
        //             alert(JSON.stringify(this.counterDuration));
        //             break;
        //         }
        //
        //     }
        // });


    }




    render() {

        // window.addEventListener('message', ({origin, data: {type, message = {}} = {}} = {}) => {
        //     if (origin !== window.location.origin) {
        //         return;
        //     }
        //     switch (type) {
        //
        //         case 'auto-response-alert': {
        //             console.log('messages are: ', message);
        //
        //             const key = Date.now();
        //             notification.notice({
        //                 content: <div>
        //                     <p>click below button to close</p>
        //                     <button onClick={close.bind(null, key)}>close</button>
        //                 </div>,
        //                 key,
        //                 duration: 5,
        //                 closable: true,
        //             });
        //         }
        //
        //     }
        // });

        const {channelIsArchived} = this.props;
        // if (this.props.showTutorial) {
        //     return (
        //         <TutorialView
        //             isRoot={false}
        //         />
        //     );
        // }

        let createPost;
        if (this.props.deactivatedChannel) {
            createPost = (
                <div
                    className='post-create-message'
                >
                    <FormattedMessage
                        id='create_post.deactivated'
                        defaultMessage='You are viewing an archived channel with a deactivated user.'
                    />
                </div>
            );
        } else {
            createPost = (
                <div
                    className='post-create__container'
                    id='post-create'
                >
                    {!channelIsArchived &&
                        <CreatePost
                            getChannelView={this.getChannelView}
                        />
                    }
                    {channelIsArchived &&
                        <div className='channel-archived__message'>
                            <FormattedMarkdownMessage
                                id='archivedChannelMessage'
                                defaultMessage='You are viewing an **archived channel**. New messages cannot be posted.'
                            />
                            <button
                                className='btn btn-primary channel-archived__close-btn'
                                onClick={this.onClickCloseChannel}
                            >
                                <FormattedMessage
                                    id='center_panel.archived.closeChannel'
                                    defaultMessage='Close Channel'
                                />
                            </button>
                        </div>
                    }
                </div>
            );
        }

        const DeferredPostView = this.deferredPostView;

        return (
            <div
                ref='channelView'
                id='app-content'
                className='app__content'
            >
                <FileUploadOverlay overlayType='center'/>
                <ChannelHeader
                    channelId={this.props.channelId}
                />
                <DeferredPostView
                    channelId={this.props.channelId}
                />
                {createPost}
            </div>
        );
    }
}
