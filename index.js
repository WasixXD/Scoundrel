import { Card, Deck } from "./classes.js"
import { cards } from "./cards.js"
const { createApp, ref, nextTick, watch } = Vue

const hit = new Audio("./audio/barehands.wav")
const sword = new Audio("./audio/swordhit.wav")

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
        const remaning = ref(deck.cards.length)
        const showTakenDmg = ref(0)
        const kingSlayer = ref(false)

        watch(health, (newValue) => {
            if(newValue <= 0) {
                alert("Você perdeu")
                // this is terrible
                // if we reload we need to reload the images
                // change this
                location.reload()
            }
        })

        watch([remaning, roomCards], ([newRemaining, newRoomCards]) => {

            if(newRemaining === 0 && newRoomCards.length === 0) {
                alert("Você ganhou")
                location.reload()
            }
        })

        // for now this will do
        watch(dropzone, (slayed) => {
            let count = 0
            for(let card of slayed) {
                if(card.value === 14 || card.value === 13 || card.value === 12 || card.value === 11) {
                    count++
                }
            }

            if(count === 4) {
                kingSlayer.value = true
            }
        })

        watch(kingSlayer, (value) => {
            if(value) {
                let int = setInterval(() => {
                    kingSlayer.value = false
                    clearInterval(int)
                }, 3000)
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
            showTakenDmg.value = 0
            sword.play()
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
            .on("over", (el, target) => {
                if(weapon.value.name === "none") return

                const card = deck.getCard(el.firstChild.id)
                showTakenDmg.value = Math.abs(Math.max(0, card.value - weapon.value.value))
            })
        })

        function getCards() {
            roomCards.value = [...roomCards.value, ...deck.remove(4 - roomCards.value.length)]
            nextCard.value = deck.nextCard()
            room.value++

            canRun.value = true
            canUse.value = true
            remaning.value = deck.cards.length
        }

        function removeFromRoom(card) {
            const index = roomCards.value.findIndex((item) => item.name === card.name)
            if(index < 0) return

            roomCards.value.splice(index, 1)
        }

        function bareHands(card) {
            removeFromRoom(card)
            health.value -=  Math.max(0, card.value)
            showTakenDmg.value = 0
            hit.play() 
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

        function calculateDmg(card) {
            if(!card.isMonster) return
            showTakenDmg.value = card.value

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
            canUse,
            remaning,
            calculateDmg,
            showTakenDmg,
            kingSlayer
        }
    },

}).mount('#app')
