/**
 * An airline booking.
 * @typedef {object<*>} Booking
 * @property {string} id ID of the booking.
 * @property {string} type Type of booking.
 */

/**
 * @callback bookingFunction
 * @param {number} flightNum - Index of array element
 * @param {string} name - Index of array element
 * @property {boolean} isConnected Is the booking function connected to a database?
 * @returns {number} ID of a new booking
 */

/**
 * Connect to a database
 * @callback bookingFunction#connect
 * @param {object} name Database name
 * @returns {number} ID of a database session
 */

/**
 * @typedef {Object} Airline
 * @property {String} airline
 * @property {String} iataCode
 * @property {Array<Booking>} bookings The array of bookings
 * @property {bookingFunction} book Book a seat on a flight
 */
