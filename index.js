import { Card, Deck } from "./classes.js"
import { cards } from "./cards.js"
const { createApp, ref, nextTick, watch } = Vue


createApp({
    setup() {

        const roomCards = ref([])
        const dropzone = ref([])
        const deck = new Deck(cards)
        const health = ref(20)
        const weapon = ref(new Card("none", 0, ""))
        const room = ref(0)
        const canRun = ref(true)
        const canUse = ref(true)

        watch(health, (newValue) => {
            if(newValue <= 0) {
                alert("Você perdeu")
                // this is terrible
                // if we reload we need to reload the images
                // change this
                location.reload()
            }
        })


        deck.shuffle()

        const nextCard = ref(deck.nextCard())


        function killWithWeapon(el, target) {
            const cardId = el.firstChild.id
            const card = deck.getCard(cardId)

            health.value -=  Math.max(0, card.value - weapon.value.value)
            dropzone.value.push(card)
            removeFromRoom(card)
        }

        nextTick(() => {
            dragula([document.querySelector("#room"), document.querySelector("#dropzone")], {
                accepts: (el, target) => {
                    if(dropzone.value.length <= 0) {
                        return weapon.value.name !== "none" && 
                               target.id === "dropzone" &&
                               (el.firstChild.src.includes("P") || el.firstChild.src.includes("C"))
                    }

                    const card = deck.getCard(el.firstChild.id)
                    const lastMonster = dropzone.value[dropzone.value.length - 1]
                    const isValid = lastMonster ? lastMonster.value > card.value : false

                    return weapon.value.name !== "none" && 
                               target.id === "dropzone" &&
                               (el.firstChild.src.includes("P") || el.firstChild.src.includes("C")) &&
                               isValid


                },
                removeOnSpill: false
            }).on("drop", killWithWeapon)
            
        })

        function getCards() {
            roomCards.value = [...roomCards.value, ...deck.remove(4 - roomCards.value.length)]
            nextCard.value = deck.nextCard()
            room.value++

            canRun.value = true
            canUse.value = true
        }

        function removeFromRoom(card) {
            const index = roomCards.value.findIndex((item) => item.name === card.name)
            if(index < 0) return

            roomCards.value.splice(index, 1)
        }

        function bareHands(card) {
            removeFromRoom(card)
            health.value -= card.value
        }

        function equip(card) {
            removeFromRoom(card)
            weapon.value = card
            dropzone.value = []
        }

        function use(card) {
            removeFromRoom(card)
            if(!canUse.value) return
            health.value += Math.min(card.value, 20 - health.value); 
            canUse.value = false
        }

        function run() {
            deck.cards.unshift(...roomCards.value)
            roomCards.value = []
            getCards()
            canRun.value = false
        }


        return {
            roomCards,
            getCards,
            nextCard,
            bareHands,
            health,
            dropzone,
            weapon,
            equip,
            use,
            room,
            run,
            canRun,
            canUse
        }
    },

}).mount('#app')
