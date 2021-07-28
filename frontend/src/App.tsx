import React from 'react';
import './App.css';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { BrowserRouter, Route, Switch, Link, useHistory } from "react-router-dom"
import AppBar from '@material-ui/core/AppBar';
import { Button, Toolbar, Typography } from '@material-ui/core';

import Home from './components/home/home';
import { RecipePage } from './components/recipe/recipe';
import { Login } from './components/login/login';
import { isLoggedIn, logoutUser } from './lib/user';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loginButton: {
      float: "right",
      position: "static",
      margin: theme.spacing(2),
    },
  })
);

function App() {
  let history = useHistory();
  const classes = useStyles();

  const [alreadyLoggedIn, setLoggedIn] = React.useState<boolean>(false)

  React.useEffect(() => {
    isLoggedIn().then(r => setLoggedIn(r))
  }, [])

  const onLogoutBtn = () => {
    logoutUser().then(
      (res) => {
        if (res) {
          history.push("/")
        }
      }
    )
  }

  return (
    <BrowserRouter>
      {
        alreadyLoggedIn
          ? <Button className={classes.loginButton} color="inherit" onClick={onLogoutBtn}>Uitloggen</Button>
          : <Button className={classes.loginButton} color="inherit" component={Link} to="/login">Inloggen</Button>
      }
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/recipe/:recipeId">
          <RecipePage></RecipePage>
        </Route>
        <Route path="/recipe">
          <h3>Please pick a recipe.</h3>
        </Route>
        <Route exact path="/" component={Home} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
