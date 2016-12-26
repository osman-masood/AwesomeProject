/**
 * Created by osman on 12/7/16.
 *
 *
 * @flow
 */


//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
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

const LIST_VIEW_BOTTOM_PADDING_HACK = 80;

export default class MyJobsComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.setDeclineModalVisible = this.setDeclineModalVisible.bind(this);
        this.setAcceptModalVisible = this.setAcceptModalVisible.bind(this);
        this.onPickupJob = this.onPickupJob.bind(this);
        this.onDeclineJob = this.onDeclineJob.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
        this.callPhone = this.callPhone.bind(this);
        this.selectVehicleType = this.selectVehicleType.bind(this);
        this.selectIsInOperation = this.selectIsInOperation.bind(this);
        this.selectTrailerType = this.selectTrailerType.bind(this);
        this.selectShipFromDaysInFuture = this.selectShipFromDaysInFuture.bind(this);

        this.state = {
            selectedTab: "list",  // selectedTab is "list", "map", or "sort"
            jobs: [
                {
                    "name": "Toyota of Fresno",
                    "jobId": "1",
                    "isPreferred": true,
                    "isNetwork": false,
                    "origin": "Fresno, CA",
                    "destination": "Los Angeles, CA",
                    "vehicles": "10 (4 Cars, 4 Pickup, 2 SUV)",
                    "trailerType": "Open",
                    "isOperable": true,
                    "cod": 150.0,
                    "location": {
                        "latitude": "37.532762",
                        "longitude": "-122.553908",
                        "distance": 29,
                        "pickupDate": "2016/08/12",
                        "jobExpirationDatetime": "2016-12-09T03:22:20Z",
                        "phoneNumber": "4085152051"
                    },
                    "isDeclined": false,
                    "isAccepted": false,
                },
                {
                    "name": "Toyota of Los Angeles",
                    "jobId": "2",
                    "isPreferred": false,
                    "isNetwork": false,
                    "origin": "Fremont, CA",
                    "destination": "Los Angeles, CA",
                    "vehicles": "20 (8 Cars, 8 Pickup, 4 SUV)",
                    "trailerType": "Open",
                    "isOperable": false,
                    "cod": 150.0,
                    "location": {
                        "latitude": "37.432762",
                        "longitude": "-122.153908",
                        "distance": 29,
                        "pickupDate": "2016/08/12",
                        "jobExpirationDatetime": "2016-12-09T03:22:20Z",
                        "phoneNumber": "4085152051"
                    },
                    "isDeclined": false,
                    "isAccepted": false,
                },
                {
                    "name": "Toyota of Fremont",
                    "jobId": "3",
                    "isPreferred": false,
                    "isNetwork": true,
                    "origin": "Los Angeles, CA",
                    "destination": "San Francisco, CA",
                    "vehicles": "10 (4 Cars, 4 Pickup, 2 SUV)",
                    "trailerType": "Open",
                    "isOperable": false,
                    "cod": 250.0,
                    "location": {
                        "latitude": "37.432762",
                        "longitude": "-122.153908",
                        "distance": 29,
                        "pickupDate": "2016/08/12",
                        "jobExpirationDatetime": "2016-12-09T03:22:20Z",
                        "phoneNumber": "4085152051"
                    },
                    "isDeclined": false,
                    "isAccepted": false,
                }
            ],
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
            currentPosition: {latitude: null, longitude: null},
            isFilterDropdownVisible: false,
            isDeclineModalVisible: false,
            isAcceptModalVisible: false,
            jobOfModal: null,
            declineReason: DECLINE_REASONS[0],
            declineReasonComments: null
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
            (positionError) => console.error("MyJobsComponent.constructor: Got an error trying to getCurrentPosition: " + positionError.message)
        );

        // Continually update current position (marker) as user's location changes
        navigator.geolocation.watchPosition(
            (position) => this.setState({
                currentPosition: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
            }),
            (positionError) => console.error("MyJobsComponent.constructor: Got an error trying to watchPosition: " + positionError.message)
        )
    }

    onRegionChange(mapViewRegion) {
        console.log("onRegionChange called with this: ", this);
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
        console.info("MyJobsComponent state.selectedTab: ", this.state.selectedTab);
        if (this.state.selectedTab === "list") {
            mainView = this.listView();
        }
        else if (this.state.selectedTab === "map") {
            mainView = this.mapView();
        }

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                rightButton={rightButtonConfig}
            />
            <View style={{marginTop: 40}}>
                <View>
                    {this.renderAcceptModalIfVisible()}
                    {this.renderDeclineModalIfVisible()}
                    {mainView}
                </View>
            </View>
        </View>;
    }

    getAcceptedAndNotFinishedJobs() {
        return this.state.jobs.filter((job) => job.isAccepted);
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

    updateSearchParams(keyName: string, newValue) {
        const updateObject = {};
        updateObject[keyName] = {$set: newValue};
        let newSearchParams = update(this.state.searchParams, updateObject);
        this.setState({searchParams: newSearchParams});
    }

    listView() {
        const notDeclinedJobs = this.getAcceptedAndNotFinishedJobs();

        // Get list of dealer jobs
        const dealerJobs = notDeclinedJobs.filter((job) => job.isPreferred);
        console.log("dealerJobs: ", dealerJobs);
        let dealerJobsContainer = null;
        if (dealerJobs.length > 0) {
            const dealerJobsViews = [];
            for (let job of dealerJobs) {
                dealerJobsViews.push(this.renderJobListElement(job));
            }
            dealerJobsContainer = <View key="dealerJobsContainer">
                <View style={[styles.listViewHeader, {backgroundColor: '#BA4141', paddingTop: 10, paddingBottom: 10, paddingLeft: 15}]}>
                    <Text style={styles.listViewHeaderText}>My Dealer Jobs</Text>
                </View>
                {dealerJobsViews}
            </View>;
        }

        // Get list of network jobs
        const networkJobs = notDeclinedJobs.filter((job) => job.isNetwork);
        console.log("networkJobs: ", networkJobs);
        let networkJobsContainer = null;
        if (networkJobs.length > 0) {
            const networkJobsViews = [];
            for (let job of networkJobs) {
                networkJobsViews.push(this.renderJobListElement(job));
            }
            networkJobsContainer = <View key="networkJobsContainer">
                <View style={[styles.listViewHeader, {backgroundColor: '#DDA956', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}]}>
                    <Text style={styles.listViewHeaderText}>Network Jobs</Text>
                </View>
                {networkJobsViews}
            </View>;
        }

        // Get list of nearby jobs
        const allJobs = notDeclinedJobs.filter((job) => !job.isPreferred && !job.isNetwork);
        console.log("allJobs: ", allJobs);
        let allJobsContainer = null;
        if (allJobs.length > 0) {
            const allJobsViews = [];
            for (let job of allJobs) {
                allJobsViews.push(this.renderJobListElement(job));
            }
            /* Bottom padding is so you can see the last job's buttons, because bottom nav tabs block
             those from view due to the ScrollView */
            allJobsContainer = <View key="allJobsContainer"
                                     style={{paddingBottom: LIST_VIEW_BOTTOM_PADDING_HACK}}>
                <View style={[styles.listViewHeader, {backgroundColor: '#1B6C1B', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}]}>
                    <Text style={styles.listViewHeaderText}>All Jobs</Text>
                </View>
                {allJobsViews}
            </View>;
        }

        // Sub-tabs (depends on state)
        const subTabs = this.renderSelectedTabs();

        // Render them out in the list
        const allContainers = [];
        if (dealerJobsContainer) {
            allContainers.push(dealerJobsContainer);
        }
        if (networkJobsContainer) {
            allContainers.push(networkJobsContainer);
        }
        if (allJobsContainer) {
            allContainers.push(allJobsContainer);
        }

        if (allContainers.length === 0) {
            return <View><Text>No jobs found! Try again later!</Text></View>
        }
        return <ScrollView>{[subTabs, ...allContainers]}</ScrollView>;
    }

    mapView() {
        const subTabs = this.renderSelectedTabs();
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

            {this.getAcceptedAndNotFinishedJobs().map(job => (
                <MapView.Marker
                    key={job.name + job.location.latitude + job.location.longitude}
                    coordinate={{latitude: parseFloat(job.location.latitude), longitude: parseFloat(job.location.longitude)}}
                    title={"COD: $" + job.cod}
                    description={job.name}
                />
            ))}
        </MapView></View>];
    }

    renderSelectedTabs() {
        return <View key="subTabs" style={{marginTop: 20}}>
            <Tabs selected={this.state.selectedTab}
                  style={{backgroundColor:'white'}}
                  selectedStyle={{fontWeight:'bold'}}
                  selectedIconStyle={{borderWidth:1,borderColor:'grey'}}
                  onSelect={el => this.setState({selectedTab:el.props.name})}>
                <Text style={{fontWeight: '100'}} name="list">List View</Text>
                <Text style={{fontWeight: '100'}} name="map">Map View</Text>
            </Tabs>
        </View>;
    }

    setDeclineModalVisible(visible, job) {
        this.setState({isDeclineModalVisible: visible, jobOfModal: job});
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
                    <PickerIOS
                        itemStyle={{fontSize: 25}}
                        selectedValue={this.state.declineReason}
                        onValueChange={(declineReason) => this.setState({declineReason})}>
                        {DECLINE_REASONS.map((declineReason) => (
                            <PickerItemIOS
                                key={declineReason}
                                value={declineReason}
                                label={declineReason}
                            />
                        ))}
                    </PickerIOS>
                    <TextInput
                        style={{fontSize: 24, height: 60, borderColor: 'gray', borderWidth: 1}}
                        editable = {true}
                        multiline = {true}
                        numberOfLines = {4}
                        onChangeText={(declineReasonComments) => this.setState({declineReasonComments})}
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
        const jobIdToUpdate = this.state.jobOfModal.jobId;
        const updatedJobs = this.getUpdatedJobsAfterFinishOrDecline(jobIdToUpdate, false);

        this.setState({
            isDeclineModalVisible: false,
            jobOfModal: null,
            jobs: updatedJobs
        });
        // TODO Make AJAX call to submit updated job
    }

    getUpdatedJobsAfterFinishOrDecline(jobId: string, isAccept: boolean) {
        /*
         Find finished/declined job in state's list, get the updated object,
         and replace old job with updated job in list.
         */
        const jobInList = this.state.jobs.filter((job) => job.jobId === jobId)[0];
        const jobIndexInList = this.state.jobs.findIndex((job) => job.jobId === jobId);
        let updatedJob;
        if (isAccept) {
            updatedJob = update(jobInList, {isAccepted: {$set: true}, isDeclined: {$set: false}});
        } else {
            updatedJob = update(jobInList, {isDeclined: {$set: true}, isAccepted: {$set: false}});
        }
        return update(this.state.jobs, {$splice: [[jobIndexInList, 1, updatedJob]]});
    }

    setAcceptModalVisible(visible: boolean, job) {
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
                    <Text>Are you sure you would like to accept this job?</Text>
                </View>
                <View style={{flex: 3, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(!this.state.isAcceptModalVisible, null) }>
                        Cancel
                    </Icon.Button>
                    <Icon.Button name="thumbs-o-up" color="green" backgroundColor="white" size={30} onPress={this.onPickupJob}>
                        Yes
                    </Icon.Button>
                </View>
            </View>
        </Modal>;
    }

    onPickupJob() {
        const jobIdToUpdate = this.state.jobOfModal.jobId;
        const updatedJobs = this.getUpdatedJobsAfterFinishOrDecline(jobIdToUpdate, true);

        this.setState({
            isAcceptModalVisible: false,
            jobOfModal: null,
            jobs: updatedJobs
        });
        // TODO Make AJAX call to submit updated job
    }

    renderJobListElement(job) {
        return <View key={job.jobId} style={{ marginTop: 5, marginBottom: 5, paddingLeft: 5, paddingTop: 5}}>


            {/* Job Text */}
            <TouchableHighlight onPress={() => this.props.navigator.push({
                component: JobDetailComponent,
                navigationBarHidden: false,
                navigator: this.props.navigator,
                passProps: {title: job.name, job:job}
            })}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 3}}>
                        <Text style={{fontWeight: 'bold'}}>{job.name}</Text>
                        <Text>Origin: {job.origin}</Text>
                        <Text>Destination: {job.destination}</Text>
                        <Text>Vehicles: {job.vehicles}</Text>
                        <Text>Trailer Type: {job.trailerType}</Text>
                        <Text>{job.isOperable ? "Operable" : "Inoperable"}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text>COD: {job.cod}</Text>
                        <Text>Distance: {job.location.distance}</Text>
                        <Text>Pickup: {job.pickupDate}</Text>
                        <Text>Job Expires: {job.jobExpirationDatetime}</Text>
                    </View>
                </View>
            </TouchableHighlight>

            {/* Call, Accept/Decline buttons */}
            <View style={{flexDirection: 'row'}}>
                <Icon.Button name="phone" color="green" backgroundColor="white" size={30} onPress={ () => this.callPhone(job.location.code)}>
                    <Text style={{fontSize: 12}}>Call</Text>
                </Icon.Button>
                <Icon.Button name="thumbs-o-up" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(true, job)}>
                    <Text style={{fontSize: 12}}>Accept</Text>
                </Icon.Button>
                <Icon.Button name="times-circle" color="red" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(true, job)}>
                    <Text style={{fontSize: 12}}>Decline</Text>
                </Icon.Button>
                <Icon.Button name="mail-forward" color="blue" backgroundColor="white" size={30} onPress={ () => this.callPhone(job.location.code)}>
                    <Text style={{fontSize: 12}}>Forward</Text>
                </Icon.Button>
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
        color: 'white',
        fontFamily: 'Helvetica Neue'
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