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
import WelcomeComponent from "./components/WelcomeComponent";


export default class stowk extends Component {

    constructor(props) {
        super(props);

        this.state = { maniplulator: true};
        this.changeSt = this.changeSt.bind(this);

    }

    changeSt() {
        if(this.state.maniplulator){
            this.setState({manipulator: false});
        }
        else{
            this.setState({manipulator: true});
        }
    }

    render() {

        console.log(`stowk: `, this.state);

        return (
            <NavigatorIOS
                initialRoute={{
                    component: MainScreen,
                    title: '',
                    navigationBarHidden: true,
                    passProps: {title: "", changeSt: this.changeSt}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

class MainScreen extends Component {

    constructor(props) {
        super(props);

        this.logoutFunction = this.logoutFunction.bind(this);
        this.loginFunction  = this.loginFunction.bind(this);
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

    logoutFunction() {
        //AsyncStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        AsyncStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "")
        loadAccessToken().then((result) => {
            this.setState({
                token: result,
                wait: false
            })
        });
   //     this.props.changeSt();
    }

    loginFunction() {

        loadAccessToken().then((result) => {
            this.setState({
                token: result,
                wait: false
            })
        });
 //       this.props.changeSt();
    }

    render() {

        console.log(`MainScreen:`, this.state);

        let retComponent;
        if (this.state.wait) {
            retComponent = <WaitScreen/>;
        } else {
            if (this.state.token == null || this.state.token == "") {
                retComponent = <WelcomeComponent title="Welcome Screen"
                                                 navigator={this.props.navigator}
                                                 logoutFunction={this.logoutFunction}
                                                 loginFunction={this.loginFunction}
                                                 accessToken={this.state.token}
                                                 loginOrAccount= {0}
                />;
            } else {
                retComponent = <TabBarComponent accessToken={this.state.token} navigator={this.props.navigator} logoutFunction={this.logoutFunction}/>;
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
