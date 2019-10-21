import * as React from 'react';
import { Grid, Paper, FormGroup, Button, Typography, AppBar } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Redirect, Link } from 'react-router-dom';
import { compose } from 'recompose';
const { Option } = Select;

import { Typography as AntTypography } from 'antd';
import { Select } from 'antd';
import { Input } from 'antd';


import { connect } from 'react-redux';
import { mapDispatchToProps } from 'app/store/document_create/actions';
import { mapStateToProps } from 'app/store/document_create/reducers';
import { DocumentCreateReducerState, DocumentCreateDispatchers } from 'app/store/document_create/types';
import { NRWorkflow, NRDocument } from 'app/utils/models';

export namespace DocumentCreate {
	export interface Props extends DocumentCreateDispatchers, DocumentCreateReducerState {
		classes: Record<string, string>
		match?: { params: any }
	}

    // Add refresh button to workflows.
    export class Componenet extends React.Component<DocumentCreate.Props> {

        constructor(props: DocumentCreate.Props, context?: any) {
            super(props, context);
            this.state = { 
                nickname: "", workflow: undefined, availableWorkflows: [], 
                submitted: false, pendingSubmission: false, flash: "" 
            }
        }

        componentDidMount() {

            this.props.fetchWorkflows();

        }

        onSubmit() {

            this.props.induceFlash("");
            this.props.updatePending(true);

            var postMessage = new NRDocument({ name: this.props.name, workflow: new NRWorkflow({ id: this.props.selectedWorkflow }) })
            
            console.log(postMessage)

            axios.post("/api/documents", postMessage).then((response: any) => {

            }).catch((error) => {
                this.props.induceFlash(error.response.data.message || "Something has gone terribly wrong. We don't even know.");
                this.props.updatePending(false);
            });
        }


        renderWorkflows() {


            const children = this.props.fetchedWorkflows.map((workflow: NRWorkflow) => 
                <Option key={workflow.id}>{workflow.name}</Option>
            );

            return (<React.Fragment>
                <Select
                    style={{ width: '100%', marginBottom: '16px' }}
                    placeholder="Select a Workflow"
                    defaultValue={(this.props.selectedWorkflow || "").toString()}
                    onChange={(c: string) => this.props.updateWorkflow(parseInt(c)) }
                >
                    {children}
                </Select>
                
            </React.Fragment>)
        }


        render() {

            if (this.props.submitted) {
                return <Redirect push to="/" />;
            }

            const { classes } = this.props;

            return (
                <main className={classes.main}>
                    <AppBar color="default" className={classes.appBar} style={{marginTop: "64px", padding: "16px"}}>
                        <Link style={{ textDecoration: "none" }} to="/">
                            <Button style={{ width: "calc(4*52px)" }} variant={"contained"}>
                                Back to Dashboard
                            </Button>
                        </Link>
                    </AppBar>
                    <Grid className={classes.outerGrid} style={{marginTop: "132px"}} alignContent={"center"} container spacing={4} direction="row" justify="center" alignItems="center">
                        <Grid item xs={8} md={6}>
                            <Paper className={classes.formPaper}>
                                {(this.props.flash != "") ?
                                    <Paper className={classes.flashMessage}>
                                        <Typography>
                                            {this.props.flash}
                                        </Typography>
                                    </Paper> :
                                    <div></div>
                                }
                                <FormGroup className={classes.formGroup}>
                                    <AntTypography.Title level={3}>Create Document</AntTypography.Title>
                                    <AntTypography.Text strong={true}>Document Headline</AntTypography.Text>
                                    <Input
                                        placeholder={"Brown: Utah Ute's Win The Holy War Against BYU"}
                                        style={{marginBottom: "16px"}}
                                        value={this.props.name}
                                        onChange={(c) => this.props.updateName(c.target.value)}
                                    />
                                    <AntTypography.Text strong={true}>Workflow</AntTypography.Text>
                                    {this.renderWorkflows()}
                                </FormGroup>
                                <div className={classes.formButtonGroup}>
                                    <Button variant="contained" disabled={this.props.pending} onClick={this.onSubmit.bind(this)} className={classes.button}>Create</Button>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </main>
            );
        }
    }
}

export default compose<DocumentCreate.Props, {}>(
    withStyles(styles, {withTheme: true}),
)(connect<DocumentCreate.Props>(
    mapStateToProps,
    mapDispatchToProps
)(DocumentCreate.Componenet));