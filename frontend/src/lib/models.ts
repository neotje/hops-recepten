export interface ResponseError {
    code: number
    msg: string
}

export interface User {
    name: string
    email: string
    type: string
}

export const EmptyUser: User = {
    name: "",
    email: "",
    type: ""
}

export interface UserAction {
    type: string
}

export interface UserInterface {
    loggedIn: boolean
}

export interface UserContext {
    state: UserInterface
    dispatch: (value: UserAction) => void
}

export interface Ingredient {
    amount: string
    name: string
}

export interface Step {
    content: string
}

export interface Recipe {
    id: string
    title: string
    author: User
    ingredients: Ingredient[]
    gear: string[]
    steps: Step[]
}

export const EmptyRecipe: Recipe = {
    id: "",
    title: "",
    author: EmptyUser,
    ingredients: [],
    gear: [],
    steps: []
}
