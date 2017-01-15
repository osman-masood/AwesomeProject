/**
 * Created by osman on 12/25/16.
 *
 *
 *
 * @flow
 */
"use strict";


/**
 ABOUT REQUEST STATUSES: Taken from https://github.com/yasinarif1/stowk-APIserver/blob/dad8baa308b1bc7e417e4824405a2d2a5c4784de/api/data/models/Request.js

 0 new: new request created - payment not processed
 1 processing: payment accepted from shipper, awaiting carrier acceptance
 2 dispatched: Carrier accepted and is on his way to pickup
 3 in-progress: En Route, cars picked-up
 4 complete: cars delivered,
 5 cancelled: only can be cancelled on 2 or below

 Status can only increase.
 */
const RequestStatusEnum = Object.freeze({
    NEW: 0,
    PROCESSING: 1,
    DISPATCHED: 2,
    IN_PROGRESS: 3,
    COMPLETE: 4,
    CANCELLED: 5,
});

const DeliveryStatusEnum = Object.freeze({
    ACCEPTED: 0,
    IN_PROGRESS: 1,  // They picked it up
    DROPPED_OFF: 2,
    RETURNED: 3
});


const GRAPHQL_ENDPOINT = "https://stowkapi-staging.herokuapp.com/graphql?";

/* For Flow support */
class Request {
    _id: string;
    status: number;
    paymentType: string;
    amountDue: number;
    amountEstimated: number;
    declinedBy: Array<string>;
    deliveries: {
        edges: [{
            node: {
                _id: string,
                carrierId: string,
            }
        }]
    };
    vehicleIds: Array<String>;
    vehicles: {
        count: number;
        edges: {
            node: {
                year: number;
                make: string;
                model: string;
                type: string;
                color: string;
                enclosed: boolean;
                running: boolean;
            }
        }
    };
    preferredCarrierIds: Array<String>;
    origin: {
        coordinates: Array<number>;
        locationName: string;
        contactName: string;
        contactPhone: string;
        address: string;
    };
    destination: {
        coordinates: Array<number>;
        locationName: string;
        contactName: string;
        contactPhone: string;
        address: string;
    };
    pickupDate: string;
    dropoffDate: string;
    createdAt: string;
    shipper: {
        name: string;
        buyerNumber: string;
        phone: string;
    };
}

class User {
    _id: string;
    carrier: {
        _id: string
    };
}

const genericRequestsQueryStringLambda = (requestsFunctionString:string) => `{
  viewer {
    me {
      _id,
      carrier {
        _id
      }
    }
  
    locationRequests(latitude: 30.0, longitude:-130, distance:5000) {
      _id,
      status,
      paymentType,
      amountDue,
      amountEstimated,
      declinedBy {
        carrierId
      },
      deliveries {
        edges {
          node {
            _id,
            carrierId
          }
        }
      },
      vehicleIds,
      vehicles {
        count,
        edges {
          node {
			year,
            make,
            model,
            type,
            color,
            enclosed,
            running
          }
        }
      },
      preferredCarrierIds,
      origin {
        coordinates,
        locationName,
        contactName,
        contactPhone,
        address
      },
      destination {
        coordinates,
        locationName,
        contactName,
        contactPhone,
        address
      },
      pickupDate,
      dropoffDate,
      createdAt,
      shipper {
        name,
        buyerNumber,
        phone,
      }
    }
  }
}`;

const acceptRequestAndCreateDeliveryFunction = (accessToken:string, request:Request, carrierId:string, currentLatitude:number, currentLongitude:number) => {
    return fetchGraphQlQuery(
        accessToken,
        `mutation UpdateRequestById {
            requestUpdateById(input: {clientMutationId: "10", record:{_id:"${request._id}", status:${RequestStatusEnum.DISPATCHED}}}) {
                recordId
            }
        }`
    ).then((response) => {
        return fetchGraphQlQuery(
            accessToken,
            `mutation AddDeliveryToRequest {
                deliveryCreate(input: {
                    clientMutationId:"11",
                    record: {
                        carrierId:"${carrierId}", 
                        requestId:"${request._id}", 
                        currentCoordinates:[${currentLongitude}, ${currentLatitude}],
                        status: ${DeliveryStatusEnum.ACCEPTED},
                        vehicleIds: ${JSON.stringify(request.vehicleIds)}
                    }
                }) {
                    record { _id }
                }
            }`
        )
    });
};

const createDeclinedByGraphQlString = (request:Request, carrierId:string, reason:string) => {
    let newDeclinedBy = request.declinedBy;
    if (request.declinedBy.map((db) => db['carrierId']).indexOf(carrierId) !== -1) {
        console.warn("createDeclinedByGraphQlString: Request ", request, "already contains the carrier ID", carrierId, "in its declinedBy. Shouldn't happen, corrupted DB data?");
    } else {
        newDeclinedBy = newDeclinedBy.concat([{carrierId: carrierId, reason: reason || ""}]);
    }
    return "[" + newDeclinedBy.map((db) => `{carrierId: "${db.carrierId}", reason: "${db.reason}"}`).join(',') + "]"; // TODO really should use the graphql vars for this. Can't use JSON.stringify because the key names have doubel quotes which GraphQL doesn't like.
}
;

/**
 * Adds the carrierId to the Request's declinedBy array.
 */
const declineRequestFunctionWithAccessToken = (accessToken:string, request:Request, carrierId:string, reason: string) => {
    const newDeclinedByStr = createDeclinedByGraphQlString(request, carrierId, reason);
    const mutationString = `mutation UpdateRequestById {
        requestUpdateById(input: {clientMutationId: "10", record:{_id:"${request._id}", declinedBy:${newDeclinedByStr}}}) {
            recordId
        }
    }`;
    return fetchGraphQlQuery(accessToken, mutationString);
};

/**
 * Similar to declineRequest function, but will delete the Delivery object, set the Request status back to PROCESSING,
 * and also Declines the Request so it can't be added again.
 */
const cancelRequestFunctionWithAccessToken = (accessToken:string, request:Request, carrierId:string, reason: string) => {
    // Create mutation string to delete delivery
    const deliveryIdOfCarrier = request.deliveries.edges.filter(edge => edge.node.carrierId === carrierId)[0].node._id;
    const deleteDeliveryString = `mutation DeleteDeliveryById{
      deliveryRemoveById(input:{_id: "${deliveryIdOfCarrier}", clientMutationId:"13"}) {
        recordId
      }
    }`;

    // Create mutation string to decline the Request and set its status to PROCESSING
    const newDeclinedByStr = createDeclinedByGraphQlString(request, carrierId, reason);
    const declineAndRevertRequestString = `mutation UpdateRequestById {
        requestUpdateById(input: {clientMutationId: "10", record:{_id:"${request._id}", status: ${RequestStatusEnum.PROCESSING}, declinedBy:${newDeclinedByStr}}}) {
            recordId
        }
    }`;

    // Create Promise chain of queries
    return fetchGraphQlQuery(accessToken, deleteDeliveryString).then(() => {
        return fetchGraphQlQuery(accessToken, declineAndRevertRequestString);
    });
};

const locationRequestsQueryStringLambda = (latitude:number, longitude:number, distance:number) => {
    const rFS = `locationRequests(latitude: ${latitude}, longitude: ${longitude}, distance: ${distance})`;
    console.log("locationRequestsQueryLambda: requestFunctionString=", rFS);
    return genericRequestsQueryStringLambda(rFS);
};

function getAccessTokenFromResponse(response) {
    // Fetch out access token from response header object
    const setCookieHeaderValue = response.headers.get('set-cookie');
    if (!setCookieHeaderValue) {
        throw new Error("Response header did not contain set-cookie: " + response.headers.entries());
    }
    let accessToken;
    for (let headerKeyValue of setCookieHeaderValue.split(';')) {
        const keyValueArray = headerKeyValue.split('=');
        if (keyValueArray[0].trim() === 'accessToken') {
            accessToken = keyValueArray[1];
            break;
        }
    }
    if (!accessToken) {
        throw new Error("set-cookie header in response did not contain access token: " + response.headers.entries());
    }
    return accessToken;
}

function fetchGraphQlQuery(accessToken:string, query:string) {
    console.log(`fetchGraphQlQuery(accessToken: ${accessToken}) with body:`, JSON.stringify({"query": query}));
    return fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cookie": "accessToken=" + accessToken
        },
        body: JSON.stringify({"query": query, "variables": null, "operationName": null})
    })
        .then((response) => {
            console.log(`fetchGraphQlQuery: response from ${GRAPHQL_ENDPOINT}`, response);
            if (response.status !== 200) {
                throw new Error(`fetchGraphQlQuery: GET had non-200 response: ${response.status}`);
            }
            return response.json();
        })
}

function fetchCurrentUserAndLocationRequests(accessToken:string, latitude:string, longitude:string, distance:number) {
    const query = locationRequestsQueryStringLambda(latitude, longitude, distance);
    console.log("fetchCurrentUserAndLocationRequests: fetchGraphQlQuery with query=", query);
    return fetchGraphQlQuery(accessToken, query);
}

/** Following Haversine implementation taken from:
 * https://github.com/njj/haversine/blob/master/haversine.js#L3 **/
const toRad = function (num) {
    return num * Math.PI / 180
};

function haversine(start, end, options) {
    options   = options || {};

    const radii = {
        km: 6371,
        mile: 3960,
        meter: 6371000
    };

    const R = options.unit in radii
        ? radii[options.unit]
        : radii.km;

    const dLat = toRad(end.latitude - start.latitude);
    const dLon = toRad(end.longitude - start.longitude);
    const lat1 = toRad(start.latitude);
    const lat2 = toRad(end.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return options.threshold ? options.threshold > (R * c) : Math.round(R * c);
}

function haversineDistanceToRequest(currentPosition:any, request:Request) {
    const isPickUp = request.status !== RequestStatusEnum.IN_PROGRESS;  // We'd only go to the destination if it's already picked up.
    const originOrDestinationKey = isPickUp ? "origin" : "destination";
    return haversine(
        {latitude: currentPosition.latitude, longitude: currentPosition.longitude},
        {latitude: request[originOrDestinationKey].coordinates[0], longitude: request[originOrDestinationKey].coordinates[1]},
        {unit: "mile"}
    );
}

function generateOperableString(request:Request) {
    // Generate operable/inoperable count string
    const numOperable = request.vehicles.edges.filter((edge) => edge.node.running).length;
    const numInoperable = request.vehicles.edges.filter((edge) => !edge.node.running).length;
    return (!numInoperable ?
        "Operable" :
        (!numOperable ?
            "Inoperable" :
            `${numInoperable} Inoperable, ${numOperable} Operable`));
}

export {Request, User, getAccessTokenFromResponse, fetchCurrentUserAndLocationRequests, haversineDistanceToRequest, RequestStatusEnum, fetchGraphQlQuery, acceptRequestAndCreateDeliveryFunction, declineRequestFunctionWithAccessToken, cancelRequestFunctionWithAccessToken, generateOperableString}
