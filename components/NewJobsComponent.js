/**
 * Created by osman on 12/7/16.
 *
 *
 * @flow
 */


//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import {RequestStatusEnum, fetchCurrentUserAndLocationRequests, haversineDistanceToRequest, Request, User} from "./common";
import EventEmitter from 'EventEmitter'
global.evente = new EventEmitter;
const deepcopy = require("deepcopy");

import {
  View,
  PickerIOS,
    Picker,
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

import JobDetailComponent from './JobDetailComponent';
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';
//noinspection JSUnresolvedVariable
import Tabs from 'react-native-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
//noinspection JSUnresolvedVariable
import MapView from 'react-native-maps';
import update from 'immutability-helper';

const PickerItemIOS = PickerIOS.Item;

const DECLINE_REASONS = ["Not interested", "Customer not available", "Customer doesn't want to ship",
    "Wrong trailer type", "Not operable", "Wrong price", "Other"];

const LIST_VIEW_BOTTOM_PADDING_HACK = 0;


export default class NewJobsComponent extends Component {
    //noinspection JSUnusedGlobalSymbols,JSUnresolvedVariable
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        openPreferredRequests: PropTypes.array.isRequired,
        openNonPreferredRequests: PropTypes.array.isRequired,
        currentPosition: PropTypes.object.isRequired,
        acceptRequestFunction: PropTypes.func.isRequired,
        declineRequestFunction: PropTypes.func.isRequired,
        currentUserId: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.setDeclineModalVisible = this.setDeclineModalVisible.bind(this);
        this.setAcceptModalVisible = this.setAcceptModalVisible.bind(this);
        this.renderAcceptModalIfVisible = this.renderAcceptModalIfVisible.bind(this);
        this.onAcceptJob = this.onAcceptJob.bind(this);
        this.onDeclineJob = this.onDeclineJob.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
        this.callPhone = this.callPhone.bind(this);
        this.selectVehicleType = this.selectVehicleType.bind(this);
        this.selectIsInOperation = this.selectIsInOperation.bind(this);
        this.selectTrailerType = this.selectTrailerType.bind(this);
        this.selectShipFromDaysInFuture = this.selectShipFromDaysInFuture.bind(this);

        //noinspection UnnecessaryLocalVariableJS
        let thisState: {
            selectedTab: string,
            allJobsSubTab: string,

            openPreferredRequests: Array<Request>,
            openNonPreferredRequests: Array<Request>,
            searchParams: {
                origin: string,
                destination: string,
                vehicleType: string,
                trailerType: string,
                isRunning: boolean,
                minVehicles: string,
                maxVehicles: string,
                readyToShipFromDate: string
            },
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
            isDeclineModalVisible: boolean,
            jobOfModal: Request,
            declineReason: string,
            declineReasonComments: string,
            currentUserId: string

        } = {
            selectedTab: "all_jobs",
            allJobsSubTab: "list",  // allJobsSubTab is "list", "map", or "sort"

            openPreferredRequests: deepcopy(this.props.openPreferredRequests),
            openNonPreferredRequests: deepcopy(this.props.openNonPreferredRequests),
            searchParams: {
                origin: null,
                destination: null,
                vehicleType: null,
                trailerType: null,
                isRunning: null,
                minVehicles: "0",  // TODO for now, must be string because TextInputs throw warnings if you pass them numbers
                maxVehicles: "1000",
                readyToShipFromDate: null,
            },
            mapViewRegion: {
                latitude: 1.78825,
                longitude: -1.4324,
                latitudeDelta: 0.1822,
                longitudeDelta: 0.0921,
            },
            currentPosition: deepcopy(this.props.currentPosition),
            isFilterDropdownVisible: false,
            isDeclineModalVisible: false,
            isAcceptModalVisible: false,
            jobOfModal: null,
            declineReason: DECLINE_REASONS[0],
            declineReasonComments: null,
            currentUserId: this.props.currentUserId
        };
        this.state = thisState;

        // Set current map position based on geolocation.
        navigator.geolocation.getCurrentPosition(
            (position) => this.setState({
                currentPosition: {
                    latitude: this.props.currentPosition.latitude,
                    longitude: this.props.currentPosition.longitude,
                },
                mapViewRegion: {
                    latitude: this.props.currentPosition.latitude,
                    longitude: this.props.currentPosition.longitude,
                    latitudeDelta: 0.522,
                    longitudeDelta: 0.421,
                }
            }),
            (positionError) => console.error("NewJobsComponent.constructor: Got an error trying to getCurrentPosition: " + positionError.message)
        );
    }

    componentWillReceiveProps(nextProps) {
        // TODO we can optimize further by deep-comparing the requests in shouldComponentUpdate.
        this.setState({
            openNonPreferredRequests: deepcopy(nextProps.openNonPreferredRequests),
            openPreferredRequests: deepcopy(nextProps.openPreferredRequests),
            currentPosition: deepcopy(nextProps.currentPosition)
        });
    }

    // componentWillMount() {
    //     fetchCurrentUserAndLocationRequests(null, this.state.currentPosition.latitude,
    //                                              this.state.currentPosition.longitude, 6000)
    //         .then(response => {
    //             console.log("fetchCurrentUserAndLocationRequests", response, this.state.currentPosition);
    //
    //             let openPreferredRequests = response['data']['viewer']['carrierRequests'];
    //             let openNonPreferredRequests = response['data']['viewer']['locationRequests'];
    //         this.setState({
    //             openNonPreferredRequests: openNonPreferredRequests,
    //             openPreferredRequests: openPreferredRequests
    //         })
    //     })
    // }

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
        if (this.state.selectedTab === "all_jobs") {
            if (this.state.allJobsSubTab === "list") {
                mainView = this.listView();
            }
            else if (this.state.allJobsSubTab === "map") {
                mainView = this.mapView();
            }
        } else if (this.state.selectedTab === "search_loads") {
            mainView = this.searchLoadsView();
        }

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                rightButton={undefined}
            />
            <View>
                {/*
                <View style={{borderBottomWidth: 1, borderBottomColor: 'grey'}}>
                    <Tabs selected={this.state.selectedTab}
                          style={{backgroundColor:'white'}}
                          selectedIconStyle={{borderBottomWidth:2,borderBottomColor:'blue'}}
                          selectedStyle={{fontWeight:'bold'}}
                          onSelect={el => this.setState({selectedTab:el.props.name})}>
                        <Text style={{fontWeight: '100'}} name="all_jobs">All Jobs</Text>
                        <Text style={{fontWeight: '100'}} name="search_loads" >Search Loads</Text>
                    </Tabs>
                </View>
                */}
                <View>
                    {this.renderAcceptModalIfVisible()}
                    {this.renderDeclineModalIfVisible()}
                    {mainView}
                </View>
            </View>
        </View>;
    }

    searchLoadsView() {
        return <View>
            <TextInput
                style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                editable = {true}
                multiline = {false}
                numberOfLines = {1}
                onChangeText={(origin) => this.updateSearchParams("origin", origin)}
                maxLength = {256}
                returnKeyType="next"
                onSubmitEditing={() => alert('Submitted!')}
                keyboardType="default"
                value={this.state.searchParams.origin}
                placeholder="Origin City, State"
            />
            <TextInput
                style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                editable = {true}
                multiline = {false}
                numberOfLines = {1}
                onChangeText={(destination) => this.updateSearchParams("destination", destination)}
                maxLength = {256}
                returnKeyType="next"
                onSubmitEditing={() => alert('Submitted!')}
                keyboardType="default"
                value={this.state.searchParams.destination}
                placeholder="Destination City, State"
            />

            <Text>Vehicle Type</Text>
            <View style={{flexDirection: "row"}}>
                <Button
                    onPress={() => this.selectVehicleType("Car")}
                    title="Car"
                    accessibilityLabel="Filter for Car" />
                <Button
                    onPress={() => this.selectVehicleType("SUV")}
                    title="SUV"
                    accessibilityLabel="Filter for SUV" />
                <Button
                    onPress={() => this.selectVehicleType("Van")}
                    title="Van"
                    accessibilityLabel="Filter for Van" />
                <Button
                    onPress={() => this.selectVehicleType("Pickup")}
                    title="Pickup"
                    accessibilityLabel="Filter for Pickup"/>
            </View>

            <Text>Trailer Type</Text>
            <View style={{flexDirection: "row"}}>
                <Button
                    onPress={() => this.selectTrailerType("Open")}
                    title="Open"
                    accessibilityLabel="Filter for Open" />
                <Button
                    onPress={() => this.selectTrailerType("Enclosed")}
                    title="Enclosed"
                    accessibilityLabel="Filter for Enclosed" />
            </View>

            <Text>Running</Text>
            <View style={{flexDirection: "row"}}>
                <Button
                    onPress={() => this.selectIsInOperation(true)}
                    title="Operable"
                    accessibilityLabel="Filter for Operable" />
                <Button
                    onPress={() => this.selectIsInOperation(false)}
                    title="Non-operable"
                    accessibilityLabel="Filter for Non-operable" />
            </View>

            <View style={{flexDirection: 'row'}}>
                <View>
                    <Text>Min</Text>
                    <TextInput
                        style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                        editable = {true}
                        multiline = {false}
                        numberOfLines = {1}
                        onChangeText={(text) => this.updateSearchParams("minVehicles", text)}
                        maxLength = {3}
                        returnKeyType="next"
                        onSubmitEditing={() => alert('Submitted!')}
                        keyboardType="default"
                        value={this.state.searchParams.minVehicles}
                        placeholder="Min"
                    />
                </View>
                <View>
                    <Text>Max</Text>
                    <TextInput
                        style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                        editable = {true}
                        multiline = {false}
                        numberOfLines = {1}
                        onChangeText={(text) => this.updateSearchParams("maxVehicles", text)}
                        maxLength = {3}
                        returnKeyType="next"
                        onSubmitEditing={() => alert('Submitted!')}
                        keyboardType="default"
                        value={this.state.searchParams.maxVehicles}
                        placeholder="Max"
                    />
                </View>
            </View>

            <Text>Ready to ship within</Text>
            <View style={{flexDirection: "row"}}>
                <Button
                    onPress={() => this.selectShipFromDaysInFuture(0)}
                    title="ASAP"
                    accessibilityLabel="Filter for ship ASAP" />
                <Button
                    onPress={() => this.selectShipFromDaysInFuture(7)}
                    title="7 Days"
                    accessibilityLabel="Filter for ship within 7 Days" />
                <Button
                    onPress={() => this.selectShipFromDaysInFuture(30)}
                    title="30 Days"
                    accessibilityLabel="Filter for ship within 30 days" />
                <Button
                    onPress={() => this.selectShipFromDaysInFuture(60)}
                    title="60 Days"
                    accessibilityLabel="Filter for ship within 60 days" />
            </View>

        </View>
    }

    selectVehicleType(vehicleType: string) {
        this.updateSearchParams("vehicleType", vehicleType);
    }

    selectTrailerType(trailerType: string) {
        this.updateSearchParams("trailerType", trailerType)
    }

    selectIsInOperation(isInOperation: boolean) {
        this.updateSearchParams("isOperable", isInOperation)
    }

    selectShipFromDaysInFuture(shipFromDaysInFuture: number) {
        // TODO:
    }

    updateSearchParams(keyName: string, newValue: string) {
        const updateObject = {};
        updateObject[keyName] = {$set: newValue};
        let newSearchParams = update(this.state.searchParams, updateObject);
        this.setState({searchParams: newSearchParams});
    }

    dealerJobsContainer() {
        /**
         * Renders Requests whose preferred carrier ID is this carrier.
         */
        const dealerJobs = this.state.openPreferredRequests;
        let dealerJobsContainer = null;
        if (dealerJobs.length > 0) {
            const dealerJobsViews = [];
            for (let job of dealerJobs) {
                dealerJobsViews.push(this.renderJobListElement(job));
            }
            dealerJobsContainer = <View key="dealerJobsContainer">
                <View style={[styles.listViewHeader, {backgroundColor: '#F4F0F0', paddingTop: 10, paddingBottom: 10, paddingLeft: 15}]}>
                    <Text style={styles.listViewHeaderText}>My Dealer Jobs</Text>
                </View>
                {dealerJobsViews}
            </View>;
        }
        return dealerJobsContainer;
    }

    networkJobsContainer() {
        const networkJobs = [];  // TODO perform filter
        let networkJobsContainer = null;
        if (networkJobs.length > 0) {
            const networkJobsViews = [];
            for (let job of networkJobs) {
                networkJobsViews.push(this.renderJobListElement(job));
            }
            networkJobsContainer = <View key="networkJobsContainer">
                <View style={[styles.listViewHeader, {backgroundColor: '#F4F0F0', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}]}>
                    <Text style={styles.listViewHeaderText}>Network Jobs</Text>
                </View>
                {networkJobsViews}
            </View>;
        }
        return networkJobsContainer;
    }

    allJobsContainer() {
        const allJobs = this.state.openNonPreferredRequests;
        let allJobsContainer = null;
        if (allJobs.length > 0) {
            const allJobsViews = [];
            for (let jobIndex = 0; jobIndex < allJobs.length; jobIndex++) {
                // Bottom margin should be more for very last element so that bottom tab doesn't cover it.
                const marginBottom = (jobIndex === allJobs.length - 1) ? 70 : undefined;
                allJobsViews.push(this.renderJobListElement(allJobs[jobIndex], false, marginBottom));
            }
            /* Bottom padding is so you can see the last job's buttons, because bottom nav tabs block
             those from view due to the ScrollView */
            allJobsContainer = <View key="allJobsContainer"
                                     style={{paddingBottom: LIST_VIEW_BOTTOM_PADDING_HACK}}>
                <View style={[styles.listViewHeader, {backgroundColor: '#F4F0F0', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}]}>
                    <Text style={styles.listViewHeaderText}>All Jobs</Text>
                </View>
                {allJobsViews}
            </View>;
        }
        return allJobsContainer;
    }

    listView() {
        // Get list of dealer jobs
        console.log("--->",this.state.openPreferredRequests, this.state.openNonPreferredRequests);
        let dealerJobsContainer = this.dealerJobsContainer();

        // Get list of network jobs
        let networkJobsContainer = this.networkJobsContainer();

        // Get list of nearby jobs
        let allJobsContainer = this.allJobsContainer();

        // Sub-tabs (depends on state)
        const subTabs = this.renderAllJobsSubTabs();

        // Render them out in the list
        const allContainers = [dealerJobsContainer, networkJobsContainer, allJobsContainer].filter((c) => c !== null);

        let returnView;
        if (allContainers.length === 0) {
            returnView = <View><Text>Loading...</Text></View>
        } else {
            returnView = <ScrollView>{[subTabs, ...allContainers]}</ScrollView>;
        }
        return returnView;
    }

    mapView() {
        const subTabs = this.renderAllJobsSubTabs();
        const locationRequests = this.state.openNonPreferredRequests.concat(this.state.openPreferredRequests);
        return [subTabs, <View key="mapview"><MapView
            region={this.state.mapViewRegion}
            onRegionChange={(mapViewRegion) => this.setState({mapViewRegion})}
            style={{height: 490}}
        >
            <MapView.Marker coordinate={{latitude: this.state.currentPosition.latitude, longitude:
            this.state.currentPosition.longitude}}
                            title="Me"
                            description="Where I am"
            />

            {locationRequests.map(request => (
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

    setDeclineModalVisible(visible, request:Request) {
        this.setState({isDeclineModalVisible: visible, jobOfModal: request});
    }

    renderDeclineModalIfVisible() {
        return <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.isDeclineModalVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
        >
            <View style={{flex: 1}}>
                {/* Top right X button */}
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(!this.state.isDeclineModalVisible, null) }>
                    </Icon.Button>
                </View>

                <View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Text>Please select a reason to decline this job.</Text>
                </View>

                <View style={{flex: 9, flexDirection: 'column', justifyContent: 'flex-start'}}>
                    <Picker
                        // style={{fontSize: 25}}
                        selectedValue={this.state.cancelReason}
                        onValueChange={(declineReason:string) => this.setState({declineReason})}>
                        {DECLINE_REASONS.map((declineReason) => (
                            <Picker.Item
                                key={declineReason}
                                value={declineReason}
                                label={declineReason}
                            />
                        ))}
                    </Picker>
                    <TextInput
                        style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                        editable = {true}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(declineReasonComments:string) => this.setState({declineReasonComments})}
                        maxLength = {2047}
                        returnKeyType="send"
                        onSubmitEditing={this.onDeclineJob}
                        keyboardType="default"
                        value={this.state.declineReasonComments}
                        placeholder="Comments"
                    />
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around'}}>
                        <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(!this.state.isDeclineModalVisible, null) }>
                            Cancel
                        </Icon.Button>
                        <Icon.Button name="thumbs-o-up" color="green" backgroundColor="white" size={30} onPress={this.onDeclineJob}>
                            OK
                        </Icon.Button>
                    </View>
                </View>
            </View>
        </Modal>;
    }

    onDeclineJob() {
        // Remove job from all lists
        const requestIdToRemove = this.state.jobOfModal._id;
        if (!requestIdToRemove) {
            console.error("NewJobsComponent.onDeclineJob: No requestIdToRemove. jobOfModal:", this.state.jobOfModal);
        }
        const openNonPreferredRequests = this.state.openNonPreferredRequests.filter((r) => r._id !== requestIdToRemove);
        const openPreferredRequests = this.state.openPreferredRequests.filter((r) => r._id !== requestIdToRemove);

        // API call to decline request
        const finalDeclineReason = this.state.declineReason + (this.state.declineReasonComments ? `\n${this.state.declineReasonComments}` : "");
        this.props.declineRequestFunction(this.state.jobOfModal, finalDeclineReason).then((responseJson) => {
            console.log("NewJobsComponent.onDeclineJob: Successfully declined job. Response: ", responseJson);
        });

        // Set state to indicate request is declined
        this.setState({
            isDeclineModalVisible: false,
            jobOfModal: null,
            openNonPreferredRequests: openNonPreferredRequests,
            openPreferredRequests: openPreferredRequests
        });
    }

    setAcceptModalVisible(visible: boolean, job:Request) {
        this.setState({isAcceptModalVisible: visible, jobOfModal: job});
    }

    renderAcceptModalIfVisible() {
        return <Modal
            animationType={"slide"}
            transparent={false}
            visible={this.state.isAcceptModalVisible}
            onRequestClose={() => {alert("Modal has been closed.")}}
        >
            <View style={{flex: 1}}>
                {/* Top right X button */}
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(!this.state.isAcceptModalVisible, null) }>
                    </Icon.Button>
                </View>

                <View style={{flex: 3, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <Text>Are you sure you would like to accept this job? </Text>
                </View>
                <View style={{flex: 3, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(!this.state.isAcceptModalVisible, null) }>
                        Cancel
                    </Icon.Button>
                    <Icon.Button name="thumbs-o-up" color="green" backgroundColor="white" size={30} onPress={this.onAcceptJob}>
                        Yes
                    </Icon.Button>
                </View>
            </View>
        </Modal>;
    }

    onAcceptJob() {
        console.log("onAcceptJob called with state.currentPosition:", this.state.currentPosition);
        // Remove job from all lists
        const requestIdToRemove = this.state.jobOfModal._id;
        if (!requestIdToRemove) {
            console.error("NewJobsComponent.onAcceptJob: No requestIdToRemove. jobOfModal:", this.state.jobOfModal);
        }
        const openNonPreferredRequests = this.state.openNonPreferredRequests.filter((r) => r._id !== requestIdToRemove);
        const openPreferredRequests = this.state.openPreferredRequests.filter((r) => r._id !== requestIdToRemove);

        // API call to accept job
        this.props.acceptRequestFunction(this.state.jobOfModal, this.state.currentPosition.latitude, this.state.currentPosition.longitude).then((responseJson) => {
            global.evente.emit('re-send-my-request', {reload: true});
            window.console.log("NewJobsComponent.onAcceptJob: Successfully accepted job. Response: ", responseJson);
        });

        // Set state to hide accepted job & modal
        this.setState({
            isAcceptModalVisible: false,
            jobOfModal: null,
            openNonPreferredRequests: openNonPreferredRequests,
            openPreferredRequests: openPreferredRequests
        });
    }

    static generateIsOperableString(request:Request) {
        const numOperable = request.vehicles.edges.map(edge => edge.node.running).length;
        const numInoperable = request.vehicles.edges.length - numOperable;
        let retStr;
        if (numOperable === 0) {
            retStr = `${numInoperable} Inoperable`;
        } else if (numInoperable === 0) {
            retStr = `${numOperable} Operable`;
        } else {
            retStr = `${numOperable} Operable, ${numInoperable} Inoperable`;
        }
        return retStr;
    }

    renderJobListElement(request:Request, showPhoneNumber: boolean, marginBottom: number) {
        if (showPhoneNumber === undefined) {
            showPhoneNumber = true;
        }
        if (marginBottom === undefined) {
            marginBottom = 5;
        }

        let phoneNumberLambda = null;
        if (showPhoneNumber) {
            phoneNumberLambda = (r) => <Icon.Button name="phone" color="green" backgroundColor="white" size={30} onPress={ () => this.callPhone(r.shipper.phone)}>
                <Text style={{fontSize: 12}}>Call</Text>
            </Icon.Button>;
        } else {
            phoneNumberLambda = (r) => <View style={{width: 0, height: 0}} />;
        }

        const haversineDistance = haversineDistanceToRequest(this.state.currentPosition, request);

        let dealerJobsOrMyJobs = (request.preferredCarrierIds.indexOf(this.state.currentUserId) === -1 )? true : false;


        return <View key={request._id} style={{ marginTop: 5, marginBottom: marginBottom, paddingLeft: 5, paddingTop: 5}}>


            <TouchableHighlight disabled={dealerJobsOrMyJobs} onPress={() => this.props.navigator.push({
                component: JobDetailComponent,
                navigationBarHidden: false,
                navigator: this.props.navigator,
                passProps: {title: "My Job String", request:request},
            })}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 3}}>
                        <Text style={{fontWeight: 'bold'}}>{request.name}</Text>
                        <Text>Origin: {request.origin.address}</Text>
                        <Text>Destination: {request.destination.address}</Text>
                        <Text>Vehicles: {request.vehicles.count}</Text>
                        <Text>Trailer Type: {"TODO"}</Text>
                        <Text>{NewJobsComponent.generateIsOperableString(request)}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text>{`${request.paymentType || 'COD'}: $${request.amountDue || "10.00"}`}</Text>
                        <Text>Distance: {haversineDistance}</Text>
                        <Text>Pickup: {request.pickupDate}</Text>
                        <Text>Job Expires: {request.dropoffDate}</Text>
                    </View>
                </View>
            </TouchableHighlight>

            {/* Call, Accept/Decline buttons */}
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                { phoneNumberLambda(request) }
                <Icon.Button name="thumbs-o-up" color="black" backgroundColor="white" size={45} onPress={ () => this.setAcceptModalVisible(true, request)}>
                    <Text style={{fontSize: 14}}>Accept</Text>
                </Icon.Button>
                <Icon.Button name="times-circle" color="red" backgroundColor="white" size={45} onPress={ () => this.setDeclineModalVisible(true, request)}>
                    <Text style={{fontSize: 14}}>Decline</Text>
                </Icon.Button>
                {/*
                <Icon.Button name="mail-forward" color="blue" backgroundColor="white" size={30} onPress={ () => this.callPhone(job.location.phoneNumber)}>
                    <Text style={{fontSize: 12}}>Forward</Text>
                </Icon.Button>
                */}
            </View>
        </View>
    }

    callPhone(phoneNumber: string) {
        Linking.openURL("tel:1-408-555-5555").catch(
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