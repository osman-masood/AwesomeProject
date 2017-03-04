/**
 * Created by shahwarsaleem on 2017-03-03.
 */

import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button

} from 'react-native';

import WelcomeComponent from './WelcomeComponent';

export default class SettingsComponent extends Component{
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

    }

    openSettings() {

       // this.props.navigator.popToTop(0);
        this.props.logoutFunction();
    }

    render () {
        return (
            <View style={{backgroundColor: '#F5FCFF', flex: 1, marginTop: 100}}>

                <View style={styles.viewStyle} >
                    <Text style={styles.textStyle}>Personal Profile</Text>
                </View>

                <Button
                    style={styles.buttonStyle}
                    onPress={() => this.openSettings()}
                    title="Logout"
                    color="#841584"
                    accessibilityLabel="Logout"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({

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
    buttonStyle: {
        marginTop: 100,
        textAlign: 'center',
        height: 40
    }
});