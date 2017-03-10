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
    TouchableHighlight,
    Image,
    TextInput,
    Button,
    Alert,
    Date,
    ScrollView,
    Dimensions,
    PickerIOS,
    PickerItemIOS
} from 'react-native';

import DatePicker from 'react-native-datepicker';

//noinspection JSUnresolvedVariable
import CarrierProfileComponent from './CarrierProfileComponent';
import LicensePhotoComponent from './LicensePhotoComponent';

import NavigationBar from 'react-native-navbar';

var states =  [
    ['Arizona', 'AZ'],
    ['Alabama', 'AL'],
    ['Alaska', 'AK'],
    ['Arizona', 'AZ'],
    ['Arkansas', 'AR'],
    ['California', 'CA'],
    ['Colorado', 'CO'],
    ['Connecticut', 'CT'],
    ['Delaware', 'DE'],
    ['Florida', 'FL'],
    ['Georgia', 'GA'],
    ['Hawaii', 'HI'],
    ['Idaho', 'ID'],
    ['Illinois', 'IL'],
    ['Indiana', 'IN'],
    ['Iowa', 'IA'],
    ['Kansas', 'KS'],
    ['Kentucky', 'KY'],
    ['Kentucky', 'KY'],
    ['Louisiana', 'LA'],
    ['Maine', 'ME'],
    ['Maryland', 'MD'],
    ['Massachusetts', 'MA'],
    ['Michigan', 'MI'],
    ['Minnesota', 'MN'],
    ['Mississippi', 'MS'],
    ['Missouri', 'MO'],
    ['Montana', 'MT'],
    ['Nebraska', 'NE'],
    ['Nevada', 'NV'],
    ['New Hampshire', 'NH'],
    ['New Jersey', 'NJ'],
    ['New Mexico', 'NM'],
    ['New York', 'NY'],
    ['North Carolina', 'NC'],
    ['North Dakota', 'ND'],
    ['Ohio', 'OH'],
    ['Oklahoma', 'OK'],
    ['Oregon', 'OR'],
    ['Pennsylvania', 'PA'],
    ['Rhode Island', 'RI'],
    ['South Carolina', 'SC'],
    ['South Dakota', 'SD'],
    ['Tennessee', 'TN'],
    ['Texas', 'TX'],
    ['Utah', 'UT'],
    ['Vermont', 'VT'],
    ['Virginia', 'VA'],
    ['Washington', 'WA'],
    ['West Virginia', 'WV'],
    ['Wisconsin', 'WI'],
    ['Wyoming', 'WY'],
];

export default class SignUpPersonalProfileComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            title: this.props.title,
            navigator: this.props.navigator,
            accessToken: this.props.accessToken,
            firstName: null,
            lastName: null,
            driversLicense: null,
            driversLicenseState: null,
            driversLicenseExpiry: "2016-05-01",
            usedPhoto: null,
            cameraModalOpen: true,
            openCamera: false,
            openCarrierProfile: false,
            // <--
        };

        this.tookPicture = this.tookPicture.bind(this);
        this.toggleCameraOpen = this.toggleCameraOpen.bind(this);
        this.toggleCarrierProfile = this.toggleCarrierProfile.bind(this);
    }


    openCarrierProfileComponent()  {

        if (this.state.firstName == null || this.state.lastName == null || this.state.driversLicense == null
            || this.state.driversLicenseState == null || this.state.driversLicenseExpiry === "Invalid Date" || this.state.usedPhoto === null
        )
        {
            Alert.alert("All fields are required", "Please fill all fields");
        } else {
            this.toggleCarrierProfile();
        }
    }

    _onForward() {

    }

    tookPicture(path) {
        let that = this;
        that.setState({
            usedPhoto: path,
            cameraModalOpen: false,
            openCamera: false

        });
    }

    toggleCarrierProfile() {

        if(this.state.openCarrierProfile){
            this.setState({
                openCarrierProfile: false
            });
        }else{
            this.setState({
                openCarrierProfile: true
            });
        }

    }

    toggleCameraOpen() {

        if(this.state.openCamera){
            this.setState({
                openCamera: false
            });
        }else{
            this.setState({
                openCamera: true
            });
        }

    }

    backToWelcome() {

        this.props.resetLoginState();
        this.props.logoutFunction();
    }

    render() {

        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.backToWelcome()
        };

        // TODO add states for loading & failed
        let returnComponent;

        if(this.state.openCamera){

            returnComponent = <LicensePhotoComponent title='License photo'
                                                     navigator={this.props.navigator}
                                                     accessToken= {this.props.accessToken}
                                                     takePicture={this.tookPicture}
                                                     toggleCameraOpen={this.toggleCameraOpen}


                                />

        }else if(this.state.openCarrierProfile){

            returnComponent = <CarrierProfileComponent title="Carrier Company details"
                                                       navigator={this.props.navigator}
                                                       accessToken= {this.props.accessToken}
                                                       phone={this.props.phone}
                                                       firstName={this.state.firstName}
                                                       lastName={this.state.lastName}
                                                       driversLicense={this.state.driversLicense}
                                                       driversLicenseState={this.state.driversLicenseState}
                                                       driversLicenseExpiry={this.state.driversLicenseExpiry}
                                                       loginFunction={this.props.loginFunction}
                                                       logoutFunction={this.props.logoutFunction}
                                                       resetLoginState={this.props.resetLoginState}
            />

        }else{
            returnComponent = (
                <ScrollView style={{height: Dimensions.get('window').height - 800, backgroundColor: '#6AB0FC', flex: 1}}>
                    <NavigationBar
                        leftButton={leftButtonConfig}
                        style={{backgroundColor: '#6AB0FC'}}
                    />

                    <View style={styles.viewStyle} >
                        <Text style={styles.textTitle}>Personal Profile</Text>
                    </View>

                    <View>
                        <Text style={styles.textRegular}>Driver License Photo</Text>
                    </View>

                    <TouchableHighlight
                        style={styles.pictureStyle} onPress={() => {this.toggleCameraOpen()}}>
                        <Image
                            //defaultSource={require('../assets/sign.jpeg')}
                            style={styles.imageStyle}
                            source={ this.state.usedPhoto === null? require('../assets/uploadpic@3x.png'): { uri : this.state.usedPhoto}}
                        />
                    </TouchableHighlight>

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(firstName) => this.setState({firstName})}
                        value={this.state.firstName}
                        placeholder="First Name"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(lastName) => this.setState({lastName})}
                        value={this.state.lastName}
                        placeholder="Last Name"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(driversLicense) => this.setState({driversLicense})}
                        value={this.state.driversLicense}
                        placeholder="Driver's License Number"
                        multiline={false}
                        autoFocus={false}
                        keyboardType="default"
                    />

                    <View style={{marginLeft: 40, marginRight: 40}}>
                        <Text style={styles.textRegular}>Driver License State</Text>
                        <PickerIOS
                            itemStyle={{fontSize: 14, color: 'white'}}
                            selectedValue={this.state.driversLicenseState}
                            onValueChange={(state) => this.setState({driversLicenseState: state})}>
                            {Object.keys(states).map((state) => (
                                <PickerItemIOS
                                    key={state}
                                    value={`${states[state][0]}, ${states[state][1]}`}
                                    label={states[state][0]}
                                />
                            ))}
                        </PickerIOS>
                    </View>

                    <View>
                        <Text style={styles.textRegular}>License Expiration Date</Text>
                        <DatePicker
                            style={styles.dateStyle}
                            date={this.state.driversLicenseExpiry}
                            mode="date"
                            placeholder="select date"
                            format="YYYY-MM-DD"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            onDateChange={(driversLicenseExpiry) => this.setState({driversLicenseExpiry})}
                        />
                    </View>

                    <TouchableHighlight
                        style={styles.button}
                        onPress={ () => {this.openCarrierProfileComponent()}}
                        accessibilityLabel="Go to Carrier Information">
                        <Text style={styles.text}>Next</Text>
                    </TouchableHighlight>

                    {/*<Button*/}
                        {/*style={[styles.button, {paddingLeft: 100, paddingRight: 55}]}*/}
                        {/*onPress={ () => {this.openCarrierProfileComponent()}}*/}
                        {/*title="Next"*/}
                        {/*color="#64B7FF"*/}
                        {/*accessibilityLabel="Go to Carrier Information"*/}

                    {/*/>*/}
                </ScrollView>
            );
        }

        return returnComponent;
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6AB0FC',
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
    textTitle: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 20,
    },

    textRegular: {
        marginTop: 10,
        fontSize: 15,
        color: 'white',
        textAlign: 'center',
    },

    textInputStyle: {
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        padding: 10,
        // marginTop: 5,
        // marginBottom: 5,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
        marginBottom: 10,
        fontSize: 14,
    },

    dateStyle: {
        width: 200,
        alignItems: 'center',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 100,
        marginRight: 5,
        borderColor: 'white',
    },

    pictureStyle: {
        alignItems: 'center'
    },

    imageStyle: {
        height: 100,
        width: 100,
        margin: 10,
    },

    buttonStyle: {
        textAlign: 'center',
        height: 40
    },
    text: {
        color: '#64B7FF',
        fontSize: 20,
        margin: 5,
        paddingTop: 5,
        paddingBottom: 5,
        textAlign: 'center',
    },
    button: {
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        margin: 20,
    },
});
