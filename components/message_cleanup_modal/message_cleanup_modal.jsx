// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import SaveButton from "../save_button";
import {localizeMessage} from "../../utils/utils";

export default class MessageCleanupModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        currentTeam: PropTypes.object.isRequired,
        onHide: PropTypes.func.isRequired,
        onLoad: PropTypes.func,
        actions: PropTypes.shape({
            patchTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            autoCleanupDuration: 0,
            saving: false,
            durationUpdated: false,
            error: false,
            errorMessage: null
        }
    }

    componentDidMount() {
        console.log('prps', this.props);
        if (this.props.onLoad) {
            this.props.onLoad();
        }

        let app = this;
        this.setState({
            autoCleanupDuration: app.props.currentTeam.message_cleanup_duration
        })
    }

    onHide = () => {
        this.props.onHide();
    }

    saveAutoCleanup = async() => {
        if(this.state.autoCleanupDuration === ''){
            this.setState({
                error: true,
                errorMessage: 'Duration field can not be empty.',
                durationUpdated: false
            })

            return;
        }

        var data = {...this.props.currentTeam};
        data.message_cleanup_duration = parseInt(this.state.autoCleanupDuration);
        const {error} = await this.props.actions.patchTeam(data);

        if (error) {
            this.setState({
                error: true,
                errorMessage: error.message
            })
        } else {
            this.setState({
                durationUpdated: true
            })
        }
    }

    onDurationChanged = (e) => {
        this.setState({autoCleanupDuration: e.target.value}, () => {console.log(this.state.autoCleanupDuration)});
    }

    render() {
        let durationUpdateMessage = null;
        if (this.state.durationUpdated) {
            durationUpdateMessage = <label className='control-label' style={{color: 'green'}}><b>Message auto cleanup duration has been updated.</b></label>;
        }

        return (
            <Modal
                dialogClassName='a11y__modal more-modal'
                show={this.props.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                role='dialog'
                aria-labelledby='teamMemberModalLabel'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='teamMemberModalLabel'
                    >
                        <FormattedMessage
                            id='team_member_modal.members'
                            defaultMessage={localizeMessage('', 'Manage Message Auto Cleanup') }
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div key='autoRespondDuration' className='form-group padding-top'>
                        <label className='col-sm-12 control-label'>
                            <FormattedMessage
                                id='user.settings.notifications.autoRespondDuration'
                                defaultMessage='Duration [In Days] [Enter 0 to Disable]'
                            />
                        </label>
                        <div className='col-sm-12'>
                            <input
                                id='cleanupDuration'
                                autoFocus={true}
                                className='form-control'
                                type='text'
                                onChange={this.onDurationChanged}
                                value={this.state.autoCleanupDuration}
                            />
                        </div>
                    </div>
                    <br/>
                    {this.state.error
                        ?
                        <div className='form-group' style={{marginTop: '5%', textAlign: 'left'}}>
                            <div className='col-sm-12'>
                            <label className='control-label' style={{color: 'red'}}><b>{this.state.errorMessage}</b></label>
                            </div>
                        </div>
                        : null
                    }

                    <br/>
                    <div style={{marginTop: '5%', textAlign: 'center'}}>
                        <SaveButton
                            btnClass='btn-primary'
                            savingMessage="Saving..."
                            saving={this.state.saving}
                            onClick={this.saveAutoCleanup}
                        />
                        <br/>
                        <div className='col-sm-12'>
                        {durationUpdateMessage}
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
