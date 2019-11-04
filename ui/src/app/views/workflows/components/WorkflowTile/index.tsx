import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { Typography, Divider, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { NRWorkflow } from 'app/utils/models';
import { ReactElement } from 'react';

export namespace WorkflowTile {
    export interface Props {
        classes?: any;
        workflow: NRWorkflow;
        onClick: Function;
    }
    
    export class Component extends React.Component<WorkflowTile.Props, any> {

        constructor(props: WorkflowTile.Props) {
            super(props)
            this.state = {}
        }
    
        render() {
            const { classes, workflow } = this.props;
            
            var deleteButton : ReactElement | [] = [];
            var viewButtonText = "View";
            if (workflow && workflow.permission != 0) {
                deleteButton = (
                <Button 
                    variant="contained"    
                    className={classes.button} 
                    onClick={() => this.props.onClick(workflow.id)}
                    >
                        Delete
                </Button>)

                viewButtonText = "Edit"; 
            }

            return (
                <Paper className={classes.documentItem} key={workflow.id}>
                    <Typography className={classNames(classes.heading, classes.noWrap)} variant="h6">
                        {workflow.name}
                    </Typography>
                    <Divider />
                    <Typography style={{overflowWrap: "break-word"}} component="p">
                        {(workflow.description === "" ? "(No Description)" : workflow.description)}
                    </Typography>
                    <div className={classes.buttonGroup}>
                        <Link to={"/workflow/" + workflow.id + "/edit"}>
                            <Button variant="contained" className={classes.button}>
                                {viewButtonText}
                            </Button>
                        </Link>
                        {deleteButton}
                    </div>
                </Paper>
            );
        }
    }
}

export default withStyles(styles, { withTheme: true })(WorkflowTile.Component);