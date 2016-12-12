/**
 * Created by osman on 12/7/16.
 *
 *
 * @flow
 */


import React, { Component, PropTypes } from 'react';
const ReactNative = require('react-native');
const {
    StyleSheet,
    TabBarIOS,
    Text,
    View,
    Button,
    Linking,
    Modal,
    TouchableHighlight,
    PickerIOS,
    TextInput
} = ReactNative;
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';

const PickerItemIOS = PickerIOS.Item;

import Tabs from 'react-native-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';

import update from 'immutability-helper';


const DECLINE_REASONS = ["Not interested", "Customer not available", "Customer doesn't want to ship",
    "Wrong trailer type", "Not operable", "Wrong price", "Other"];

export default class NewJobsComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.setDeclineModalVisible = this.setDeclineModalVisible.bind(this);
        this.setAcceptModalVisible = this.setAcceptModalVisible.bind(this);
        this.onAcceptJob = this.onAcceptJob.bind(this);
        this.onDeclineJob = this.onDeclineJob.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
        this.callPhone = this.callPhone.bind(this);

        this.state = {
            selectedTab: "all_jobs",
            allJobsSubTab: "list",  // allJobsSubTab is "list", "map", or "sort"
            jobs: [
                {
                    "name": "Toyota of Fresno",
                    "jobId": "1",
                    "isPreferred": true,
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
                    "name": "Toyota of Fremont",
                    "jobId": "2",
                    "isPreferred": false,
                    "origin": "Fremont, CA",
                    "destination": "Los Angeles, CA",
                    "vehicles": "20 (4 Cars, 4 Pickup, 2 SUV)",
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
                }
            ],
            searchOrigin: null,
            destinationOrigin: null,
            mapViewRegion: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            declineModalVisible: false,
            acceptModalVisible: false,
            jobOfModal: null,
            declineReason: DECLINE_REASONS[0],
            declineReasonComments: null
        };
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

        const activeButtonStyle = {
            backgroundColor: '#aaa'
        };

        let mainView = <Text>Not defined yet!</Text>;
        if (this.state.selectedTab === "all_jobs") {
            if (this.state.allJobsSubTab === "list") {
                mainView = this.listView();
            }
            else if (this.state.allJobsSubTab === "map") {
                mainView = this.mapView();
            }
        }

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                rightButton={rightButtonConfig}
            />
            <View style={{marginTop: 10}}>
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
                <View>
                    {this.renderAcceptModalIfVisible()}
                    {this.renderDeclineModalIfVisible()}
                    {mainView}
                </View>
            </View>
        </View>;
    }

    getNotDeclinedOrAcceptedJobs() {
        return this.state.jobs.filter((job) => !job.isDeclined && !job.isAccepted);
    }

    listView() {
        const notDeclinedJobs = this.getNotDeclinedOrAcceptedJobs();

        // Get list of dealer jobs
        const dealerJobs = notDeclinedJobs.filter((el) => el.isPreferred);
        console.log("dealerJobs: ", dealerJobs);
        let dealerJobsContainer = null;
        if (dealerJobs.length > 0) {
            const dealerJobsViews = [];
            for (let job of dealerJobs) {
                dealerJobsViews.push(this.renderJobListElement(job));
            }
            dealerJobsContainer = <View key="dealerJobsContainer">
                <View style={{backgroundColor: 'grey', paddingTop: 10, paddingBottom: 10, paddingLeft: 15}}>
                    <Text>My Dealer Jobs</Text>
                </View>
                {dealerJobsViews}
            </View>;
        }

        // Get list of nearby jobs
        const nearbyJobs = notDeclinedJobs.filter((el) => !el.isPreferred);
        console.log("nearbyJobs: ", nearbyJobs);
        let nearbyJobsContainer = null;
        if (nearbyJobs.length > 0) {
            const nearbyJobsViews = [];
            for (let job of nearbyJobs) {
                nearbyJobsViews.push(this.renderJobListElement(job));
            }
            nearbyJobsContainer = <View key="nearbyJobsContainer">
                <View style={{backgroundColor: 'grey', paddingTop: 10, paddingBottom: 10, paddingLeft: 15, marginTop: 10}}>
                    <Text>Nearby Jobs</Text>
                </View>
                {nearbyJobsViews}
            </View>;
        }

        // Sub-tabs (depends on state)
        const subTabs = this.renderAllJobsSubTabs();

        // Render them out in the list
        const allContainers = [];
        if (dealerJobsContainer) {
            allContainers.push(dealerJobsContainer);
        }
        if (nearbyJobsContainer) {
            allContainers.push(nearbyJobsContainer);
        }

        if (allContainers.length === 0) {
            return <View><Text>No jobs found! Try again later!</Text></View>
        }
        return <View>{[subTabs, ...allContainers]}</View>;
    }

    mapView() {
        const subTabs = this.renderAllJobsSubTabs();
        return [subTabs, <View key="mapview"><MapView
            region={this.state.mapViewRegion}
            onRegionChange={(mapViewRegion) => this.setState({mapViewRegion})}
            style={{height: 490}}
        >
            {this.state.jobs.map(job => (
                <MapView.Marker
                    coordinate={{latitude: parseFloat(job.location.latitude), longitude: parseFloat(job.location.longitude)}}
                    title={"COD: $" + job.cod}
                    description={job.name}
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
                <View name="sort">
                    <Text style={{fontWeight: '100'}}>Sort</Text>
                </View>
            </Tabs>
        </View>;
    }

    setDeclineModalVisible(visible, job) {
        this.setState({declineModalVisible: visible, jobOfModal: job});
    }

    renderDeclineModalIfVisible() {
        return <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.declineModalVisible}
                    onRequestClose={() => {alert("Modal has been closed.")}}
                >
            <View style={{flex: 1}}>
                {/* Top right X button */}
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(!this.state.declineModalVisible, null) }>
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
                        <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(!this.state.declineModalVisible, null) }>
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
        const updatedJobs = this.getUpdatedJobsAfterAcceptOrDecline(jobIdToUpdate, false);

        this.setState({
            declineModalVisible: false,
            jobOfModal: null,
            jobs: updatedJobs
        });
        // TODO Make AJAX call to submit updated job
    }

    getUpdatedJobsAfterAcceptOrDecline(jobId: string, isAccept: boolean) {
        // Find declined job in state's list, get the updated object, and replace old job with updated job in list.
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

    setAcceptModalVisible(visible, job) {
        this.setState({acceptModalVisible: visible, jobOfModal: job});
    }

    renderAcceptModalIfVisible() {
        return <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.acceptModalVisible}
                    onRequestClose={() => {alert("Modal has been closed.")}}
                >
                    <View style={{flex: 1}}>
                        {/* Top right X button */}
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(!this.state.acceptModalVisible, null) }>
                            </Icon.Button>
                        </View>

                        <View style={{flex: 3, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                            <Text>Are you sure you would like to accept this job?</Text>
                        </View>
                        <View style={{flex: 3, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around'}}>
                            <Icon.Button name="close" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(!this.state.acceptModalVisible, null) }>
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
        const jobIdToUpdate = this.state.jobOfModal.jobId;
        const updatedJobs = this.getUpdatedJobsAfterAcceptOrDecline(jobIdToUpdate, true);

        this.setState({
            acceptModalVisible: false,
            jobOfModal: null,
            jobs: updatedJobs
        });
        // TODO Make AJAX call to submit updated job
    }

    renderJobListElement(job) {
        return <View key={job.jobId} style={{ marginTop: 5, marginBottom: 5, paddingLeft: 5, paddingTop: 5}}>
            {/* Job Text */}
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

            {/* Call, Accept/Decline buttons */}
            <View style={{flexDirection: 'row'}}>
                <Icon.Button name="phone" color="green" backgroundColor="white" size={30} onPress={ () => this.callPhone(job.location.phoneNumber)}>
                    <Text style={{fontSize: 12}}>Call</Text>
                </Icon.Button>
                <Icon.Button name="thumbs-o-up" color="black" backgroundColor="white" size={30} onPress={ () => this.setAcceptModalVisible(true, job)}>
                    <Text style={{fontSize: 12}}>Accept</Text>
                </Icon.Button>
                <Icon.Button name="times-circle" color="red" backgroundColor="white" size={30} onPress={ () => this.setDeclineModalVisible(true, job)}>
                    <Text style={{fontSize: 12}}>Decline</Text>
                </Icon.Button>
                <Icon.Button name="mail-forward" color="blue" backgroundColor="white" size={30} onPress={ () => this.callPhone(job.location.phoneNumber)}>
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
    row: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowTitle: {
        flex: 1,
        fontWeight: 'bold',
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