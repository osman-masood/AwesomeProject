/**
 *
 * Tab bar example taken from:
 * https://facebook.github.io/react-native/docs/tabbarios.html
 * which links to:
 * https://github.com/facebook/react-native/blob/master/Examples/UIExplorer/js/TabBarIOSExample.js
 *
 *
 * @flow
 */
'use strict';

const React = require('react');
const ReactNative = require('react-native');
const {
    StyleSheet,
    TabBarIOS,
    Text,
    View,
} = ReactNative;

import NewJobsComponent from "./NewJobsComponent"
import MyJobsComponent from "./MyJobsComponent"
import DeliveredComponent from "./DeliveredComponent"
import MyNetworkComponent from "./MyNetworkComponent"

const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';

class TabBarComponent extends React.Component {
    static title = '<TabBarIOS>';
    static description = 'Tab-based navigation.';
    static displayName = 'TabBarComponent';

    state = {
        selectedTab: 'newJobsTab',
        notifCount: 0,
        presses: 0,
    };

    _renderContent = (color: string, num?: number) => {
        if (this.state.selectedTab == 'newJobsTab') {
            return <NewJobsComponent title="New Jobs" navigator={navigator}/>
        }
        else if (this.state.selectedTab == 'myJobsTab') {
            return <MyJobsComponent title="My Jobs" navigator={navigator}/>
        }
        else if (this.state.selectedTab == 'deliveredTab') {
            return <DeliveredComponent title="Delivered" navigator={navigator}/>
        }
        else if (this.state.selectedTab == 'myNetworkTab') {
            return <MyNetworkComponent title="My Network" navigator={navigator}/>
        }
        else {
            console.error("Unknown selected tab: ", this.state.selectedTab);
            return <NewJobsComponent title="New Jobs" navigator={navigator}/>;
        }
    };

    render() {
        return (
            <TabBarIOS>

                <TabBarIOS.Item
                    title="New Jobs"
                    icon={{uri: base64Icon, scale: 3}}
                    selected={this.state.selectedTab === 'newJobsTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'newJobsTab',
                    });
                }}>
                    {this._renderContent('#414A8C')}
                </TabBarIOS.Item>

                <TabBarIOS.Item
                    title="My Jobs"
                    icon={require('./flux.png')}
                    selected={this.state.selectedTab === 'myJobsTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'myJobsTab',
                        presses: this.state.presses + 1
                    });
                }}>
                    {this._renderContent('#21551C', this.state.presses)}
                </TabBarIOS.Item>

                <TabBarIOS.Item
                    title="Delivered"
                    icon={require('./flux.png')}
                    selected={this.state.selectedTab === 'deliveredTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'deliveredTab',
                        presses: this.state.presses + 1
                    });
                }}>
                    {this._renderContent('#21551C', this.state.presses)}
                </TabBarIOS.Item>

                <TabBarIOS.Item
                    title="My Network"
                    icon={require('./relay.png')}
                    selected={this.state.selectedTab === 'myNetworkTab'}
                    onPress={() => {
                    this.setState({
                        selectedTab: 'myNetworkTab',
                        presses: this.state.presses + 1
                    });
                }}>
                    {this._renderContent('#21551C', this.state.presses)}
                </TabBarIOS.Item>

            </TabBarIOS>
        );
    }
}

const styles = StyleSheet.create({
    tabContent: {
        flex: 1,
        alignItems: 'center',
    },
    tabText: {
        color: 'white',
        margin: 50,
    },
});

module.exports = TabBarComponent;