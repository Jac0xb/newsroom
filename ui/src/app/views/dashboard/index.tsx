import { LoadingComponent } from 'app/components/common/loading';
import { NRDocument } from 'app/utils/models';
import { mapDispatchToProps } from 'app/store/dashboard/actions';
import { mapStateToProps } from 'app/store/dashboard/reducers';
import { DashboardDispatchers, DashboardReducerState } from 'app/store/dashboard/types';
import { DocumentTileComponent } from 'app/views/dashboard/components/DocumentTile';
import _ from 'lodash-es';
import * as React from 'react';
import { connect } from 'react-redux';

import { Divider, AppBar } from '@material-ui/core';
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

        try {
            await this.props.deleteDocument(id);
            this.props.fetchDocuments();
        }
        catch (err) {
            //this.props.induceFlash(err);
        }

    }

    renderDocuments() {
        return _.map(this.props.documents, (document) =>
            <DocumentTileComponent key={document.id} document={document} onDelete={() => this.handleDelete(document.id) } />
        )
        
    }

    render() {
        console.log(this.props.location)
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
                                return <Link to={`/workflow/${document.workflow.id}/edit`}>
                                    {document.workflow.name}
                                </Link>
                            }},
                            {title: "Created", field:"created", searchable: true, render: (document: NRDocument) => { 
                                return <div>{`${document.created.getDay()}/${document.created.getMonth()}/${document.created.getFullYear()}`}</div>;
                            }},
                            {title: "Last Modified", field:"lastUpdated", render: (document: NRDocument) => { 
                                return <div>{`${document.lastUpdated.getDay()}/${document.lastUpdated.getMonth()}/${document.lastUpdated.getFullYear()}`}</div>;
                            }},
                            {title: "", render: (group: any) => {
                                
                            }}
                        ]}
                        options={{
                            search: false
                        }}
                        data={documents}
                        title="Documents"/>}
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