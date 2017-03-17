/**
 * Created by Janim007 on 1/13/17.
 */


import React, { Component, PropTypes } from 'react';
import {
    generateOperableString, 
    RequestStatusEnum, 
    DeliveryStatusEnum,
    updateRequestStatus,
    updateDeliveryPickup} from "./common";
import ImageViewer from 'react-native-image-zoom-viewer';
var moment = require('moment');
import Camera from 'react-native-camera';
import Sketch from 'react-native-sketch';
import EventEmitter from 'EventEmitter'
global.evente = new EventEmitter;

import {
  View,
  PickerIOS,
  Linking,
  TabBarIOS,
  Button,
  ScrollView,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native'


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
            cameraModalOpen: true, // <--
            sketchModalOpen: false,
            customerModelOpen: false,
            photos: [],
            step: 1,
            showResults: false, // <-
            notesModelOpen: false
        };
        this.onReset = this.onReset.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.tookPicture = this.tookPicture.bind(this);
    }

    componentWillMount() {
        if (this.state.job.deliveries.edges.length == 0) {
            console.warn("Can't process your request");
        }
    }    

    updatePhotos(photos) {
        this.setState({
            photos: photos
        })
    }

    onReset() {
        console.log('The drawing has been cleared!');
    }

    onUpdate(base64Image) {
        this.setState({ 
            encodedSignature: base64Image 
        });
    }

    gotSignature(base64Image) {
        this.setState({
            signatureImage: base64Image
        });
    }

    onSave() {
        let that = this;
        this.sketch.saveImage(this.state.encodedSignature)
            .then((data) => {            
                let photos = this.state.photos;
                photos.push({
                    step: that.state.step,
                    path: data.path,
                    notes: that.state.noteText
                });

                let new_step = that.state.step + 1;                
                that.sketch.clear();
                that.setState({
                    photos: photos,
                    step: new_step,
                    cameraModalOpen: new_step <= 4,
                    sketchModalOpen: false,
                    showResults: new_step == 5,
                    usedPhoto: null
                });
                console.log("photos onSave", this.state.photos);
            })
            .catch((error) => console.error(error));
    }

    addNote(e) {
        this.noteText = e;
    }    

    signed() {
        var that = this;
        this.sketch.saveImage(this.state.signatureImage).then( (data) => {
            that.props.uploadImageJPGS3(data.path).then(response => {
                var photos = that.state.photos.map( (item) => {
                        return {photoUrl: item.photoUrl, note: item.note}; 
                    } )
                    photos = JSON.stringify(photos).replace(/\"([^(\")"]+)\":/g, "$1:");
                    console.log('photos.map', photos);
                updateDeliveryPickup(
                    that.state.job,
                    photos,
                    that.state.customerName,
                    response.body.postResponse.location
                ).then(response => {
                    that.setState({
                        customerModelOpen: false
                    });
                    global.evente.emit('re-send-request', {reload: true});
                    //global.evente.emit('re-send-my-request', {reload: true});
                    that.props.navigator.popN(2);
                }).catch(e => {
                    Alert.alert('Could not save request details',
                        e.message,
                        [
                            {
                                text: 'Ok',
                                onPress: () => {
                                    that.setState({
                                        customerModelOpen: false
                                    });
                                }
                            }
                        ]);
                })
            });
        });
    }

    tookPicture(path) {
        let that = this;
        that.setState({            
                usedPhoto: path,
                cameraModalOpen: false,
                sketchModalOpen: true,
                noteText: null
            });                
        window.setTimeout(function() {
            that.sketch.clear();
            that.setState({
                encodedSignature: null
            })
        }, 200);
    }
    viewCustomerModal() {
        if (this.sketch) {
            this.sketch.clear();
        }
        this.setState({
            encodedSignature: null,
            customerModelOpen: true,
            cameraModalOpen: false,
            sketchModalOpen: false,
            usedPhoto:null
        });        
    }

    addCustomerName(event) {
        this.setState({
            customerName: event.nativeEvent.text
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
                <CameraView step={this.state.step} takePicture={this.tookPicture} navigator={this.props.navigator}/>
            </Modal>
        );

        let sketchView = (<Modal
            style={{backgroundColor:'#000'}}
            animationType={"fade"}
            transparent={false}
            visible={this.state.sketchModalOpen}>
                <View style={styles.container}>
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
                    <View style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        borderWidth:0.1,
                        height: 50,
                        flexGrow: 0,
                        backgroundColor:'#000',
                        justifyContent: 'space-around'
                    }}>
                        
                        <TouchableOpacity 
                            onPress={() => {
                                this.setState({
                                    notesModelOpen: true,
                                    sketchModalOpen: false
                                })
                            }}
                            style={{width:50, height:50, marginLeft:10}}>
                            <Image source={require('../assets/notes-icon.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        onPress={()=> {
                            //
                            this.setState({
                                cameraModalOpen: true,
                                sketchModalOpen: false,
                                noteText: null
                            })
                        }}
                        style={{width:50, height:50, marginLeft:10}}>
                            <Image source={require('../assets/retake-icon.png')}/>
                        </TouchableOpacity>                                                
                        <TouchableOpacity
                            disabled={!this.state.encodedSignature}
                            style={[styles.button, {width: 50, marginLeft:10}]}
                            onPress={this.onSave}>
                            <Image source={require('../assets/next-icon.png')}/>
                        </TouchableOpacity>
                    </View>
            </View>
        </Modal>);

        let notesView = (<Modal visible={this.state.notesModelOpen}>
            <View style={{
                        flexDirection: 'row',
                        marginTop: 20,
                        height: 50,
                        flexGrow: 0,
                        justifyContent: 'space-between'
                    }}>
                        
                        <TouchableOpacity 
                            onPress={() => {
                                this.setState({
                                    notesModelOpen: false,
                                    sketchModalOpen:true,
                                    noteText: ''
                                })
                            }}
                            style={{width:50, height:50, marginLeft:10, marginTop:10}}>
                            <Image source={require('../assets/back-icon.png')}/>
                        </TouchableOpacity>                                                                     
                        <TouchableOpacity
                            style={[styles.button, {width: 60, marginLeft:10}]}
                            onPress={() => {                                
                                this.setState({
                                    notesModelOpen: false,
                                    sketchModalOpen:true,
                                    noteText: this.noteText
                                })
                                
                            }}>
                            <Text style={{fontSize:18, marginTop:10, marginRight:10}}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent: 'center',}}>
                    <TextInput
                        editable = {true}
                        maxLength = {400}
                        multiline={true}
                        defaultValue={this.state.noteText}
                        style={{borderWidth:1, width:300, height:240}}
                        placeholder="Comments Box"
                        returnKeyType="done"
                        onChangeText={this.addNote.bind(this)}>
                    </TextInput>
                    </View>
        </Modal>)

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
                        onUpdate={this.gotSignature.bind(this)}
                        imageFilePath=""
                        ref={(sketch) => { 
                            this.sketch = sketch;
                            if (!this.cleared) {
                                sketch.clear();
                                this.cleared = true;
                            }
                        }}
                        style={{width: 200, height: 200, marginTop:20, marginBottom:20, marginLeft: (Dimensions.get("window").width/2)-100}} />
                    <Text style={{textAlign:'center', color: '#cccccc', margin:10}}>I agree with the drivers assessment of the vehicle(s). </Text>
                    <TouchableOpacity
                        disabled={!this.state.signatureImage}
                        style={{width: 100, marginLeft: (Dimensions.get("window").width/2)-50}}
                        onPress={this.signed.bind(this)}>
                        <Text style={[styles.buttonText, {backgroundColor: '#000', textAlign:'center'}]}>Agrees</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);

        var moreView = null;
        if (this.state.showResults) {
            moreView = resultsView;
        }

        return (<View>
            {notesView}
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
                <TouchableOpacity 
                            style={{marginLeft: 10, marginTop:20, width:30}}
                            onPress={() => {
                                this.props.navigator.popN(1);
                            }}>
                            <Image source={require('../assets/close-icon.png')}/>
                </TouchableOpacity>
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
            buttonDisabled: true,
            photos: photos
        });
        let new_photos = [];
        var counter = 0;
        this.sketch = null;

        photos.map((photo) => {
            this.props.uploadImageJPGS3(photo.path).then(response => {
                counter++;
                let new_photo = {
                    photoUrl: response.body.postResponse.location,
                    path:response.body.postResponse.location,
                    note: photo.notes
                };

                new_photos.push(new_photo);
                if (counter == photos.length) {
                    this.props.updatePhotos(new_photos);
                    this.setState({
                        //buttonText: 'Customer: I agree with inspection',
                        buttonText: 'REVIEW BOL WITH CUSTOMER',
                        buttonDisabled: false,
                        buttonAction: this.reviewingBolWithCustomer.bind(this)
                    });
                }
                return new_photo;
            });            
        });
    }

    viewImage(img, idx) {
        this.setState({
            view: 'photo',
            selectedImage: img,
            selectedImageNumber: idx,
            footerText: img.note
        });
    }

    unViewImage() {
        this.setState({
            view: null
        })
    }

    reviewingBolWithCustomer() {
        let func = this.props.viewCustomerModal;
        this.setState({
            customerIsNotHere: true,
            buttonText: 'Customer: I agree with inspection',
            buttonAction: func
        })
    }
    
    render() {
        //var photos = this.props.photos;        
        var photos = this.state.photos;
        var cars = this.props.job.vehicles.edges;
        var _this = this;
        if ( this.state.view == 'photo' ) {
            var photos_for_viewer = this.state.photos.map((img) => {
                return {'url': img.path}
            })            
            return (
              <Modal visible={true} transparent={false}>     
              <TouchableHighlight onPress={this.unViewImage.bind(this)}>
                    <Text style={{paddingTop:20, backgroundColor:'#000000', color: '#FFFFFF', zIndex:1111}}>Close</Text>
                </TouchableHighlight>           
                <ImageViewer 
                height={400}
                imageUrls={photos_for_viewer}
                onChange={(idx) => {_this.setState({footerText: _this.state.photos[idx].note})}}
                saveToLocalByLongPress={false}
                index={_this.state.selectedImageNumber}
                />
                <Text style={{
                    backgroundColor: '#000000', 
                    position:'absolute', 
                    color:'#FFFFFF', 
                    bottom:0,
                    width: Dimensions.get("window").width,
                    height: 30,
                    textAlign: 'center'}}>{_this.state.footerText}</Text>
            </Modal>
            )
        }

        var NoCustomerButton;
        var customerReviewingDist;
        if (this.state.customerIsNotHere) {
            NoCustomerButton = (<TouchableHighlight style={{backgroundColor: '#F4511E', padding: 5, height: 30, margin:20}}>
                            <Text style={{color: '#FFFFFF', textAlign: 'center'}}>Customer is not available </Text>
                        </TouchableHighlight>);
            customerReviewingDist =(<View style={{height: 60}}>
                            <View style={{flex: 2, flexDirection: 'row'}}>
                                <View style={{marginTop: 10, width: 200}}>
                                    <Text>Destination Contact:</Text>
                                    <Text style={styles.textColor}>{this.props.job.destination.contactName}</Text>
                                    <Text style={styles.textColor}>{this.props.job.destination.contactPhone}</Text>
                                </View>
                                <View>
                                    <Button title="EDIT" onPress={() => {console.warn('is there an endpoint for this?')}} />
                                </View>
                            </View>
                        </View>)
        }

        return (            
            <ScrollView style={{height: Dimensions.get("window").height-24}}>
                <Text style={{fontSize:18, height:25, color: '#CCCCCC', marginTop:35, textAlign: 'center'}}>Review BOL</Text>
                <View>
                    <View style={{height: 75, marginTop: 5, marginLeft: 20, marginRight: 20}}>
                        <View style={{flex: 4, flexDirection: 'row', alignItems:'center', justifyContent: 'space-between'}}>
                        {photos.map((img, idx) => {
                            return (
                                <TouchableHighlight key={idx} onPress={() => this.viewImage(img, idx)}>
                                    <Image style={{width: 70, height: 70}}
                                            key={idx}
                                            source={{uri: img.path}} />
                            </TouchableHighlight>)
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
                            <Text>Destination Contact:</Text>
                            <Text style={styles.textColor}>{this.props.job.destination.contactName}</Text>
                            <Text style={styles.textColor}>{this.props.job.destination.contactPhone}</Text>
                        </View>
                        {customerReviewingDist}
                    </View>
                    <View style={{marginTop: 20}}>
                        <TouchableHighlight
                            disabled={this.state.buttonDisabled}
                            style={{backgroundColor: '#8BC34A', padding: 5, height: 40, margin:20, marginBottom:2}}
                            onPress={_this.state.buttonAction}>
                            <Text style={{color: '#FFFFFF', textAlign: 'center'}}>{this.state.buttonText}</Text>
                        </TouchableHighlight>
                        {NoCustomerButton}
                    </View>
                </View>
            </ScrollView>
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
        marginTop: 20,
        backgroundColor: '#000'
    },
    instructions: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    sketch: {
        height: Dimensions.get("window").height-100, // Height needed; Default: 200px
        width: Dimensions.get("window").width,
        marginTop:5
    },    
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    textColor: {
        color: '#95989A'
    }
});