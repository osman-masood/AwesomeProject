/**
 * Created by osman on 12/7/16.
 *
 *
 * @flow
 */


//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import {RequestStatusEnum, generateOperableString, haversineDistanceToRequest} from "./common";
import JobDetailComponent from "./JobDetailComponent";
const deepcopy = require("deepcopy");

const ReactNative = require('react-native');
const {
    StyleSheet,
    Text,
    View,
    Linking,
    Modal,
    TouchableHighlight,
    PickerIOS,
    TextInput,
    ScrollView,
    Button
} = ReactNative;
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';
//noinspection JSUnresolvedVariable
import Tabs from 'react-native-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
//noinspection JSUnresolvedVariable
import MapView from 'react-native-maps';

const PickerItemIOS = PickerIOS.Item;

const CANCEL_REASONS = ["Not interested", "Customer not available", "Customer doesn't want to ship",
    "Wrong trailer type", "Not operable", "Wrong price", "Other"];

const LIST_VIEW_BOTTOM_PADDING_HACK = 0;


export default class MyJobsComponent extends Component {
    //noinspection JSUnresolvedVariable
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        acceptedRequests: PropTypes.array.isRequired,
        currentPosition: PropTypes.object.isRequired,
        cancelRequestFunction: PropTypes.func.isRequired
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
            cancelReasonComments: string
        } = {
            allJobsSubTab: "list",  // allJobsSubTab is "list", "map", or "sort"

            acceptedRequests: deepcopy(this.props.acceptedRequests),
            mapViewRegion: {
                latitude: 1.78825,
                longitude: -1.4324,
                latitudeDelta: 0.1822,
                longitudeDelta: 0.0921,
            },
            currentPosition: deepcopy(this.props.currentPosition),
            isFilterDropdownVisible: false,
            isCancelModalVisible: false,
            jobOfModal: null,
            cancelReason: CANCEL_REASONS[0],
            cancelReasonComments: null
        };
        this.state = thisState;
    }

    componentWillReceiveProps(nextProps) {
        // TODO we can optimize further by deep-comparing the requests in shouldComponentUpdate.
        this.setState({
            acceptedRequests: deepcopy(nextProps.acceptedRequests),
            currentPosition: deepcopy(nextProps.currentPosition)
        });
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
        const rightButtonConfig = {
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
                rightButton={rightButtonConfig}
            />
            <View style={{marginTop: 40}}>
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
            returnView = <View><Text>No jobs found! Try again later!</Text></View>
        } else {
            returnView = <ScrollView>{[subTabs, allJobsContainer]}</ScrollView>;
        }
        return returnView;
    }

    mapView() {
        const subTabs = this.renderAllJobsSubTabs();
        return [subTabs, <View key="mapview"><MapView
            region={this.state.mapViewRegion}
            onRegionChange={(mapViewRegion) => this.setState({mapViewRegion})}
            style={{height: 490}}
        >
            <MapView.Marker coordinate={{latitude: this.state.currentPosition.latitude, longitude:
            this.state.currentPosition.longitude}}
                            title="Me"
                            description="My location"
            />

            {this.state.acceptedRequests.map(request => (
                <MapView.Marker
                    key={request._id}
                    coordinate={{latitude: request.origin.coordinates[0], longitude: request.origin.coordinates[1]}}
                    title={`${request.paymentType || 'COD'}: $${request.amountDue || "10.00"}`}
                    description={request.origin.locationName}
                />
            ))}
        </MapView></View>];
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
                    <PickerIOS
                        itemStyle={{fontSize: 25}}
                        selectedValue={this.state.cancelReason}
                        onValueChange={(cancelReason) => this.setState({cancelReason})}>
                        {CANCEL_REASONS.map((cancelReason) => (
                            <PickerItemIOS
                                key={cancelReason}
                                value={cancelReason}
                                label={cancelReason}
                            />
                        ))}
                    </PickerIOS>
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

        const directionsRequest = `comgooglemaps-x-callback://?daddr=${latitude},${longitude}&x-success=stowkapp://?resume=true&x-source=stowkapp`;

        Linking.openURL(directionsRequest).catch(
            err => console.error('An error occurred opening directions request' + directionsRequest, err));
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
                passProps: {title: "View Job", request:request, haversineDistance:haversineDistance}})}>

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

const styles = StyleSheet.create({
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