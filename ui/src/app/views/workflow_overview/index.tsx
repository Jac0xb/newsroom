import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import { Divider } from '@material-ui/core';
import WorkflowTile from 'app/views/workflow_overview/components/WorkflowObject';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';

export namespace WorkflowOverview {
    export interface Props {
        classes?: any
    }
    export interface State {
        showDialog: boolean
        workFlowName: string
        workFlowDesc: string
        workflows: any[]
        dialogBoxName: string
        dialogBoxDesc: string
    }
}


class WorkflowOverview extends React.Component<WorkflowOverview.Props, WorkflowOverview.State> {

    constructor(props: WorkflowOverview.Props) {
		super(props)
        this.state = { workflows: [], 
            workFlowName: "", 
            workFlowDesc: "", 
            showDialog: false,
            dialogBoxName: '',
            dialogBoxDesc: '', 
        };
    }

    componentDidMount() {
        this.getWorkflows();
    }

    getWorkflows = () => {
        axios.get("/api/workflows").then((response) => {
            console.log(response);

            this.setState({ workflows: response.data });
        })
    }

    handleCreateNewOpen = (open: boolean) => () => {
        this.setState({ showDialog: open });
    };

    handleTextBoxesChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

        // this.setState({ [name]: event.target.value });

        if(name == "workFlowName"){
            this.setState({ workFlowName: event.target.value });
        }
        if(name == "workFlowDesc"){
            this.setState({ workFlowDesc: event.target.value });
        }
        if(name == "textBoxName"){
            this.setState({ dialogBoxName: event.target.value });
        }
        if(name == "textBoxDesc"){
            this.setState({ dialogBoxDesc: event.target.value });
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
            this.setState({showDialog: false, workFlowName: "", workFlowDesc: ""});
        });
    };

    handleDeleteClick = (workflowID: number) => {

        axios.delete("/api/workflows/" + workflowID ,{
        }).then((response) => {
    
          // Update view
          this.getWorkflows();
          
        });
    
      };

    render() {

        const { workflows, dialogBoxName, dialogBoxDesc } = this.state;
        const { classes } = this.props;

        return (
            <main className={classes.layout}>
                <div className={classes.buttonGroup}>
                    <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create Workflow</Button>
                </div>
				<Divider style={{margin: "0px 24px"}}/>
				<div className={classes.outerGrid}>
                    {workflows.map(workflow => (
                    	<WorkflowTile workflow={workflow} onClick={(id: number) => this.handleDeleteClick(id)}/>
					))
					}
				</div>

                <DialogItem textBoxName={dialogBoxName} textBoxDesc={dialogBoxDesc}  title={"Create New Workflow"} desc={"Enter the name of the new workflow"} show={this.state.showDialog} handleTextBoxesChange={this.handleTextBoxesChange} handleClose={() => this.setState({showDialog: false})} handleSave={this.handleCreateNew}/>
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(WorkflowOverview);