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
    Button,
    AsyncStorage,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import EnterPhoneNumberComponent from "./components/EnterPhoneNumberComponent";
//noinspection JSUnresolvedVariable
import TabBarComponent from "./components/TabBarComponent";
import VehicleInspectionComponent from './components/VehicleInspectionComponent'
import {ACCESS_TOKEN_STORAGE_KEY, loadAccessToken} from "./components/common";


export default class stowk extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: MainScreen,
                    title: '',
                    navigationBarHidden: true,
                    passProps: {title: ""}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

class MainScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            token: null,
            wait: true
        });
        loadAccessToken().then((result) => {
            this.setState({
                token: result,
                wait: false
            })
        });
    }

    componentWillReceiveProps(nextProps) {

    }    

    render() {
        //if (!this.state) return null;
        let retComponent;
        if (this.state.wait) {
            retComponent = <WaitScreen/>;
        } else {
            if (this.state.token == null) {
                retComponent = <EnterPhoneNumberComponent title="Enter phone number" navigator={this.props.navigator}/>;
            } else {
                retComponent = <TabBarComponent accessToken={this.state.token} navigator={this.props.navigator}/>;
            }
        }
        return retComponent;
    }
}

class WaitScreen extends Component {

    render() {
        return <View style={styles.screenOverlay}>
            <Text style={{textAlign:'center'}}>Loading Stowk</Text>
            <ActivityIndicator
                animating={true}
                style={[styles.centering, {height: 80}]}
                size="large"
            />
        </View>
    }
}

const styles = StyleSheet.create({
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    screenOverlay: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width,
        backgroundColor: '#FFFFFF',
        paddingTop: 100
    }
});

AppRegistry.registerComponent('stowk', () => stowk);
