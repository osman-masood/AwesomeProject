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
    TouchableHighlight
} = ReactNative;
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';

import Tabs from 'react-native-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';

export default class NewJobsComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
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
                    }
                },
                {
                    "name": "Toyota of Fremont",
                    "jobId": "1",
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
                    }
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
            jobOfModal: null
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

    listView() {
        // Get list of dealer jobs
        const dealerJobs = this.state.jobs.filter((el) => el.isPreferred);
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
        const nearbyJobs = this.state.jobs.filter((el) => !el.isPreferred);
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
            return <View>No nearby jobs found! Try again later!</View>
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
                    <View style={{marginTop: 22}}>
                        <View>
                            <Text>Hello World!</Text>

                            <TouchableHighlight onPress={() => {
              this.setDeclineModalVisible(!this.state.declineModalVisible, null)
            }}>
                                <Text>Hide Modal</Text>
                            </TouchableHighlight>

                        </View>
                    </View>
                </Modal>;
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
        // Uses state.jobOfModal

    }

    renderJobListElement(job) {
        return <View key={job.id} style={{ marginTop: 5, marginBottom: 5, paddingLeft: 5, paddingTop: 5}}>
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

    static callPhone(phoneNumber: string) {
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