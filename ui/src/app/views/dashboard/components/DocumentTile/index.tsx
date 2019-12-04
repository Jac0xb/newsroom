import * as React from 'react';
import { Divider, Paper, Typography } from '@material-ui/core';
import { Button} from 'antd'
import DetailRow from 'app/views/dashboard/components/DetailLine';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { NRDocument } from 'app/utils/models';
import classNames from 'classnames';

namespace DocumentTile {
    export interface Props {
        classes?: any,
        match?: { params: any },
        document: NRDocument,
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
                    <Typography className={classes.noWrap}>
                        {document.name}
                    </Typography>
                    <Divider/>
                    <DetailRow title="Workflow Type" data={""}
                               link={"/workflow/" + 1 + "/edit"}/>
                    <DetailRow title="Due Date" data={"duedate"}/>
                    <div className={classes.buttonGroup}>
                        <Link to={"/document/" + document.id + "/edit"}>
                            <Button style={{marginRight: "16px"}} className={classes.button}>Edit</Button>
                        </Link>
                        <Button className={classes.button}
                                onClick={() => onDelete(document.id)}>Delete</Button>
                    </div>
                </Paper>
            );
        } else {
            return (
                <Paper className={classNames(classes.documentItem, classes.flexAutosize)}>
                    <Link to={"/document/" + document.id + "/edit"}>
                        <Typography className={classes.noWrap}>
                            {document.name}
                        </Typography>
                    </Link>
                </Paper>
            )
        }
    }
}

export const DocumentTileComponent = withStyles(styles, {withTheme: true})(DocumentTile);
