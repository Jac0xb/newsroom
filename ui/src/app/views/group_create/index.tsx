import * as React from 'react';
import { Button, FormGroup, Grid, Paper, Typography } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Link, Redirect } from 'react-router-dom';
import { compose } from 'recompose';
import { TreeSelect, Select } from 'antd';
import { Typography as AntTypography } from 'antd';
import { Input } from 'antd';
import { NRRole, NRUser, NRWorkflow, NRStage, NRWFPermission, NRSTPermission } from 'app/utils/models'
const { Option } = Select;
const { TextArea } = Input;
import _ from 'lodash';

import { connect } from 'react-redux';
import { mapDispatchToProps } from 'app/store/group_create/actions';
import { mapStateToProps } from 'app/store/group_create/reducers';
import { GroupCreateReducerState, GroupCreateDispatchers } from 'app/store/group_create/types';

export namespace GroupCreate {

    export interface Props extends GroupCreateDispatchers, GroupCreateReducerState {
        classes: Record<string, string>;
    }

    export interface SimplePermission {
        id: number;
        access: number;
    }

    /**
     * TODO: Documentation.
     */
    export class Component extends React.Component<Props> {

        constructor(props: Props, context?: any) {
            super(props, context);
        }

        componentDidMount() {
           this.props.fetchWorkflows();
           this.props.fetchUsers();
        }

        /**
         * TODO: Documentation
         */
        async onSubmit() {

            this.props.induceFlash();

            var wfpermissions: NRWFPermission[] = [];
            var stpermissions: NRSTPermission[] = [];

            if (this.props.selectedItems.length == 0) {
                this.props.induceFlash("You have not given this group any permissions.");
                return;
            }

            if (this.props.name == "") {
                this.props.induceFlash("No group name was given.");
                return;
            }

            this.props.selectedItems.map((item) => {
                
                var regex = /^([0-9]{1,})-{0,1}([0-9]{1,}){0,1}$/
                var match = regex.exec(item);
                
                if (match && match[1] != undefined && match[2] == undefined) {
                    wfpermissions.push(new NRWFPermission({
                        workflow: new NRWorkflow({id: parseInt(match[1])}), 
                        access: 1
                    }));

                } 
                else if (match && match[2] != undefined) {
                    stpermissions.push(new NRSTPermission({ 
                        stage: new NRStage({id: parseInt(match[2])}), 
                        access: 1
                    }));
                }
            })

            var users = this.props.selectedUsers.map((users) => {
                return {id: users.id} as NRUser;
            })

            var newRole = new NRRole({
                name: this.props.name || "",
                description: this.props.description || "",
                users,
                wfpermissions,
                stpermissions
            });
            
            try {

                var responseRole = await axios.post<NRRole>("/api/roles", newRole);
                this.props.induceSubmission();
                
            }
            catch (err) {
                this.props.induceFlash(err.response.data.message || "Something has gone terribly wrong. We don't even know.");
            }
        }

        renderUsers() {

            const children = [];
            for (let i = 0; i < this.props.fetchedUsers.length; i++) {
              children.push(<Option key={this.props.fetchedUsers[i].id}>{this.props.fetchedUsers[i].userName}</Option>);
            }

            return (<React.Fragment>
                <Select
                    mode="multiple"
                    style={{ width: '100%', marginBottom: '16px' }}
                    placeholder="Please select"
                    defaultValue={_.map(this.props.selectedUsers, (user) => user.id.toString())}
                    onChange={(users: string[]) => {
                        var selectedUsers = _.filter(this.props.fetchedUsers, (user) => _.includes(users, user.id.toString()));
                        this.props.updateUserSelection(_.map(selectedUsers, (user) => {return {id: user.id, name: user.userName}}));
                    }}
                >
                    {children}
                </Select>
                
            </React.Fragment>)
        }

        render() {
            
            var { classes } = this.props;

            var treeData = _.map(this.props.fetchedWorkflows, (workflow) => {
                var newWorkflow = { title: workflow.name, value: `${workflow.id}`, children: new Array<{title: string, value: string}>() }

                for (var i = 0; i < workflow.stages.length; i++) {
                    let stage = workflow.stages[i] 
                    newWorkflow.children.push({ title : stage.name, value: `${workflow.id}-${stage.id}` })
                }

                return newWorkflow;
            });

            if (this.props.submitted) {
                this.props.clearForm();
                return <Redirect push to="/groups" />;
            }

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
                        <Grid item xs={7} md={6} lg={5} xl={4}>
                            <Paper className={classes.formGroup} elevation={6}>
                                {(this.props.flash != "") ?
                                    <Paper className={classes.flashMessage} elevation={2}>
                                        <Typography variant="caption">
                                            {this.props.flash}
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
                                        value={this.props.name}
                                        onChange={(c) => this.props.updateName(c.target.value)}
                                    />
                                    <AntTypography.Text strong={true}>Group Description</AntTypography.Text>
                                    <TextArea
                                        placeholder="Ex. A group for sports editors."
                                        style={{marginBottom: "16px"}}
                                        autosize={{ minRows: 2, maxRows: 6 }}
                                        value={this.props.description}
                                        onChange={({ target: { value } }) => this.props.updateDescription(value)}
                                    />
                                    <AntTypography.Text strong={true}>Group Permissions</AntTypography.Text>
                                    <TreeSelect
                                        showSearch
                                        treeData={treeData}
                                        value={this.props.selectedItems}
                                        style={{marginBottom: "16px"}}
                                        placeholder="Type to filter.."
                                        allowClear
                                        multiple
                                        treeDefaultExpandAll
                                        onChange={(value: string[]) => this.props.updateItemSelection(value)}
                                    />
                                    <AntTypography.Text strong={true}>Group Users</AntTypography.Text>
                                    {this.renderUsers()}
                                </FormGroup>
                                <div style={{display: "flex", flexDirection: "row-reverse"}}>
                                    <Button variant="contained" onClick={this.onSubmit.bind(this)}
                                            className={classes.button}>Create</Button>
                                </div>
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
)(connect<GroupCreate.Props>(
    mapStateToProps,
    mapDispatchToProps
)(GroupCreate.Component));