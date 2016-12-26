/**
 * Created by osman on 12/7/16.
 *
 * @flow
 */


import React, { Component, PropTypes } from 'react';
const ReactNative = require('react-native');
const {
    StyleSheet,
    TabBarIOS,
    Text,
    View,
} = ReactNative;
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';


export default class JobDetailComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    render() {
        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.props.navigator.pop()
        };

        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                leftButton={leftButtonConfig}
            />
            <View style={{alignItems: 'center', backgroundColor: 'white'}}>
                <Text style={styles.tabText}>JobDetailComponent</Text>
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    tabText: {
        color: 'black',
        marginTop: 50,
    },
});