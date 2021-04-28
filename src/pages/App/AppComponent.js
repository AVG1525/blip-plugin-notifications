import React, { useEffect, useState } from 'react';
import 'blip-toolkit/dist/blip-toolkit.css';
import {
    getApplication,
    getScheduledMessages,
    getNotifications
} from 'api/application-service';
import { showToast, withLoading } from 'api/common-service';
import { PageHeader } from 'components/PageHeader';
import { BlipTable } from 'components/BlipTable';
import { CommonProvider } from 'contexts/CommonContext';
import { PageTemplate } from 'components/PageTemplate';
import { BlipTabs } from 'blip-toolkit';

const TABLE_SCHEDULES_MODEL = [
    { label: 'Name', key: 'name' },
    { label: 'When', key: 'when' },
    { label: 'Status', key: 'status' },
    { label: 'Notification Id', key: 'message' }
];

const TABLE_MESSAGES_MODEL = [
    { label: 'Event', key: 'event' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' }
];

const AppComponent = () => {
    const [application, setApplication] = useState({});
    const [schedules, setSchedules] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationsAux, setnotificationsAux] = useState([]);

    const fetchApi = async () => {
        setApplication(await getApplication());
        setSchedules(await getScheduledMessages());

        showToast({
            type: 'success',
            message: 'Success loaded'
        });
    };

    useEffect(() => {
        withLoading(async () => {
            new BlipTabs('tab-nav');
            await fetchApi();
        });
    }, []);

    const title = `Sample Plugin - ${application.shortName}`;

    const handleDetalhes = async (messageId) => {
        console.log(messageId);
        setNotifications(await getNotifications(messageId));
        setnotificationsAux(await getNotifications(messageId));
        localStorage.setItem('messageId', messageId);
    };

    const handleSelectEvent = async (event) => {
        let { name, value } = event.target;
        var mid = localStorage.getItem('messageId');
        if (Object.keys(notifications).length === 0) {
            setNotifications(getNotifications(mid));
        }

        let notificationsSelected = '';
        if (value == 'all') {
            notificationsSelected = notifications;
        } else {
            notificationsSelected = notifications.filter((arr) => {
                return arr.event == value;
            });
        }

        setnotificationsAux(notificationsSelected);
    };

    return (
        <CommonProvider>
            <div id="main" className="App">
                <PageHeader title={title} />
                <PageTemplate title={title}>
                    <div id="tab-nav" className="bp-tabs-container">
                        <ul className="bp-tab-nav">
                            <li>
                                {/* eslint-disable-next-line */}
                                <a href="#" data-ref="notifications">
                                    Notificações agendadas
                                </a>
                            </li>
                            <li>
                                {/* eslint-disable-next-line */}
                                <a href="#" data-ref="messagesnotifications">
                                    Notificações de Mensagens
                                </a>
                            </li>
                        </ul>
                        <div
                            className="bp-tab-content fl w-100"
                            data-ref="notifications"
                        >
                            <BlipTable
                                id_key="name"
                                model={TABLE_SCHEDULES_MODEL}
                                data={schedules
                                    .filter((s) => {
                                        return s.status === 'executed';
                                    })
                                    .map((s) => ({
                                        name: (
                                            <a
                                                style={{
                                                    color: '#3f7de8',
                                                    fontWeight: 'bold'
                                                }}
                                                href="#"
                                                onClick={() =>
                                                    handleDetalhes(s.message.id)
                                                }
                                            >
                                                {s.name
                                                    ? s.name
                                                    : 'Ver Notificações'}
                                            </a>
                                        ),
                                        when: s.when,
                                        status: s.status,
                                        message: s.message.id
                                    }))}
                                can_select={true}
                                body_height="400px"
                                selected_items={[]}
                            />
                        </div>
                        <div
                            className="bp-tab-content fl w-100"
                            data-ref="messagesnotifications"
                        >
                            <div>
                                Esolha o tipo de evento:
                                <select
                                    id="select-event"
                                    onChange={handleSelectEvent}
                                >
                                    <option value="all">Todos</option>
                                    <option value="accepted">accepted</option>
                                    <option value="Java">received</option>
                                    <option value="consumed">consumed</option>
                                    <option value="failed">failed</option>
                                </select>
                            </div>
                            <BlipTable
                                id_key="id"
                                model={TABLE_MESSAGES_MODEL}
                                data={notificationsAux.map((s) => ({
                                    event: s?.event,
                                    from: s?.from,
                                    to: s?.to
                                }))}
                                empty_message="Nenhum registro encontrado"
                                can_select={true}
                                body_height="400px"
                                selected_items={[]}
                            />
                        </div>
                    </div>
                </PageTemplate>
            </div>
        </CommonProvider>
    );
};

export { AppComponent };
