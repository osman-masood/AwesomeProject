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
    Navigator,
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
import EnterCodeComponent from "./components/EnterCodeComponent";
import TabAndroidComponent from "./components/TabAndroidComponent";
import {ACCESS_TOKEN_STORAGE_KEY, loadAccessToken} from "./components/common";
import {Scene, Router} from 'react-native-router-flux';

export default class stowk extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        //window.console.log("inside stowk render func");
        return (
            <Navigator
                initialRoute={{id: 'MainScreen', title: ""}}
                renderScene={this.renderScene.bind(this)}
            />
            // <Navigator
            //     initialRoute={{
            //         component: MainScreen,
            //         title: '',
            //         navigationBarHidden: true,
            //         passProps: {title: ""}
            //         }}
            //     renderScene={this.renderScene.bind(this)}
            //     style={{flex: 1}}
            // />
        );
    }

    renderScene(route, navigator) {
        let routeId = route.id;
        let token = route.accessToken;
        if (routeId === 'MainScreen') {
            return (
                <MainScreen navigator={navigator}/>
            );
        }
        if (routeId === 'EnterCode') {
            return (
                <EnterCodeComponent title="Enter Code" navigator={navigator} accessToken={token} />
            );
        }
        if (routeId === 'NewJobs') {
            return (
                <TabAndroidComponent navigator={navigator} accessToken={token} />
            )
        }
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
        window.console.log("inside mainscreen render func");
        if (!this.state) return null;
        let retComponent;
        if (this.state.wait) {
            window.console.log("state is waiting");
            retComponent = <WaitScreen/>;
        } else {
            window.console.log("state token: " + this.state.token);
            if (this.state.token == null) {
                window.console.log("state token is null");
                retComponent = <EnterPhoneNumberComponent title="Enter phone number" navigator={this.props.navigator}/>;
            } else {
                window.console.log("calling tab android");
                retComponent = <TabAndroidComponent accessToken={this.state.token} navigator={this.props.navigator}/>; // if already signed in
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
