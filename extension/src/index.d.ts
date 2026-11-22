
interface PickOptions {
    canPickMany?: boolean
    matchOnDescription?: boolean
    matchOnDetail?: boolean
}

interface InputBoxOptions {
    title?: string;
    value?: string;
    valueSelection?: [number, number];
    prompt?: string;
    placeHolder?: string;
}

interface OpenDialogOptions<Uri> {
    defaultUri?: Uri;
    openLabel?: string;
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    canSelectMany?: boolean;
    filters?: { [name: string]: string[] };
    title?: string;
}

interface SaveDialogOptions<Uri> {
    defaultUri?: Uri;
    saveLabel?: string;
    filters?: { [name: string]: string[] };
    title?: string;
}
