/**
 * Created by KJ on 2/21/17.
 */

/* @flow */

import React, { Component } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { TabViewAnimated, TabBar } from 'react-native-tab-view';

class BottomBarComponent extends Component {

    static title = 'Bottom bar with indicator';
    static appbarElevation = 4;

    static propTypes = {
        style: View.propTypes.style,
    };

    // constructor(props) {
    //     super(props);
    //     //noinspection UnnecessaryLocalVariableJS
    //     let thisState: { // flow syntax
    //         tab: string,
    //     } = {
    //         tab: this.props.tab,
    //     };
    //     this.state = thisState;
    // }

    // state = {
    //     index: 0,
    //     routes: [
    //         { key: '1', title: 'New Jobs' },
    //         { key: '2', title: 'My Jobs' },
    //     ],
    // };

    _handleChangeTab = (props) => {
        this.setState({
            tab: props.tab,
        });
    };

    _renderIndicator = (props) => {
        const { width, position } = props;

        const translateX = Animated.multiply(position, width);

        return (
            <Animated.View
                style={[ styles.container, { width, transform: [ { translateX } ] } ]}
            >
                <View style={styles.indicator} />
            </Animated.View>
        );
    };


    _renderFooter = (props) => {
        return (
            <TabBar
                {...props}
                renderIndicator={this._renderIndicator}
                style={styles.tabbar}
                tabStyle={styles.tab}
            />
        );
    };

    // _renderScene = (props) => {
    //     switch (props.tab) {
    //         case 'newJobs':
    //             return <View style={[ styles.page, { backgroundColor: '#ff4081' } ]} />;
    //         case 'myJobs':
    //             return <View style={[ styles.page, { backgroundColor: '#673ab7' } ]} />;
    //         default:
    //             return null;
    //     }
    // };

    render() {
        return (
            <TabViewAnimated
                style={[ styles.container, this.props.style ]}
                navigationState={this.state}
                // renderScene={this._renderScene}
                renderFooter={this._renderFooter}
                onRequestChangeTab={this._handleChangeTab}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabbar: {
        backgroundColor: '#222',
        height: 50,
    },
    tab: {
        padding: 0,
    },
    indicator: {
        flex: 1,
        backgroundColor: '#0084ff',
        margin: 4,
        borderRadius: 2,
    },
    page: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
