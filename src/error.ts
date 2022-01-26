import { window } from "vscode"

export const enum Errors {
    bookUndefined,
}

export function error(Errors err) {
    switch (err) {

    }
    window.showErrorMessage()
}