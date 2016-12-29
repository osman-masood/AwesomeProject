/**
 * Created by osman on 12/25/16.
 *
 *
 *
 * @flow
 */
"use strict";

/*
 ABOUT REQUEST STATUSES: Taken from https://github.com/yasinarif1/stowk-APIserver/blob/dad8baa308b1bc7e417e4824405a2d2a5c4784de/api/data/models/Request.js

 0 new: new request created - payment not processed
 1 processing: payment accepted from shipper, awaiting carrier acceptance
 2 dispatched: Carrier accepted and is on his way to pickup
 3 in-progress: En Route, cars picked-up
 4 complete: cars delivered,
 5 cancelled: only can be cancelled on 2 or below

 Status can only increase.
 */

const GRAPHQL_ENDPOINT = "https://stowkapi-staging.herokuapp.com/graphql";

const genericRequestsQueryLambda = (requestsFunctionString) => `{
  viewer {
    ${requestsFunctionString} {
      id,
      status,
      vehicles {
        count,
        edges {
          node {
			year,
            make,
            model,
            type,
            color
          }
        }
      }
      preferredCarrierIds,
      origin {
        coordinates,
        locationName,
        contactName,
        contactPhone
      },
      destination {
        coordinates,
        locationName,
        contactName,
        contactPhone
      },
      amountDue,
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

const carrierRequestsQuery = genericRequestsQueryLambda("carrierRequests");

const locationRequestsQueryLambda = (latitude, longitude, distance) => {
    genericRequestsQueryLambda(`locationRequests(latitude: ${latitude}, longitude: ${longitude}, distance: ${distance}`);
};

function getAccessTokenFromResponse(response) {
    // Fetch out access token from response header object
    const setCookieHeaderValue = response.headers.get('set-cookie');
    if (!setCookieHeaderValue) {
        throw new Error("Response header did not contain set-cookie: " + response.headers);
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
        throw new Error("set-cookie header in response did not contain access token: " + response.headers);
    }
    return accessToken;
}

function fetchGraphQlQuery(accessToken:string, query:string, responseDataViewerKey:string) {
    console.log(`fetchGraphQlQuery(accessToken: ${accessToken}, responseDataViewerKey: ${responseDataViewerKey}`);
    return fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            'Accept': 'application/json',
            'Cookie': 'accessToken=' + accessToken
        },
        body: JSON.stringify({"query": query})
    })
        .then((response) => {
            return [response.json(), response.status]
        })
        .then((responseTuple) => {
            const responseJson = responseTuple[0];
            const responseStatus = responseTuple[1];
            if (responseTuple[1] !== 200) {
                throw new Error(`Get ${responseDataViewerKey} had non-200 response: ${responseStatus}, Content: ${responseJson}`);
            }
            return responseJson['data']['viewer'][responseDataViewerKey];
        });
}

function fetchCarrierRequests(accessToken) {
    return fetchGraphQlQuery(accessToken, carrierRequestsQuery, "carrierRequests");
}

function fetchLocationRequests(accessToken:string, latitude:string, longitude:string, distance:number) {
    return fetchGraphQlQuery(accessToken, locationRequestsQueryLambda(latitude, longitude, distance), "locationRequests")
        .then((locationRequests) => locationRequests.filter((req) => req.status === 1));
}

export {getAccessTokenFromResponse, fetchCarrierRequests, fetchLocationRequests}