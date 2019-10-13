import { LoadingComponent } from 'app/components/common/loading';
import { NRDocument } from 'app/utils/models';
import { mapDispatchToProps } from 'app/store/dashboard/actions';
import { mapStateToProps } from 'app/store/dashboard/reducers';
import { DashboardDispatchers, DashboardReducerState } from 'app/store/dashboard/types';
import { DocumentTileComponent } from 'app/views/dashboard/components/DocumentTile';
import _ from 'lodash-es';
import * as React from 'react';
import { connect } from 'react-redux';

import { Divider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { LinkedButton } from './components/LinkedButton';
import { styles } from './styles';

export namespace Dashboard {

    export interface Props extends DashboardDispatchers, DashboardReducerState {
        classes?: any
        history: any
        match?: { params: any }
        location: any,
    }
    export interface State {
        documents: NRDocument[]
    }
}

class Dashboard extends React.Component<Dashboard.Props, Dashboard.State> {

    constructor(props: Dashboard.Props, context?: any) {
        super(props, context);
        this.state = { documents: [] };
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
            console.log(err);
        }

    }

    renderDocuments() {
        return _.map(this.props.documents, (document) =>
            <DocumentTileComponent key={document.id} document={document} onDelete={() => this.handleDelete(document.id) } />
        )
        
    }

    render() {

        const { classes, pending } = this.props;

        return (
            <main className={classes.main}>
                <div className={classes.buttonGroup}>
                    <LinkedButton />
                </div>
                <Divider className={classes.topDivider} />
                {(pending) ?
                    <LoadingComponent />
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