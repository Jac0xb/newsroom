export namespace UsersAPI {

    export function updateUserRoles(id: number) {
        return `/api/roles/${id}`;
    };

    export function getAllUsers() {
        return '/api/users';
    }
}