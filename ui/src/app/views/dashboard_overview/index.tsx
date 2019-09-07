import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/views/dashboard_overview/components/DocumentTile';
import { Document } from 'app/models';
import { styles } from './styles';
import LinkedButton from './components/LinkedButton'
import axios from 'axios';
import _ from 'lodash-es';

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
            <DocumentTile key={document.id} document={document} />
        )
        
    }

    render() {

        const { classes } = this.props;

        return (
            <main className={classes.layout}>
                <div className={classes.buttonGroup}>
                    <LinkedButton />
                </div>
                <div className={classes.outerGrid}>
                    {this.renderDocuments()}
                </div>
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Dashboard);
