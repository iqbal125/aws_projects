export interface Todo {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
}

export interface CreateTodoInput {
    title: string;
    description?: string;
}

export interface UpdateTodoInput {
    title?: string;
    description?: string;
    completed?: boolean;
}

export type TodoResponse = Todo;
export type TodoListResponse = {
    items: Todo[];
    count: number;
};
