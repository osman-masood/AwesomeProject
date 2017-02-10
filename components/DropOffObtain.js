import NavigationBar from 'react-native-navbar'
import React, { Component, } from 'react'
import {getDeliveryInspectionNotes, uploadImageJPGS3, updateDeliveryDropOff} from "./common"
import Sketch from 'react-native-sketch';
import Camera from 'react-native-camera';
import ImageViewer from 'react-native-image-zoom-viewer';
const moment = require('moment');
import EventEmitter from 'EventEmitter'
global.evente = new EventEmitter;

import {
  View,
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

export default class DropOffObtain extends Component {

  static propTypes = {}

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    var self = this;
    getDeliveryInspectionNotes(this.props.request.deliveries.edges[0].node._id).then((response) => {
      self.setState({
        inspectionNotes: response.data.viewer.delivery[0].pickupInspectionNotes,
        inspectionOpen: false,
        encodedSignature: null,
        customerModelOpen: false,
        keyCameraModalOpen: false,
        viewImagesOpen: false,
        keysPictureUrl: null,
        dropoffInspectionPhotos: [],
        allPhotos: [],
        signatureImage: null,
        customerName: ""
      });
    });    
    global.evente.addListener('callingRightButton', function(e) {
        console.log('e', e)
        if (e.showInspection && self.state.dropoffInspectionPhotos.length == 0) {
          self.setState({
            customerModelOpen: false,
            keyCameraModalOpen: false,
            inspectionOpen: true
          })
        }
    });
  }
  
  callingRightButton() {
     global.evente.emit('callingRightButton', {showInspection: true});
  }

  obtainSignutre() {
    if (moment().isAfter(this.props.request.dropoffDate) && !this.state.keysPictureUrl) {
      this.setState({
        keyCameraModalOpen:true
      })
    }else {
      this.setState({
        customerModelOpen: true
      });
    }
  }

  closeObtainSignutre() {
    this.setState({
      customerModelOpen: false      
    })
  }

  takeKeysPicture() {
    this.setState({
      keyCameraModalOpen: true
    })
  }

  addCustomerName(event) {
        this.setState({
            customerName: event.nativeEvent.text
        })
  }

  onUpdate() {

  }

  closeInpection() {
    this.setState({
      inspectionOpen: false
    })
  }

  doneInspection(photos) {
    let new_photos = [];
    var counter = 0;
    photos.map((photo) => {
      uploadImageJPGS3(photo.path).then(response => {
          counter++;
          let new_photo = {
              photoUrl: response.body.postResponse.location,
              note: photo.notes
          };

          new_photos.push(new_photo);
          if (counter == photos.length) {            
              this.setState({
                  dropoffInspectionPhotos: new_photos,
                  inspectionOpen: false
              });
          }
          return new_photo;
      });            
        });    
  }

  viewImage(img, idx) {
        this.setState({
            viewImagesOpen: true,
            selectedImage: img,
            selectedImageNumber: idx,
            footerText: img.note
        });
  }
  unViewImage() {
      this.setState({
          viewImagesOpen:false,
          inspectionOpen: false
      })
  }

  tookPicture(path) {
    let that = this;
    uploadImageJPGS3(path).then(response => {      
      that.setState({
        keysPictureUrl: response.body.postResponse.location,
        customerModelOpen: true,
        keyCameraModalOpen:false        
      });
      console.log('tookKeysPicture: this.state.allPhotos -> ', this.state.dropoffInspectionPhotos);
    });    
  }

  gotSignature(base64Image) {
        this.setState({
            signatureImage: base64Image
        });
  }

  signed() {
        var that = this;
        
        this.sketch.saveImage(this.state.signatureImage).then( (data) => {
            that.props.uploadImageJPGS3(data.path).then(response => {                    
                    let photos = JSON.stringify(that.state.dropoffInspectionPhotos).replace(/\"([^(\")"]+)\":/g, "$1:");
                    console.log('photos.map', that.props.request.deliveries.edges[0].node._id, photos);
                updateDeliveryDropOff(
                    that.props.request,
                    photos,
                    that.state.customerName,
                    response.body.postResponse.location,
                    that.state.keysPictureUrl
                ).then(response => {
                    that.setState({
                        customerModelOpen: false
                    });
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

  render() {
    if (!this.state.inspectionNotes) return null;

        let customerView = (<Modal
          animationType={"fade"}
          transparent={false}
          visible={this.state.customerModelOpen}>
          <TouchableHighlight 
              style={{backgroundColor: '#000000', padding: 5, height: 20, marginTop:20, marginLeft: (Dimensions.get('window').width/2)-50, width: 100}}
                onPress={this.closeObtainSignutre.bind(this)}>
                  <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 13}}>
                    Close
                  </Text>
              </TouchableHighlight>
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
                          <Text style={{color:'#000'}}>Agrees</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>);

        let dropOffAfterHourButton;
        let keysRequired = false;
        if (moment().isAfter(this.props.request.dropoffDate)) {
          keysRequired = true;
          dropOffAfterHourButton = (<TouchableHighlight 
            style={{
              backgroundColor: '#F6A623', padding: 5, height: 50, marginLeft: 6, marginTop:20,
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              width: Dimensions.get('window').width-10
            }}
            onPress={this.takeKeysPicture.bind(this)}>
              <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 13, marginTop: 10}}>
                Take a picture for the keys
              </Text>
          </TouchableHighlight>);
        }

        let keysCameraView = (<Modal
            animationType={"fade"}
            transparent={false}
            visible={this.state.keyCameraModalOpen}>
                <KeysCameraView tookKeysPicture={this.tookPicture.bind(this)}/>
            </Modal>
        );

        let dropoffInspectionPhotosView = (<View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              marginTop: 10,
              width: Dimensions.get('window').width - 10
            }}>
            {this.state.dropoffInspectionPhotos.map((item, idx) => {
              return <Image
                key={idx}
                style={{
                  width: 95,
                  height: 95,
                  marginLeft: 5
                }}
                resizeMode={"center"}
                source={{uri: item.photoUrl}}
                />
            })}
          </View>);


        let inspectionPhotos = <DropoffVehicleInspectionComponent 
                      request={this.props.request} 
                      closeInpection={this.closeInpection.bind(this)} 
                      doneInspection={this.doneInspection.bind(this)}/>;

        let _scrollView = (<ScrollView 
          horizontal={false}
          style={{ marginTop: 64 }}>
          <Text
            style={{
              color: 'black',
              fontSize: 16,
              fontWeight: 'normal',
              fontFamily: 'Helvetica Neue',
              marginTop: 5, marginBottom: 10,
              textAlign: 'center'
            }}>
            Review BOL
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              width: Dimensions.get('window').width - 10
            }}>
            {this.state.inspectionNotes.map((item, idx) => {
              return (
                  <TouchableHighlight key={idx} onPress={() => this.viewImage(item, idx)}>
                  <Image
                key={idx}
                style={{
                  width: 95,
                  height: 95,
                  marginLeft: 5
                }}
                resizeMode={"center"}
                source={{ uri: item.photoUrl }}
                /></TouchableHighlight>)
            })}
          </View>          
          {dropoffInspectionPhotosView}
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              backgroundColor: "rgba(249,252,255,1)",
              marginTop: 10, marginLeft: 10
            }}>
            <Text style={styles.textDesc}>
              {this.props.request.vehicles.edges[0].node.year} {this.props.request.vehicles.edges[0].node.make} {this.props.request.vehicles.edges[0].node.model}
            </Text>
            <Text style={styles.textDesc}>{this.props.request.vehicles.edges[0].node.type}</Text>
          </View>
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <Text style={styles.textTitle}>ORIGIN</Text>
            <Text style={styles.textDesc}>{this.props.request.origin.locationName}</Text>
            <Text style={styles.textDesc}>{this.props.request.origin.address}</Text>
          </View>
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <Text style={styles.textTitle}>Origin contact</Text>
            <Text style={styles.textDesc}>{this.props.request.origin.contactName}</Text>
            <Text style={styles.textDesc}>{this.props.request.origin.contactPhone}</Text>
          </View>
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <Text style={styles.textTitle}>Destination</Text>
            <Text style={styles.textDesc}>{this.props.request.destination.locationName}</Text>
            <Text style={styles.textDesc}>{this.props.request.destination.address}</Text>
          </View>
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <Text style={styles.textTitle}>Destination contact</Text>
            <Text style={styles.textDesc}>{this.props.request.destination.locationName}</Text>
            <Text style={styles.textDesc}>{this.props.request.destination.address}</Text>
          </View>
          <TouchableHighlight
            style={{
              backgroundColor: '#26C6DA', padding: 5, height: 50, marginLeft: 6, marginTop: 20,
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              width: Dimensions.get('window').width - 10
            }}
            onPress={this.obtainSignutre.bind(this)}>
            <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 13, marginTop: 10 }}>
              OBTAIN DROP OFF SIGNATURE
            </Text>
          </TouchableHighlight>
          {dropOffAfterHourButton}
        </ScrollView>);

        var photos_for_viewer = this.state.inspectionNotes.map((img) => {
                return {'url': img.photoUrl}
            }) 
        let viewImages = (
              <Modal visible={true} transparent={false}>     
              <TouchableHighlight onPress={this.unViewImage.bind(this)}>
                    <Text style={{paddingTop:20, backgroundColor:'#000000', color: '#FFFFFF', zIndex:1111}}>Close</Text>
                </TouchableHighlight>           
                <ImageViewer 
                height={400}
                imageUrls={photos_for_viewer}
                onChange={(idx) => {this.setState({footerText: this.state.inspectionNotes[idx].note})}}
                saveToLocalByLongPress={false}
                index={this.state.selectedImageNumber}
                />
                <Text style={{
                    backgroundColor: '#000000', 
                    position:'absolute', 
                    color:'#FFFFFF', 
                    bottom:0,
                    width: Dimensions.get("window").width,
                    height: 30,
                    textAlign: 'center'}}>{this.state.footerText}</Text>
            </Modal>
            )

        let mainView = null;
        if (this.state.inspectionOpen) {
          mainView = inspectionPhotos;
        }else if (this.state.viewImagesOpen){
          mainView = viewImages;
        }else {
          mainView = _scrollView;  
        }

    return (
      <View>
      {mainView}
      {keysCameraView}
      {customerView}      
      </View>
    )
  }  
}

class KeysCameraView extends Component{

    constructor(props) {
        super(props);
    }

    componentWillMount() {
      this.camera = null;
    }

    takePicture() {
        this.camera.capture()
            .then((data) => {
              this.props.tookKeysPicture(data.path);
            })
            .catch(err => {
                console.error(err);
            });
    }

    render() {
        
        return (<View style={styles.cameraContainer}>
            <Camera
                ref={(cam) => {this.camera = cam;}}
                style={styles.preview}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.temp}>
                <Image source={require('../assets/keys.png')} style={styles.previewOverlay} resizeMode="stretch"/>
                <Text style={styles.capture} onPress={this.takePicture.bind(this)}>PLEASE TAKE CAR KEY PICTURES</Text>
            </Camera>
        </View>);
    }
}

class DropoffVehicleInspectionComponent extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            job: this.props.request,
            cameraModalOpen: true, // <--
            sketchModalOpen: false,
            photos: [],
            step: 1,
            notesModelOpen: false
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

    onUpdate(base64Image) {
        this.setState({ 
            encodedSignature: base64Image 
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
                    usedPhoto: null
                });
                if (new_step == 5) {
                  that.setState({
                    cameraModalOpen: false,
                    sketchModalOpen:false
                  });
                  this.props.doneInspection(photos);
                }
                console.log("photos onSave", this.state.photos);
            })
            .catch((error) => console.error(error));
    }

    addNote(e) {
        this.noteText = e;
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

    render() {     

        let cameraView = (<Modal
            animationType={"fade"}
            transparent={false}
            visible={this.state.cameraModalOpen}>
                <InpectCameraView 
                step={this.state.step} 
                takePicture={this.tookPicture} 
                closeInpection={() => {
                  this.setState({
                    cameraModalOpen: false,
                    sketchModalOpen:false
                  });
                  this.props.closeInpection()
                }}/>
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

        return (<View>
            {notesView}
            {cameraView}
            {sketchView}
            </View>)
    }
}


class InpectCameraView extends Component{

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
        return (<View style={styles.cameraContainer2}>
            <Camera
                ref={(cam) => {
                            this.camera = cam;
                        }}
                style={styles.preview2}
                aspect={Camera.constants.Aspect.fill}
                captureTarget={Camera.constants.CaptureTarget.temp}>
                <TouchableOpacity 
                            style={{marginLeft: 10, marginTop:20, width:30}}
                            onPress={this.props.closeInpection}>
                            <Image source={require('../assets/close-icon.png')}/>
                </TouchableOpacity>
                <Image source={imgs[this.props.step]} style={styles.previewOverlay2} resizeMode="stretch"/>
                <Text style={styles.capture} onPress={this.takePicture.bind(this)}>
                    [CAPTURE PHOTO FOR {steps_text[this.props.step]} {this.props.step} OF 4]
                </Text>
            </Camera>
        </View>);
    }
}

const styles = StyleSheet.create({
  textTitle: {
    color: '#28273A',
    fontSize: 15
  },
  textDesc: {
    color: '#BBBBBB',
    fontSize: 14
  },
  cameraContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  },
  preview: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width
  },
  previewOverlay: {
    height: (Dimensions.get("window").height/2)-40,
    width: Dimensions.get("window").width-40,
    marginLeft: 20,
    marginTop: ((Dimensions.get("window").height)-(Dimensions.get("window").height/2))/2
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
  cameraContainer2: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height
    },
    preview2: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width
    },
    previewOverlay2: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width
    },
    capture2: {
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