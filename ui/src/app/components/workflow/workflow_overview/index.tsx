import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import { Divider } from '@material-ui/core';
import WorkflowTile from 'app/components/workflow/workflow_object';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';

export namespace CreateWorkflow {
    export interface Props {
        classes?: any
    }
    export interface State {
        dialogCreateNewOpen: boolean
        workFlowName: string
        workFlowDesc: string
        workflows: Array<any>
    }
}


class CreateWorkflow extends React.Component<CreateWorkflow.Props, CreateWorkflow.State> {

    constructor(props: CreateWorkflow.Props) {
        super(props)
    }

    state: CreateWorkflow.State = {
        dialogCreateNewOpen: false,
        workFlowName: "",
        workFlowDesc: "",
        workflows: [],
    };

    componentDidMount() {
        axios.get("/api/workflows").then((response) => {
            console.log(response);

            this.setState({ workflows: response.data });
        })
    }

    handleCreateNewOpen = (open: boolean) => () => {
        this.setState({ dialogCreateNewOpen: open });
    };

    handleTextBoxesChange = (name: keyof CreateWorkflow.State) => (event: React.ChangeEvent<HTMLInputElement>) => {

        if(name == "workFlowName"){
            this.setState({ workFlowName: event.target.value });
        }
        if(name == "workFlowDesc"){
            this.setState({ workFlowDesc: event.target.value });
        }
    };

    handleCreateNew = (textBoxName: string, textBoxDesc: string) => {

        axios.post("/api/workflows", {
            name: textBoxName,
            creator: "Jacques",
            description: textBoxDesc,

        }).then((response: any) => {
            console.log(response);

            const workflow = response.data
            this.state.workflows.push(workflow)

            // close dialog, rest text boxes
            this.setState({dialogCreateNewOpen: false, workFlowName: "", workFlowDesc: ""});
        });
    };

    render() {

        const { dialogCreateNewOpen, workFlowName, workFlowDesc, workflows } = this.state;
        const { classes } = this.props;

        return (
            <main className={classes.layout}>
                <div className={classes.buttonGroup}>
                    <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create Workflow</Button>
                </div>
				<Divider style={{margin: "0px 24px"}}/>
				<div className={classes.outerGrid}>
                    {workflows.map(workflow => (
                    	<WorkflowTile workflow={workflow} />
					))
					}
				</div>

                <DialogItem title={"Create New Workflow"} desc={"Enter the name of the new workflow"} show={dialogCreateNewOpen} handleSave={this.handleCreateNew}/>
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(CreateWorkflow);