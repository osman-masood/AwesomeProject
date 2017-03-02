/**
 * Created by KJ on 2/21/17.
 */
/**
 *
 * @flow
 */

'use strict';
//noinspection JSUnresolvedVariable
import React, {Component, PropTypes} from "react";
//noinspection JSUnresolvedVariable
import {AppRegistry, StyleSheet, Text, View, Navigator, TextInput, Image} from "react-native";

import NewJobsComponent from "./NewJobsComponent";
import MyJobsComponent from "./MyJobsComponent";
import DeliveredComponent from "./DeliveredComponent";
import MyNetworkComponent from "./MyNetworkComponent";
import TabNavigator from 'react-native-tab-navigator';

import {
    fetchCurrentUserAndLocationRequests,
    RequestStatusEnum,
    acceptRequestAndCreateDeliveryFunction,
    declineRequestFunctionWithAccessToken,
    User, Request,
    cancelRequestFunctionWithAccessToken,
    uploadImageJPGS3,
    updateDeliveryMutation,
    acceptedRequestsQuery
} from "./common";

const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';

export default class TabAndroidComponent extends Component {
    static title = '<TabAndroid>';
    static description = 'Tab-based navigation.';
    //noinspection JSUnusedGlobalSymbols
    static displayName = 'TabAndroidComponent';

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

    acceptedRequests() {
        return acceptedRequestsQuery(
            this.props.accessToken,
            this.state.currentPosition.latitude,
            this.state.currentPosition.longitude
        );
    }

    constructor(props) {
        super(props);
        //noinspection UnnecessaryLocalVariableJS
        let thisState: { // flow syntax
            selectedTab: string,
            notificationCount: number,
            presses: number,
            openNonPreferredRequests: Array<Request>,
            openPreferredRequests: Array<Request>,
            acceptedRequests: Array<Request>,
            currentPosition: {
                latitude: number,
                longitude: number
            },
            currentUser: User
        } = {
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
        this.state = thisState;

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
            (positionError) => {}
        );

        // Continually update current position (marker) as user's location changes
        navigator.geolocation.watchPosition(
            (position) => this.setState({
                currentPosition: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
            }),
            (positionError) => console.error("TabAndroidComponent.constructor: Got an error trying to watchPosition: " + positionError.message)
        );

        this.fetchUserAndRequests();
    }

    /**
     * Get User and all nearby Requests from GraphQL endpoint, and set state vars based on response.
     */
    fetchUserAndRequests = () => {
        fetchCurrentUserAndLocationRequests(
            this.props.accessToken, this.state.currentPosition.latitude, this.state.currentPosition.longitude, 6000)
            .then((userAndLocationRequests) => {
                const currentUser = userAndLocationRequests['data']['viewer']['me'];
                const currentCarrierId = currentUser['carrier']['_id'];

                console.log(userAndLocationRequests['data']);

                // Go through the list of all requests and set the open preferred, open non-preferred, and accepted requests.
                const locationRequests = userAndLocationRequests['data']['viewer']['locationRequests'];


                let openNonPreferredRequests = [], openPreferredRequests = [], acceptedRequests = [];
                for (let openRequest of locationRequests) {
                    // If request was declined by this carrier, skip it
                    if (openRequest.declinedBy && openRequest.declinedBy.length > 0 && openRequest.declinedBy.map((db) => db['carrierId']).indexOf(currentCarrierId) !== -1) {
                        console.log("TabAndroidComponent constructor: Request ", openRequest, "had current carrier ID ", currentCarrierId, " in its declined list");
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
                    else if (TabAndroidComponent.hasCarrierAcceptedRequest(currentCarrierId, openRequest)) {
                        acceptedRequests.push(openRequest);
                    }
                }

                //openPreferredRequests = userAndLocationRequests['data']['viewer']['carrierRequests'];

                // Set state variables of current user and requests
                this.setState({
                    currentUser: currentUser,
                    openNonPreferredRequests: openNonPreferredRequests,
                    openPreferredRequests: openPreferredRequests,
                    acceptedRequests: []
                });
            });
    };

    static hasCarrierAcceptedRequest(carrierId: string, request:Request) {
        // Must be Dispatched or In Progress, and deliveries.edges[i].node must contain carrierId.
        let ret;
        if ((request.status === RequestStatusEnum.DISPATCHED || request.status === RequestStatusEnum.IN_PROGRESS) &&
            (request.deliveries && request.deliveries.edges && request.deliveries.edges.length > 0)) {

            const deliveryCarrierIds = request.deliveries.edges.map((edge) => edge.node.carrierId);
            ret = deliveryCarrierIds.indexOf(carrierId) !== -1;
        }
        return ret;
    }

    acceptRequestFunction = (request:Request, currentLatitude:string, currentLongitude:string) => {
        return acceptRequestAndCreateDeliveryFunction(this.props.accessToken, request, this.state.currentUser.carrier._id, currentLatitude, currentLongitude);
    };

    declineRequestFunction = (request:Request, reason: string) => {
        return declineRequestFunctionWithAccessToken(this.props.accessToken, request, this.state.currentUser.carrier._id, reason);
    };

    cancelRequestFunction = (request:Request, reason: string) => {
        return cancelRequestFunctionWithAccessToken(this.props.accessToken, request, this.state.currentUser.carrier._id, reason);
    };

    updateDeliveryFwd = (id, notes, cname, csig) => {
        return updateDeliveryMutation(this.props.accessToken, id, notes, cname, csig);
    };

    _renderContent = () => {
        let returnComponent;
        if (this.state.selectedTab == 'newJobsTab') {
            returnComponent = <NewJobsComponent title="New Jobs"
                                                currentPosition={this.state.currentPosition}
                                                openNonPreferredRequests={this.state.openNonPreferredRequests} // requests are shipments
                                                openPreferredRequests={this.state.openPreferredRequests}
                                                navigator={this.props.navigator}
                                                acceptRequestFunction={this.acceptRequestFunction}
                                                declineRequestFunction={this.declineRequestFunction}
                                                currentUserId={this.state.currentUser.carrier._id}
                                                accessToken={this.props.accessToken}
            />
        }
        else if (this.state.selectedTab == 'myJobsTab') {
            returnComponent = <MyJobsComponent title="My Jobs"
                                               currentPosition={this.state.currentPosition}
                                               acceptedRequests={this.acceptedRequests.bind(this)}
                                               navigator={this.props.navigator}
                                               cancelRequestFunction={this.cancelRequestFunction}
                                               uploadImageJPGS3={uploadImageJPGS3}
                                               updateDeliveryMutation={this.updateDeliveryFwd.bind(this)}
                                               accessToken={this.props.accessToken}
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
            throw new Error("Unknown selected tab WTF?");
        }
        return returnComponent;
    };

    render() {
        if(!this.state.currentUser)
        {
            return <TabNavigator></TabNavigator>;
        }

        return (
            <TabNavigator>
                <TabNavigator.Item
                    title="New Jobs"
                    renderIcon={() =>
                        <Image
                            source={{uri: base64Icon}}
                        />
                    }
                    //icon={{uri: base64Icon, scale: 3}}
                    selected={this.state.selectedTab === 'newJobsTab'}
                    onPress={() => this.setState({ selectedTab: 'newJobsTab'})}>
                    {this._renderContent()}
                </TabNavigator.Item>

                <TabNavigator.Item
                    title="My Jobs"
                    renderIcon={() =>
                        <Image source={require('../flux@3x.png')} />
                    }
                    // icon={require('../flux.png')}
                    selected={this.state.selectedTab === 'myJobsTab'}
                    onPress={() => this.setState({
                        selectedTab: 'myJobsTab',
                        presses: this.state.presses + 1
                    })}>
                    {this._renderContent()}
                </TabNavigator.Item>

            </TabNavigator>
        )

    }
}

module.exports = TabAndroidComponent;