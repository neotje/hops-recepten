import React, { useContext } from 'react';
import { Link } from "react-router-dom"

import { ButtonGroup, ImageListItem, ImageListItemBar } from '@material-ui/core';


import { config } from '../../config';
import { Recipe, UserContext } from '../../lib/models';
import { Button } from '@material-ui/core';
import { userContext, userIsAuthor } from '../../lib/user';
import { Delete } from '@material-ui/icons';

type RecipeCardProps = {
    data: Recipe
    context: UserContext
}

export const RecipeCard = ({ data, context }: RecipeCardProps) => {
    function onDelete() {
        
    }

    return (
        <ImageListItem key={data.id} component={Link} to={`/recipe/${data.id}`}>
            <img src={`${config.apiUrl}/recipes/${data.id}/image`} alt="result of recipe" />
            <ImageListItemBar
                title={data.title}
                subtitle={<span>{data.author.name}</span>}
                actionIcon={
                    <ButtonGroup variant="contained" color="primary">
                        {
                            (context.state.loggedIn && userIsAuthor(context.state.user, data)) &&
                            <Button onClick={e => {onDelete()}}><Delete /></Button>
                        }
                        <Button component={Link} to={`/recipe/${data.id}`}>Naar Recept</Button>
                    </ButtonGroup>
                }
                style={{
                    paddingRight: 12
                }}
            />
        </ImageListItem>
    )
}