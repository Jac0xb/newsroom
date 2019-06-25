import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { } from '@material-ui/core';


export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any 
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

        const { classes } = this.props;
        const {  } = this.state;

        return (
        <main className={classes.layout}>
        
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);