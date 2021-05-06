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
import './AppComponent.css';
import Pagination from 'react-js-pagination';

const TABLE_SCHEDULES_MODEL = [
    { label: 'Nome', key: 'name' },
    { label: 'Quando', key: 'when' },
    { label: 'Status', key: 'status' },
    { label: 'Notification Id', key: 'message'},
    { label: 'To', key:'to'}
];

const TABLE_MESSAGES_MODEL = [
    { label: 'Evento', key: 'event' },
    { label: 'Fone', key: 'from' }
];

const AppComponent = () => {

    var regex = new RegExp("\\+?\\(?\\d*\\)? ?\\(?\\d+\\)?\\d*([\\s./-]?\\d{2,})+", "g");

    const [application, setApplication] = useState({});
    const [schedules, setSchedules] = useState([]);
    //const [notifications, setNotifications] = useState([]);
    const [notificationsAux, setnotificationsAux] = useState([]);

    const [allNotifications, setAllNotifications] = useState([]);
    //const [totalNotifications, setTotalNotifications] = useState([]);
    //const [eventFilter, setEventFilter] = useState(String);
    const [notificationsFilted, setNotificationsFilted] = useState([]);
    //const [messageId, setMessageId] = useState(String);

    const [hideList, setHideList] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [currentPage, setCurrentpage] = useState(1);
    const [total, setTotal] = useState(0);

    const recordPerpage = 10;//10; //2

    const pageRange = 10;

    //const totalRecords = 0;

    const handlePageChange = async (pageNumber, testFilter) => {
        setCurrentpage(pageNumber);
        /*var pgnb = 0;
        if(pageNumber == 1)
            pgnb = 0;
        else
            pgnb = pageNumber*recordPerpage;*/
        //var mid = localStorage.getItem('messageId');
        // debugger;
        //setNotifications(await getNotifications(mid, pgnb, 0, recordPerpage));
        //setnotificationsAux(await getNotifications(mid, pgnb, 0, recordPerpage));
        let testePgn = (pageNumber - 1) * recordPerpage;
        let number = testePgn + recordPerpage;
        let teste;

        if (testFilter != undefined) {
            teste = testFilter.slice(testePgn, number);
        } else {
            teste = notificationsFilted.slice(testePgn, number);
        }

        //setNotifications(teste);
        setnotificationsAux(teste);
    }

    const fetchApi = async () => {
        setLoading(true);
        setApplication(await getApplication());
        setSchedules(await getScheduledMessages());
        setLoading(false);
        showToast({
            type: 'success',
            message: 'Dados carregados'
        });
    };

    useEffect(() => {
        withLoading(async () => {
            await fetchApi();
        });
    }, []);

    const title = `Sample Plugin - ${application.shortName}`;

    const handleDetalhes = async (messageId) => {
        console.log('messageId= ' + messageId);
        //sessionStorage.setItem('messageId', messageId);

        setHideList(true);
        setLoading(true);

        await getAllNotifications(messageId);

        let getAllNotificationsTwo = await getNotifications(messageId, 0, 0, recordPerpage);

        //setNotifications(getAllNotificationsTwo);
        setnotificationsAux(getAllNotificationsTwo);

        //setTotal(localStorage.getItem('total'));
        setLoading(false);
    }

    const backToList = (event) => {
        clearUseStates();
        event.preventDefault();
        setHideList(false);
    }

    const clearUseStates = () => {
        setCurrentpage(1);
    }

    const getAllNotifications = async (messageId) => {
        const MAXIMUM_NUMBER_OF_NOTIFICATIONS = 100;
        let totalNotifications = parseInt(await getNotifications(messageId, 0, 1) / MAXIMUM_NUMBER_OF_NOTIFICATIONS);
        let getAllNotifications = [];

        for (let index = 0; index < (totalNotifications + 1); ++index) {
            let skipByIndex = MAXIMUM_NUMBER_OF_NOTIFICATIONS * index;
            let takeByIndex = MAXIMUM_NUMBER_OF_NOTIFICATIONS * (index + 1);
            let getNotificationsBySkipAndTake = await getNotifications(messageId, skipByIndex, 0, takeByIndex);
            getAllNotifications.push(...getNotificationsBySkipAndTake);
        }

        //setTotalNotifications(totalNotifications);
        setTotal(getAllNotifications.length);
        setAllNotifications(getAllNotifications);
        setNotificationsFilted(getAllNotifications);
    }

    const handleSelectEvent = async (event) => {
        let { name, value } = event.target;
        //setEventFilter(value);
        /*console.log(`event: ${event}`)
        console.log(`notiAux: ${notificationsAux}`)

        var mid = localStorage.getItem('messageId');

        if (Object.keys(notifications).length === 0) {
            setNotifications(getNotifications(mid));
        }*/

        //debugger;

        let notificationsSelected = '';
        if (value === 'all') {
            notificationsSelected = allNotifications;
        } else {
            notificationsSelected = allNotifications.filter((arr) => {
                return arr.event == value;
            });
        }
        //setTotal(notifications.length);
        //setnotificationsAux(notificationsSelected.length);
        setTotal(notificationsSelected.length);
        setNotificationsFilted(notificationsSelected);
        setnotificationsAux(notificationsSelected);

        handlePageChange(1, notificationsSelected);
    };

    return (
        <CommonProvider>
            <div id="main" className="App text-center">
                <PageHeader title={title} />
                <PageTemplate title={title}>
                    {isLoading && (
                        <div className="container-loader">
                            <img src="https://safra.blip.ai/fonts/blip_logo.svg?4d7df62009a68ad9765c504f2c70ba68" />
                            <h3 className="text-center">Loading...</h3>
                        </div>
                    )}
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
                                                        : 'Visualizar Notificações'}
                                                </a>
                                            ),
                                            when: s.when,
                                            status: s.status,
                                            message: s.message.id,
                                            to: s.message.to
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
                                    <p className="margin-gl">
                                        <a
                                            className="btn btn-info"
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
                                    Tipo de evento:
                                    <select
                                        id="select-event"
                                        onChange={handleSelectEvent}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="accepted">accepted</option>
                                        <option value="received">received</option>
                                        <option value="consumed">consumed</option>
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
                                        <Pagination
                                        itemClass="page-item"
                                        linkClass="page-link"
                                        activePage={currentPage}
                                        itemsCountPerPage={recordPerpage}
                                        totalItemsCount={total}
                                        pageRangeDisplayed={pageRange}
                                        onChange={handlePageChange}
                                         />
                                         Mostrando {notificationsAux.length} de {total} registro(s).
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
