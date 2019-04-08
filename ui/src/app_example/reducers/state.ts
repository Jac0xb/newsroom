import { TodoModel } from 'app_example/models';

export interface RootState {
  todos: RootState.TodoState;
  router?: any;
}

export namespace RootState {
  export type TodoState = TodoModel[];
}
