/**
 * Created by osman on 12/7/16.
 *
 * @flow
 */


import React, { Component, PropTypes } from 'react';
const ReactNative = require('react-native');
import {StyleSheet, TabBarIOS, Text, View} from 'react-native';
//noinspection JSUnresolvedVariable
import NavigationBar from 'react-native-navbar';


export default class DeliveredComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    render() {
        const rightButtonConfig = {
            title: 'Menu',
            handler: () => alert('Menu!'),
        };
        return <View style={{flex: 1}}>
            <NavigationBar
                title={{title: this.props.title}}
                rightButton={rightButtonConfig}
            />
            <View style={{alignItems: 'center', backgroundColor: 'white'}}>
                <Text style={styles.tabText}>DeliveredComponent</Text>
            </View>
        </View>
    }
}

const styles = StyleSheet.create({
    tabContent: {
        flex: 1,
        alignItems: 'center',
    },
    tabText: {
        color: 'white',
        margin: 50,
    },
});