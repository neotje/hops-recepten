import React from 'react';

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import GridList from '@material-ui/core/GridList';

import { config } from '../../config';
import { Recipe } from '../../lib/models';
import { RecipeCard } from '../recipe-card/RecipeCard';
import { Typography } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({})


interface HomeProps extends WithStyles<typeof styles> { }
type HomeState = {
    isLoaded: boolean
    recipes: Recipe[]
}

class Home extends React.Component<HomeProps, HomeState> {
    constructor(props: HomeProps) {
        super(props)

        this.state = {
            isLoaded: false,
            recipes: []
        }
    }

    componentDidMount() {
        fetch(`${config.apiUrl}/recipes/list`, {credentials: "same-origin"})
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        recipes: result.recipes
                    })
                },
                (error) => {
                    this.setState({
                        isLoaded: false
                    })
                }
            )
    }

    render() {
        const { isLoaded, recipes } = this.state

        if (!isLoaded) {
            return <div>Loading...</div>
        }

        const items = []

        for (const r of recipes) {
            items.push(RecipeCard({ data: r }))
        }

        return (
            <Container maxWidth="md">
                <Typography variant="h1" component="h2" gutterBottom>Hops Recepten</Typography>
                <GridList cellHeight={270} spacing={4} cols={window.innerWidth < 600 ? 1 : 2}>
                    {items}
                </GridList>
            </Container>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Home)