/**
 * Created by shahwarsaleem on 2017-03-03.
 */

import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    TouchableHighlight

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

    backToWelcome() {

        this.props.resetLoginState();
        this.props.logoutFunction();
    }

    render(){

        return (
            <View style={{backgroundColor: '#6AB0FC', flex: 1}}>

                <View style={{backgroundColor: '#6AB0FC', flex: 1, marginTop: 100}}>

                    <Text style={styles.textHeader}>Getting Started</Text>

                    <Text style={styles.textParagraph}>Please add Stowk, Inc as as a certificate holder and have
                        your insurance email your certificate to insurance@stowk.com
                    </Text>

                    <Text style={styles.textParagraph}>Once we receive it, we will notify you when your account
                        has been activated!
                    </Text>

                    <Text style={styles.textParagraph}>Automobile Liability ("AL")</Text>
                    <Text style={styles.textParagraph}>Minimum per Truck  $1,000,000</Text>
                    <Text style={styles.textParagraph}>Motor Truck Cargo ("Cargo")  </Text>
                    <Text style={styles.textParagraph}>1   Car Hauler   $50,000</Text>
                    <Text style={styles.textParagraph}>2-3 Car Hauler  $100,000</Text>
                    <Text style={styles.textParagraph}>4   Car Hauler  $150,000</Text>
                    <Text style={styles.textParagraph}>5+  Car Hauler  $250,000</Text>

                    <Text style={styles.textParagraph}>Questions?</Text>
                    <Text style={styles.textParagraph}>Email us at support@stowk.com</Text>

                    <TouchableHighlight
                        style={styles.button}
                        onPress={ () => {this.backToWelcome()}}
                        title="Done"
                        accessibilityLabel="Go to Carrier Information">
                        <Text style={styles.text}>Done</Text>
                    </TouchableHighlight>

                    {/*<Button*/}
                    {/*style={styles.buttonStyle}*/}
                    {/*onPress={ () => {this.props.loginFunction()}}*/}
                    {/*title="Done"*/}
                    {/*color="#841584"*/}
                    {/*accessibilityLabel="Go to Carrier Information"*/}

                    {/*/>*/}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    viewStyle :{
        backgroundColor: '#6AB0FC',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        paddingTop: 200,
    },
    textStyle: {
        fontSize: 20
    },
    buttonStyle: {
        marginTop: 100,
        textAlign: 'center',
        height: 40
    },
    button: {
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        margin: 20,
        marginTop: 50,
    },
    text: {
        color: '#64B7FF',
        fontSize: 20,
        margin: 5,
        paddingTop: 5,
        paddingBottom: 5,
        textAlign: 'center',
    },
    textHeader: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 20,
        color: 'white',
    },
    textParagraph: {
        color: 'white',
        marginLeft: 25,
        marginRight: 25,
        marginBottom: 10,
    }
});