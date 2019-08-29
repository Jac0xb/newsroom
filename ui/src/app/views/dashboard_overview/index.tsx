import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/header';
import { Button, TextField, Typography, Divider, MenuItem } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { withStyles } from '@material-ui/core/styles';
import DocumentTile from 'app/components/dashboard/DocumentTile';
import { Document } from 'app/models';
import { styles } from './styles';
import { Link } from 'react-router-dom';
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

    render() {

        const { classes } = this.props;
        
        const jsxDocuments = <React.Fragment>
            <div className={classes.outerGrid}>
            {
                _.map(this.state.documents, (document) =>
                <DocumentTile key={document.id} document={document} />
                )
            }
            </div>
        </React.Fragment>

        return (
            <React.Fragment>
                <PrimarySearchAppBar />
                <div className={classes.buttonGroup}>
                    <Link style={{ textDecoration: "none" }} to="/document/create">
                        <Button style={{ width: "calc(3*52px)" }} variant={"contained"}>
                            New Document
						</Button>
                    </Link>
                    <Button variant="outlined" color="primary" onClick={() => {}}>
                        <AccountCircleIcon />
                    </Button>
                    <form style={{ display: "flex" }}>
                        <TextField
                            className={classes.textField}
                            placeholder="Filter Author"
                            margin={"none"}
                            style={{ width: 300, marginRight: "16px" }}
                            value={""}
                            disabled={false}
                            onChange={(c) => {}}
                        />
                        <Typography variant={"subtitle1"} style={{ marginRight: "16px" }}>Sorting</Typography>
                        <TextField
                            select
                            className={classes.textField}
                            value={""}
                            margin={"none"}
                            onChange={(e) => {}}
                            SelectProps={{
                                MenuProps: {
                                    className: classes.menu,
                                },
                            }}
                        >
                            {["Author", "Workflow"].map((item, i) => (
                                <MenuItem key={i} value={i}>
                                    {item}
                                </MenuItem>
                            ))}
                        </TextField>
                    </form>
                </div>
                {jsxDocuments}
            </React.Fragment>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Dashboard);
