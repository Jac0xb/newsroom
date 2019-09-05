import * as React from 'react';
import PrimarySearchAppBar from 'app/components/common/application_bar';
import { Avatar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Group } from 'app/models';
import { styles } from './styles';
import axios from 'axios';
import MaterialTable from "material-table";

export namespace Groups {
    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any
    }

    export interface State {
        groups: Group[],
        filterInput: string
    }
}

class Groups extends React.Component<Groups.Props, Groups.State> {
    constructor(props: Groups.Props, context?: any) {
        super(props, context);
        this.state = {
            groups: [],
            filterInput: ""
        }
    }

    componentDidMount() {
        axios.get("/api/roles").then((response) => {
            this.setState({groups: response.data})
        });

        // TODO Remove testing user data once API is working
        const groups = Array.from({length: 25}, (value, key) => {
            return {
                id: key,
                name: "Group " + key,
                created: new Date().toLocaleDateString(),
                lastUpdated: new Date().toLocaleDateString(),
                description: "A group"
            }
        });

        this.setState({groups: groups});
    }

    render() {
        const {groups} = this.state;

        return (
            <React.Fragment>
                <PrimarySearchAppBar/>
                <MaterialTable
                    columns={[
                        {title: "Avatar", render: Groups.getGroupAvatar},
                        {title: "Name", field: "name"},
                        {title: "Created", field: "created"},
                        {title: "Last Updated", field: "lastUpdated"},
                        {title: "Description", field: "description"}
                    ]}
                    data={groups}
                    title="Groups"/>
            </React.Fragment>
        );
    }

    static getGroupAvatar(group: any) {
        // TODO Get Image Avatar
        return <Avatar>{group.name.substring(0, 2)}</Avatar>
    }
}

export default withStyles(styles, {withTheme: true})(Groups);
