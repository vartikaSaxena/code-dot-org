import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ProgressBubbleSet from './ProgressBubbleSet';
import color from '@cdo/apps/util/color';
import {levelType} from './progressTypes';
import {getIconForLevel} from './progressHelpers';
import ProgressPill from './ProgressPill';
import i18n from '@cdo/locale';

const styles = {
  table: {
    marginTop: 12
  },
  nameText: {
    color: color.charcoal
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12
  },
  col2: {
    paddingLeft: 20
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2
  },
  horizontalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    position: 'relative',
    top: -2,
    height: 3,
    width: '100%'
  },
  dot: {
    display: 'inline-block',
    position: 'relative',
    left: -2,
    top: 1,
    backgroundColor: color.lighter_gray,
    height: 10,
    width: 10,
    borderRadius: 10
  }
};

/**
 * A set of one or more levels that are part of the same progression
 */
class ProgressLevelSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.string,
    onBubbleClick: PropTypes.func
  };

  render() {
    const {
      name,
      levels,
      disabled,
      selectedSectionId,
      onBubbleClick
    } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep ? undefined : levels[0].url;

    let pillText, icon;
    let progressStyle = false;
    if (levels[0].isUnplugged || levels[levels.length - 1].isUnplugged) {
      // We explicitly don't want any text in this case
      if (multiLevelStep) {
        pillText = '';
        icon = getIconForLevel(levels[0]);
      } else {
        pillText = i18n.unpluggedActivity();
        progressStyle = true;
      }
    } else {
      pillText = levels[0].levelNumber.toString();
      icon = getIconForLevel(levels[0]);
      if (multiLevelStep) {
        pillText += `-${levels[levels.length - 1].levelNumber}`;
      }
    }

    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.col1}>
              <ProgressPill
                levels={levels}
                icon={icon}
                text={pillText}
                disabled={disabled}
                selectedSectionId={selectedSectionId}
                progressStyle={progressStyle}
                onSingleLevelClick={onBubbleClick}
              />
            </td>
            <td style={styles.col2}>
              <a href={url}>
                <div style={{...styles.nameText, ...styles.text}}>{name}</div>
              </a>
            </td>
          </tr>
          {multiLevelStep && (
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine} />
                  <div style={styles.horizontalLine} />
                  <div style={styles.dot} />
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  disabled={disabled}
                  selectedSectionId={selectedSectionId}
                  onBubbleClick={onBubbleClick}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default Radium(ProgressLevelSet);
