/**
 *
 * Tab bar example taken from:
 * https://facebook.github.io/react-native/docs/tabbarios.html
 * which links to:
 * https://github.com/facebook/react-native/blob/master/Examples/UIExplorer/js/TabBarIOSExample.js
 *
 *
 * @flow
 */
'use strict';
//noinspection JSUnresolvedVariable
import React, {Component, PropTypes} from "react";
//noinspection JSUnresolvedVariable
import {AppRegistry, StyleSheet, Text, View, NavigatorIOS, TextInput, TabBarIOS} from "react-native";

import NewJobsComponent from "./NewJobsComponent";
import MyJobsComponent from "./MyJobsComponent";
import DeliveredComponent from "./DeliveredComponent";
import MyNetworkComponent from "./MyNetworkComponent";
import {
    fetchCurrentUserAndLocationRequests,
    RequestStatusEnum,
    acceptRequestAndCreateDeliveryFunction,
    declineRequestFunction,
    fetchGraphQlQuery,
    changeStatusMutationFunction
} from "./common";

const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';


const ACCEPTED_REQUEST_STUB_DATA = [
    {
        "_id": "58634a24246d69259c41b93c",
        "status": 3,
        "amountDue": null,
        "amountEstimated": 200,
        "paymentType": 'COD',
        "deliveries": {
            "edges": [
                {
                    "node": {
                        "id": "RGVsaXZlcnk6NTg2MzRhMjcyNDZkNjkyNTljNDFiYTEz",
                        "carrierId": "586349cf246d69259c41b1d7"
                    }
                }
            ]
        },
        "vehicleIds": [
            "58634a22246d69259c41b466",
            "58634a22246d69259c41b4d1",
            "58634a22246d69259c41b466",
            "58634a22246d69259c41b4d1"
        ],
        "vehicles": {
            "count": 2,
            "edges": [
                {
                    "node": {
                        "year": "2013",
                        "make": "mclaren",
                        "model": "MP4-12C Spider",
                        "type": "car",
                        "color": "violet",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2005",
                        "make": "scion",
                        "model": "xA",
                        "type": "car",
                        "color": "mint green",
                        "enclosed": false,
                        "running": true
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                37.335081,
                -121.894675
            ],
            "locationName": " Armstrongfort Dealership",
            "contactName": "Xzavier Hermiston",
            "contactPhone": "(231) 321-1065",
            "address": "San Jose, CA"
        },
        "destination": {
            "coordinates": [
                37.525171,
                -122.280922
            ],
            "locationName": " Lake Connorburgh Dealership",
            "contactName": "Nickolas Auer",
            "contactPhone": "(104) 651-3804",
            "address": "San Fransisco, CA"
        },
        "pickupDate": "2016-07-18T15:08:04.788Z",
        "dropoffDate": "2016-07-18T15:08:04.788Z",
        "createdAt": "2016-12-28T05:14:12.292Z",
        "shipper": {
            "name": "Hammes Group",
            "buyerNumber": "43136575",
            "phone": "+18975708002"
        }
    },
    {
        "_id": "58634a24246d69259c41b837",
        "status": 2,
        "amountDue": null,
        "amountEstimated": 200,
        "paymentType": 'COD',
        "deliveries": {
            "edges": [
                {
                    "node": {
                        "id": "RGVsaXZlcnk6NTg2MzRhMjcyNDZkNjkyNTljNDFiYTIx",
                        "carrierId": "586349cf246d69259c41b1da",
                        "currentCoordinates": [10, 10]
                    }
                }
            ]
        },
        "vehicleIds": [
            "58634a22246d69259c41b368",
            "58634a22246d69259c41b520",
            "58634a22246d69259c41b368",
            "58634a22246d69259c41b520"
        ],
        "vehicles": {
            "count": 2,
            "edges": [
                {
                    "node": {
                        "year": "2009",
                        "make": "subaru",
                        "model": "Tribeca",
                        "type": "car",
                        "color": "grey",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2016",
                        "make": "mini",
                        "model": "Cooper Countryman",
                        "type": "suv",
                        "color": "orange",
                        "enclosed": false,
                        "running": true
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                37.331085,
                -121.899679
            ],
            "locationName": " South Bart Dealership",
            "contactName": "Pearl O'Hara DDS",
            "contactPhone": "457.330.1411",
            "address": "San Jose, CA"
        },
        "destination": {
            "coordinates": [
                37.335071,
                -121.894665
            ],
            "locationName": " McLaughlinberg Dealership",
            "contactName": "Giovanna Altenwerth",
            "contactPhone": "1-198-791-5705 x819"
        },
        "pickupDate": "2016-06-24T01:52:26.763Z",
        "dropoffDate": "2016-06-24T01:52:26.763Z",
        "createdAt": "2016-12-28T05:14:12.234Z",
        "shipper": {
            "name": "McGlynn, Sanford and Gottlieb",
            "buyerNumber": "67490717",
            "phone": "+13913580943",
            "address": "San jose, CA"
        }
    },
    {
        "_id": "58634a24246d69259c41b9ab",
        "status": 2,
        "amountDue": null,
        "amountEstimated": 200,
        "paymentType": 'COD',
        "deliveries": {
            "edges": [
                {
                    "node": {
                        "id": "RGVsaXZlcnk6NTg2MzRhMjcyNDZkNjkyNTljNDFiYTA2",
                        "carrierId": "586349cf246d69259c41b1ce"
                    }
                }
            ]
        },
        "vehicleIds": [
            "58634a22246d69259c41b3e1",
            "58634a22246d69259c41b754",
            "58634a22246d69259c41b3e1",
            "58634a22246d69259c41b754"
        ],
        "vehicles": {
            "count": 2,
            "edges": [
                {
                    "node": {
                        "year": "2012",
                        "make": "land-rover",
                        "model": "LR2",
                        "type": "suv",
                        "color": "violet",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2005",
                        "make": "chevrolet",
                        "model": "Cobalt",
                        "type": "car",
                        "color": "yellow",
                        "enclosed": false,
                        "running": true
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                37.336213,
                -121.897627
            ],
            "locationName": " Purdyfort Dealership",
            "contactName": "Ruthie Fisher",
            "contactPhone": "012.371.6269",
            "address": "San jose, CA"
        },
        "destination": {
            "coordinates": [
                37.335027,
                -121.894611
            ],
            "locationName": " Dooleyland Dealership",
            "contactName": "Velma Bailey",
            "contactPhone": "736-408-6271 x82136",
            "address": "San Fransisco, CA"
        },
        "pickupDate": "2016-09-13T08:04:14.676Z",
        "dropoffDate": "2016-09-13T08:04:14.676Z",
        "createdAt": "2016-12-28T05:14:12.310Z",
        "shipper": {
            "name": "Leannon and Sons",
            "buyerNumber": "61794306",
            "phone": "+18505646963"
        }
    },
    {
        "_id": "58634a24246d69259c41b821",
        "status": 3,
        "amountDue": null,
        "amountEstimated": 200,
        "paymentType": 'COD',
        "deliveries": {
            "edges": [
                {
                    "node": {
                        "id": "RGVsaXZlcnk6NTg2MzRhMjcyNDZkNjkyNTljNDFiOWVi",
                        "carrierId": "586349cf246d69259c41b1df"
                    }
                }
            ]
        },
        "vehicleIds": [
            "58634a22246d69259c41b3ca",
            "58634a22246d69259c41b61f",
            "58634a22246d69259c41b3ca",
            "58634a22246d69259c41b61f"
        ],
        "vehicles": {
            "count": 2,
            "edges": [
                {
                    "node": {
                        "year": "2017",
                        "make": "cadillac",
                        "model": "CT6",
                        "type": "car",
                        "color": "mint green",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2012",
                        "make": "aston-martin",
                        "model": "Rapide",
                        "type": "suv",
                        "color": "lime",
                        "enclosed": false,
                        "running": true
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                -14.0174,
                33.2452
            ],
            "locationName": " Purdyfort Dealership",
            "contactName": "Ruthie Fisher",
            "contactPhone": "012.371.6269"
        },
        "destination": {
            "coordinates": [
                -53.6027,
                89.5244
            ],
            "locationName": " Dooleyland Dealership",
            "contactName": "Velma Bailey",
            "contactPhone": "736-408-6271 x82136"
        },
        "pickupDate": "2016-05-09T05:01:50.342Z",
        "dropoffDate": "2016-05-09T05:01:50.342Z",
        "createdAt": "2016-12-28T05:14:12.231Z",
        "shipper": {
            "name": "Leannon and Sons",
            "buyerNumber": "61794306",
            "phone": "+18505646963"
        }
    },
    {
        "_id": "58634a24246d69259c41b846",
        "status": 3,
        "amountDue": null,
        "amountEstimated": 200,
        "paymentType": 'COD',
        "deliveries": {
            "edges": []
        },
        "vehicleIds": [
            "58634a22246d69259c41b411",
            "58634a22246d69259c41b565",
            "58634a22246d69259c41b411",
            "58634a22246d69259c41b565"
        ],
        "vehicles": {
            "count": 2,
            "edges": [
                {
                    "node": {
                        "year": "2001",
                        "make": "dodge",
                        "model": "Caravan",
                        "type": "car",
                        "color": "white",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2014",
                        "make": "lincoln",
                        "model": "MKT",
                        "type": "car",
                        "color": "mint green",
                        "enclosed": false,
                        "running": true
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                -14.0174,
                33.2452
            ],
            "locationName": " Purdyfort Dealership",
            "contactName": "Ruthie Fisher",
            "contactPhone": "012.371.6269"
        },
        "destination": {
            "coordinates": [
                -14.0174,
                33.2452
            ],
            "locationName": " Purdyfort Dealership",
            "contactName": "Ruthie Fisher",
            "contactPhone": "012.371.6269"
        },
        "pickupDate": "2016-11-17T21:40:01.824Z",
        "dropoffDate": "2016-11-17T21:40:01.824Z",
        "createdAt": "2016-12-28T05:14:12.236Z",
        "shipper": {
            "name": "Leannon and Sons",
            "buyerNumber": "61794306",
            "phone": "+18505646963"
        }
    },
    {
        "_id": "58634a24246d69259c41b8ab",
        "status": 2,
        "amountDue": null,
        "amountEstimated": null,
        "paymentType": null,
        "deliveries": {
            "edges": []
        },
        "vehicleIds": [],
        "vehicles": {
            "count": 0,
            "edges": []
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                -53.6027,
                89.5244
            ],
            "locationName": " Dooleyland Dealership",
            "contactName": "Velma Bailey",
            "contactPhone": "736-408-6271 x82136"
        },
        "destination": {
            "coordinates": [
                73.5833,
                -38.0106
            ],
            "locationName": " New Reynoldside Dealership",
            "contactName": "Logan Huels",
            "contactPhone": "834-863-9401 x05798"
        },
        "pickupDate": "2016-12-07T01:49:27.901Z",
        "dropoffDate": "2016-12-07T01:49:27.901Z",
        "createdAt": "2016-12-28T05:14:12.255Z",
        "shipper": {
            "name": "Hammes Group",
            "buyerNumber": "43136575",
            "phone": "+18975708002"
        }
    },
    {
        "_id": "58634a24246d69259c41b7d2",
        "status": 3,
        "amountDue": null,
        "amountEstimated": null,
        "paymentType": null,
        "deliveries": {
            "edges": []
        },
        "vehicleIds": [
            "58634a22246d69259c41b483",
            "58634a22246d69259c41b66c",
            "58634a22246d69259c41b699",
            "58634a22246d69259c41b72c",
            "58634a22246d69259c41b483",
            "58634a22246d69259c41b66c",
            "58634a22246d69259c41b699",
            "58634a22246d69259c41b72c",
            "58634a22246d69259c41b483",
            "58634a22246d69259c41b66c",
            "58634a22246d69259c41b699",
            "58634a22246d69259c41b72c",
            "58634a22246d69259c41b483",
            "58634a22246d69259c41b66c",
            "58634a22246d69259c41b699",
            "58634a22246d69259c41b72c",
            "58634a22246d69259c41b79a"
        ],
        "vehicles": {
            "count": 5,
            "edges": [
                {
                    "node": {
                        "year": "2012",
                        "make": "fisker",
                        "model": "Karma",
                        "type": "car",
                        "color": "silver",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2012",
                        "make": "porsche",
                        "model": "Cayman",
                        "type": "suv",
                        "color": "lime",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2016",
                        "make": "land-rover",
                        "model": "Discovery Sport",
                        "type": "car",
                        "color": "teal",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2006",
                        "make": "saab",
                        "model": "9-3",
                        "type": "car",
                        "color": "orange",
                        "enclosed": false,
                        "running": true
                    }
                },
                {
                    "node": {
                        "year": "2000",
                        "make": "daewoo",
                        "model": "Leganza",
                        "type": "car",
                        "color": "white",
                        "enclosed": false,
                        "running": false
                    }
                }
            ]
        },
        "preferredCarrierIds": [
            "586349cf246d69259c41b1d4"
        ],
        "origin": {
            "coordinates": [
                90.8684,
                15.0839
            ],
            "locationName": " Lake Connorburgh Dealership",
            "contactName": "Nickolas Auer",
            "contactPhone": "(104) 651-3804"
        },
        "destination": {
            "coordinates": [
                90.8684,
                15.0839
            ],
            "locationName": " Lake Connorburgh Dealership",
            "contactName": "Nickolas Auer",
            "contactPhone": "(104) 651-3804"
        },
        "pickupDate": "2016-08-18T09:58:57.290Z",
        "dropoffDate": "2016-08-18T09:58:57.290Z",
        "createdAt": "2016-12-28T05:14:12.217Z",
        "shipper": {
            "name": "Schmeler, Parisian and Johns",
            "buyerNumber": "19667215",
            "phone": "+17147875872"
        }
    }];


class TabBarComponent extends Component {
    static title = '<TabBarIOS>';
    static description = 'Tab-based navigation.';
    static displayName = 'TabBarComponent';

    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

     acceptRequestAndCreateDelivery (request) {
        return acceptRequestAndCreateDeliveryFunction(this.props.accessToken,
            request,
            this.state.currentUser['carrier']['_id'],
            this.state.currentPosition.latitude,
            this.state.currentPosition.longitude);
    }

    cancelRequestFunction(request) {
        return changeStatusMutationFunction(this.props.accessToken, request, RequestStatusEnum.CANCELLED);
    }

    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'newJobsTab',
            notificationCount: 0,
            presses: 0,
            openNonPreferredRequests: [],  // "All Requests" (all open Requests within radius)
            openPreferredRequests: [],  // "My requests" (open Requests whose preferredCarrierIds has this carrier)
            acceptedRequests: [],  // Requests accepted by the carrier (status == dispatched or in progress, and Request has a Delivery with this carrier)
            currentPosition: {  // This is the currentPosition!
                latitude: 37.3382,
                longitude: -121.8863
            },
            currentUser: null
        };

        // Set current map position based on geolocation.
        navigator.geolocation.getCurrentPosition(
            (position) => this.setState({
                currentPosition: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                mapViewRegion: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.522,
                    longitudeDelta: 0.421,
                }
            }),
            (positionError) => console.error("TabBarComponent.constructor: Got an error trying to getCurrentPosition: " + positionError.message)
        );

        // Continually update current position (marker) as user's location changes
        navigator.geolocation.watchPosition(
            (position) => this.setState({
                currentPosition: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
            }),
            (positionError) => console.error("TabBarComponent.constructor: Got an error trying to watchPosition: " + positionError.message)
        );

        this.acceptRequestAndCreateDelivery = this.acceptRequestAndCreateDelivery.bind(this);
        this.cancelRequestFunction = this.cancelRequestFunction.bind(this);

        // Get all nearby Requests from GraphQL endpoint, and set state vars based on response
        fetchCurrentUserAndLocationRequests(
            this.props.accessToken, this.state.currentPosition.latitude, this.state.currentPosition.longitude, 3000)
            .then((userAndLocationRequests) => {
                const currentUser = userAndLocationRequests['data']['viewer']['me'];
                const currentCarrierId = currentUser['carrier']['_id'];

                // Go through the list of all requests and set the open preferred, open non-preferred, and accepted requests.
                const locationRequests = userAndLocationRequests['data']['viewer']['locationRequests'];
                console.log("TabBarComponent.fetchCurrentUserAndLocationRequests: Number of requests", locationRequests.length, "user ID", currentUser._id);
                let openNonPreferredRequests = [], openPreferredRequests = [], acceptedRequests = [];
                for (let openRequest of locationRequests) {
                    // If request was declined by this carrier, skip it
                    if (openRequest.declinedBy && openRequest.declinedBy.length > 0 && openRequest.declinedBy.indexOf(currentCarrierId) !== -1) {
                        continue;
                    }

                    // Figure out if request is preferred to carrier, not preferred, or already accepted by carrier
                    if (openRequest.status === RequestStatusEnum.PROCESSING) {
                        // TODO add logic to support carrier -> carrier reqs. That is, if preferredCarrierIds.length === 2, then preferredCarrierIds[0] recommended the job to preferredCarrierIds[1], and the job should be in the Network Jobs list of preferredCarrierIds[1]
                        if (openRequest['preferredCarrierIds'].indexOf(currentCarrierId) === -1) {
                            // If current carrier's ID is within the request's preferred carrier IDs, it is preferred. Otherwise not.
                            openNonPreferredRequests.push(openRequest);
                        } else {
                            openPreferredRequests.push(openRequest);
                        }
                    }
                    else if (TabBarComponent.hasCarrierAcceptedRequest(currentCarrierId, openRequest)) {
                        acceptedRequests.push(openRequest);
                    }
                }

                // Set state variables of current user and requests
                console.log(`TabBarComponent.fetchCurrentUserAndLocationRequests: 
                    openNonPreferredRequests: ${openNonPreferredRequests.length}, 
                    openPreferredRequests: ${openPreferredRequests.length}, 
                    acceptedRequests: ${acceptedRequests.length}`);
                this.setState({
                    currentUser: currentUser,
                    openNonPreferredRequests: openNonPreferredRequests,
                    openPreferredRequests: openPreferredRequests,
                    acceptedRequests: ACCEPTED_REQUEST_STUB_DATA    // acceptedRequests  TODO replace once we have accepted requests
                });
            });
    }

    static hasCarrierAcceptedRequest(carrierId: string, request) {
        // Must be Dispatched or In Progress, and deliveries.edges[i].node must contain carrierId.
        if ((request.status === RequestStatusEnum.DISPATCHED || request.status === RequestStatusEnum.IN_PROGRESS) &&
            (request.deliveries && request.deliveries.edges && request.deliveries.edges.length > 0)) {

            const deliveryCarrierIds = request.deliveries.edges.map((edge) => edge.node.carrierId);
            if (deliveryCarrierIds.indexOf(carrierId) !== -1) {
                return true;
            }
        }
        return false;
    }

    _renderContent = () => {
        console.log("TabBarComponent._renderContent called with selectedTab=", this.state.selectedTab);
        let returnComponent;
        if (this.state.selectedTab == 'newJobsTab') {
            returnComponent = <NewJobsComponent title="New Jobs" currentPosition={this.state.currentPosition}
                                                openNonPreferredRequests={this.state.openNonPreferredRequests}
                                                openPreferredRequests={this.state.openPreferredRequests}
                                                navigator={this.props.navigator}
                                                acceptRequestFunction={this.acceptRequestAndCreateDelivery}
                                                declineRequestFunction={declineRequestFunction}
            />
        }
        else if (this.state.selectedTab == 'myJobsTab') {

            returnComponent = <MyJobsComponent title="My Jobs" currentPosition={this.state.currentPosition}
                                               acceptedRequests={this.state.acceptedRequests}
                                               navigator={this.props.navigator}
                                               cancelRequestFunction={this.cancelRequestFunction}
            />
        }
        else if (this.state.selectedTab == 'deliveredTab') {
            returnComponent = <DeliveredComponent title="Delivered" navigator={this.props.navigator}
                                                  accessToken={this.props.accessToken}/>
        }
        else if (this.state.selectedTab == 'myNetworkTab') {
            returnComponent = <MyNetworkComponent title="My Network" navigator={this.props.navigator}
                                                  accessToken={this.props.accessToken}/>
        }
        else {
            console.error("Unknown selected tab: ", this.state.selectedTab);
            returnComponent = <NewJobsComponent title="New Jobs" currentPosition={this.state.currentPosition}
                                                openNonPreferredRequests={this.state.openNonPreferredRequests}
                                                openPreferredRequests={this.state.openPreferredRequests}
                                                navigator={this.props.navigator}
                                                acceptRequestFunction={acceptRequestAndCreateDeliveryFunction}
                                                declineRequestFunction={declineRequestFunction}/>
        }
        return returnComponent;
    };

    render() {
        return (
            <TabBarIOS>

                <TabBarIOS.Item
                    title="New Jobs"
                    icon={{uri: base64Icon, scale: 3}}
                    selected={this.state.selectedTab === 'newJobsTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'newJobsTab',
                    });
                }}>
                    {this._renderContent()}
                </TabBarIOS.Item>

                <TabBarIOS.Item
                    title="My Jobs"
                    icon={require('../flux.png')}
                    selected={this.state.selectedTab === 'myJobsTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'myJobsTab',
                        presses: this.state.presses + 1
                    });
                }}>
                    {this._renderContent()}
                </TabBarIOS.Item>

                {/*
                 <TabBarIOS.Item
                 title="Delivered"
                 icon={require('../flux.png')}
                 selected={this.state.selectedTab === 'deliveredTab'}
                 onPress={() => {
                 this.setState({
                 selectedTab: 'deliveredTab',
                 presses: this.state.presses + 1
                 });
                 }}>
                 {this._renderContent()}
                 </TabBarIOS.Item>

                 <TabBarIOS.Item
                 title="My Network"
                 icon={require('../relay.png')}
                 selected={this.state.selectedTab === 'myNetworkTab'}
                 onPress={() => {
                 this.setState({
                 selectedTab: 'myNetworkTab',
                 presses: this.state.presses + 1
                 });
                 }}>
                 {this._renderContent()}
                 </TabBarIOS.Item>
                 */}
            </TabBarIOS>
        );
    }
}

module.exports = TabBarComponent;