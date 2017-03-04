/**
 * Created by osman on 12/7/16.
 *
 * @flow
 */


import React, { Component, PropTypes } from 'react';
import {updateDeliveryMutation, generateOperableString, RequestStatusEnum, Request} from "./common";
import VehicleInspectionComponent from "./VehicleInspectionComponent";
import DropOffObtain from "./DropOffObtain"

const moment = require('moment');

import {
  View,
  Linking,
  TabBarIOS,
  Button,
  ScrollView,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native'

//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';

export default class JobDetailComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        request: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
        haversineDistance: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        //noinspection UnnecessaryLocalVariableJS
        let thisState: {
            job: Request
        } = {
            job: this.props.request
        };
        this.state = thisState;
        this.cancelJobAction = this.cancelJobAction.bind(this);
        this.callJobAction = this.callJobAction.bind(this);
    }

    componentDidMount() {
        Linking.addEventListener('url', (event) => {
            console.log("addEventListener('url", event);
        });
    }

    componentWillUnmount() {
        Linking.removeEventListener('url');
    }

    cancelJobAction() {

        const job = this.state.job;
        const self = this;
        Alert.alert(
            'Cancel?',
            job.origin.locationName + ' to ' + job.destination.locationName,
            [
                {text: 'YES', onPress: () => {
                    self.props.cancelRequestFunction(job).then(function (data) {
                        if (data.errors.length > 0) {
                            Alert.alert('Could not cancel request');
                        }else {
                            self.props.onCancelJob();
                        }
                    })
                }},
                {
                    text: 'NO'
                }
            ]
        )
    }

    callJobAction() {
        let phoneNumber = this.state.job.shipper.phoneNumber;
        Linking.openURL("tel:" + phoneNumber).catch(er => {
            Alert.alert('Could not make call to ', phoneNumber);
        });
    }

    messageJobAction() {
    }

    navigateTo() {
        const originOrDestinationKey = (this.state.job.status === RequestStatusEnum.DISPATCHED) ? "origin" : "destination";
        const latitude = this.state.job[originOrDestinationKey].coordinates[0];
        const longitude = this.state.job[originOrDestinationKey].coordinates[1];

        const directionsRequest = `comgooglemaps-x-callback://?daddr=${latitude},${longitude}&directionsmode=driving&nav=1&x-source=stowkapp&x-success=stowkapp://?resume=true`;
        Linking.openURL(directionsRequest).catch(err => {
            Alert.alert('Could not start navigation', err.message);
        });
        // Linking.canOpenURL(directionsRequest).then(supported => {
        //     if (supported) {
        //         Linking.openURL(directionsRequest).catch(err => {
        //             Alert.alert('Could not start navigation', err.message);
        //         });
        //     } else {
        //         Alert.alert('You don\'t have Google maps installed', 'Directions require Google maps application to run');
        //     }
        // });
    }

    goToInspection() {        
        let isDispatched = this.state.job.status === RequestStatusEnum.DISPATCHED;
        this.props.navigator.push({
            component: isDispatched ? VehicleInspectionComponent : DropOffObtain,
            navigationBarHidden: false,
            navigator: this.props.navigator,
            rightButtonTitle: isDispatched ? null : 'Add addional Photos',
            onRightButtonPress: DropOffObtain.prototype.callingRightButton,
            passProps: {
                title: "Inspect",
                navigator: this.props.navigator,
                request: this.state.job,
                uploadImageJPGS3: this.props.uploadImageJPGS3,
                updateDeliveryMutation: this.props.updateDeliveryMutation
            }
        });        
    }

    render() {
        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.props.navigator.pop()
        };
        const titleConfig = {
            title: 'Inspect'
        };

        const request = this.props.request;

        return (<View>
            <NavigationBar
                title={titleConfig}
                leftButton={leftButtonConfig}
            />
            <ScrollView style={{height: Dimensions.get('window').height - 80}}>
                <View style={[styles.cardBottom, {flexDirection: 'row'}]}>
                    <View style={{flex: 3, flexDirection: 'column', alignItems: 'center'}}>
                        <Image style={{margin: 5}} source={require('../assets/profilepic@3x.png')}/>
                        <Text>{request.shipper.name}</Text>
                        <Text>{request.phoneNumber}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: 'column', marginRight: 50}}>
                        <TouchableHighlight onPress={this.callJobAction}>
                            <Image style={{margin: 5}} source={require('../assets/callbutton@3x.png')}/>
                        </TouchableHighlight>
                        {/*<Image style={{margin: 5}} source={require('../assets/message@3x.png')}/>*/}
                        <TouchableHighlight onPress={this.cancelJobAction}>
                            <Image style={{margin: 5}} source={require('../assets/decline@3x.png')}/>
                        </TouchableHighlight>
                    </View>
                </View>

                <View style={[styles.cardBottom, {flexDirection: 'column', margin: 2}]}>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
                        <Image style={{margin: 5}} source={require('../assets/startdot@3x.png')} />
                        <Text style={{margin: 5}}>{request.origin.city}, {request.origin.state}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Image style={{margin: 5}} source={require('../assets/enddot@3x.png')} />
                        <Text>{request.destination.city}, {request.origin.state}</Text>
                    </View>
                </View>


                <View style={[styles.details, styles.cardBottom]}>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>Job Expires: </Text>{moment(request.dropoffDate).format("MMM Do ddd, hA")}</Text>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>COD: </Text>{`${request.paymentType || 'COD'}: $${request.amountDue || "100.00"}`}</Text>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>Trailer Type: </Text>{request.vehicles.count == 0? "None": request.vehicles.edges[0].node.enclosed?"Enclosed":"Open"}</Text>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>Distance: </Text>{this.props.haversineDistance}</Text>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>Running: </Text>{generateOperableString(request)}</Text>
                    <Text style={styles.detailText}><Text style={{fontWeight: 'bold'}}>Pickup: </Text>{request.pickupDate.substring(0,10)}</Text>
                </View>

                <View style={styles.details}>
                    <View style={{margin: 3}}>
                        <Text style={{marginLeft: 3, fontWeight: 'bold'}}>Cars:</Text>
                        <Text style={{marginLeft: 3}}>Vehicles: {request.vehicles.count}</Text>
                    </View>
                    <View style={{flex: 2, flexGrow:2, flexDirection: 'column'}}>
                        {request.vehicles.edges.map( (v, i) => {
                            return <View key={i} style={[styles.cardBottom, {margin: 3, padding: 4}]}>
                                <Text><Text style={{fontWeight: 'bold'}}>Year: </Text>{v.node.year}</Text>
                                <Text><Text style={{fontWeight: 'bold'}}>Make: </Text>{v.node.make}</Text>
                                <Text><Text style={{fontWeight: 'bold'}}>Model: </Text>{v.node.model}</Text>
                                <Text><Text style={{fontWeight: 'bold'}}>Color: </Text>{v.node.color}</Text>
                                <Text><Text style={{fontWeight: 'bold'}}>Type: </Text>{v.node.type}</Text>
                            </View>
                        })}
                    </View>
                </View>




                {/*<View style={styles.topBox}>*/}
                    {/*<Image source={require('../assets/profle@3x.png')} />*/}
                    {/*<Text>{request.shipper.name}</Text>*/}
                    {/*<Text>{request.phoneNumber}</Text>*/}
                {/*</View>*/}
                {/*<View style={{height: 1, backgroundColor: '#CCCCCC'}}></View>*/}
                <View style={{padding:10}}>
                    {/*<Text>Order Id: {request.orderId}</Text>*/}
                    {/*<Text style={{fontWeight: 'bold'}}>Origin:</Text>*/}
                    {/*<Text> {request.origin.locationName}</Text>*/}
                    {/*<Text> {request.origin.contactName}</Text>*/}
                    {/*<Text> {request.origin.contactPhone}</Text>*/}
                    {/*<Text> {request.origin.address}</Text>*/}
                    {/*<View style={{height: 1, backgroundColor: '#CCCCCC'}}></View>*/}
                    {/*<Text style={{fontWeight: 'bold'}}>Destination:</Text>*/}
                    {/*<Text> {request.destination.locationName}</Text>*/}
                    {/*<Text> {request.destination.contactName}</Text>*/}
                    {/*<Text> {request.destination.contactPhone}</Text>*/}
                    {/*<Text> {request.destination.address}</Text>*/}
                    {/*<View style={{height: 1, backgroundColor: '#CCCCCC'}}></View>*/}
                    {/*<Text>Trailer Type: {"TODO"}</Text>*/}
                    {/*<Text>{generateOperableString(request)}</Text>*/}
                    {/*<Text>{`${request.paymentType || 'COD'}: $${request.amountDue || "100.00"}`}</Text>*/}
                    {/*<Text>Distance: {this.props.haversineDistance}</Text>*/}
                    {/*<Text>Pickup: {moment(request.pickupDate).format("MMM Do ddd, hA")}</Text>*/}
                    {/*<Text>Job Expires: {moment(request.dropoffDate).format("MMM Do ddd, hA")}</Text>*/}
                    {/*<View style={{height: 1, backgroundColor: '#CCCCCC'}}></View>*/}
                    {/*<Text style={{fontWeight: 'bold'}}>Cars:</Text>*/}
                    {/*<Text>Vehicles: {request.vehicles.count}</Text>*/}
                    {/*<View style={{height: 110}}>*/}
                        {/*<View style={{flex: 2, flexGrow:2, flexDirection: 'row'}}>*/}
                        {/*{request.vehicles.edges.map( (v, i) => {*/}
                            {/*return <View key={i} style={{ margin: 3, padding: 4, borderLeftWidth: 1, borderColor: '#cccccc'}}>*/}
                                {/*<Text>Year: {v.node.year}</Text>*/}
                                {/*<Text>Make: {v.node.make}</Text>*/}
                                {/*<Text>Model: {v.node.model}</Text>*/}
                                {/*<Text>Color: {v.node.color}</Text>*/}
                                {/*<Text>Type: {v.node.type}</Text>*/}
                            {/*</View>*/}
                        {/*})}*/}
                        {/*</View>*/}
                    {/*</View>*/}
                    {/*<View style={{height: 1, backgroundColor: '#CCCCCC'}}></View>*/}
                    {/*<View style={{height: 70}}>*/}
                        {/*<View style={{flex: 3, flexDirection: 'row', marginTop: 20, alignItems: 'center', justifyContent: 'center'}}>*/}
                            {/*<TouchableHighlight style={{backgroundColor: '#FF5722', padding: 5, width: 90, height: 30, marginLeft: 6}}*/}
                                {/*onPress={this.cancelJobAction}>*/}
                                {/*<Text style={{color: '#FFFFFF', textAlign: 'center'}}>Cancel Job</Text>*/}
                            {/*</TouchableHighlight>*/}
                            {/*<TouchableHighlight style={{backgroundColor: '#42A5F5', padding: 5, width: 90, height: 30, marginLeft: 6}}*/}
                                                {/*onPress={this.callJobAction}>*/}
                                {/*<Text style={{color: '#FFFFFF', textAlign: 'center'}}>Call</Text>*/}
                            {/*</TouchableHighlight>*/}
                            {/*/!*<TouchableHighlight style={{backgroundColor: '#009688', padding: 5, width: 90, height: 30, marginLeft: 6}}*!/*/}
                                                {/*/!*onPress={this.messageJobAction.bind(this)}>*!/*/}
                                {/*/!*<Text style={{color: '#FFFFFF', textAlign: 'center'}}>Message</Text>*!/*/}
                            {/*/!*</TouchableHighlight>*!/*/}
                            {/*<TouchableHighlight style={{backgroundColor: '#66BB6A', padding: 5, width: 100, height: 30, marginLeft: 6}}*/}
                                                {/*onPress={this.navigateTo.bind(this)}>*/}
                                {/*<Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 10,}}>Navigate to*/}
                                    {/*{(request.status === RequestStatusEnum.DISPATCHED) ? 'Pick up' : 'Drop off'}</Text>*/}
                            {/*</TouchableHighlight>*/}
                        {/*</View>*/}
                    {/*</View>*/}
                    <View>
                        <TouchableHighlight style={{backgroundColor: '#26C6DA',
                        padding: 5, 
                        height: 30, 
                        marginLeft: 20,
                        alignItems: "center",
                        width: Dimensions.get('window').width-40}}
                                            onPress={this.goToInspection.bind(this)}>
                            <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 13}}>
                                {(request.status === RequestStatusEnum.DISPATCHED) ? 'TAP TO START PICK UP INSPECTION' : 'OBTAIN DROP OFF SIGNATURE'}
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </ScrollView>
        </View>)
    }
}

const styles = StyleSheet.create({
    topBox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        marginTop: 10
    },
    cardBottom: {
        marginTop: 5,
        marginBottom: 5,
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#EEEEEE',
        shadowOffset: {width: 5, height: 5},
        shadowRadius: 5,
        shadowOpacity: 5,
    },
    details: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        margin: 5,
        padding: 5,
    },
    detailText: {
        marginLeft: 10,
    },
});

