/** This class describes a tester. */
export declare class Tester {
    /**
     * Constructs a new instance.
     *
     * @param name The name
     */
    constructor(name: string);
    /**
     * Gets the name.
     *
     * @returns The name.
     */
    getName(): string;
    /** The name of the instance */
    name: string;
    /**
     * The XXX of Tester
     *
     * @param [arg=1] Some number
     * @returns A multiplier of the number
     */
    static xxx(arg?: number): number;
}
