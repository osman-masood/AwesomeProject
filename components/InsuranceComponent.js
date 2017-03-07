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

export default class InsuranceComponent extends Component{
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

    }

    render(){

        return(<View>
            <Text>Shahwar</Text>
        </View>);

        return (
            <View style={{backgroundColor: '#F5FCFF', flex: 1}}>


                <View style={styles.viewStyle}>
                    <Text style={styles.textStyle}>Carrier's Signatue</Text>
                </View>

                {/*<View style={styles.viewStyle}>*/}

                    {/*<Text>Please add Stowk, Inc as as a certificate holder and have*/}
                        {/*your insurance email your certificate to insurance@stowk.com*/}
                    {/*</Text>*/}

                    {/*<Text>Once we receive it, we will notify you when your account*/}
                        {/*has been activated!*/}
                    {/*</Text>*/}

                    {/*<Text>Automobile Liability ("AL")</Text>*/}
                    {/*<Text>Minimum per Truck  $1,000,000</Text>*/}
                    {/*<Text>Motor Truck Cargo ("Cargo")  </Text>*/}
                    {/*<Text>1   Car Hauler  $50,000</Text>*/}
                    {/*<Text>2-3 Car Hauler  %100,000</Text>*/}
                    {/*<Text>4   Car Hauler  $150,000</Text>*/}
                    {/*<Text>5+  Car Hauler  $250,000</Text>*/}

                    {/*<Text>Questions?</Text>*/}
                    {/*<Text>Email us at support@stowk.com</Text>*/}

                    {/*<Button*/}
                        {/*style={styles.buttonStyle}*/}
                        {/*onPress={ () => {console.log("Done")}}*/}
                        {/*title="Done"*/}
                        {/*color="#841584"*/}
                        {/*accessibilityLabel="Go to Carrier Information"*/}

                    {/*/>*/}

                {/*</View>*/}

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