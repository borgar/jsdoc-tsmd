/** A are multicellular organism in the biological kingdom Animalia. */
export declare type Animal = {
    /** The phylum of the subject. */
    phylum: string;
    /** The species of the subject. */
    species: string;
};

/** A a vertebrate animal of the class Mammalia. */
export declare type Mammal = Animal & {
    /** A zero based position in a token list. */
    class: "mammal";
    /** The phylum of the subject. */
    phylum: "chordata";
    /** Set to 0 for males, 1 for females, null if sexless. */
    sex: number;
};
