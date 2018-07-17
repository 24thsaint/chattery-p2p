const swarmlog = require('swarmlog')
const wrtc = require('wrtc')
const readline = require('readline')
const level = require('level')
const colors = require('colors')
const crypto = require('crypto')

const verbose = process.env.VERBOSE || false

class SwarmBooking {
    constructor() {
        this.booking = {}
        this.rl = undefined

        /**
         * This is a local level instance so that we can manually set
         * the key-value pairs.
         */
        this.database = level('./local', {
            valueEncoding: 'json'
        })

        /**
         * A swarmlog instance to sync data with other peers.
         */
        this.log = swarmlog({
            keys: require('./keys.json'),
            sodium: require('chloride/browser'),
            db: level('./swarm'),
            valueEncoding: 'json',
            hubs: ['http://signalhub-router.herokuapp.com/'],
            wrtc: wrtc
        })

        this.log.on('add', (node) => {
            this._logger('booking successfull!')
        })

        this.log.createReadStream({
                live: true
            })
            .on('data', (data) => {
                this._logger('RECEIVED', data)

                this.database.put(data.key, data.value, (err) => {
                    if (err) this._logger(err)
                })

                this.index(data.value, data.key)
            })
    }

    /**
     * Appends a booking to the log if it does not exist.
     * 
     * @param {Object} hash - The booking object
     */
    async book(booking) {
        const hash = this._hash(JSON.stringify(booking))
        let f = await this.find(hash)
        
        if (!f) {
            await this.log.append(hash)
            console.log(colors.green('***************************'))
            console.log(colors.green('Room Booked!'))
            console.log(booking)
            console.log('Hash: ' + hash)
            console.log(colors.green('***************************'))
        } else {
            console.log(colors.red('***************************'))
            console.log(colors.red('Room not available'))
            console.log(colors.red('***************************'))
        }
    }

    /**
     * Queries the log if a booking already exists.
     * 
     * @param {object} query - The object to search
     */
    async find(key) {
        try {
            const res = await this.database.get(key)
            return res
        } catch (err) {
            this._logger(err)
        }
        return false
    }

    /**
     * Indexes the booking query to a key
     * so that searching will be faster.
     * 
     * @param {object} hashedData 
     * @param {string} key
     */
    index(hashedData, key) {
        this.database.put(hashedData, key, (err) => {
            if (err) return this._logger(err)
        })
        this.database.get(hashedData, (err, val) => {
            if (err) return this._logger(err)
            this._logger('index', val)
        })
    }

    _hash(text) {
        const hash = crypto.createHash('sha256')
        hash.update(text)
        return hash.digest('hex').toString()
    }

    _logger(message) {
        if (verbose) {
            console.log(message)
        }
    }

    /**
     * Prompts the user for inputs.
     */
    prompter() {
        const booking = {}

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        console.log('========================')
        console.log('Hotel Booking')
        console.log('========================')

        process.stdout.write('Name: ')
        let inc = 0

        this.rl.on('line', async (input) => {
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
                await this.book(booking)
                this.rl.close()
                this.rl = undefined
                this.prompter()
            }
            inc++
        })
    }
}

module.exports = SwarmBooking