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

export async function showNotification({title, body, channel, teamId, requireInteraction, silent, notifyProp, onClick} = {}) {

    console.log('comes under show notification');
    console.log('under show notification props: ', notifyProp);
    let icon = icon50;
    if (UserAgent.isEdge()) {
        icon = iconWS;
        console.log('icon is: ', icon);
    }

    if (!('Notification' in window)) {
        console.log('n 1');
        throw new Error('Notification not supported');
    }

    if (typeof Notification.requestPermission !== 'function') {
        console.log('n 2');
        throw new Error('Notification.requestPermission not supported');
    }


    // if (Notification.permission !== 'granted' && requestedNotificationPermission) {
    //     console.log('n 3');
    //     console.log('notification permission in grant: ', Notification.permission);
    //     console.log('requestedNotificationPermission: ', requestedNotificationPermission);
    //     console.log('all notification: ', Notification);
    //     throw new Error('Notifications already requested but not granted');
    // }


    requestedNotificationPermission = true;

    let permission = await Notification.requestPermission();
    console.log('permission: ', permission);
    if (typeof permission === 'undefined') {
        // Handle browsers that don't support the promise-based syntax.
        permission = await new Promise((resolve) => {
            let aa = Notification.requestPermission(resolve);
            console.log('aa: ', aa);
        });
        console.log('permission under undefined: ', permission);
    }

    // if (permission !== 'granted') {
    //     throw new Error('Notifications not granted');
    // }

    // this section is not needed because the for sending notification, postMessage has been used, so that the host machine can take care of the notifications.
    // const notification = new Notification(title, {
    //     body,
    //     tag: body,
    //     icon,
    //     requireInteraction,
    //     silent,
    // });
    //
    // // notification.close();
    //
    // console.log('notification is: ', notification);
    //
    // if (onClick) {
    //     console.log("comes under onclick");
    //     notification.onclick = onClick;
    // }

    sendNativeDesktopNotification(title, body, channel, teamId, requireInteraction, silent, notifyProp, onClick);

    // // Mac desktop app notification dismissal is handled by the OS
    // if (!requireInteraction && !UserAgent.isMacApp()) {
    //     setTimeout(() => {
    //         notification.close();
    //     }, Constants.DEFAULT_NOTIFICATION_DURATION);
    // }
    //
    // return () => {
    //     notification.close();
    // };
}

function sendNativeDesktopNotification(title, body, channel, teamId, requireInteraction, silent, notifyProp, onClick) {
    const payload = {
        type: 'dispatch-notification',
        message: {
            title,
            body,
            channel,
            teamId,
            requireInteraction,
            silent,
            notifyProp,
        }
    };
    console.log('sendNativeDesktopNotification notifyprops: ', notifyProp);
    window.postMessage(payload, '*');

    // window.addEventListener('ipc-message', event => {
    //     console.log('event channel is: ', event.channel);
    // });

    // window.addEventListener("new-message-reply", function(evt) {
    //     console.log('notification has arrived');
    //     console.log('event data: ', evt);
    // });

}