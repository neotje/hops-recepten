import { config } from "../config";
import { User } from "./models";

export function getCurrentUser(): Promise<User | null> {
    return fetch(`${config.apiUrl}/user`, { credentials: "include" })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                var u: User = result.user
                return u
            }
            return null
        })
}

export function isLoggedIn(): Promise<boolean> {
    return getCurrentUser().then(user => {
        return user != null
    })
}

export function loginUser(email: string, password: string): Promise<User | null> {
    return fetch(`${config.apiUrl}/user/login`, {
        method: 'POST',
        body: JSON.stringify({
            'email': email,
            'password': password
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                var u: User = result.user
                return u
            }
            return null
        })
}

export function logoutUser(): Promise<boolean> {
    return fetch(`${config.apiUrl}/user/logout`, { credentials: "include" })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                return true
            }
            return false
        })
}