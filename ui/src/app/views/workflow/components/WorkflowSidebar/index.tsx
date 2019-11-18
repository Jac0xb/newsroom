import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, FormControl, Button } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { NRStage, NRWorkflow } from 'app/utils/models';
import Input from 'antd/lib/input';
import { Typography as AntTypography, Checkbox, Divider, Select } from 'antd';
const { Option } = Select;
import TextArea from 'antd/lib/input/TextArea';

export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        stage?: NRStage
        onTextChange: (stageId: number, name: string, target: string) => any;
        onToggle: () => any;
        onUpdateClick: (stage: NRStage) => any;
        onDeleteClick: () => any;
        onAddStage: (id: number) => any;
        onAddTriggerClick: (stage: NRStage, channel: string) => any;
        onDeleteTriggerClick: (stage: NRStage) => any;
        workflow?: NRWorkflow
        closed?: Boolean
    }
    export interface State {

    }
}
class WorkflowMenuBar extends React.Component<WorkflowMenuBar.Props, WorkflowMenuBar.State, any> {

    constructor(props: WorkflowMenuBar.Props) {
        super(props);
        this.state = {};
    }

    render() {

        const { classes, workflow, closed, stage } = this.props;
        const {  } = this.state;

        if (!workflow || (workflow && workflow.permission == 0)) {
            return <div></div>;
        }

        if (closed) {
            return (
                <main className={classes.layout}>
                    <Drawer
                        anchor="right"
                        variant="permanent"
                        classes={{
                        paper: classes.closedDrawer,
                        }}
                    >
                        <Button style={{padding: "16px"}} onClick={(e) => this.props.onToggle()}>
                            <MenuIcon />
                        </Button>
                    </Drawer>
                </main>
            );
        }

        if (stage == undefined) {
            return (<main className={classes.layout}>             
                <Drawer
                    anchor="right"
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                    paper: classes.drawerPaper,
                    }}
                >
                    <Button style={{padding: "16px"}} onClick={(e) => this.props.onToggle()}>
                        <MenuIcon />
                    </Button>
                    <FormControl className={classes.buttonGroup}>
                        <div className={classes.stageButtonGroup}>
                            <Button 
                                style={{margin:"auto"}}
                                variant="contained" 
                                onClick={() => this.props.onAddStage(workflow.stages.length)}
                                disabled={(this.props.workflow && this.props.workflow.permission == 1) ? false : true}
                                >
                                    Add Stage
                            </Button>
                        </div>
                    </FormControl>
                </Drawer>
            </main>);
        }

        stage.workflow = workflow;

        var slackElement = <div></div>

        if (stage.trigger) {
            
            const channels = ["general", "opinion-editors", "releases"];
            const children = [];
            for (let i = 0; i < channels.length; i++) {
                children.push(<Option value={channels[i]}>{channels[i]}</Option>);
            }

            slackElement = (<Select
                style={{ margin: 10 }}
                placeholder="Please select"
                defaultValue={stage.trigger.channelName}
                onChange={(value: any) => {

                    if (this.props.stage == undefined)
                        return;

                    this.props.onTextChange(this.props.stage.id, 'trigger', value)}
                }
            >
                {children}
            </Select>);
            
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

                <Button style={{padding: "16px"}} onClick={(e) => this.props.onToggle()}>
                    <MenuIcon />
                </Button>
                <Divider orientation="center" style={{margin: 0}}>
                    <AntTypography.Text>Stage Settings</AntTypography.Text>
                </Divider>
                <FormControl className={classes.formComp}>
                    <AntTypography.Text strong={true}>Stage Name</AntTypography.Text>
                    <Input
                        id="name"
                        value={stage.name}
                        onChange={(event) => {

                            if (this.props.stage == undefined)
                                return;

                            return this.props.onTextChange(this.props.stage.id, 'name', event.target.value);
                        }}
                    />
                </FormControl>
                <FormControl className={classes.formComp}>
                    <AntTypography.Text strong={true}>Stage Description</AntTypography.Text>
                    <TextArea
                        placeholder="Ex. A group for sports editors."
                        autosize={{ minRows: 2, maxRows: 6 }}
                        value={stage.description}
                        onChange={(event) => {

                            if (this.props.stage == undefined)
                                return;

                            this.props.onTextChange(this.props.stage.id, 'description', event.target.value)
                        }}
                    />
                </FormControl>
                <Divider orientation="center">
                    <AntTypography.Text>Slack Settings</AntTypography.Text>
                </Divider>
                <Checkbox style={{marginLeft:10}} 
                    checked={stage.trigger ? true: false}
                    onChange={
                        stage.trigger ? 
                            () => {
                                if (this.props.stage == undefined)
                                    return;

                                this.props.onDeleteTriggerClick(this.props.stage) 
                            }
                        :
                            () => {
                                if (this.props.stage == undefined)
                                    return;
                                
                                    this.props.onAddTriggerClick(this.props.stage, this.props.stage.trigger ? this.props.stage.trigger.channelName : "general")
                            }
                    }
                >
                    Enable Slack Trigger
                </Checkbox>
                {slackElement}
                <FormControl className={classes.buttonGroup}>
                    <div className={classes.stageButtonGroup}>
                        <Button 
                            variant="contained" 
                            className={classes.stageButton} 
                            onClick={() => {
                                if (this.props.stage == undefined)
                                    return;

                                this.props.onAddStage(this.props.stage.sequenceId)}
                            }
                        >
                            <span>{"<- Add"}</span>
                        </Button>
                        <Button 
                            variant="contained" 
                            className={classes.stageButton} 
                            onClick={() => {
                                
                                if (this.props.stage == undefined)
                                    return;
                                
                                this.props.onAddStage(this.props.stage.sequenceId + 1);

                            }}>
                                <span>{"Add ->"}</span>
                        </Button>
                    </div>
                    <Button 
                        variant="contained" 
                        className={classes.button} 
                        onClick={() => {
                            if (this.props.stage == undefined)
                                return;

                            this.props.onUpdateClick(this.props.stage);
                        }}
                    >
                        Update
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        className={classes.deleteButton} 
                        onClick={() => this.props.onDeleteClick()}
                    >
                        Delete
                    </Button>
                </FormControl>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);