/**
 * @flow
 */

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
//noinspection JSUnresolvedVariable
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    NavigatorIOS,
    TouchableHighlight,
    Image,
    TextInput,
    Button,
    Alert,
    Date
} from 'react-native';

import DatePicker from 'react-native-datepicker';

//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';
import WelcomeComponent from './WelcomeComponent';

import { getAccessTokenFromResponse } from './common';
import CarrierProfileComponent from './CarrierProfileComponent';
import LicensePhotoComponent from './LicensePhotoComponent';

import NavigationBar from 'react-native-navbar';


export default class SignUpPersonalProfileComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            title: this.props.title,
            navigator: this.props.navigator,
            accessToken: this.props.accessToken,
            firstName: null,
            lastName: null,
            driversLicense: null,
            driversLicenseState: null,
            driversLicenseExpiry: "2016-05-01",
            usedPhoto: null,
            cameraModalOpen: true, // <--
        };

        this.tookPicture = this.tookPicture.bind(this);
    }

    openWelcomeComponent = () => {
        this.state.navigator.push({
            title: 'Welcome Screen',
            component: WelcomeComponent,
            navigator: this.state.navigator,
            navigationBarHidden: true,
            passProps: { title: "Welcome Screen", navigator: this.state.navigator}
        });
    }

    openCarrierProfileComponent = (accessToken) => {

        if (this.state.firstName == null || this.state.lastName == null || this.state.driversLicense == null
            || this.state.driversLicenseState == null || this.state.driversLicenseExpiry === "Invalid Date" || this.state.usedPhoto === null
        )
        {
            Alert.alert("All fields are required", "Please fill all fields");
        } else {
            this.props.navigator.push({
                title: 'Sign up details',
                component: CarrierProfileComponent,
                navigator: this.props.navigator,
                navigationBarHidden: true,
                passProps: {title: 'Carrier Company details', navigator: this.props.navigator, accessToken: accessToken, phone: this.props.phone,
                            firstName: this.state.firstName, lastName: this.state.lastName, driversLicense: this.state.driversLicense,
                            driversLicenseState: this.state.driversLicenseState, driversLicenseExpiry: this.state.driversLicenseExpiry
                            }
            });
        }
    }

    _onForward() {

    }

    tookPicture(path) {
        let that = this;
        that.setState({
            usedPhoto: path,
            cameraModalOpen: false,
        });
    }

    openLicensePhotoComponent() {
            this.props.navigator.push({
                title: 'License photo',
                component: LicensePhotoComponent,
                navigator: this.props.navigator,
                navigationBarHidden: true,
                passProps: {title: 'License photo', navigator: this.props.navigator, accessToken: this.props.accessToken, takePicture: this.tookPicture}
            });

    }

    render() {

        const leftButtonConfig = {
            title: 'Back',
            handler: () => {this.openWelcomeComponent()}
        };

        // TODO add states for loading & failed
        return (
            <View style={{backgroundColor: '#F5FCFF', flex: 1}}>
                <NavigationBar
                    leftButton={leftButtonConfig}
                    style={{backgroundColor: '#F5FCFF'}}
                />

                <View style={styles.viewStyle} >
                    <Text style={styles.textStyle}>Personal Profile</Text>
                </View>

                    <TouchableHighlight
                        style={styles.pictureStyle} onPress={() => {this.openLicensePhotoComponent()}}>
                        <Image
                            //defaultSource={require('../assets/sign.jpeg')}
                            style={styles.imageStyle}
                            source={ this.state.usedPhoto === null? require('../assets/sign.jpeg'): { uri : this.state.usedPhoto}}
                        />
                    </TouchableHighlight>

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(firstName) => this.setState({firstName})}
                        value={this.state.firstName}
                        placeholder="First Name"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(lastName) => this.setState({lastName})}
                        value={this.state.lastName}
                        placeholder="Last Name"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(driversLicense) => this.setState({driversLicense})}
                        value={this.state.driversLicense}
                        placeholder="Driver's License Number"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(driversLicenseState) => this.setState({driversLicenseState})}
                        value={this.state.driversLicenseState}
                        placeholder="State"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />


                <DatePicker
                    style={styles.dateStyle}
                    date={this.state.driversLicenseExpiry}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={(driversLicenseExpiry) => this.setState({driversLicenseExpiry})}
                />


                <Button
                    style={styles.buttonStyle}
                    onPress={ () => {this.openCarrierProfileComponent(this.state.accessToken)}}
                    title="Next"
                    color="#841584"
                    accessibilityLabel="Go to Carrier Information"

                />
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    viewStyle :{
        backgroundColor: '#F5FCFF',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        paddingTop: 15,
    },

    textStyle: {
        fontSize: 20
    },

    textInputStyle: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5
    },

    dateStyle: {
        width: 200,
        alignItems: 'center',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5
    },

    pictureStyle: {
        alignItems: 'center'
    },

    imageStyle: {
        height: 200,
        width: 200,
    },


    buttonStyle: {
        textAlign: 'center',
        height: 40
    }
});
