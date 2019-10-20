import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, List, ListItem, Divider, ListItemText, ListItemIcon, TextField, FormLabel, FormControl } from '@material-ui/core';
import { NRStage } from 'app/utils/models';


export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        // textName: string
        // textDesc: string 
        // stageId: number
        stage: NRStage
        onTextChange: Function
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
                {/* <Divider /> */}
                <List>
                {['Triggers', 'Due Date'].map((text, index) => (
                    <ListItem button key={text}>
                    <ListItemText primary={text} />
                    </ListItem>
                ))}
                </List>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);