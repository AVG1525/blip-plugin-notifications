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

    //console.log('#### ITEMS SCHEDULE ####');
    //console.log(items);
    return filterValues(items, filterByBroadcast);
};

const getNotifications = async (messageId, skip = 0, tipo = 0, take = 100) => {
    const {
        response: { items, total }
    } = await IframeMessageProxy.sendMessage({
        action: 'sendCommand',
        content: {
            destination: 'MessagingHubService',
            command: {
                method: 'get',
                uri: `/notifications?$skip=${skip}&$take=${take}&id=${messageId}`
            }
        }
    });

    if (tipo == 0) return filterValues(items, filterByPhone);
    else if (tipo == 1) return total;
};

const filterByBroadcast = (schedule) => {
    const MESSAGE_BROADCAST = "wpp"
    return schedule.message.to.toLowerCase().includes(MESSAGE_BROADCAST);
}

const filterByPhone = (phone) => {
    const REGEX_EXPRESSION = new RegExp("\\+?\\(?\\d*\\)? ?\\(?\\d+\\)?\\d*([\\s./-]?\\d{2,})+", "g");
    return REGEX_EXPRESSION.test(phone.from);
}

const filterValues = (values, condition) => {
    return values.filter(condition);
}

export {
    getApplication,
    getContacts,
    getThreads,
    getScheduledMessages,
    getNotifications
};
