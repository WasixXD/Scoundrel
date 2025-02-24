const fs = require("node:fs")
const dir = "dungeon"
const jsFile = "cards.js"


const files = fs.readdirSync(dir)

let output = []

for(const file of files) {
    const [name] = file.split(".")
    let value = parseInt(name.split("").splice(1, name.length).join("")) | 0
    const isMonster = name[0] === "P" || name[0] === "C" ? true : false

    switch(name[1]) {
        case "J":
            value = 11
            break
        case "Q":
            value = 12
            break
        case "K":
            value = 13
            break
        case "A":
            value = 14
            break
    }

    output.push({ name, sprite: `./dungeon/${file}` , value, isMonster })
}

// console.log(output)
fs.writeFileSync(jsFile, `export const cards = ${JSON.stringify(output, null,  2)}`)