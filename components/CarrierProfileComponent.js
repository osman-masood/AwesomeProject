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
    Button
} from 'react-native';

//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';
import WelcomeComponent from './WelcomeComponent';
import InformationBar from './InformationBar';

import { getAccessTokenFromResponse } from './common';

import NavigationBar from 'react-native-navbar';


export default class CarrierProfileComponent extends Component {
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
            companyName: null,
            address1: null,
            address2: null,
            city: null,
            countryState: null,
            zipCode: null,
            emailAddress: null,
            mcNumber: null,
            usDotNumber: null,
            vehicleAmount: null
        }
        // console.info("SignUpPersonalProfileComponent constructor with accessToken", props.accessToken, "title", props.title);
        // this._onForward = this._onForward.bind(this);
        // this.state = { code: null, submittingCodeState: 0 };  // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
    }

    openSignUpPersonalProfileComponent = (accessToken) => {
        this.props.navigator.push({
            title: 'Sign up details',
            component: SignUpPersonalProfileComponent,
            navigator: this.props.navigator,
            navigationBarHidden: true,
            passProps: {title: 'Sign up details', navigator: this.props.navigator, accessToken: accessToken}
        });
    }

    _onForward() {


    }

    render() {

        const leftButtonConfig = {
            title: 'Back',
            handler: ()  => this.state.navigator.pop()
        };

        // TODO add states for loading & failed
        return (
            <View style={{backgroundColor: '#F5FCFF', flex: 1}}>
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
                    autoFocus={true}
                    keyboardType="default"
                />



                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(address1) => this.setState({address1})}
                    value={this.state.address1}
                    placeholder="Address"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="default"
                />



                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(city) => this.setState({city})}
                    value={this.state.city}
                    placeholder="City"
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

                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(zipCode) => this.setState({zipCode})}
                    value={this.state.zipCode}
                    placeholder="Zip Code"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="default"
                />

                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(emailAddress) => this.setState({emailAddress})}
                    value={this.state.emailAddress}
                    placeholder="Email Address"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="email-address"
                />



                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(mcNumber) => this.setState({mcNumber})}
                    value={this.state.mcNumber}
                    placeholder="MC #"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="default"
                />



                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(usDotNumber) => this.setState({usDotNumber})}
                    value={this.state.usDotNumber}
                    placeholder="USDOT #"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="default"
                />

                <TextInput
                    style={styles.textInputStyle}
                    onChangeText={(vehicleAmount) => this.setState({vehicleAmount})}
                    value={this.state.vehicleAmount}
                    placeholder="How many vehicles can you carry?"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="number-pad"
                />

                <Button
                    style={styles.buttonStyle}
                    onPress={this._onForward}
                    title="Submit"
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
