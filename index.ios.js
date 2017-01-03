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
import TabBarComponent from "./components/TabBarComponent";

export default class AwesomeProject extends Component {
    render() {
        console.info("Rendering AwesomeProject with props ", this.props);
        return (
            <NavigatorIOS
                initialRoute={{
                    component: TabBarComponent,  // TabBarComponent, // EnterPhoneNumberComponent,
                    title: 'Enter Phone Number',
                    navigationBarHidden: true,
                    passProps: {title: "Enter Phone Number", accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODYzNDljZjI0NmQ2OTI1OWM0MWIxYTIiLCJlbWFpbCI6IkJldHR5NDBAeWFob28uY29tIiwiZmlyc3ROYW1lIjoiS2FpbHluIiwibGFzdE5hbWUiOiJMZWJzYWNrIiwicGhvbmUiOiIrMTQwODUxNTIwNTEiLCJyb2xlIjoidXNlciIsInByb2ZpbGUiOnsidHlwZSI6ImNhcnJpZXIiLCJyb2xlIjoib3duZXIiLCJjYXJyaWVyIjoiNTg2MzQ5Y2YyNDZkNjkyNTljNDFiMWQ0In0sInZlcmlmaWVkIjp0cnVlLCJpYXQiOjE0ODMzNTE3ODcsImV4cCI6MTUxNDg4Nzc4N30.AszPT8ifkgkiYpUzEdN-UpAwTNLrEMTOqhg0N6-Ixa4'}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
