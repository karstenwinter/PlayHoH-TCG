import fs from 'fs'
import path from 'path'
import {Effect, EffectCategory} from "../../interfaces/cardTypes"

const txtPath = path.resolve('./public', 'static', 'effects.txt')
const categoriesPath = path.resolve('./public', 'static', 'categories.txt')

export const effectsTxt = fs.readFileSync(txtPath, 'utf-8')
export const categoriesTxt = fs.readFileSync(categoriesPath, 'utf-8')

//console.log("effectsTxt: " + effectsTxt?.length)
export const parsedEffects = effectsTxt
    .replace(/\r/g, "")
    .split('\n')
    .map(x => {
        const parts =
            x.split("\",\"").map(x => x.replace(/"/g, ""))
        return {
            a: parts[0] ?? "",
            b: parts[1] ?? "",
            c: parts[2] ?? "",
            d: parts[3] ?? "",
            e: parts[4] ?? "",
            f: parts[5] ?? ""
        }
    }).filter((x, i) => i > 0)

export const parsedCategories = categoriesTxt
    .replace(/\r/g, "")
    .split('\n')
    .map(x => {
        const parts =
            x.split("\",\"").map(x => x.replace(/"/g, ""))
        return {
            a: parts[0] ?? "",
            b: parts[1] ?? ""
        }
    }).filter((x, i) => i > 0)

export const effects: Effect[] = parsedEffects
    .filter(x => x.a === "" && x.b !== "" && !x.b.startsWith("_"))
    .map(x => ({
        effect: x.b,
        text: x.c,
        power: parseFloat(x.d),
        witsAbility: x.e !== "",
        category: x.f
    }))

export const effectsForTypes: Effect[] = parsedEffects
    .filter(x => x.a !== "" && x.b !== "" && !x.b.startsWith("-"))
    .map(x => ({
        type: x.a,
        effect: x.b
    }))

export const effectsTypeForCategory: EffectCategory[] = parsedCategories
    .filter(x => x.a !== "" && x.b !== "")
    .map(x => ({
        textPart: x.a,
        category: x.b
    }))

export default function handler(req, res) {
    const obj = {effects, effectsForTypes, effectsTypeForCategory}
    res.status(200).json(obj)
}
