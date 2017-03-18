/**
 * Created by shahwarsaleem on 2017-03-02.
 */
import React, { Component, PropTypes }from 'react';
import {
    View,
    NavigatorIOS,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Alert
}from 'react-native';


import Camera from 'react-native-camera';

export default class LicensePhotoComponent extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    takePicture() {
        this.camera.capture()
            .then((data) => {
                console.log('camera data:', data);
                this.props.takePicture(data.path);
                this.props.navigator.popN(1);
            })
            .catch(err => {
                Alert.alert("ERROR:",err);
            });
    }

    render() {
        var steps_text = ["", "License"]
        var imgs = [];
        imgs[0] = null;
        imgs[1] = require('../assets/camera-overlay-1.png');
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
                                this.props.toggleCameraOpen();
                            }}>
                    <Image source={require('../assets/close-icon.png')}/>
                </TouchableOpacity>
                <Image source={imgs[this.props.step]} style={styles.previewOverlay} resizeMode="stretch"/>
                <Text style={styles.capture} onPress={this.takePicture.bind(this)}>
                    [CAPTURE PHOTO OF DRIVER'S LICENSE]
                </Text>
            </Camera>
        </View>);
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
        alignItems: 'center',
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