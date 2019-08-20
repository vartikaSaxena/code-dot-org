import Radium from 'radium';
import React from 'react';
import color from '../../util/color';

class DataBrowser extends React.Component {
  state = {selectedTab: TabType.DATA_TABLES};

  handleTabClick = newTab => this.setState({selectedTab: newTab});

  render() {
    const tabHeight = 35;
    const borderColor = color.lighter_gray;
    const bgColor = color.lightest_gray;
    const baseTabStyle = {
      borderColor: borderColor,
      borderStyle: 'solid',
      boxSizing: 'border-box',
      height: tabHeight,
      padding: '0 10px'
    };
    const styles = {
      activeTab: Object.assign({}, baseTabStyle, {
        backgroundColor: bgColor,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        float: 'left'
      }),
      inactiveTab: Object.assign({}, baseTabStyle, {
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        float: 'left'
      }),
      // This tab should fill the remaining horizontal space.
      emptyTab: Object.assign({}, baseTabStyle, {
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        width: '100%'
      }),
      workspaceDescription: {
        height: 28,
        overflow: 'hidden'
      },
      workspaceDescriptionText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      workspaceTabs: {
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 1
      },
      tabLabel: {
        lineHeight: tabHeight + 'px',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      },
      workspaceBody: {
        height: 'calc(100% - 83px)',
        padding: '10px 10px 10px 0',
        borderColor: borderColor,
        borderStyle: 'solid',
        borderTopWidth: 0,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        backgroundColor: bgColor
      },
      activeBody: {
        height: '100%',
        overflowY: 'auto'
      },
      inactiveBody: {
        display: 'none',
        height: '100%',
        overflowY: 'auto'
      }
    };
    return (
      <div style={{height: '100%'}}>
        <div id="dataBrowserTabs" style={styles.workspaceTabs}>
          <div
            id="dataTablesTab"
            style={
              this.state.selectedTab === TabType.DATA_TABLES
                ? styles.activeTab
                : styles.inactiveTab
            }
            onClick={this.handleTabClick.bind(this, TabType.DATA_TABLES)}
          >
            <span style={styles.tabLabel}>DATA TABLES</span>
          </div>
          <div
            id="keyValuePairsTab"
            style={
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? styles.activeTab
                : styles.inactiveTab
            }
            onClick={this.handleTabClick.bind(this, TabType.KEY_VALUE_PAIRS)}
          >
            <span style={styles.tabLabel}>KEY/VALUE PAIRS</span>
          </div>
          <div id="emptyTab" style={styles.emptyTab} />
        </div>
        <div id="dataBrowserBody" style={styles.workspaceBody}>
          <div
            id="dataTablesBody"
            style={
              this.state.selectedTab === TabType.DATA_TABLES
                ? styles.activeBody
                : styles.inactiveBody
            }
          >
            <span> DATA TABLES PLACEHOLDER </span>
          </div>
          <div
            id="keyValuePairsBody"
            style={
              this.state.selectedTab === TabType.KEY_VALUE_PAIRS
                ? styles.activeBody
                : styles.inactiveBody
            }
          >
            <span> KEY VALUE PAIRS PLACEHOLDER </span>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * @readonly
 * @enum {string}
 */
const TabType = {
  DATA_TABLES: 'dataTables',
  KEY_VALUE_PAIRS: 'keyValuePairs'
};
DataBrowser.TabType = TabType;

export default Radium(DataBrowser);
