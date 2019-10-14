import { Paper, Typography, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { styles } from './styles';

export namespace LoginPage {
    export interface Props {
        classes?: any
    }
}

class LoginPage extends React.Component<LoginPage.Props> {
    constructor(props: LoginPage.Props) {
        super(props);
    }

    handleLogin() {
        window.location.href = "/auth/google";
    }

    render() {
        const { classes } = this.props;

        return (
            <main className={classes.main}>
                <Paper className={classes.paper} elevation={1}>
                    <Typography className={classes.title} variant="h5" component="h3">
                        User Login
                    </Typography>
                    <Typography className={classes.subtitle} variant="body1" component="div">
                        To login, please click the link below.
                    </Typography>
                    <Button variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={this.handleLogin}
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                            className={classes.googleImage}
                            alt="Google Logo"
                            width={30}
                            height={30} />
                        Sign In with Google
                    </Button>
                </Paper>
            </main>
        );
    }
}

export default withStyles(styles, { withTheme: true })(LoginPage);