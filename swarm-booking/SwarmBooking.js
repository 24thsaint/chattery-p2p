const swarmlog = require('swarmlog')
const wrtc = require('wrtc')
const readline = require('readline');
const level = require('level')

class SwarmBooking {
    constructor() {
        this.booking = {}

        this.database = level('./local', {
            valueEncoding: 'json'
        })

        this.log = swarmlog({
            keys: require('./keys.json'),
            sodium: require('chloride/browser'),
            db: level('./swarm'),
            valueEncoding: 'json',
            hubs: ['http://signalhub-router.herokuapp.com/'],
            wrtc: wrtc
        })

        this.log.on('add', (node) => {
            console.log('booking successfull!')
        })

        this.log.createReadStream({
                live: true
            })
            .on('data', (data) => {
                console.log('RECEIVED', data)
                this.database.put(data.key, data.value, (err) => {
                    if (err) console.log(err)
                })
                this.index(data.value, data.key)
            })
    }

    /**
     * Appends a booking to the log if it does not exist.
     * 
     * @param {Object} booking - The booking object
     */
    async book(booking) {
        let f = await this.find(booking)
        
        if (!f) {
            await this.log.append(booking)
        } else {
            console.log('Room not available')
        }
    }

    /**
     * Queries the log if a booking already exists.
     * 
     * @param {object} query - The object to search
     */
    async find(query) {
        try {
            const res = await this.database.get(JSON.stringify(query))
            return res
        } catch (err) {
            console.log(err)
        }
        return false
    }

    /**
     * Indexes the booking query to a key
     * so that searching will be faster.
     * 
     * @param {object} json 
     * @param {string} key
     */
    index(json, key) {
        this.database.put(JSON.stringify(json), key, (err) => {
            if (err) return console.log(err)
        })
        this.database.get(JSON.stringify(json), (err, val) => {
            if (err) return console.log(err)
            console.log('index', val)
        })
    }

    /**
     * Prompts the user for inputs.
     */
    prompter() {
        const booking = {};

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        console.log('Hotel Booking')

        process.stdout.write('Name: ')
        let inc = 0

        rl.on('line', (input) => {
            if (inc == 0) {
                process.stdout.write('Room: ')
                booking.name = input
            }
            if (inc == 1) {
                process.stdout.write('Date: ')
                booking.room = input
            }
            if (inc == 2) {
                booking.date = input
                this.book(booking)
            }
            inc++
        });
    }
}

module.exports = SwarmBooking;