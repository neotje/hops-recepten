import React from 'react'
import { logoutUser, userContext } from '../../lib/user'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Toolbar, Typography } from '@material-ui/core';
import { useHistory, Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        loginButton: {
            float: "right",
            position: "static",
            margin: theme.spacing(2),
        },
    })
);


export const Navigation = () => {
    const context = React.useContext(userContext)
    const classes = useStyles()
    let history = useHistory();

    const onLogoutBtn = () => {
        logoutUser().then(
            (res) => {
                if (res) {
                    history.push("/")
                    context.dispatch({ type: "logout" })
                }
            }
        )
    }

    return (
        context.state.loggedIn
            ? <Button className={classes.loginButton} color="inherit" onClick={onLogoutBtn}>Uitloggen</Button>
            : <Button className={classes.loginButton} color="inherit" component={Link} to="/login">Inloggen</Button>
    )
}