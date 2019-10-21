import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, List, ListItem, ListItemText, TextField, FormLabel, FormControl, Button } from '@material-ui/core';
import { NRStage } from 'app/utils/models';


export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        stage: NRStage
        onTextChange: Function
        onUpdateClick: Function
        onDeleteClick: Function
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

        const { classes, stage } = this.props;
        const {  } = this.state;

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
                {/* <FormControl className={classes.formComp}>
                    <FormLabel className={classes.formLabel}>Due Date</FormLabel>
                    <TextField
                        id="desc"
                        className={classes.textField}
                        value={stage.description}
                        onChange={(event) => this.props.onTextChange(stage.id, 'description', event.target.value)}
                        margin="normal"
                        // variant="outlined"
                    />
                </FormControl> */}
                {/* <FormControl className={classes.formComp}>
                    <FormLabel className={classes.formLabel}>Notifications</FormLabel>
                    <TextField
                        id="desc"
                        className={classes.textField}
                        value={stage.description}
                        onChange={(event) => this.props.onTextChange(stage.id, 'description', event.target.value)}
                        margin="normal"
                        // variant="outlined"
                    />
                </FormControl> */}
                <FormControl className={classes.buttonGroup}>
                    <Button variant="contained" className={classes.button} onClick={() => this.props.onUpdateClick(this.props.stage)}>Update</Button>
                    <Button variant="contained" color="secondary" className={classes.deleteButton} onClick={() => this.props.onDeleteClick()}>Delete</Button>
                </FormControl>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);