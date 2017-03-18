/**
 * Created by shahwarsaleem on 2017-02-23.
 */
/**
 * @flow
 */

//noinspection JSUnresolvedVariable
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
    Alert,
    Sketch,
    TouchableOpacity,
    Dimensions,
    Modal
} from 'react-native';

//noinspection JSUnresolvedVariable


import NavigationBar from 'react-native-navbar';
import InsuranceComponent from './InsuranceComponent';

export default class SignatureComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    // static propTypes = {
    //     title: PropTypes.string.isRequired,
    //     navigator: PropTypes.object.isRequired,
    //     accessToken: PropTypes.string.isRequired,
    //     phone: PropTypes.string.isRequired
    // };

    constructor(props) {
        super(props);

        this.state = {
            sketchModalOpen: false,
            customerModelOpen: true,
            encodedSignature: null,

        };
        this.clear = this.clear.bind(this);
        this.onReset = this.onReset.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
    }

    onSave() {
        this.sketch.saveImage(this.state.encodedSignature)
            .then((data) => console.log(data))
            .catch((error) => console.log(error));
    }

    signed() {

        this.props.navigator.push({
            title: 'Insurance Screen',
            component: InsuranceComponent,
            navigator: this.props.navigator,
            navigationBarHidden: true,
            passProps: { title: "Insurance Screen", navigator: this.props.navigator}
        });
    }

    clear() {
        this.sketch.clear();
    }

    onReset() {
        console.log('The drawing has been cleared!');
    }

    onUpdate(base64Image) {
        this.setState({ encodedSignature: base64Image });
    }

    gotSignature(base64Image) {
        // this.setState({
        //     signatureImage: base64Image
        // });
    }

    render(){

        const leftButtonConfig = {
            title: 'Back',
            handler: ()  => this.props.toggleSignatureScreen()
        };

        // TODO add states for loading & failed
        return (
            <View style={{backgroundColor: '#6AB0FC', flex: 1}}>
                <NavigationBar
                    leftButton={leftButtonConfig}
                    style={{backgroundColor: '#6AB0FC'}}
                />

                <View style={styles.viewStyle} >
                    <Text style={styles.textStyle}>
                        Carrier's Signature
                    </Text>
                </View>

                {/*<Sketch*/}
                    {/*fillColor="#f5f5f5"*/}
                    {/*strokeColor="#000000"*/}
                    {/*strokeThickness={2}*/}
                    {/*onReset={this.onReset}*/}
                    {/*onUpdate={this.onUpdate}*/}
                    {/*ref={(sketch) => { this.sketch = sketch;} }*/}
                    {/*style={styles.sketch} />*/}


                <Text style={{textAlign:'center', color: '#cccccc', margin:10}}>I agree with the drivers assessment of the vehicle(s). </Text>
                <Button
                    onPress={this.clear}
                    title="Clear drawing"
                />
                <TouchableOpacity
                    disabled={false}
                    style={styles.button}
                    onPress={this.signed.bind(this)}>
                    <Text style={[styles.buttonText, {backgroundColor: '#6AB0FC', textAlign:'center'}]}>Next</Text>
                </TouchableOpacity>

            </View>
        );
    }
}

const styles = StyleSheet.create({

    sketch: {
        width: 200,
        height: 200,
        marginTop:20,
        marginBottom:20,
        marginLeft: (Dimensions.get("window").width/2)-100
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    viewStyle :{
        backgroundColor: '#6AB0FC',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        paddingTop: 15,
    },

    textStyle: {
        fontSize: 20
    },

    textInputStyle: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5
    },

    horizontalViewStyle: {
        borderBottomWidth: 1,
        padding: 5,
        backgroundColor: '#F5FCFF',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        borderColor: '#ddd',
        // position: 'relative'
    },

    button: {
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        margin: 20,
    },
});
