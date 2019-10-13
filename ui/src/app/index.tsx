import * as React from 'react';

// Nagivational React components that are composed declaratively.
import { Route, Switch } from 'react-router-dom';

// Style-Normalization (https://material-ui.com/style/css-baseline/)
import CssBaseline from '@material-ui/core/CssBaseline';

// Allows for React components to be live reloaded without the loss of state.
import { hot } from 'react-hot-loader';

import Dashboard from 'app/views/dashboard';
import DocumentEditor from 'app/views/document_edit';
import Workflow from 'app/views/workflow';
import Workflows from 'app/views/workflows';
import DocumentCreator from 'app/views/document_create';
import Users from "app/views/users";
import EditUser from 'app/views/user';
import Groups from "app/views/groups";
import Group from "app/views/group";
import GroupCreate from 'app/views/group_create';
import AppHeader from 'app/components/common/header';
import LoginPage from 'app/views/login';
import axios from 'axios';
import { NRUser } from 'app/utils/models';

export namespace App {
    export interface Props {
        classes?: any
    }

    export interface State {
        isAuthenticated: Boolean,
        users: NRUser[]
    }
}


class App extends React.Component<App.Props, App.State, any> {

    constructor(props: App.Props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            users: []
        }
    }

    componentDidMount() {
        axios.get("/api/users/1").then((response) => {
            this.setState({isAuthenticated: response.status != 401});
        }).catch((error) => console.log(error))
    };

    render() {

        const {isAuthenticated} = this.state;
        const headerMargin = { marginTop: "64px" };

        if (!isAuthenticated) {
            return (
                <React.Fragment>
                    <AppHeader loggedOut={true}/>
                    <div style={headerMargin}>
                        <LoginPage/>
                    </div>
                </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                <CssBaseline/>
                <AppHeader />
                <div style={headerMargin}>
                    <Switch>
                        <Route exact path="/" component={Dashboard}/>
                        <Route exact path="/document" component={Dashboard}/>
                        <Route exact path="/document/create" component={DocumentCreator}/>
                        <Route exact path="/workflow" component={Workflows}/>
                        <Route path="/document/:id/edit" component={DocumentEditor}/>
                        <Route path="/workflow/:id/edit" component={Workflow}/>
                        <Route exact path="/groups" component={Groups}/>
                        <Route exact path="/groups/create" component={GroupCreate}/>
                        <Route path="/groups/:id" component={Group}/>
                        <Route exact path="/users" component={Users}/>
                        <Route path="/users/:id" component={EditUser}/>
                    </Switch>
                </div>
            </React.Fragment>
        );
    }
}

export default hot(module)(App);
