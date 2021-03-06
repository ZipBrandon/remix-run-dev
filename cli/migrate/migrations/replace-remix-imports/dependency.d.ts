export interface Dependency {
    name: string;
    versionSpec: string;
}
export declare let depsToEntries: (deps?: Record<string, string> | undefined) => Dependency[];
export declare let depsToObject: (deps: Dependency[]) => Record<string, string>;
export declare const isRemixPackage: (name: string) => boolean;
