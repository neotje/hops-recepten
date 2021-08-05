import React from 'react';
import './App.css';

import { BrowserRouter, Route, Switch } from "react-router-dom"

import Home from './components/home/home';
import { RecipePage } from './components/recipe/recipe';
import { Login } from './components/login/login';
import { UserProvider } from './lib/user';
import { Navigation } from './components/navigation/navigation';
import { CreatePage } from './components/create/create';
import { EditPage } from './components/edit/edit';


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navigation></Navigation>

        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/recipe/create">
            <CreatePage></CreatePage>
          </Route>
          <Route path="/recipe/:recipeId/edit">
            <EditPage></EditPage>
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
    </UserProvider>
  );
}

export default App;
