import { LoadingComponent } from 'app/components/common/loading';
import { NRDocument } from 'app/utils/models';
import { mapDispatchToProps } from 'app/store/dashboard/actions';
import { mapStateToProps } from 'app/store/dashboard/reducers';
import { DashboardDispatchers, DashboardReducerState } from 'app/store/dashboard/types';
import _ from 'lodash-es';
import * as React from 'react';
import { connect } from 'react-redux';
import date from 'date-and-time';

import { AppBar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { LinkedButton } from './components/LinkedButton';
import { styles } from './styles';
import MaterialTable from 'material-table';
import { Link } from 'react-router-dom';

export namespace Dashboard {

    export interface Props extends DashboardDispatchers, DashboardReducerState {
        classes?: any;
        history: any;
        match?: { params: any };
        location: any;
    }
    export interface State {
        submitted: boolean;
    }
}

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

    constructor(props: Dashboard.Props, context?: any) {
        super(props, context);
        this.state = { submitted: false };
    }

    async componentDidMount() {
        this.props.fetchDocuments();
    }

    async handleDelete(id: number) {

        await this.props.deleteDocument(id);
        this.props.fetchDocuments();

    }

    render() {

        const { classes, pending, documents } = this.props;
        
        return (
            <main className={classes.main}>
                <AppBar color="default" className={classes.appBar} style={{marginTop: "64px", padding: "16px"}}>
                    <LinkedButton />
                </AppBar>
                
                {(pending) ?
                    <LoadingComponent />
                :
                <div style={{width: "100%", padding: "24px 24px", marginTop: "132px"}}>
                    { <MaterialTable 
                        columns={[
                            {title: "Headline", field:"name", render: (document: NRDocument) => {
                                return <Link to={`/document/${document.id}/edit`}>
                                    {document.name}
                                </Link>
                            }},
                            
                            {title: "Workflow", field:"workflow.name", render: (document: NRDocument) => { 
                                if (!document.workflow)
                                    return <div>Undefined</div>

                                return <Link to={`/workflow/${document.workflow.id}/edit`}>
                                    {document.workflow.name}
                                </Link>

                            }},
                            {title: "Created", field:"created", searchable: true, render: (document: NRDocument) => { 
                                
                                try {
                                    var creationDate = date.format(document.created, 'M/D/YYYY')
                                    return <div>{creationDate.toString()}</div>;
                                }
                                catch (err) {
                                    return <div>0/0/2019</div>
                                }

                            }},
                            {title: "Last Modified", field:"lastUpdated", render: (document: NRDocument) => { 
                                try {
                                    var creationDate = date.format(document.lastUpdated, 'M/D/YYYY')
                                    return <div>{creationDate.toString()}</div>;
                                }
                                catch (err) {
                                    return <div>0/0/2019</div>
                                }
                            }},
                            {title: "", render: (group: any) => {
                                
                            }}
                        ]}
                        options={{
                            pageSize: 10,
                            search: false
                        }}
                        data={documents}
                        title="Dashboard"/>}
                </div>
                }
            </main>
        );
    }
}

export default connect<Dashboard.Props>(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(Dashboard));