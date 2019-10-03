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
import { mapStateToProps  } from 'app/store/dashboard/reducers';
import { mapDispatchToProps } from "app/store/dashboard/actions";
import { DashboardDispatchers, DashboardReducerState } from "app/store/dashboard/types";

var image = require("./download.svg")
export namespace Dashboard {

    export interface Props extends DashboardDispatchers, DashboardReducerState {
        classes?: any
        history: any
        match?: { params: any }
        location: any,
    }
    export interface State {
        documents: Document[]
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

    constructor(props: Dashboard.Props, context?: any) {
        super(props, context);
        this.state = { documents: [] };
    }

    async componentDidMount() {
        this.props.fetchDocumentsPending();
        await sleep(2000)
        var response = await axios.get<Document[]>("/api/documents");
        this.props.fetchDocumentsSuccess(response.data);
    }

    renderDocuments() {
        return _.map(this.props.documents, (document) =>
            <DocumentTile key={document.id} document={document} onDelete={() => {
                axios.delete(`/api/documents/${document.id}`).then((response) => {

                    console.log(response);

                    axios.get("/api/documents").then((response) => {
                        //this.setState({ documents: response.data });
                    });     
                });
            }} />
        )
        
    }

    render() {

        const { classes, pending } = this.props;

        return (
            <main className={classes.main}>
                <div className={classes.buttonGroup}>
                    <LinkedButton />
                </div>
                <Divider style={{ margin: "0px 24px" }} />
                {(pending) ?
                    <img src={String(image)} style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50px, -50px)", height: "100px", width: "100px"}} />
                :
                <div className={classes.documentGrid}>
                    {this.renderDocuments()}
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