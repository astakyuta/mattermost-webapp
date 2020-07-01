// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
// import {FormattedMessage} from 'react-intl';

// import {browserHistory} from 'utils/browser_history';
import * as Utils from 'utils/utils.jsx';
// import ConfirmModal from 'components/confirm_modal.jsx';
// import DropdownIcon from 'components/icon/dropdown_icon';
//
// import Menu from 'components/widgets/menu/menu';
// import MenuWrapper from 'components/widgets/menu/menu_wrapper';
// import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action';

const ROWS_FROM_BOTTOM_TO_OPEN_UP = 3;

export default class AutoResponderStatusCheckbox extends React.Component {
    // static propTypes = {
    //     user: PropTypes.object.isRequired,
    //     currentUser: PropTypes.object.isRequired,
    //     teamMember: PropTypes.object.isRequired,
    //     teamUrl: PropTypes.string.isRequired,
    //     currentTeam: PropTypes.object.isRequired,
    //     index: PropTypes.number.isRequired,
    //     totalUsers: PropTypes.number.isRequired,
    //     actions: PropTypes.shape({
    //         getMyTeamMembers: PropTypes.func.isRequired,
    //         getMyTeamUnreads: PropTypes.func.isRequired,
    //         getUser: PropTypes.func.isRequired,
    //         getTeamMember: PropTypes.func.isRequired,
    //         getTeamStats: PropTypes.func.isRequired,
    //         getChannelStats: PropTypes.func.isRequired,
    //         updateTeamMemberSchemeRoles: PropTypes.func.isRequired,
    //         removeUserFromTeamAndGetStats: PropTypes.func.isRequired,
    //         updateUserActive: PropTypes.func.isRequired,
    //     }).isRequired,
    // }

    constructor(props) {
        super(props);
        this.state = {
            user: null,
            status: false,
        }

        let localAutoResponderActive = (localStorage.getItem('auto_responder_active') ? localStorage.getItem('auto_responder_active') : '');

        if(localAutoResponderActive != '') {
            // forEach(localAutoResponderActive, function (value, prop, obj) {
            localAutoResponderActive = JSON.parse(localAutoResponderActive);
            // console.log('localAutoResponderActive after parse: ', JSON.parse(localAutoResponderActive));
             for (var key in localAutoResponderActive) {
                // console.log('key is: ', key); // Todd, UK
                // console.log('value of key is: ', localAutoResponderActive[key]); // name, location
                if(key == this.props.user.id) {
                    console.log('comes under == if');
                    this.state = {
                        user: null,
                        status: ((localAutoResponderActive[key] == "true") ? true : false), // ((this.props.user.notify_props.auto_responder_active == "true") ? true : false),
                    }
                }
             }
        } else {
            console.log('comes under else part');
            this.state = {
                user: null,
                status: this.props.user.notify_props.auto_responder_active == "true",
            };
        }

        // this.state = {
        //     // serverError: null,
        //     // showDemoteModal: false,
        //     user: null,
        //     // role: null,
        //     status: ((this.props.user.notify_props.auto_responder_active == "true") ? true : false),
        // };

        // console.log(this.props.currentUser);
        // console.log(this.props.user);
    }

    handleAutoResponderStatus = (e) => {
        this.setState({
            status: e.target.checked,
        });
        console.log('e target status: ', e.target.checked);
        // console.log(this.props.currentUser);
        // console.log(this.props.user);
        this.props.onStatusUpdate(this.props.user, e.target.checked);
    };

    componentDidUpdate() {

        // let localAutoResponderActive = (localStorage.getItem('auto_responder_active') ? localStorage.getItem('auto_responder_message') : '');
        // if(localAutoResponderActive != '') {
        //    
        // }
        
        
        console.log('checkboxes on didupdate users: ', this.props.user);
        console.log('checkboxes on didupdate user: ', this.props.users);
    }

    render() {

        // console.log('status value: ', this.state.status);
        return (
            
                <div className='checkbox'>
                    <input
                        type='checkbox'
                        // ref='postall'
                        checked={ this.state.status }
                        // disabled={this.state.isSystemAdmin}
                        onChange={this.handleAutoResponderStatus}
                    />
                </div>
            
        );
    }
}
