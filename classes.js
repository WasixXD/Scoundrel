export class Card {
    constructor(name, value, sprite, isMonster) {
        this.name = name
        this.value = value
        this.sprite = sprite
        this.isMonster = isMonster
    }
}


export class Deck {
    constructor(cards) {

        this.lookUpTable = new Map()
        this.cards = []
        for(const card of cards) {
            const C = new Card(card.name, card.value, card.sprite, card.isMonster)
            this.cards.push(C)
            this.lookUpTable.set(card.name, C)
        }
    }

    remove(qtd) {
        return this.cards.splice(this.cards.length - qtd, this.cards.length)
    }

    nextCard() {
        return this.cards[this.cards.length - 1]
    }

    shuffle() {
        for(const card in this.cards) {
            const randomPos = Math.floor(Math.random() * this.cards.length)
            const tmp = this.cards[randomPos]

            this.cards[randomPos] = this.cards[card]
            this.cards[card] = tmp
        }
    }

    getCard(cardName) {
        return this.lookUpTable.get(cardName)
    }
}

