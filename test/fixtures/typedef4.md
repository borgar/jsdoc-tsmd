**Types**

- [Airline](#Airline)
- [Booking](#Booking)
- [bookingFunction( flightNum, name )](#bookingFunction)

## Types

### <a id="Airline" href="#Airline">#</a> Airline = `object`

##### Properties

| Name     | Type                                  | Description             |
| -------- | ------------------------------------- | ----------------------- |
| airline  | `string`                              |                         |
| book     | [`bookingFunction`](#bookingFunction) | Book a seat on a flight |
| bookings | `Array<Booking>`                      | The array of bookings   |
| iataCode | `string`                              |                         |

---

### <a id="Booking" href="#Booking">#</a> Booking = `Record<string, any>`

An airline booking.

##### Properties

| Name | Type     | Description        |
| ---- | -------- | ------------------ |
| id   | `string` | ID of the booking. |
| type | `string` | Type of booking.   |

---

### <a id="bookingFunction" href="#bookingFunction">#</a> bookingFunction( flightNum, name ) ⇒ `number`

##### Parameters

| Name      | Type     | Description            |
| --------- | -------- | ---------------------- |
| flightNum | `number` | Index of array element |
| name      | `string` | Index of array element |

##### Properties

| Name            | Type       | Returns  | Description                                      |
| --------------- | ---------- | -------- | ------------------------------------------------ |
| isConnected     | `boolean`  |          | Is the booking function connected to a database? |
| connect( name ) | `Function` | `number` | Connect to a database                            |

---