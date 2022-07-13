import type { Flags } from "./flags";
export declare type MigrationFunction = (args: {
    flags: Flags;
    projectDir: string;
}) => Promise<void>;
export interface Migration {
    id: string;
    description: string;
    function: MigrationFunction;
}
