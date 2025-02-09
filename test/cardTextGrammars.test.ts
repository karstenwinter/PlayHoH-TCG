import {randomGen, runGrammar} from "../src/polygen"
import {archetypeGrammar, objectGrammar, personGrammar} from "../src/grammars"
import { splitIntoBox } from "../src/measureText"

function generateSomePhrasesFrom(grammar) {
    const done = {}
    Array.from({length: 2000}).forEach(i => {
        const grammarRes = runGrammar(grammar, randomGen("r" + new Date().toISOString() + "x" + i))
        const splitText = splitIntoBox(grammarRes)
        let res = splitText.map(x => x.text).join("\n")

        if (splitText.length <= 4 && !done[res]) {
            done[res] = true
            console.log(res) // grammarRes.replace("\n", "\\n") + "\n---\n" + res)
        }
    })
}

describe("Test", () => {
    it("should run personGrammar",
        async () => {
            generateSomePhrasesFrom(personGrammar)
        })
    it("should run objectGrammar",
        async () => {
            generateSomePhrasesFrom(objectGrammar)
        })
    it("should run archetypeGrammar",
        async () => {
            generateSomePhrasesFrom(archetypeGrammar)
        })
})
