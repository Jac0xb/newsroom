import * as React from 'react';
import { Button, Divider, Paper, Typography } from '@material-ui/core';
import DetailRow from 'app/views/dashboard_overview/components/DetailLine';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { Document } from 'app/models';
import classNames from 'classnames';

export namespace DocumentTile {
    export interface Props {
        classes?: any,
        match?: { params: any },
        document: Document,
        compressed?: Boolean
        onDelete: (id: number) => void;
    }
}

class DocumentTile extends React.Component<DocumentTile.Props> {

    constructor(props: DocumentTile.Props, context?: any) {
        super(props, context);
    }

    render() {

        const {classes, document, onDelete} = this.props;

        if (!this.props.compressed) {
            return (
                <Paper className={classNames(classes.documentItem, classes.flexAutosize)}>
                    <Typography variant={"title"} className={classes.noWrap}>
                        {document.name}
                    </Typography>
                    <Divider/>
                    <DetailRow title="Author" data={document.creator.userName}
                               link={"/users/" + document.creator.id}/>
                    <DetailRow title="Workflow Type" data={document.workflow.name}
                               link={"/workflow/" + document.workflow.id + "/edit"}/>
                    <DetailRow title="Due Date" data={"duedate"}/>
                    <div className={classes.buttonGroup}>
                        <Link to={"/document/" + document.id + "/edit"}>
                            <Button style={{marginRight: "16px"}} variant="contained" className={classes.button}>Edit</Button>
                        </Link>
                        <Button variant="contained" className={classes.button}
                                onClick={() => onDelete(document.id)}>Delete</Button>
                    </div>
                </Paper>
            );
        } else {
            return (
                <Paper className={classNames(classes.documentItem, classes.flexAutosize)}>
                    <Link to={"/document/" + document.id + "/edit"}>
                        <Typography variant={"body1"} className={classes.noWrap}>
                            {document.name}
                        </Typography>
                    </Link>
                </Paper>
            )
        }
    }
}

export default withStyles(styles, {withTheme: true})(DocumentTile);
