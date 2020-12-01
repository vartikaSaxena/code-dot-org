import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import i18n from '@cdo/locale';
import SimpleProgressBubble, * as bubbleSizes from '@cdo/apps/templates/sectionProgress/SimpleProgressBubble';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import _ from 'lodash';

const bubbleSetStyles = {
  main: {
    position: 'relative',
    display: 'inline-block'
  },
  backgroundDiamond: {
    top: (progressStyles.DIAMOND_DOT_SIZE + 4 + 12 - 10) / 2
  },
  backgroundPill: {
    // pill has height of 18, border of 2, padding of 6, margin of 3
    top: (18 + 4 + 12 + 6 - 10) / 2
  },
  backgroundSublevel: {
    top: 4
  },
  backgroundFirst: {
    left: 15
  },
  backgroundLast: {
    right: 15
  },
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36
  },
  pillContainer: {
    marginRight: 2,
    // Height needed only by IE to get pill to line up properly
    height: 37
  }
};

const pillStyles = {
  levelPill: {
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    color: color.charcoal,
    display: 'flex',
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
    minWidth: 70,
    lineHeight: '18px',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    letterSpacing: -0.12
  },
  textProgressStyle: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    letterSpacing: -0.12,
    width: 120,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  iconMargin: {
    marginLeft: 10
  }
};

const styles = {
  bubbles: {
    whiteSpace: 'nowrap'
  },
  cell: {
    // padding: '0px 4px'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 10,
    right: 10
  }
};

export const widthForLevels = levels => {
  return levels.reduce((widthSum, level) => {
    widthSum +=
      bubbleSizes.BIG_CONTAINER + level.sublevels &&
      level.sublevels.length * bubbleSizes.SMALL_CONTAINER;
  }, 0);
};
export default class StudentProgressDetailCell extends Component {
  static whyDidYouRender = true;
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired,
    stageExtrasEnabled: PropTypes.bool
  };

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  buildBubbleUrl(level) {
    if (!level.url) {
      return null;
    }
    const {studentId, sectionId} = this.props;
    return `${level.url}?section_id=${sectionId}&user_id=${studentId}`;
  }

  renderUnplugged(level, status) {
    let url = this.buildBubbleUrl(level);
    let style = {
      ...pillStyles.levelPill,
      ...(url && progressStyles.hoverStyle),
      ...progressStyles.levelProgressStyle(status)
    };

    return (
      <a
        key={level.id}
        href={url}
        style={{textDecoration: 'none'}}
        className="uitest-ProgressPill"
      >
        <div style={style}>
          <div
            className="ProgressPillTextAndIcon"
            style={pillStyles.textProgressStyle}
          >
            {i18n.unpluggedActivity()}
          </div>
        </div>
      </a>
    );
  }

  renderSublevels(level) {
    return (
      <div style={bubbleSetStyles.main}>
        {level.sublevels.map(sublevel => {
          const subProgress = this.props.studentProgress[sublevel.id];
          const subStatus = subProgress && subProgress.status;
          return (
            <SimpleProgressBubble
              key={sublevel.id}
              levelStatus={subStatus}
              disabled={!!level.bonus && !stageExtrasEnabled}
              smallBubble={true}
              bonus={sublevel.bonus}
              concept={sublevel.isConceptLevel}
              title={sublevel.bubbleTitle}
              url={this.buildBubbleUrl(sublevel)}
            />
          );
        })}
      </div>
    );
  }

  renderBubble = (level, index, isSublevel) => {
    const {studentProgress, stageExtrasEnabled} = this.props;
    const levelProgress = studentProgress[level.id];
    const status = levelProgress && levelProgress.status;
    const paired = levelProgress && levelProgress.paired;
    if (level.isUnplugged && !isSublevel) {
      return this.renderUnplugged(level, status);
    }
    const conceptContainer =
      (level.isConceptLevel && bubbleSetStyles.diamondContainer) || {};
    return (
      <div
        key={`${level.id}_${level.levelNumber}`}
        style={{
          ...bubbleSetStyles.container,
          ...conceptContainer
        }}
      >
        <SimpleProgressBubble
          levelStatus={status}
          levelKind={level.kind}
          disabled={!!level.bonus && !stageExtrasEnabled}
          smallBubble={isSublevel}
          bonus={level.bonus}
          paired={paired}
          concept={level.isConceptLevel}
          title={level.bubbleTitle}
          url={this.buildBubbleUrl(level)}
        />
        {level.sublevels && this.renderSublevels(level)}
      </div>
      // </div>
    );
  };

  render() {
    return (
      <div
        style={{
          // ...styles.cell,
          ...styles.bubbles,
          ...bubbleSetStyles.container
        }}
        className="uitest-detail-cell cell-content"
      >
        <div style={styles.background} />
        {this.props.levels.map((level, index) => {
          return this.renderBubble(level, index, false);
        })}
      </div>
    );
  }
}
