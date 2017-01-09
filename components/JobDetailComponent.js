/**
 * Created by osman on 12/7/16.
 *
 * @flow
 */


import React, { Component, PropTypes } from 'react';
import {generateOperableString} from "./common";
const ReactNative = require('react-native');
const {
    StyleSheet,
    TabBarIOS,
    Text,
    View,
} = ReactNative;
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';


export default class JobDetailComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        request: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
        haversineDistance: PropTypes.number.isRequired
    };

    render() {
        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.props.navigator.pop()
        };
        const request = this.props.request;

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                leftButton={leftButtonConfig}
            />
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 3}}>
                    <Text style={{fontWeight: 'bold'}}>{request.name}</Text>
                    <Text>Origin: {request.origin.locationName}</Text>
                    <Text>Destination: {request.destination.locationName}</Text>
                    <Text>Vehicles: {request.vehicles.count}</Text>
                    <Text>Trailer Type: {"TODO"}</Text>
                    <Text>{generateOperableString(request)}</Text>
                </View>
                <View style={{flex: 3}}>
                    <Text>{`${request.paymentType || 'COD'}: $${request.amountDue || "100.00"}`}</Text>
                    <Text>Distance: {this.props.haversineDistance}</Text>
                    <Text>Pickup: {request.pickupDate}</Text>
                    <Text>Job Expires: {request.dropoffDate}</Text>
                </View>
            </View>
        </View>
    }
}
