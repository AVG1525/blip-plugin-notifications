import React, { useEffect, useState } from 'react';
import 'blip-toolkit/dist/blip-toolkit.css';
import { getApplication, getScheduledMessages } from 'api/application-service';
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

const AppComponent = () => {
    const [application, setApplication] = useState({});
    const [schedules, setSchedules] = useState([]);

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
                                        ...s,
                                        message: s.message.id
                                    }))}
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
