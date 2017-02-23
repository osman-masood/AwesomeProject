/**
 * Created by KJ on 2/20/17.
 */
import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import {TabViewAnimated, TabBar} from 'react-native-tab-view';

export default class TabViewComponent extends Component {

    static title = 'Scrollable top bar';
    static appbarElevation = 0;

    static propTypes = {
        style: View.propTypes.style,
    };

    state = {
        index: 1,
        routes: [
            { key: '1', title: 'New Jobs' },
            { key: '2', title: 'My Jobs' },
        ],
    };

    _handleChangeTab = (index) => {
        this.setState({
            index,
        });
    };

    _renderHeader = (props) => {
        return (
            <TabBar
                {...props}
                // scrollEnabled
                indicatorStyle={styles.indicator}
                style={styles.tabbar}
                labelStyle={styles.label}
            />
        );
    };

    _renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return <View style={[styles.page, { backgroundColor: '#ff4081'} ]} />;
            case '2':
                return <View style={[ styles.page, { backgroundColor: '#673ab7' } ]} />;
            default:
                return null;
        }
    };

    render() {
        return (
            <TabViewAnimated
                style={[ styles.container, this.props.style ]}
                navigationState={this.state}
                renderScene={this._renderScene}
                renderHeader={this._renderHeader}
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
    },
    page: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indicator: {
        backgroundColor: '#ffeb3b',
    },
    label: {
        color: '#fff',
        fontWeight: '400',
    },
});