// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils';

class AppQuitModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current user id.
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current team id.
         */
        currentTeamId: PropTypes.string.isRequired,

        /**
         * hide action
         */

        onHide: PropTypes.func.isRequired,

        /**
         * show or hide modal
         */

        show: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        actions: PropTypes.shape({

            /**
             * An action to remove user from team
             */

            leaveTeam: PropTypes.func.isRequired,

            /**
             * An action to toggle the right menu
             */

            toggleSideBarRightMenu: PropTypes.func.isRequired,
        }),
    };

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleSubmit(e);
        }
    };

    handleSubmit = () => {
        let status = true;
        const payload = {
            type: 'quit-app',
            message: {
                status,
            }
        };
        window.postMessage(payload, '*');
        this.props.onHide();
        // this.props.actions.leaveTeam(this.props.currentTeamId, this.props.currentUserId);
        // this.props.actions.toggleSideBarRightMenu();
    };

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal'
                className='modal-confirm'
                show={this.props.show}
                onHide={this.props.onHide}
                id='leaveTeamModal'
                role='dialog'
                aria-labelledby='leaveTeamModalLabel'
            >
                <Modal.Header closeButton={false}>
                    <Modal.Title
                        componentClass='h1'
                        id='leaveTeamModalLabel'
                    >
                        <FormattedMessage
                            id='quit_app'
                            defaultMessage='Quit App'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormattedMessage
                        id='quit_app_desc'
                        defaultMessage='Are you sure?'
                    />
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-link'
                        onClick={this.props.onHide}
                        id='leaveTeamNo'
                    >
                        <FormattedMessage
                            id='leave_team_modal.no'
                            defaultMessage='No'
                        />
                    </button>
                    <button
                        type='button'
                        className='btn btn-danger'
                        onClick={this.handleSubmit}
                        id='leaveTeamYes'
                    >
                        <FormattedMessage
                            id='leave_team_modal.yes'
                            defaultMessage='Yes'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default injectIntl(AppQuitModal);
