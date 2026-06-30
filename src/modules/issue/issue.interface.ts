// export interface IIssue {
//     title: string,
//     description: string,
//     type: string
// }

// export interface QueryIssue {
//     sort: string,
//     type: string,
//     status: string
// }

export interface IssuePayload {
    title: string,
    description: string,
    type: string
};

export interface IssueQuery {
    sort?: string,
    type?: string,
    status?: string
};

export interface AuthUser {
    id: number,
    role: string
};

export interface UpdateIssuePayload {
    title?: string,
    description?: string,
    type?: string,
    status?: string
}