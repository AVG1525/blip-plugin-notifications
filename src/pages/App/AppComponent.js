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

const TABLE_SCHEDULES_MODEL = [
    { label: 'Nome', key: 'name' },
    { label: 'Quando', key: 'when' },
    { label: 'Status', key: 'status' },
    { label: 'Notification Id', key: 'message' }
];

const TABLE_MESSAGES_MODEL = [
    { label: 'Evento', key: 'event' },
    { label: 'Fone', key: 'from' }
];

const AppComponent = () => {
    const [application, setApplication] = useState({});
    const [schedules, setSchedules] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationsAux, setnotificationsAux] = useState([]);
    const [hideList, setHideList] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const fetchApi = async () => {
        setLoading(true);
        setApplication(await getApplication());
        setSchedules(await getScheduledMessages());
        setLoading(false);
        showToast({
            type: 'success',
            message: 'Success loaded'
        });
    };

    useEffect(() => {
        withLoading(async () => {
            await fetchApi();
        });
    }, []);

    const title = `Sample Plugin - ${application.shortName}`;

    const handleDetalhes = async (messageId) => {
        setHideList(true);
        setLoading(true);
        setNotifications(await getNotifications(messageId));
        setnotificationsAux(await getNotifications(messageId));
        localStorage.setItem('messageId', messageId);
        setLoading(false);
    };

    const backToList = (event) => {
        event.preventDefault();
        setHideList(false);
    };

    const handleSelectEvent = async (event) => {
        let { name, value } = event.target;
        var mid = localStorage.getItem('messageId');
        if (Object.keys(notifications).length === 0) {
            setNotifications(getNotifications(mid));
        }

        let notificationsSelected = '';
        if (value === 'all') {
            notificationsSelected = notifications;
        } else {
            notificationsSelected = notifications.filter((arr) => {
                return arr.event === value;
            });
        }

        setnotificationsAux(notificationsSelected);
    };

    return (
        <CommonProvider>
            <div id="main" className="App">
                <PageHeader title={title} />
                <PageTemplate title={title}>
                    {isLoading && <h1>Is Loading</h1>}
                    {!hideList && (
                        <div>
                            <h3 className="text-center">
                                Notificações agendadas
                            </h3>
                            <div className="row w-100">
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
                                                        handleDetalhes(
                                                            s.message.id
                                                        )
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
                        </div>
                    )}
                    {hideList && (
                        <div class="row">
                            <div class="col-12">
                                <h3 className="text-center">
                                    Lista de Notificações
                                </h3>
                                <div>
                                    <p>
                                        <a
                                            style={{
                                                color: '#3f7de8',
                                                fontWeight: 'bold'
                                            }}
                                            href="#"
                                            onClick={backToList}
                                        >
                                            Voltar
                                        </a>
                                    </p>
                                    Esolha o tipo de evento:
                                    <select
                                        id="select-event"
                                        onChange={handleSelectEvent}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="accepted">
                                            accepted
                                        </option>
                                        <option value="Java">received</option>
                                        <option value="consumed">
                                            consumed
                                        </option>
                                        <option value="failed">failed</option>
                                    </select>
                                </div>
                                <div id="divNotifications" class="row">
                                    <div class="col-12">
                                        <BlipTable
                                            id_key="id"
                                            model={TABLE_MESSAGES_MODEL}
                                            data={notificationsAux.map((s) => ({
                                                event: s?.event,
                                                from: s?.from
                                                    .split('/')[1]
                                                    .split('%')[0]
                                            }))}
                                            empty_message="Nenhum registro encontrado"
                                            can_select={true}
                                            body_height="400px"
                                            selected_items={[]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </PageTemplate>
            </div>
        </CommonProvider>
    );
};

export { AppComponent };
