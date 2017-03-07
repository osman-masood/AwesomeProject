/**
 * Created by shahwarsaleem on 2017-02-23.
 */
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
    ScrollView,
    Dimensions,
    PickerIOS,
    PickerItemIOS
} from 'react-native';

//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';
import WelcomeComponent from './WelcomeComponent';
import SignatureComponent from './SignatureComponent';


import { fetchGraphQlQuery } from './common';

import NavigationBar from 'react-native-navbar';

var vCount = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
export default class CarrierProfileComponent extends Component {
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
            phone: this.props.phone,
            companyName: null,
            address1: null,
            city: null,
            countryState: null,
            zipCode: null,
            email: null,
            mcNumber: null,
            usDotNumber: null,
            vehicleCount: null,
            openSignature: false
        }

        this.toggleSignatureScreen = this.toggleSignatureScreen.bind(this);
    }

    toggleSignatureScreen() {
        if (this.state.openSignature) {
            this.setState({
                openSignature: false
            });
        } else {
            this.setState({
                openSignature: true

            });
        }
    }

    goToSignature() {

        if ( this.state.companyName === null || this.state.address1 === null || this.state.city === null
              || this.state.zipCode === null || this.state.email === null || this.state.mcNumber === null
            || this.state.usDotNumber === null || this.state.vehicleCount === null) {

            Alert.alert("All fields are required", "Please fill all fields");
        } else {

            this.toggleSignatureScreen();



            // fetch("https://stowkapi-staging.herokuapp.com/auth/carrier/register", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json; charset=utf-8"
            //     },
            //     body: JSON.stringify({
            //         "firstName": `${this.props.firstName}`,
            //         "lastName": `${this.props.lastName}`,
            //         "phone": `${this.props.phone}`,
            //         "email": `${this.props.email}`,
            //         "driversLicense": `${this.props.driversLicense}`,
            //         "driversLicenseState": `${this.props.driversLicenseState}`,
            //         "driversLicenseExpiry": `${this.props.driversLicenseExpiry}`,
            //         "dob" : `1991-08-08`,
            //         "role": 'user',
            //         "strategy" : 'sms',
            //         "profile" : {
            //             "type": "carrier",
            //             "role": "owner",
            //         }
            //     })
            // }).then((response) => {
            //         console.log("Response from /auth/carrier/register for phone ",this.props.phone, ": ", response);
            //         if (response.status === 201) {
            //             fetchGraphQlQuery(
            //                 this.state.accessToken,
            //                 `mutation  {
            //             createCarrier(
            //                 name: ${this.state.companyName},
            //                 mcNumber: ${this.state.mcNumber},
            //                 usDot: ${this.state.usDotNumber},
            //                 phone: ${this.state.phone},
            //                 email: ${this.state.email},
            //                 address: ${this.state.address1}
            //
            //             ) {
            //                 record
            //             }
            //         }`
            //             ).then((response) => {
            //                     console.log("Response from createCarrier ", this.props.phone, ": ", response);
            //                 }
            //             )
            //
            //         }
            // })
            //     .catch((error) => {
            //         console.error("Error Adding user " + this.props.phone, error);
            //     });
            //
            // this.props.navigator.push({
            //         title: 'Welcome Screen',
            //         component: WelcomeComponent,
            //         navigator: this.props.navigator,
            //         navigationBarHidden: true,
            //         passProps: { title: "Welcome Screen", navigator: this.props.navigator}
            // });
        }
    }



    render(){

        const leftButtonConfig = {
            title: 'Back',
            handler: ()  => this.props.toggleCarrierProfile()
        };

        // TODO add states for loading & failed
        let returnComponent;

        if(this.state.openSignature){

            returnComponent = <SignatureComponent title="Signature Screen"
                                                  navigator={this.props.navigator}
                                                  toggleSignatureScreen={this.toggleSignatureScreen}
            />

        }else{
            returnComponent = (
                <ScrollView style={{height: Dimensions.get('window').height - 400, backgroundColor: '#F5FCFF', flex: 1}}>
                    <NavigationBar
                        leftButton={leftButtonConfig}
                        style={{backgroundColor: '#F5FCFF'}}
                    />

                    <View style={styles.viewStyle} >
                        <Text style={styles.textStyle}>Carrier Profile</Text>
                    </View>


                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(companyName) => this.setState({companyName})}
                        value={this.state.companyName}
                        placeholder="Company Name"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(address1) => this.setState({address1})}
                        value={this.state.address1}
                        placeholder="Address"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(city) => this.setState({city})}
                        value={this.state.city}
                        placeholder="City"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(countryState) => this.setState({countryState})}
                        value={this.state.driversLicenseState}
                        placeholder="State"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(zipCode) => this.setState({zipCode})}
                        value={this.state.zipCode}
                        placeholder="Zip Code"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(email) => this.setState({email})}
                        value={this.state.email}
                        placeholder="Email Address"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="email-address"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(mcNumber) => this.setState({mcNumber})}
                        value={this.state.mcNumber}
                        placeholder="MC #"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />



                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(usDotNumber) => this.setState({usDotNumber})}
                        value={this.state.usDotNumber}
                        placeholder="USDOT #"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <PickerIOS
                        selectedValue={this.state.vehicleCount}
                        onValueChange={(count) => this.setState({vehicleCount: count})}>
                        {Object.keys(vCount).map((option) => (
                            <PickerItemIOS
                                key={option}
                                value={option}
                                label={vCount[option]}
                            />
                        ))}
                    </PickerIOS>

                    {/*<TextInput*/}
                    {/*style={styles.textInputStyle}*/}
                    {/*onChangeText={(vehicleCount) => this.setState({vehicleCount})}*/}
                    {/*value={this.state.vehicleCount}*/}
                    {/*placeholder="How many vehicles can you carry?"*/}
                    {/*multiline={false}*/}
                    {/*autoFocus={false}*/}
                    {/*keyboardType="number-pad"*/}
                    {/*/>*/}

                    <Button
                        style={styles.buttonStyle}
                        onPress={() => {this.goToSignature()}}
                        title="Next"
                        color="#841584"
                        accessibilityLabel="Go to Carrier Information"

                    />
                </ScrollView>
            );
        }
        return returnComponent;
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

    horizontalViewStyle: {
        borderBottomWidth: 1,
        padding: 5,
        backgroundColor: '#F5FCFF',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderColor: '#ddd',
       // position: 'relative'
    },

    buttonStyle: {
        textAlign: 'center',
        height: 40
    }
});
