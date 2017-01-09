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
                    passProps: {title: "Enter Phone Number", accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODcxZTVkNDBmYjkzMzMxYmFkZmZhZDkiLCJlbWFpbCI6IkNsYXkuTWVkaHVyc3Q3NUB5YWhvby5jb20iLCJmaXJzdE5hbWUiOiJKYW55IiwibGFzdE5hbWUiOiJLZW1tZXIiLCJwaG9uZSI6IisxNDA4NTE1MjA1MSIsInJvbGUiOiJ1c2VyIiwicHJvZmlsZSI6eyJ0eXBlIjoiY2FycmllciIsInJvbGUiOiJvd25lciIsImNhcnJpZXIiOiI1ODcxZTVkNTBmYjkzMzMxYmFkZmZiMjAifSwidmVyaWZpZWQiOnRydWUsImlhdCI6MTQ4MzkyOTA2NywiZXhwIjoxNTE1NDY1MDY3fQ.QAOrGM1mEX2CLL0eYonBhXKfD-iPmZsUoVaHqptMPZE'}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
