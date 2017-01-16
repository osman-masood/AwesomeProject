/**
 * Created by Janim007 on 1/13/17.
 */


import React, { Component, PropTypes } from 'react';
import {generateOperableString, RequestStatusEnum} from "./common";
const ReactNative = require('react-native');
import NavigationBar from 'react-native-navbar';
var moment = require('moment');
import Camera from 'react-native-camera';
import Sketch from 'react-native-sketch';

const {
    StyleSheet,
    TabBarIOS,
    Text,
    View,
    Image,
    Button,
    TouchableHighlight,
    TouchableOpacity,
    Linking,
    Alert,
    Dimensions,
    Modal,
    TextInput
} = ReactNative;


export default class VehicleInspectionComponent extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        request: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            job: this.props.request,
            cameraModalOpen: false,
            sketchModalOpen: false,
            customerModelOpen: false,
            photos: [],
            step: 1,
            showResults: true
        };
        this.onReset = this.onReset.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.tookPicture = this.tookPicture.bind(this);
    }

    updatePhotos(photos) {
        this.setState({
            photos: photos
        })
    }

    onReset() {
        console.log('The drawing has been cleared!');
    }

    onSave() {
        this.sketch.saveImage(this.state.encodedSignature)
            .then((data) => {
            console.log(data.path);
                let photos = this.state.photos;
                photos.push({
                    step: this.state.step,
                    path: data.path,
                    notes: this.state.noteText
                });

                let new_step = this.state.step + 1;
                this.setState({
                    photos: photos,
                    step: new_step,
                    cameraModalOpen: new_step <= 4,
                    sketchModalOpen: false,
                    showResults: new_step == 5
                });
            })
            .catch((error) => console.error(error));
    }

    addNote(event) {
        console.log('addNoteResult: ', event.nativeEvent.text);
        this.setState({
            noteText: event.nativeEvent.text
        });
    }

    onUpdate(base64Image) {
        this.setState({ encodedSignature: base64Image });
    }

    signed() {
        this.sketch.saveImage(this.state.encodedSignature)
            .then((data) => {
                this.props.uploadImageJPGS3(data.path).then(response => {
                    this.setState({
                        customerSign: response.body.postResponse.location
                    });
                });
            })
            .catch((error) => console.error(error));
    }

    tookPicture(path) {
        console.log('paththing: ', path);
        this.setState({
            usedPhoto: path,
            cameraModalOpen: false,
            sketchModalOpen: true,
        });
    }
    viewCustomerModal() {
        this.setState({
            customerModelOpen: true,
            cameraModalOpen: false,
            sketchModalOpen: false
        });
    }

    addCustomerName(event) {
        this.setState({
            CustomerName: event.nativeEvent.text
        })
    }

    render() {

        let resultsView = <ResultsView
            uploadImageJPGS3={this.props.uploadImageJPGS3}
            job={this.props.request}
            photos={this.state.photos}
            viewCustomerModal={this.viewCustomerModal.bind(this)}
            updatePhotos={this.updatePhotos.bind(this)}
        />;

        let cameraView = (<Modal
            animationType={"fade"}
            transparent={false}
            visible={this.state.cameraModalOpen}>
                <CameraView step={this.state.step} takePicture={this.tookPicture}/>
            </Modal>
        );

        let sketchView = (<Modal
            animationType={"fade"}
            transparent={false}
            visible={this.state.sketchModalOpen}>
                <View style={styles.container}>
                    <Text style={styles.instructions}>Mark damages</Text>
                    <TextInput
                        onEndEditing={this.addNote.bind(this)}
                        style={{width: Dimensions.get("window").width-60, height: 40, borderWidth: 1, marginLeft: 30}}
                        placeholder="Add notes here"
                        value={this.state.text}
                    />
                    <Sketch
                        fillColor="#f5f5f5"
                        imageFilePath={this.state.usedPhoto}
                        strokeColor="#FF8F00"
                        strokeThickness={2}
                        onReset={this.onReset}
                        onUpdate={this.onUpdate}
                        ref={(sketch) => { this.sketch = sketch; }}
                        style={styles.sketch}
                    />
                    <TouchableOpacity
                        disabled={!this.state.encodedSignature}
                        style={styles.button}
                        onPress={this.onSave}
                    >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </Modal>);

        let customerView = (<Modal
        animationType={"fade"}
        transparent={false}
        visible={this.state.customerModelOpen}>
            <View style={{height:120, marginTop:200}}>
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center'}}>
                    <TextInput
                        style={{borderWidth:1, borderColor: '#CCCCCC', margin:10, height:30, textAlign:'center'}}
                        placeholder="Customer full name"
                        onEndEditing={this.addCustomerName.bind(this)}
                    />
                    <Text style={{textAlign:'center', color: '#cccccc'}}>Customer Signature</Text>
                    <Sketch
                        fillColor="#f5f5f5"
                        strokeColor="#000000"
                        strokeThickness={2}
                        onReset={this.onReset}
                        onUpdate={this.onUpdate}
                        ref={(sketch) => { this.sketch = sketch; }}
                        style={{width: 200, height: 200, marginTop:20, marginBottom:20, marginLeft: (Dimensions.get("window").width/2)-100}} />
                    <Text style={{textAlign:'center', color: '#cccccc', margin:10}}>I agree with the drivers assessment of the vehicle(s). </Text>
                    <TouchableOpacity
                        disabled={!this.state.encodedSignature}
                        style={[styles.button, {width: 100, marginLeft: (Dimensions.get("window").width/2)-50}]}
                        onPress={this.signed.bind(this)}
                    >
                        <Text style={styles.buttonText}>Agrees</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);

        var moreView = null;
        if (this.state.showResults) {
            moreView = resultsView;
        }

        return (<View>
            {cameraView}
            {sketchView}
            {moreView}
            {customerView}
            </View>)
    }
}

class CameraView extends Component{

    constructor(props) {
        super(props);
    }

    takePicture() {
        this.camera.capture()
            .then((data) => {
                console.log('camera data:', data);
                this.props.takePicture(data.path);
            })
            .catch(err => {
                Alert.alert(err);
            });
    }

    render() {
        var steps_text = ["", "FRONT LEFT", "BACK LEFT", "BACK RIGHT", "FRONT RIGHT"]
        var imgs = [];
        imgs[0] = null;
        imgs[1] = require('../assets/camera-overlay-1.png');
        imgs[2] = require('../assets/camera-overlay-2.png');
        imgs[3] = require('../assets/camera-overlay-3.png');
        imgs[4] = require('../assets/camera-overlay-4.png');
        return (<View style={styles.cameraContainer}>
            <Camera
                ref={(cam) => {
                            this.camera = cam;
                        }}
                style={styles.preview}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.temp}>
                <Image source={imgs[this.props.step]} style={styles.previewOverlay} resizeMode="stretch"/>
                <Text style={styles.capture} onPress={this.takePicture.bind(this)}>
                    [CAPTURE PHOTO FOR {steps_text[this.props.step]} {this.props.step} OF 4]
                </Text>
            </Camera>
        </View>);
    }
}

class ResultsView extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        var photos = this.props.photos;

        // start uploading photos to S3
        this.setState({
            buttonText: 'Uploading photos ... wait',
            buttonDisabled: true
        });
        let new_photos = [];
        var counter = 0;

        photos.map((photo) => {
            this.props.uploadImageJPGS3(photo.path).then(response => {
                counter++;
                let new_photo = photo;
                new_photo['url'] = response.body.postResponse.location;
                new_photos.push(new_photo);
                if (counter == photos.length) {
                    console.log('final photos', new_photos);
                    this.props.updatePhotos(new_photos);
                    this.setState({
                        buttonText: 'Customer: I agree with inspection',
                        buttonDisabled: false
                    });
                }
                return new_photo;
            });
        });
    }

    render() {

        var photos = this.props.photos;

        var cars = this.props.job.vehicles.edges;
        return (
            <View style={{marginTop: 44}}>
                <Text style={{fontSize:18, height:25, color: '#CCCCCC', marginTop:35, textAlign: 'center'}}>Review BOL</Text>
                <View>
                    <View style={{height: 75, marginTop: 5, marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 4, flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                        {photos.map(img => {
                            return <Image style={{width: 70, height: 70}} key={img.step} source={{uri: img.path}} />
                        })}
                        </View>
                    </View>
                    <View style={{height: 75, marginTop: 5, marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 4, flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                            {cars.map((car, i) => {
                                return (<View key={i} style={{width: 210}}>
                                    <Text style={styles.textColor}>{car.node.year} {car.node.make} {car.node.model}</Text>
                                    <Text style={styles.textColor}>{car.node.type}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                    <View style={{marginLeft: 10}}>
                        <View style={{height: 60}}>
                            <View style={{flex: 2, flexDirection: 'row'}}>
                                <View style={{marginTop: 10, width: 200}}>
                                    <Text>ORIGIN:</Text>
                                    <Text style={styles.textColor}>{this.props.job.origin.address}</Text>
                                </View>
                                <View>
                                    <Text>Date: {moment(this.props.job.pickupDate).format('MMM Do ddd, hA')}</Text>
                                    <Text>Payment Amount: {this.props.job.amountDue}</Text>
                                    <Text>Payment Type: {this.props.job.paymentType}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text>Origin Contact:</Text>
                            <Text style={styles.textColor}>{this.props.job.origin.contactName}</Text>
                            <Text style={styles.textColor}>{this.props.job.origin.contactPhone}</Text>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text>DESTINATION:</Text>
                            <Text style={styles.textColor}>{this.props.job.destination.address}</Text>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text>Origin Contact:</Text>
                            <Text style={styles.textColor}>{this.props.job.destination.contactName}</Text>
                            <Text style={styles.textColor}>{this.props.job.destination.contactPhone}</Text>
                        </View>
                    </View>
                    <View style={{marginTop: 20}}>
                        <TouchableHighlight
                            disabled={this.state.buttonDisabled}
                            style={{backgroundColor: '#8BC34A', padding: 5, height: 40, margin:20, marginBottom:2}}
                            onPress={this.props.viewCustomerModal}

                        >
                            <Text style={{color: '#FFFFFF', textAlign: 'center'}}>{this.state.buttonText}</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{backgroundColor: '#F4511E', padding: 5, height: 30, margin:20}}>
                            <Text style={{color: '#FFFFFF', textAlign: 'center'}}>Customer is not available </Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    cameraContainer: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    },
    preview: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width
    },
    previewOverlay: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width
    },
    capture: {
        backgroundColor: '#F9A825',
        borderRadius: 5,
        color: '#FFFFFF',
        padding: 10,
        margin: 40,
        position: 'absolute',
        bottom: 5
    },
    container: {
        padding: 0,
        marginTop: 20
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    sketch: {
        height: Dimensions.get("window").height-150, // Height needed; Default: 200px
        width: Dimensions.get("window").width-60,
        marginLeft: 30,
        marginBottom: 5
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#111111',
        padding: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    textColor: {
        color: '#95989A'
    }
});