import React from 'react';

import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { config } from '../../config';
import { Recipe } from '../../lib/models';
import { RecipeCard } from '../recipe-card/RecipeCard';
import { IconButton, Typography, ImageList, ImageListItem } from '@material-ui/core';
import { userContext, userIsEditor } from '../../lib/user';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../loading/loading';

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
            return <LoadingScreen />
        }

        const items = []

        for (const r of recipes.reverse()) {
            items.push(RecipeCard({ data: r, context: this.context }))
        }

        const newButton = (
            <ImageListItem className={this.props.classes.newButton} key={"new"}>
                <IconButton className={this.props.classes.newButtonIcon} component={Link} to="/recipe/create">
                    <AddIcon fontSize="large" />
                </IconButton>
            </ImageListItem>
        )

        return (
            <Container maxWidth="md">
                <Typography variant="h1" component="h2" gutterBottom>Hops Recepten</Typography>
                <ImageList rowHeight={270} gap={4} cols={window.innerWidth < 600 ? 1 : 2}>
                    {
                        this.context.state.loggedIn && userIsEditor(this.context.state.user)
                            ? newButton
                            : null
                    }
                    {items}
                </ImageList>
            </Container>
        )
    }
}

export default withStyles(styles, { withTheme: true })(Home)