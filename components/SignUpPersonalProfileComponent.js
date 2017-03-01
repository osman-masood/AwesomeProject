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
    TextInput,
    Button,
    Alert,
    Date
} from 'react-native';

import DatePicker from 'react-native-datepicker';

//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';
import WelcomeComponent from './WelcomeComponent';
import InformationBar from './InformationBar';

import { getAccessTokenFromResponse } from './common';
import CarrierProfileComponent from './CarrierProfileComponent';

import NavigationBar from 'react-native-navbar';


export default class SignUpPersonalProfileComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            title: this.props.title,
            navigator: this.props.navigator,
            accessToken: this.props.accessToken,
            firstName: null,
            lastName: null,
            licenseNumber: null,
            countryState: null,
            expirationDate: "2016-05-01"
        }
        // console.info("SignUpPersonalProfileComponent constructor with accessToken", props.accessToken, "title", props.title);
        // this._onForward = this._onForward.bind(this);
        // this.state = { code: null, submittingCodeState: 0 };  // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
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

        if (this.state.firstName == null || this.state.lastName == null || this.state.licenseNumber == null
            || this.state.countryState == null || this.state.expirationDate === "Invalid Date"
        )
        {
            Alert.alert("All fields are required", "Please fill the complete information");
        } else {
            this.props.navigator.push({
                title: 'Sign up details',
                component: CarrierProfileComponent,
                navigator: this.props.navigator,
                navigationBarHidden: true,
                passProps: {title: 'Carrier Company details', navigator: this.props.navigator, accessToken: accessToken}
            });
        }
    }
    _onForward() {

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
                        onChangeText={(licenseNumber) => this.setState({licenseNumber})}
                        value={this.state.licenseNumber}
                        placeholder="Driver's License Number"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(countryState) => this.setState({countryState})}
                        value={this.state.countryState}
                        placeholder="State"
                        multiline={false}
                        autoFocus={true}
                        keyboardType="default"
                    />


                <DatePicker
                    style={styles.dateStyle}
                    date={this.state.expirationDate}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={(expirationDate) => this.setState({expirationDate})}
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

    buttonStyle: {
        textAlign: 'center',
        height: 40
    }
});
