import * as React from 'react';
import { Button, FormGroup, Grid, Paper, Typography } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Link, Redirect } from 'react-router-dom';
import { Cookies, withCookies } from 'react-cookie';
import { compose } from 'recompose';
import { NRWorkflow, NRStage } from 'app/utils/models';
import { TreeSelect, Select } from 'antd';
import { Typography as AntTypography } from 'antd';
import { Input } from 'antd';
const { Option } = Select;
const { TextArea } = Input;
import _ from 'lodash';

export namespace GroupCreate {
    export interface Props {
        classes: Record<string, string>
        match?: { params: any }
        cookies: Cookies
    }
    
    export enum ItemType {
        Workflow,
        Stage
    }

    export interface State {
        submitted: boolean
        fetchedWorkflows: NRWorkflow[]
        fetchedStages: NRStage[]
        fetchedUsers: { name: string, id: number }[]
        flash?: string
        selectedItems : string[]
        name?: string
        description?: string
        users: { name: string, id: number }[]
    }

    export interface SimplePermission {
        id: number
        access: number
    }

    // Add refresh button to workflows.
    export class Component extends React.Component<Props, State> {

        constructor(props: Props, context?: any) {
            super(props, context);
            this.state = {
                selectedItems: [],
                users: [],
                name: "",
                description: "",
                flash: "",
                submitted: false,
                fetchedUsers: [], fetchedStages: [], fetchedWorkflows: []
            }
        }

        async componentDidMount() {

            var {data : workflows } = await axios.get<NRWorkflow[]>("/api/workflows");
            
            for (var i = 0; i < workflows.length; i++) {
                let { data : stages } = await axios.get<NRStage[]>(`/api/workflows/${workflows[i].id}/stages`);
                workflows[i].stages = stages;
            }
            
            this.setState({fetchedWorkflows: workflows});

            axios.get("/api/users").then((response) => {

                var fetchedUsers = response.data.map((user: any) => {
                    return {id: user.id, name: user.userName};
                });

                this.setState({fetchedUsers})

            }).catch((error) => {
                console.log(error)
            });
        }

        /**
         * On submit.
         */
        onSubmit() {

            this.setState({flash: ""}); 

            var users: { id: number }[] = [];
            var wfpermissions: GroupCreate.SimplePermission[] = [];
            var stpermissions: GroupCreate.SimplePermission[] = [];

            if (this.state.selectedItems.length == 0) {
                this.setState({flash: "You have not given this group any permissions."});
                return;
            }

            if (this.state.name == "") {
                this.setState({flash: "No group name was given."});
                return;
            }

            this.state.selectedItems.map((item) => {
                
                var regex = /^([0-9]{1,})-{0,1}([0-9]{1,}){0,1}$/
                var match = regex.exec(item)
                
                if (match && match[1] != undefined && match[2] == undefined) {
                    wfpermissions.push({ id: parseInt(match[0]), access: 1 })
                }
                if (match && match[2] != undefined) {
                    stpermissions.push({ id: parseInt(match[1]), access: 1 })
                }
            })

            users = this.state.users.map((users) => {
                return {id: users.id}
            })

            const newRole = {
                name: this.state.name,
                description: this.state.description,
                users
            };

            axios.post("/api/roles", newRole).then(async (response: any) => {
                
                var roleId = response.data.id

                for (var i = 0; i < wfpermissions.length; i++) {
                    await axios.put(`/api/roles/${roleId}/workflow/${wfpermissions[i].id}`, {access: wfpermissions[i].access})
                }
                for (var i = 0; i < stpermissions.length; i++) {
                    await axios.put(`/api/roles/${roleId}/stage/${stpermissions[i].id}`, {access: stpermissions[i].access})
                }

                if (response) {
                    this.setState({submitted: true})
                }

            }).catch((error) => {
                this.setState({flash: error.response.data.message || "Something has gone terribly wrong. We don't even know."});
            });
        }

        renderUsers() {

            const children = [];
            for (let i = 0; i < this.state.fetchedUsers.length; i++) {
              children.push(<Option key={this.state.fetchedUsers[i].id}>{this.state.fetchedUsers[i].name}</Option>);
            }

            return (<React.Fragment>
                <Select
                    mode="multiple"
                    style={{ width: '100%', marginBottom: '16px' }}
                    placeholder="Please select"
                    defaultValue={_.map(this.state.users, (user) => user.id.toString())}
                    onChange={(users: string[]) => {
                        var selectedUsers = _.filter(this.state.fetchedUsers, (user) => _.includes(users, user.id.toString()));
                        this.setState({users: selectedUsers});
                    }}
                >
                    {children}
                </Select>
                
            </React.Fragment>)
        }

        render() {
            
            var treeData = _.map(this.state.fetchedWorkflows, (workflow) => {
                var newWorkflow = { title: workflow.name, value: `${workflow.id}`, children: new Array<{title: string, value: string}>() }

                for (var i = 0; i < workflow.stages.length; i++) {
                    let stage = workflow.stages[i] 
                    newWorkflow.children.push({ title : stage.name, value: `${workflow.id}-${stage.id}` })
                }

                return newWorkflow;
            })

            if (this.state.submitted) {
                return <Redirect push to="/groups"/>;
            }
            const {classes} = this.props;

            return (
                <main className={classes.main}>
                    <div className={classes.buttonGroup}>
                        <Link style={{textDecoration: "none"}} to="/groups">
                            <Button style={{width: "calc(100px)"}} variant={"contained"}>
                                Back
                            </Button>
                        </Link>
                    </div>
                    <Grid className={classes.outerGrid} alignContent={"center"} container spacing={4} direction="row"
                        justify="center" alignItems="center">
                        <Grid item xs={8} md={6}>
                            <Paper className={classes.formGroup}>
                                {(this.state.flash != "") ?
                                    <Paper className={classes.flashMessage}>
                                        <Typography variant="caption">
                                            {this.state.flash}
                                        </Typography>
                                    </Paper> :
                                    <div></div>
                                }
                                <FormGroup>
                                    <AntTypography.Title level={3}>Create Group</AntTypography.Title>
                                    <AntTypography.Text strong={true}>Group Name</AntTypography.Text>
                                    <Input
                                        placeholder="Ex. Sports Editor Group"
                                        style={{marginBottom: "16px"}}
                                        value={this.state.name}
                                        onChange={(c) => this.setState({name: c.target.value})}
                                    />
                                    <AntTypography.Text strong={true}>Group Description</AntTypography.Text>
                                    <TextArea
                                        placeholder="Ex. A group for sports editors."
                                        style={{marginBottom: "16px"}}
                                        autosize={{ minRows: 2, maxRows: 6 }}
                                        value={this.state.description}
                                        onChange={({ target: { value } }) => this.setState({description: value})}
                                    />
                                    <AntTypography.Text strong={true}>Group Permissions</AntTypography.Text>
                                    <TreeSelect
                                        showSearch
                                        treeData={treeData}
                                        value={this.state.selectedItems}
                                        style={{marginBottom: "16px"}}
                                        placeholder="Type to filter.."
                                        allowClear
                                        multiple
                                        treeDefaultExpandAll
                                        onChange={(value) => this.setState({selectedItems: value})}
                                    />
                                    <AntTypography.Text strong={true}>Group Users</AntTypography.Text>
                                    {this.renderUsers()}
                                </FormGroup>
                                <Button variant="contained" onClick={this.onSubmit.bind(this)}
                                        className={classes.button}>Create</Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </main>
            );
        }
    }
}

export default compose<GroupCreate.Props, {}>(
    withStyles(styles, {withTheme: true}),
    withCookies
)(GroupCreate.Component);