import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import Button from '@material-ui/core/Button';
import { Divider, Paper, Typography } from '@material-ui/core';
import WorkflowTile from 'app/views/workflows/components/WorkflowObject';
import DialogItem from 'app/components/common/dialog';
import axios from 'axios';
// import { RouteComponentProps } from 'react-router';

export namespace Workflows{
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
        flash: string
    }
}
// export namespace Workflows {
//     export interface Props extends RouteComponentProps<void> {
//         classes?: any
//     }
// }

class Workflows extends React.Component<Workflows.Props, Workflows.State> {

    constructor(props: Workflows.Props) {
        super(props)
        this.state = {
            workflows: [],
            workFlowName: "",
            workFlowDesc: "",
            showDialog: false,
            dialogBoxName: '',
            dialogBoxDesc: '',
            flash: ""
        };
    }


    componentDidMount() {
        axios.get("/api/workflows").then((response) => {
            this.setState({ workflows: response.data });
        })
    }

    handleCreateNewOpen = (open: boolean) => () => {
        this.setState({ showDialog: open });
    };

    handleTextBoxesChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

        // this.setState({ [name]: event.target.value });

        if (name == "workFlowName") {
            this.setState({ workFlowName: event.target.value });
        }
        if (name == "workFlowDesc") {
            this.setState({ workFlowDesc: event.target.value });
        }
        if (name == "textBoxName") {
            this.setState({ dialogBoxName: event.target.value });
        }
        if (name == "textBoxDesc") {
            this.setState({ dialogBoxDesc: event.target.value });
        }
    };

    handleCreateNew = (textBoxName: string, textBoxDesc: string) => {

        axios.post("/api/workflows", {
            name: textBoxName,
            creator: Number(localStorage.getItem("userID")),
            description: textBoxDesc,

        }).then((response: any) => {

            const workflow = response.data
            this.state.workflows.push(workflow)

            // close dialog, rest text boxes
            this.setState({ showDialog: false, workFlowName: "", workFlowDesc: "" });
        });
    };

    handleDeleteClick = (workflowID: number) => {

        axios.delete("/api/workflows/" + workflowID, {
        }).then((response) => {
            this.setState({ workflows: response.data });
        }).catch((error) => {

            if (error.response.status == 403)
                this.setState({ flash: "You lack permissions to delete this workflow" });
        });
    };

    render() {

        const { workflows, dialogBoxName, dialogBoxDesc, flash } = this.state;
        const { classes } = this.props;

        return (
            <main className={classes.main}>
                <div className={classes.buttonGroup}>
                    <Button variant="contained" onClick={this.handleCreateNewOpen(true)} className={classes.button}>Create Workflow</Button>
                </div>
                <Divider style={{ margin: "0px 24px" }} />
                {(flash != "") ?
                <Paper className={classes.flashMessage}>
                    <Typography variant="caption">
                        {this.state.flash}
                    </Typography>
                </Paper> :
                <div></div>
                }
                <div className={classes.outerGrid}>
                    {workflows.map(workflow => (
                        <WorkflowTile key={workflow.id} workflow={workflow} onClick={(id: number) => this.handleDeleteClick(id)} />
                    ))
                    }
                </div>

                <DialogItem textBoxName={dialogBoxName} textBoxDesc={dialogBoxDesc} title={"Create New Workflow"} desc={"Enter the name of the new workflow"} show={this.state.showDialog} handleTextBoxesChange={this.handleTextBoxesChange} handleClose={() => this.setState({ showDialog: false })} handleSave={this.handleCreateNew} />
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Workflows);