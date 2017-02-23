/**
 * Created by osman on 12/7/16.
 *
 *
 * @flow
 */


//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import {RequestStatusEnum, fetchGraphQlQuery, generateOperableString, haversineDistanceToRequest, Request} from "./common";
import BackgroundTimer from 'react-native-background-timer';
import JobDetailComponent from "./JobDetailComponent";
const deepcopy = require("deepcopy");
import EventEmitter from 'EventEmitter'
global.evente = new EventEmitter;

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
  Alert,
  PickerIOS,
    Picker
} from 'react-native'
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';
//noinspection JSUnresolvedVariable
import Tabs from 'react-native-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
//noinspection JSUnresolvedVariable
import MapView from 'react-native-maps';
var moment = require('moment');

const PickerItemIOS = PickerIOS.Item;

const CANCEL_REASONS = ["Not interested", "Customer not available", "Customer doesn't want to ship",
    "Wrong trailer type", "Not operable", "Wrong price", "Other"];

const LIST_VIEW_BOTTOM_PADDING_HACK = 0;


export default class MyJobsComponent extends Component {
    //noinspection JSUnresolvedVariable
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        currentPosition: PropTypes.object.isRequired,
        cancelRequestFunction: PropTypes.func.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.setCancelModalVisible = this.setCancelModalVisible.bind(this);
        this.onNavigateToPickUpOrDropOff = this.onNavigateToPickUpOrDropOff.bind(this);
        this.onCancelJob = this.onCancelJob.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
        this.callPhone = this.callPhone.bind(this);

        const thisState: {
            allJobsSubTab: string,
            acceptedRequests: Array<Request>,
            mapViewRegion: {
                latitude: number,
                longitude: number,
                latitudeDelta: number,
                longitudeDelta: number
            },
            currentPosition: {
                latitude: number,
                longitude: number
            },
            isFilterDropdownVisible: boolean,
            isCancelModalVisible: false,
            jobOfModal: Request,
            cancelReason: string,
            cancelReasonComments: string,
            accessToken: string
        } = {
            allJobsSubTab: "list",  // allJobsSubTab is "list", "map", or "sort"

            acceptedRequests: [],
            mapViewRegion: {
                latitude: this.props.currentPosition.latitude,
                longitude: this.props.currentPosition.longitude,
                latitudeDelta: 1.0,
                longitudeDelta: 1.0,
            },
            currentPosition: deepcopy(this.props.currentPosition),
            isFilterDropdownVisible: false,
            isCancelModalVisible: false,
            jobOfModal: null,
            cancelReason: CANCEL_REASONS[0],
            cancelReasonComments: null,
            accessToken: this.props.accessToken,
            buildPreview: null
        };
        this.state = thisState;
    }

    componentWillReceiveProps(nextProps) {
        // TODO we can optimize further by deep-comparing the requests in shouldComponentUpdate.
        this.setState({
            currentPosition: deepcopy(nextProps.currentPosition)
        });
    }

    componentWillMount() {

        let that = this;

        this.getMyjoblist = this.getMyjoblist.bind(this);
        this.getMyjoblist();
        global.evente.addListener('re-send-request', function(e) {
            that.getMyjoblist();
        });
    }

    getMyjoblist() {
        let that = this;
        this.props.acceptedRequests().then( response => {

            let currentCarrierId = response['data']['viewer']['me']['carrier']['_id'];
            let acceptedRequests = [];

            for (let item in response['data']['viewer']['locationRequests']) {
                let r = response['data']['viewer']['locationRequests'][item];
               // console.warn(RequestStatusEnum.DISPATCHED, r.status);
                console.log(r._id, r);
                if ( (r.deliveries.edges.length > 0) && (r.status === RequestStatusEnum.IN_PROGRESS || r.status === RequestStatusEnum.DISPATCHED)) {
                    console.log("LOGS: ", r.status, r.deliveries.edges[0].node.carrierId, currentCarrierId);

                }
                if (that.hasCarrierAcceptedRequest(currentCarrierId, r)) {
                    acceptedRequests.push(r);
                }
            }
            this.setState({
                acceptedRequests: acceptedRequests
            })
        });
    }    

    hasCarrierAcceptedRequest(carrierId: string, request:Request) {
        // Must be Dispatched or In Progress, and deliveries.edges[i].node must contain carrierId.
        let ret;
        if ((request.status === RequestStatusEnum.DISPATCHED || request.status === RequestStatusEnum.IN_PROGRESS) &&
            (request.deliveries && request.deliveries.edges && request.deliveries.edges.length > 0)) {

            const deliveryCarrierIds = request.deliveries.edges.map((edge) => edge.node.carrierId);
            ret = deliveryCarrierIds.indexOf(carrierId) !== -1;
        }
        return ret;
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO: For better perf, return true on any state change, or when the prop's requests or currentPosition changes
        return true;
    }

    onRegionChange(mapViewRegion) {
        console.log(`NewJobComponent.onRegionChange(mapViewRegion: ${mapViewRegion})`);
        this.setState({mapViewRegion});
    }

    /*
     * To make it so that NavigationBar interacts with Navigator (i.e. back button support), do:
     * http://stackoverflow.com/questions/34986149/how-to-hidden-back-button-of-react-native-navigator
     */

    render() {
        const rightButtonConfig = {  // TODO add Menu in
            title: 'Menu',
            handler: () => alert('Menu!'),
        };

        let mainView = <Text>Not defined yet!</Text>;
        if (this.state.allJobsSubTab === "list") {
            mainView = this.listView();
        }
        else if (this.state.allJobsSubTab === "map") {
            mainView = this.mapView();
        }

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                rightButton={undefined}
            />
            <View  style={{flex: 2}}>
                <View>
                    {this.renderCancelModalIfVisible()}
                    {mainView}
                </View>
            </View>
        </View>;
    }

    allJobsContainer() {
        const allJobs = this.state.acceptedRequests;
        let allJobsContainer = null;
        if (allJobs.length > 0) {
            const allJobsViews = [];
            for (let jobIndex = 0; jobIndex < allJobs.length; jobIndex++) {
                // Bottom margin should be more for very last element so that bottom tab doesn't cover it.
                const marginBottom = (jobIndex === allJobs.length - 1) ? 70 : undefined;
                allJobsViews.push(this.renderJobListElement(allJobs[jobIndex], true, marginBottom));
            }
            /* Bottom padding is so you can see the last job's buttons, because bottom nav tabs block
             those from view due to the ScrollView */
            allJobsContainer = <View key="allJobsContainer"
                                     style={{paddingBottom: LIST_VIEW_BOTTOM_PADDING_HACK}}>
                <View style={[styles.listViewHeader, {backgroundColor: '#F4F0F0', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}]}>
                    <Text style={styles.listViewHeaderText}>Jobs</Text>
                </View>
                {allJobsViews}
            </View>;
        }
        return allJobsContainer;
    }

    listView() {
        // Get list of nearby jobs
        let allJobsContainer = this.allJobsContainer();

        // Sub-tabs (depends on state)
        const subTabs = this.renderAllJobsSubTabs();

        let returnView;
        if (!allJobsContainer) {
            returnView = <View><Text style={{textAlign:'center'}}>Loading jobs ...</Text></View>
        } else {
            returnView = <ScrollView>{[subTabs, allJobsContainer]}</ScrollView>;
        }
        return returnView;
    }

    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }

    pressedMarker(request, dist) {
        console.log('pressedMarker', request, dist);
        var lat = (dist == 'O') ? request.origin.coordinates[0] : request.destination.coordinates[0];
        var lng = (dist == 'O') ? request.origin.coordinates[1] : request.destination.coordinates[1];
        this.setState({
            jobOfModal: request,
            buildPreview: [dist, request],
            mapViewRegion: {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            }
        });
    }

    mapView() {

        const subTabs = this.renderAllJobsSubTabs();
        return [subTabs, <View key="mapview">
            <MapView
            region={this.state.mapViewRegion}
            //onRegionChange={(mapViewRegion) => this.setState({mapViewRegion})}
            style={{height: Dimensions.get("window").height-160}}>

            {this.state.acceptedRequests.map(request => (
                <MapView.Polyline
                    key={request._id}
                    strokeColor={this.randomColor()}
                    coordinates={[{latitude: request.origin.coordinates[0], longitude: request.origin.coordinates[1]},
                    {latitude: request.destination.coordinates[0], longitude: request.destination.coordinates[1]}]}
                    strokeWidth={1}
                />

            ))}
            {this.state.acceptedRequests.map(request => (
                <MapView.Marker key={request._id}
                                coordinate={{latitude: request.origin.coordinates[0], longitude: request.origin.coordinates[1]}}>
                    <MarkerCustomView letter="O" bgColor={styles.redBackground} request={request} onMarkerPress={this.pressedMarker.bind(this)}/>
                </MapView.Marker>
            ))}
            {this.state.acceptedRequests.map(request => (
                <MapView.Marker
                    key={request._id}
                    coordinate={{latitude: request.destination.coordinates[0], longitude: request.destination.coordinates[1]}}>
                    <MarkerCustomView bgColor={styles.greenBackground} letter="D" request={request} onMarkerPress={this.pressedMarker.bind(this)}/>
                </MapView.Marker>
            ))}
        </MapView>
            <JobMapPreview
                buildPreview={this.state.buildPreview}
                cancelRequestFunction={this.props.cancelRequestFunction}
                onCancelJob={this.onCancelJob}
                navigateTo={this.onNavigateToPickUpOrDropOff}
            />
        </View>];
    }

    renderAllJobsSubTabs() {
        return <View key="subTabs" style={{marginTop: 50}}>
            <Tabs selected={this.state.allJobsSubTab}
                  style={{backgroundColor:'white'}}
                  selectedStyle={{fontWeight:'bold'}}
                  selectedIconStyle={{borderWidth:1,borderColor:'grey'}}
                  onSelect={el => this.setState({allJobsSubTab:el.props.name})}>
                <Text style={{fontWeight: '100'}} name="list">List View</Text>
                <Text style={{fontWeight: '100'}} name="map">Map View</Text>
            </Tabs>
        </View>;
    }

    setCancelModalVisible(visible:boolean, request:Request) {
        this.setState({isCancelModalVisible: visible, jobOfModal: request});
    }

    renderCancelModalIfVisible() {
        return <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.isCancelModalVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
        >
            <View style={{flex: 1}}>
                {/* Top right X button */}
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setCancelModalVisible(!this.state.isCancelModalVisible, null) }>
                    </Icon.Button>
                </View>

                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Text>Please select a reason to cancel this job.</Text>
                </View>

                <View style={{flex: 9, flexDirection: 'column', justifyContent: 'flex-start'}}>
                    <Picker
                        style={{fontSize: 25}}
                        selectedValue={this.state.cancelReason}
                        onValueChange={(cancelReason) => this.setState({cancelReason})}>
                        {CANCEL_REASONS.map((cancelReason) => (
                            <Picker.Item
                                // key={cancelReason}
                                value={cancelReason}
                                label={cancelReason}
                            />
                        ))}
                    </Picker>
                    <TextInput
                        style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                        editable = {true}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(cancelReasonComments) => this.setState({cancelReasonComments})}
                        maxLength = {2047}
                        returnKeyType="send"
                        onSubmitEditing={this.onCancelJob}
                        keyboardType="default"
                        value={this.state.cancelReasonComments}
                        placeholder="Comments"
                    />
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around'}}>
                        <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setCancelModalVisible(!this.state.isCancelModalVisible, null) }>
                            Cancel
                        </Icon.Button>
                        <Icon.Button name="thumbs-o-up" color="green" backgroundColor="white" size={30} onPress={this.onCancelJob}>
                            OK
                        </Icon.Button>
                    </View>
                </View>
            </View>
        </Modal>;
    }

    onCancelJob() {
        // Remove job from all lists
        const requestIdToRemove = this.state.jobOfModal._id;
        if (!requestIdToRemove) {
            console.error("MyJobsComponent.onCancelJob: No requestIdToRemove. jobOfModal:", this.state.jobOfModal);
        }
        const acceptedRequests = this.state.acceptedRequests.filter((r) => r._id !== requestIdToRemove);

        // API call to cancel request
        const finalDeclineReason = this.state.cancelReason + (this.state.cancelReasonComments ? `\n${this.state.cancelReasonComments}` : "");
        // this.props.cancelRequestFunction(this.state.jobOfModal, finalDeclineReason).then((responseJson) => {
        //     console.log("MyJobsComponent.onCancelJob: Successfully declined job. Response: ", responseJson);
        // });  TODO once cancellation works

        // Set state to indicate request is declined
        this.setState({
            isCancelModalVisible: false,
            jobOfModal: null,
            acceptedRequests: acceptedRequests,
            buildPreview: null
        });

    }

    /**
     * Opens Google Maps app to navigate to pick up.
     * https://developers.google.com/maps/documentation/ios-sdk/urlscheme
     */
    onNavigateToPickUpOrDropOff(visible: boolean, request, isPickUp: boolean) {

        const originOrDestinationKey = isPickUp ? "origin" : "destination";
        const latitude = request[originOrDestinationKey].coordinates[0];
        const longitude = request[originOrDestinationKey].coordinates[1];

        const directionsRequest = `comgooglemaps-x-callback://?daddr=${latitude},${longitude}&directionsmode=driving&nav=1&x-source=stowkapp&x-success=stowkapp://?resume=true`;

        var options = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
        // Start a timer that runs continuous after 20000 milliseconds
        if (isPickUp) {
            const intervalId = BackgroundTimer.setInterval(() => {
                // this will be executed every 200 ms
                // even when app is the the background
                console.log('tic');
                navigator.geolocation.getCurrentPosition(
                    location => {
                        var coords = location.coords;
                        return fetchGraphQlQuery(
                            this.props.accessToken,
                            `mutation UpdateDeliveryById{
                    deliveryUpdateById(input:{
                        record:{
                            _id: "${request.deliveries.edges[0].node._id}",
                                currentCoordinates: [${coords.longitude}, ${coords.latitude}]
                        }
                    }) {
                        record {
                            id
                        }
                    }
                }`)
                    },
                    error => {
                        console.warn(`ERROR(${error.code}): ${error.message}`);
                    });
            }, 20000);
        }


        Linking.canOpenURL(directionsRequest).then(supported => {
            if (supported) {
                //Linking.openURL('http://maps.apple.com/?saddr=Current%20Location&daddr=' + latitude + ',' + longitude + '&x-callback-url=stowkapp&id=1');
                Linking.openURL(directionsRequest).catch(err => {
                    Alert.alert('Could not start navigation', err.message);
                });
            } else {
                Alert.alert('You don\'t have Google maps installed', 'Directions require Google maps application to run');
            }
        });
    }

    renderJobListElement(request, showPhoneNumber: boolean, marginBottom?: number) {
        // Whether to show Call Phone button
        let phoneNumberLambda = null;
        if (showPhoneNumber) {
            phoneNumberLambda = (r) => <Icon.Button name="phone" color="green" backgroundColor="white" size={30} onPress={ () => this.callPhone(r.shipper.phone)}>
                <Text style={{fontSize: 12}}>Call</Text>
            </Icon.Button>;
        } else {
            phoneNumberLambda = (r) => <View style={{width: 0, height: 0}} />;
        }

        // Is it pick up or drop off?
        const isPickUp = request.status === RequestStatusEnum.DISPATCHED;

        // The touchable job summary
        const summaryView = this.renderJobListElementSummary(request, true);

        if (marginBottom === null || marginBottom === undefined) {
            marginBottom = 5;
        }
        return <View key={request._id} style={{ marginTop: 5, marginBottom: marginBottom, paddingLeft: 5, paddingTop: 5}}>
            {/* Job View */}
            { summaryView }

            {/* Navigate and Cancel buttons */}
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                { phoneNumberLambda(request) }
                <Icon.Button name="thumbs-o-up" color="black" backgroundColor="white" size={30} onPress={ () => this.onNavigateToPickUpOrDropOff(true, request, isPickUp)}>
                    <Text style={{fontSize: 12}}>Navigate to {isPickUp ? "Pick up" : "Drop off"}</Text>
                </Icon.Button>
                <Icon.Button name="times-circle" color="red" backgroundColor="white" size={30} onPress={ () => this.setCancelModalVisible(true, request)}>
                    <Text style={{fontSize: 12}}>Cancel</Text>
                </Icon.Button>
            </View>
        </View>
    }

    renderJobListElementSummary(request, isTouchable?: boolean) {
        // Calculate straight-line distance between current location and ending point
        const haversineDistance = haversineDistanceToRequest(this.state.currentPosition, request);

        // View which displays request info
        const summaryView = <View style={{flexDirection: 'row'}}>
            <View style={{flex: 3}}>
                <Text style={{fontWeight: 'bold'}}>{request.name}</Text>
                <Text>Origin: {request.origin.locationName}</Text>
                <Text>Destination: {request.destination.locationName}</Text>
                <Text>Vehicles: {request.vehicles.count}</Text>
                <Text>Trailer Type: {"TODO"}</Text>
                <Text>{generateOperableString(request)}</Text>
            </View>
            <View style={{flex: 1}}>
                <Text>{`${request.paymentType || 'COD'}: $${request.amountDue || "100.00"}`}</Text>
                <Text>Distance: {haversineDistance}</Text>
                <Text>Pickup: {request.pickupDate}</Text>
                <Text>Job Expires: {request.dropoffDate}</Text>
            </View>
        </View>;

        // If it's touchable, wrap it with a TouchableHighlight
        let finalView;
        if (isTouchable) {
            finalView = <TouchableHighlight onPress={() => this.props.navigator.push({
                component: JobDetailComponent,
                navigationBarHidden: false,
                navigator: this.props.navigator,
                passProps: {
                    title: "View Job",
                    request: request,
                    navigator: this.props.navigator,
                    haversineDistance: haversineDistance,
                    cancelJob: this.onCancelJob,
                    cancelRequestFunction: this.props.cancelRequestFunction,
                    onNavigateToPickUpOrDropOff: this.onNavigateToPickUpOrDropOff,
                    uploadImageJPGS3: this.props.uploadImageJPGS3,
                    updateDeliveryMutation: this.props.updateDeliveryMutation
                }})}>

                {summaryView}
            </TouchableHighlight>
        } else {
            finalView = summaryView
        }
        return finalView;
    }

    callPhone(phoneNumber: string) {
        Linking.openURL("tel:" + phoneNumber).catch(
            err => console.error('An error occurred opening phone number ' + phoneNumber, err));
    }
}

class MarkerCustomView extends Component {

    constructor(props) {
        super(props);
    }

    markerPress() {
        this.props.onMarkerPress(this.props.request, this.props.letter);
    }

    render() {
        return(
            <TouchableHighlight onPress={this.markerPress.bind(this)}>
                <View style={this.props.bgColor}>
                    <Text>{this.props.letter}</Text>
                </View>
            </TouchableHighlight>
        )
    }
}

class JobMapPreview extends Component {
    constructor(props) {
        super(props);

        this.navigate = this.navigate.bind(this);
    }

    makeCall() {
        var job = this.props.buildPreview[1];
        var disct = this.props.buildPreview[0];
        var phoneNumber = (disct == 'O') ? job.origin.contactPhone : job.destination.contactPhone;
        Linking.openURL('tell:' + phoneNumber)
    }

    cancelJob() {
        var job = this.props.buildPreview[1];
        var self = this;

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
                    text: 'NO', onPress: () => {
                        console.log('cancel')
                }
                }
            ]
        )
    }

    navigate() {
        let job = this.props.buildPreview[1];
        const isPickUp = job.status === RequestStatusEnum.DISPATCHED;
        this.props.navigateTo(true, this.props.buildPreview[1], isPickUp);
    }

    render() {
        if (this.props.buildPreview == null) {
            return (
                <View></View>
            )
        }else {
            var job = this.props.buildPreview[1];
            var disct = this.props.buildPreview[0];
            var title = (disct == 'O') ? job.origin.locationName : job.destination.locationName;
            var vcounts = {};
            job.vehicles.edges.map(v => {
                if (vcounts[v.node.type]) {
                    vcounts[v.node.type]++;
                }else {
                    vcounts[v.node.type] = 1;
                }
            });
            var vehicles = '';
            for (let obj in vcounts) {
                vehicles += ' ' + vcounts[obj] + ' ' + obj;
            }

            const isPickUp = job.status === RequestStatusEnum.DISPATCHED;
            return (
                <View style={styles.buildPreview}>
                    <View style={{height: 30}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={styles.titleText}>{title}</Text>
                            <Text style={{height:30}}>{job.paymentType}: ${job.amountEstimated}</Text>
                        </View>
                    </View>
                    <View style={{height: 74}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <View style={{width: 230, height: 70}}>
                                <Text>Origin: {job.origin.address}</Text>
                                <Text>Destination: {job.destination.address}</Text>
                                <Text>Vehicles: {job.vehicles.count} ({vehicles})</Text>
                                <Text>{generateOperableString(job)}</Text>
                            </View>
                            <View style={{width: 200, height: 50}}>
                                <Text>Pickup: {moment(job.pickupDate).format("MMM Do ddd, hA")}</Text>
                                <Text>Expires: {moment(job.dropoffDate).format("MMM Do ddd, hA")}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{marginLeft: 5, height:2,
                     width: Dimensions.get("window").width-10, backgroundColor:'#CCCCCC'}}>
                    </View>
                    <View style={{height: 30}}>
                        <View style={{flex: 1, flexDirection: 'row', alignItems:'center'}}>
                            <TouchableHighlight onPress={this.makeCall.bind(this)}>
                                <View style={styles.previewActionItem}>
                                    <Image style={{padding: 4}} source={require('../assets/phone@3x.png')} />
                                    <Text>Call</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight>
                                <View style={[styles.previewActionItem, {width:80}]}>
                                    <Image style={{padding: 4}} source={require('../assets/phone@3x.png')} />
                                    <Text>Forward</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={this.cancelJob.bind(this)}>
                                <View style={styles.previewActionItem}>
                                    <Image style={{padding: 4}} source={require('../assets/phone@3x.png')} />
                                    <Text style={{backgroundColor: '#a12631',color:'#FFFFFF'}}>Cancel</Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={this.navigate}>
                                <View style={[styles.previewActionItem, {width: 150}]}>
                                    <Image style={{padding: 4}} source={require('../assets/phone@3x.png')} />
                                    <Text style={{backgroundColor:'#3B8B50'}}>Navigate to {(isPickUp) ? 'Pick up': 'Drop off'}</Text>
                                </View>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    previewActionItem: {
        marginLeft: 10,
        width: 70,
        padding: 10
    },
    buildPreview: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 1,
        height: 170,
        backgroundColor: '#FFFFFF'
    },
    titleText: {
        fontSize: 15,
        width: 300,
        fontWeight: '400',
        textAlign: 'center',
        paddingTop: 5,
        height:30
    },
    redBackground: {
        backgroundColor: '#a12631',
        padding: 2,
    },
    greenBackground: {
        backgroundColor: '#2bba26',
        padding: 2
    },
    tabContent: {
        flex: 1,
        alignItems: 'center',
    },
    tabText: {
        color: 'white',
        margin: 50,
    },
    listViewHeader: {
    },
    listViewHeaderText: {
        color: '#000000',
        fontFamily: 'Helvetica Neue',
        textShadowColor: '#DDDDDD',
        textShadowOffset: {width: 0, height: 3},
        textShadowRadius: 6
    },
    button: {
        borderRadius: 5,
        flexGrow: 1,
        height: 44,
        alignSelf: 'stretch',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    buttonText: {
        fontSize: 18,
        margin: 5,
        textAlign: 'center',
    },
});