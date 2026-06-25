export interface IIssue {
    title: string,
    description: string,
    type: string
}

export interface QueryIssue {
    sort: string,
    type: string,
    status: string
}