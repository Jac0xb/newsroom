import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/views/dashboard/components/DocumentTile';
import { Document } from 'app/models';
import { styles } from './styles';
import LinkedButton from './components/LinkedButton'
import { Divider } from '@material-ui/core';
import { connect } from "react-redux";
import axios from 'axios';
import _ from 'lodash-es';
import { AppState } from 'app/store';
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { DashboardActionTypes } from 'app/store/dashboard/types';
import { dispatchFetchDocumentsPending, dispatchFetchDocumentsSuccess, dispatchFetchDocumentsError } from "app/store/dashboard/actions";

export namespace Dashboard {

    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any,
    }
    export interface State {
        documents: Document[]
    }
}

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

    constructor(props: Dashboard.Props, context?: any) {
        super(props, context);
        this.state = { documents: [] }
    }

    componentDidMount() {
        axios.get("/api/documents").then((response) => {
            this.setState({ documents: response.data })
        });
    }

    renderDocuments() {
        return _.map(this.state.documents, (document) =>
            <DocumentTile key={document.id} document={document} onDelete={() => {
                axios.delete(`/api/documents/${document.id}`).then((response) => {

                    console.log(response)

                    axios.get("/api/documents").then((response) => {
                        this.setState({ documents: response.data })
                    });     
                });
            }} />
        )
        
    }

    render() {

        const { classes } = this.props;

        return (
            <main className={classes.main}>
                <div className={classes.buttonGroup}>
                    <LinkedButton />
                </div>
                <Divider style={{ margin: "0px 24px" }} />
                <div className={classes.documentGrid}>
                    {this.renderDocuments()}
                </div>
            </main>
        );
    }
}

const mapStateToProps = (state: AppState, ownProps: Dashboard.Props) => ({
    dashboardState: state.dashboard
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, DashboardActionTypes>, ownProps: Dashboard.Props) => ({
    dispatchFetchDocumentsPending: bindActionCreators(dispatchFetchDocumentsPending, dispatch),
    dispatchFetchDocumentsSuccess: bindActionCreators(dispatchFetchDocumentsSuccess, dispatch),
    dispatchFetchDocumentsError: bindActionCreators(dispatchFetchDocumentsError, dispatch)
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(Dashboard));