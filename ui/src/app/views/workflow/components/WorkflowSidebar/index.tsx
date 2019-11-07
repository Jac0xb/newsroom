import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, List, ListItem, ListItemText, TextField, FormLabel, FormControl, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { NRStage, NRWorkflow, NRTrigger } from 'app/utils/models';
import { Link } from '@material-ui/icons';

export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        stage: NRStage
        onTextChange: Function
        onUpdateClick: Function
        onDeleteClick: Function
        onAddStage: Function
        onAddTriggerClick: Function
        workflow?: NRWorkflow
        trigger?: NRTrigger
    }
    export interface State {

    }
}
class WorkflowMenuBar extends React.Component<WorkflowMenuBar.Props, WorkflowMenuBar.State, any> {

    constructor(props: WorkflowMenuBar.Props) {
        super(props)
        this.state = {
            
        }
    }

    render() {

        const { classes, stage, workflow, trigger } = this.props;
        const {  } = this.state;

        if (!workflow || (workflow && workflow.permission == 0)) {
            return <div></div>
        }

        return (
        <main className={classes.layout}>
             <Drawer
                anchor="right"
                className={classes.drawer}
                variant="permanent"
                classes={{
                paper: classes.drawerPaper,
                }}
            >
                <FormControl className={classes.formComp}>
                    <FormLabel className={classes.formLabel}>Stage Name</FormLabel>
                    <TextField
                        id="name"
                        className={classes.textField}
                        value={stage.name}
                        onChange={(event) => this.props.onTextChange(stage.id, 'name', event.target.value)}
                        margin="normal"
                    />
                </FormControl>
                <FormControl className={classes.formComp}>
                    <FormLabel className={classes.formLabel}>Stage Description</FormLabel>
                    <TextField
                        id="desc"
                        className={classes.textField}
                        value={stage.description}
                        onChange={(event) => this.props.onTextChange(stage.id, 'description', event.target.value)}
                        margin="normal"
                        // variant="outlined"
                    />
                </FormControl>
                <FormControl className={classes.triggerCont}>
                <FormControlLabel
                    control={
                    <Checkbox
                        checked={trigger ? true: false}
                        onChange={() => this.props.onAddTriggerClick(this.props.stage, "general")}
                        value="trigger"
                        color="primary"
                    />
                    }
                    label="Stage Trigger"
                />
                </FormControl>
                <FormControl className={classes.formComp}>
                    <FormLabel className={classes.formLabel}>Slack Channel</FormLabel>
                    <TextField
                        id="desc"
                        className={classes.textField}
                        value={trigger ? trigger.channelName : ""}
                        onChange={(event) => this.props.onTextChange(stage.id, 'trigger', event.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                </FormControl>
                <FormControl className={classes.buttonGroup}>
                    <div className={classes.stageButtonGroup}>
                        <Button 
                            variant="contained" 
                            className={classes.stageButton} 
                            onClick={() => this.props.onAddStage(this.props.stage.sequenceId)}
                        >
                            <span>{"<- Add"}</span>
                        </Button>
                        <Button 
                            variant="contained" 
                            className={classes.stageButton} 
                            onClick={() => this.props.onAddStage(this.props.stage.sequenceId + 1)}>
                                <span>{"Add ->"}</span>
                        </Button>
                    </div>
                    <Button variant="contained" className={classes.button} onClick={() => this.props.onUpdateClick(this.props.stage)}>Update</Button>
                    <Button variant="contained" color="secondary" className={classes.deleteButton} onClick={() => this.props.onDeleteClick()}>Delete</Button>
                </FormControl>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);