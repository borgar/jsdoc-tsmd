export declare type Airline = {
    airline: string;
    /** Book a seat on a flight */
    book: bookingFunction;
    /** The array of bookings */
    bookings: Array<Booking>;
    iataCode: string;
};

/** An airline booking. */
export declare type Booking = {
    /** ID of the booking. */
    id: string;
    /** Type of booking. */
    type: string;
};

/**
 * @param flightNum Index of array element
 * @param name Index of array element
 * @returns ID of a new booking
 */
export declare type bookingFunction = {
    /**
     * @param flightNum Index of array element
     * @param name Index of array element
     * @returns ID of a new booking
     */
    (flightNum: number, name: string): number;
    /** Is the booking function connected to a database? */
    isConnected: boolean;
    /**
     * Connect to a database
     *
     * @param name Database name
     * @returns ID of a database session
     */
    connect(name: object): number;
};
