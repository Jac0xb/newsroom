export = index;
declare function index(config: any, opts: any, cb: any): any;
declare namespace index {
    class SwaggerCombine {
        constructor(config: any, opts: any);
        config: any;
        opts: any;
        apis: any;
        schemas: any;
        combinedSchema: any;
        addBasePath(): any;
        addSecurityToPaths(): any;
        addTags(): any;
        combine(): any;
        combineAndReturn(): any;
        combineSchemas(): any;
        dereferenceSchemaSecurity(): any;
        filterParameters(): any;
        filterPaths(): any;
        includeTerm(schema: any, term: any): void;
        load(): any;
        removeEmptyFields(): any;
        rename(renaming: any, node: any): any;
        renameByRegexp(currentValue: any, valueToRename: any, renameValue: any): any;
        renameByReplace(currentValue: any, valueToRename: any, renameValue: any): any;
        renameOperationIds(): any;
        renamePaths(): any;
        renameSecurityDefinitions(): any;
        renameTags(): any;
    }
    function middleware(config: any, opts: any): any;
    function middlewareAsync(config: any, opts: any): any;
}
