/**
 * Created by osman on 12/11/16.
 */
const jobs = [{
    requestId: 119991,
    shipperId: "lk23j423lk3j2434",
    shipper: {
        name: "Yasin's Shipping",
        // shipper object
    },
    carrierIds: ["234234234234"], // max length 2,
    origin: {
        name: 'Ford of Fremont',
        location: {
            latitude: "123.0",
            longitude: "123.0"
        },
        userId: "2l3kj2l3kj42l3k",
        user: {
            // user object
            firstName: "Ali",
            lastName: "Qureshi",
            phoneNumber: "+19888888888",
            email: "ali@stowk.com"
        }
    },
    destination: {
        name: 'Ford of San Francisco',
        location: {
            latitude: "123.0",
            longitude: "123.0"
        },
        userId: "232342343242",
        user: {
            // user object
            firstName: "Yasin",
            lastName: "Arif",
            phoneNumber: "+19888888888",
            email: "yasin@stowk.com"
        },
    },
    pickupDate: "2016-12-23",
    dropoffDate: "2017-01-02",
    status: 0, // [0, 1, 2, 3, 4, 5]  0: new, 1:processing, 2:dispatched, 3:in-progress, 4:complete, 5:cancelled
    paymentType: "ACH",
    paymentStatus: 0, // 0,1,2  not paid, in process, paid
    paymentId: null,
    amountDue: 450.00,
    // stowkPaymentStatus: 2,
    // stowkAmountDue: 50,
    // stowkPaymentId: "32l3kj42l34jl",
    deliveries: [{ // I will need to explain why it's like this
        requestId: 119991,
        carrierId: "234324234234223",
        truck: {
            model: "Toyota",
            make: "XYZ",
            license: "XYZ",
            color: "blue",
            maxLoad: 6, // number of cars
            vin: "XUZ",
            enclosed: true,
            type: {
                year: "1992"
            },
            pickup: "Sun Dec 11 2016 18:29:10 GMT-0800 (PST)",
            delivery: null
        }
    }],
    vehicles: [{
        make: "xz",
        model: "cuz",
        year: "2134",
        trim: "Jfiej",
        body: "Fjeifj",
        vin: "Jfioejf",
        license: "jfiefj",
        color: "Blue",
        lotNumber: "fjeiojf",
        running: true, // boolean,
        enclosed: false, // boolean,
        // below is subject to change
        pickupComments: "Jfieoj", // notes for vehicle,
        pickupImages: [], // array of images, max 4,
        dropoffComments: "feijf", // notes
        dropoffImages: []// array
    }],
    documents: ["http://somelinkto.aws.document.com/phonylskdjflsdkjf.img"], // array of images for general docs
    notes: "Pickup vehicles from the back entrance and ask gatekeeper to open the gate"
},

    {
        requestId: 119992,
        shipperId: "lk23j423lk3j2434",
        shipper: {
            name: "Yasin's Shipping",
            // shipper object
        },
        carrierIds: ["234234234234"], // max length 2,
        origin: {
            name: 'Ford of San Jose',
            location: {
                latitude: "123.0",
                longitude: "123.0"
            },
            userId: "2l3kj2l3kj42l3k",
            user: {
                // user object
                firstName: "Ali",
                lastName: "Qureshi",
                phoneNumber: "+19888888888",
                email: "ali@stowk.com"
            }
        },
        destination: {
            name: 'Ford of Fremont',
            location: {
                latitude: "123.0",
                longitude: "123.0"
            },
            userId: "232342343242",
            user: {
                // user object
                firstName: "Yasin",
                lastName: "Arif",
                phoneNumber: "+19888888888",
                email: "yasin@stowk.com"
            },
        },
        pickupDate: "2016-12-23",
        dropoffDate: "2017-01-02",
        status: 0, // [0, 1, 2, 3, 4, 5]  0: new, 1:processing, 2:dispatched, 3:in-progress, 4:complete, 5:cancelled
        paymentType: "ACH",
        paymentStatus: 0, // 0,1,2  not paid, in process, paid
        paymentId: null,
        amountDue: 450.00,
        // stowkPaymentStatus: 2,
        // stowkAmountDue: 50,
        // stowkPaymentId: "32l3kj42l34jl",
        deliveries: [{ // I will need to explain why it's like this
            requestId: 119991,
            carrierId: "234324234234223",
            truck: {
                model: "Toyota",
                make: "XYZ",
                license: "XYZ",
                color: "blue",
                maxLoad: 6, // number of cars
                vin: "XUZ",
                enclosed: true,
                type: {
                    year: "1992"
                },
                pickup: "Sun Dec 11 2016 18:29:10 GMT-0800 (PST)",
                delivery: null
            }
        }],
        vehicles: [{
            make: "xz",
            model: "cuz",
            year: "2134",
            trim: "Jfiej",
            body: "Fjeifj",
            vin: "Jfioejf",
            license: "jfiefj",
            color: "Blue",
            lotNumber: "fjeiojf",
            running: true, // boolean,
            enclosed: false, // boolean,
            // below is subject to change
            pickupComments: "Jfieoj", // notes for vehicle,
            pickupImages: [], // array of images, max 4,
            dropoffComments: "feijf", // notes
            dropoffImages: []// array
        }],
        documents: ["http://somelinkto.aws.document.com/phonylskdjflsdkjf.img"], // array of images for general docs
        notes: "Pickup vehicles from the back entrance and ask gatekeeper to open the gate"
    },

];

