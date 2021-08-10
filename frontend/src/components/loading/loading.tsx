import { CircularProgress, Container, Grid } from '@material-ui/core';
import React from 'react';

export const LoadingScreen = () => {
    return (
        <Grid container justifyContent="center" alignItems="center">
            <Grid item>
                <CircularProgress></CircularProgress>
            </Grid>
        </Grid>
    )
}