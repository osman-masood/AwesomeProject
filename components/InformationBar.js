/**
 * Created by shahwarsaleem on 2017-02-23.
 */
import React from 'react';
import {View} from 'react-native';

const InformationBar = (props) => {

    return (
        <View style={styles.containerStyle}>
            {props.children}
        </View>
    );
};


const styles = {

    containerStyle: {
        borderBottomWidth: 1,
        padding: 5,
        backgroundColor: '#F5FCFF',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderColor: '#ddd',
        position: 'relative'
    }
};

export default InformationBar;