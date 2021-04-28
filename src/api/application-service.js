import { IframeMessageProxy } from 'iframe-message-proxy';

const getApplication = async () => {
    const { response: application } = await IframeMessageProxy.sendMessage({
        action: 'getApplication'
    });

    return application;
};

const getContacts = async () => {
    const {
        response: { items }
    } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
            destination: 'MessagingHubService',
            command: {
                method: 'get',
                uri: '/contacts'
            }
        }
    });

    return items;
};

const getThreads = async () => {
    const {
        response: { items }
    } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
            destination: 'MessagingHubService',
            command: {
                method: 'get',
                uri: '/threads'
            }
        }
    });

    return items;
};

const getScheduledMessages = async () => {
    const {
        response: { items }
    } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
            destination: 'MessagingHubService',
            command: {
                to: 'postmaster@scheduler.msging.net',
                method: 'get',
                uri: '/schedules?$skip=0&$take=100&$ascending=false'
            }
        }
    });

    console.log('#### ITEMS ####');
    console.log(items);
    return items;
};

const getNotifications = async (messageId, skip = 0) => {
    const {
        response: { items }
    } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
            destination: 'MessagingHubService',
            command: {
                method: 'get',
                uri:`/notifications?$skip=${skip}&$take=100&id=${messageId}`
            }
        }
    });

    console.log('#### ITEMS ####');
    console.log(items);
    return items;
};
export {
    getApplication,
    getContacts,
    getThreads,
    getScheduledMessages,
    getNotifications
};
