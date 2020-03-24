// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as UserAgent from 'utils/user_agent.jsx';
import Constants from 'utils/constants.jsx';
import icon50 from 'images/icon50x50.png';
import iconWS from 'images/icon_WS.png';

let requestedNotificationPermission = false;

// showNotification displays a platform notification with the configured parameters.
//
// If successful in showing a notification, it resolves with a callback to manually close the
// notification. Notifications that do not require interaction will be closed automatically after
// the Constants.DEFAULT_NOTIFICATION_DURATION. Not all platforms support all features, and may
// choose different semantics for the notifications.

export async function showNotification({title, body, channel, teamId, requireInteraction, silent, onClick} = {}) {

    console.log('comes under show notification');
    let icon = icon50;
    if (UserAgent.isEdge()) {
        icon = iconWS;
    }

    if (!('Notification' in window)) {
        throw new Error('Notification not supported');
    }

    if (typeof Notification.requestPermission !== 'function') {
        throw new Error('Notification.requestPermission not supported');
    }

    if (Notification.permission !== 'granted' && requestedNotificationPermission) {
        throw new Error('Notifications already requested but not granted');
    }

    requestedNotificationPermission = true;

    let permission = await Notification.requestPermission();
    if (typeof permission === 'undefined') {
        // Handle browsers that don't support the promise-based syntax.
        permission = await new Promise((resolve) => {
            Notification.requestPermission(resolve);
        });
    }

    if (permission !== 'granted') {
        throw new Error('Notifications not granted');
    }

    const notification = new Notification(title, {
        body,
        tag: body,
        icon,
        requireInteraction,
        silent,
    });

    if (onClick) {
        notification.onclick = onClick;
    }

    sendNativeDesktopNotification(title, body, channel, teamId, requireInteraction, silent, onClick);

    // Mac desktop app notification dismissal is handled by the OS
    if (!requireInteraction && !UserAgent.isMacApp()) {
        setTimeout(() => {
            notification.close();
        }, Constants.DEFAULT_NOTIFICATION_DURATION);
    }

    return () => {
        notification.close();
    };
}

function sendNativeDesktopNotification(title, body, channel, teamId, requireInteraction, silent) {
    const payload = {
        type: 'dispatch-notification',
        message: {
            title,
            body,
            channel,
            teamId,
            requireInteraction,
            silent,
        }
    };
    console.log('channel under dispatch: ', channel);
    window.postMessage(payload, '*');

    // window.addEventListener('ipc-message', event => {
    //     console.log('event channel is: ', event.channel);
    // });

    // window.addEventListener("new-message-reply", function(evt) {
    //     console.log('notification has arrived');
    //     console.log('event data: ', evt);
    // });

}