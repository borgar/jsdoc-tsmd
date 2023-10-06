/**
 * @typedef {object<string,any>} Animal A are multicellular organism in the biological kingdom Animalia.
 * @property {string} species The species of the subject.
 * @property {string} phylum The phylum of the subject.
 */

/**
 * @typedef {Record<string,any>} Mammal A a vertebrate animal of the class Mammalia.
 * @augments Animal
 * @property {"chordata"} phylum The phylum of the subject.
 * @property {"mammal"} class A zero based position in a token list.
 * @property {number} sex Set to 0 for males, 1 for females, null if sexless.
 */
