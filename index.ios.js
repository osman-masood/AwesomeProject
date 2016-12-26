/**
 *
 *
 * @flow
 */

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
import EnterPhoneNumberComponent from "./components/EnterPhoneNumberComponent";

import NewJobsComponent from "./components/NewJobsComponent";

export default class AwesomeProject extends Component {
    render() {
        console.info("Rendering AwesomeProject with props ", this.props);
        return (
            <NavigatorIOS
                initialRoute={{
                    component: EnterPhoneNumberComponent, // NewJobsComponent
                    title: 'Enter Phone Number',
                    navigationBarHidden: true,
                    passProps: {title: "Enter Phone Number", accessToken: '123'}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
