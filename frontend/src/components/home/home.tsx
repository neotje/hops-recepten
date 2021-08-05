import React from 'react';

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import GridList from '@material-ui/core/GridList';

import { config } from '../../config';
import { Recipe } from '../../lib/models';
import { RecipeCard } from '../recipe-card/RecipeCard';
import { GridListTile, IconButton, Typography } from '@material-ui/core';
import { userContext } from '../../lib/user';
import AddIcon from '@material-ui/icons/Add';

const styles = (theme: Theme) => createStyles({
    newButton: {
        borderColor: theme.palette.divider,
        border: "solid 4px",
        boxSizing: "border-box",
    },
    newButtonIcon: {
        position: "relative",
        float: "left",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "64px"
    }
})


interface HomeProps extends WithStyles<typeof styles> { }
type HomeState = {
    isLoaded: boolean
    recipes: Recipe[]
}

class Home extends React.Component<HomeProps, HomeState> {
    static contextType = userContext

    constructor(props: HomeProps) {
        super(props)

        this.state = {
            isLoaded: false,
            recipes: []
        }
    }

    componentDidMount() {
        fetch(`${config.apiUrl}/recipes/list`, { credentials: "same-origin" })
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

        const newButton = (
            <GridListTile className={this.props.classes.newButton} key={"new"}>
                <IconButton className={this.props.classes.newButtonIcon}>
                    <AddIcon fontSize="large" />
                </IconButton>
            </GridListTile>
        )

        return (
            <Container maxWidth="md">
                <Typography variant="h1" component="h2" gutterBottom>Hops Recepten</Typography>
                <GridList cellHeight={270} spacing={4} cols={window.innerWidth < 600 ? 1 : 2}>
                    {
                        this.context.state.loggedIn
                            ? newButton
                            : null
                    }
                    {items}
                </GridList>
            </Container>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Home)