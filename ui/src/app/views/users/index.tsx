import * as React from 'react';
import { Avatar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { User } from 'app/models';
import { styles } from './styles';
import axios from 'axios';
import MaterialTable from "material-table";

export namespace Users {
    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any
    }

    export interface State {
        users: User[],
        filterInput: string
    }
}

class Users extends React.Component<Users.Props, Users.State> {
    constructor(props: Users.Props, context?: any) {
        super(props, context);
        this.state = {
            users: [],
            filterInput: ""
        }
    }

    componentDidMount() {
        axios.get("/api/users").then((response) => {
            this.setState({users: response.data})
        });
    }

    render() {
        const {users} = this.state;

        return (
            <React.Fragment>
                <MaterialTable
                    columns={[
                        {title: "Avatar", render: Users.getUserAvatar},
                        {title: "User Name", field: "name"},
                        {title: "First Name", field: "firstName"},
                        {title: "Last Name", field: "lastName"},
                        {title: "Email", field: "email"}
                    ]}
                    data={users}
                    title="Users"/>
            </React.Fragment>
        );
    }

    static getUserAvatar(user: any) {
        return <Avatar>{user.firstName.substring(0, 1) + user.lastName.substring(0, 1)}</Avatar>
    }
}

export default withStyles(styles, {withTheme: true})(Users);
