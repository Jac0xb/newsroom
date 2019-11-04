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
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';  

import { compose } from 'recompose';
import { connect } from 'react-redux';
import { mapDispatchToProps } from 'app/store/meta/actions';
import { mapStateToProps } from 'app/store/meta/reducers';
import { MetaReducerState, MetaDispatchers } from 'app/store/meta/types';

export namespace App {

    export interface Props extends MetaReducerState, MetaDispatchers {
        classes?: any
    }

    export const Theme = createMuiTheme({
        palette: {
           primary: {
              light: '#1890ff',
              main: '#1890ff',
              dark: '#1890ff'
           },
           secondary: {
             main: '#1890ff',
           },
        }
     });
     
    
    export class Component extends React.Component<App.Props, any> {
    
        constructor(props: App.Props) {
            super(props);
        }
    
        componentDidMount() {
            this.props.login();
        }
    
        render() {
    
            const { user } = this.props;
            const headerMargin = { marginTop: "64px" };
    
            if (!user) {
                return (
                    
                    <React.Fragment>
                        <MuiThemeProvider theme = { App.Theme }>
                            <AppHeader />
                            <div style={headerMargin}>
                                <LoginPage/>
                            </div>
                        </MuiThemeProvider>
                    </React.Fragment>
                )
            }
    
            return (
                <React.Fragment>
                    <CssBaseline/>
                    <MuiThemeProvider theme = { App.Theme }>
                        <AppHeader loggedIn={true} />
        
                        <div style={headerMargin}>
                                <Switch >
                                    <Route exact path="/" component={Dashboard} user={user}/>
                                    <Route exact path="/document" component={Dashboard} user={user}/>
                                    <Route exact path="/document/create" component={DocumentCreator} user={user}/>
                                    <Route exact path="/workflow" component={Workflows} user={user}/>
                                    <Route path="/document/:id/edit" component={DocumentEditor} user={user}/>
                                    <Route path="/workflow/:id/edit" component={Workflow} user={user}/>
                                    <Route exact path="/groups" component={Groups} user={user}/>
                                    <Route exact path="/groups/create" component={GroupCreate} user={user}/>
                                    <Route path="/groups/:id" component={Group} user={user}/>
                                    <Route exact path="/users" component={Users} user={user}/>
                                    <Route path="/users/:id" component={EditUser} user={user}/>
                                </Switch>
                        </div>
                    </MuiThemeProvider>
                </React.Fragment>
            );
        }
    }
}

export default hot(module)(compose<App.Props, {}>(
)(connect<App.Props>(
    mapStateToProps,
    mapDispatchToProps
)(App.Component)));