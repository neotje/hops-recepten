export interface ResponseError {
    code: number
    msg: string
}

export interface User {
    name: string
    email: string
    type: string
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
