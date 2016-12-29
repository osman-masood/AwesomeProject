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
import React, { Component, PropTypes } from 'react';

//noinspection JSUnresolvedVariable
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    NavigatorIOS,
    TextInput,
    Button,
    TabBarIOS
} from 'react-native';

import NewJobsComponent from "./NewJobsComponent"
import MyJobsComponent from "./MyJobsComponent"
import DeliveredComponent from "./DeliveredComponent"
import MyNetworkComponent from "./MyNetworkComponent"
import {fetchCarrierRequests, fetchLocationRequests} from "./common";

const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';



class TabBarComponent extends Component {
    static title = '<TabBarIOS>';
    static description = 'Tab-based navigation.';
    static displayName = 'TabBarComponent';

    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'newJobsTab',
            notifCount: 0,
            presses: 0,
            carrierRequests: [],
            locationRequests: [],
            currentPosition: {
                latitude: 100,
                longitude: 100
            }
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

        // Get this carrier's Requests from GraphQL endpoint
        fetchCarrierRequests(this.props.accessToken).then((carrierRequests) => this.setState({carrierRequests}));

        // Get all nearby Requests from GraphQL endpoint
        fetchLocationRequests(
            this.props.accessToken, this.state.currentPosition.latitude, this.state.currentPosition.longitude, 1000)
            .then((locationRequests) => this.setState({locationRequests}));
    }

    _renderContent = () => {
        console.log("TabBarComponent._renderContent called with selectedTab=", this.state.selectedTab);
        let returnComponent;
        if (this.state.selectedTab == 'newJobsTab') {
            returnComponent = <NewJobsComponent title="New Jobs" currentPosition={this.state.currentPosition} locationRequests={this.state.locationRequests} navigator={this.props.navigator} accessToken={this.props.accessToken}/>
        }
        else if (this.state.selectedTab == 'myJobsTab') {
            returnComponent = <MyJobsComponent title="My Jobs" carrierRequests={this.state.carrierRequests} navigator={this.props.navigator} accessToken={this.props.accessToken}/>
        }
        else if (this.state.selectedTab == 'deliveredTab') {
            returnComponent = <DeliveredComponent title="Delivered" navigator={this.props.navigator} accessToken={this.props.accessToken}/>
        }
        else if (this.state.selectedTab == 'myNetworkTab') {
            returnComponent = <MyNetworkComponent title="My Network" navigator={this.props.navigator} accessToken={this.props.accessToken}/>
        }
        else {
            console.error("Unknown selected tab: ", this.state.selectedTab);
            returnComponent = <NewJobsComponent title="New Jobs" locationRequests={this.state.locationRequests} navigator={this.props.navigator} accessToken={this.props.accessToken}/>;
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

            </TabBarIOS>
        );
    }
}

module.exports = TabBarComponent;