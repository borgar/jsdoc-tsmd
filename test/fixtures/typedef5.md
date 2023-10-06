**Types**

- [Animal](#Animal)
- [Mammal](#Mammal)

## Types

### <a id="Animal" href="#Animal">#</a> Animal

A are multicellular organism in the biological kingdom Animalia.

##### Properties

| Name    | Type     | Description                 |
| ------- | -------- | --------------------------- |
| phylum  | `string` | The phylum of the subject.  |
| species | `string` | The species of the subject. |

---

### <a id="Mammal" href="#Mammal">#</a> Mammal extends [`Animal`](#Animal)

A a vertebrate animal of the class Mammalia.

##### Properties

| Name   | Type         | Description                                         |
| ------ | ------------ | --------------------------------------------------- |
| class  | `"mammal"`   | A zero based position in a token list.              |
| phylum | `"chordata"` | The phylum of the subject.                          |
| sex    | `number`     | Set to 0 for males, 1 for females, null if sexless. |

---
