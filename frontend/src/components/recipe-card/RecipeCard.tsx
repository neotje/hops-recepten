import React from 'react';
import { Link } from "react-router-dom"

import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import { config } from '../../config';
import { Recipe } from '../../lib/models';
import { Button } from '@material-ui/core';

type RecipeCardProps = {
    data: Recipe
}

export const RecipeCard = ({ data }: RecipeCardProps) => {
    return (
        <GridListTile key={`${config.apiUrl}/recipes/${data.id}/image`}>
            <img src={`${config.apiUrl}/recipes/${data.id}/image`} alt="result of recipe"/>
            <GridListTileBar
                title={data.title}
                subtitle={<span>{data.author.name}</span>}
                actionIcon={
                    <Button variant="contained" color="primary" component={Link} to={`/recipe/${data.id}`}>Naar Recept</Button>
                }
                style={{
                    paddingRight: 12
                }}
            />
        </GridListTile>
    )
}