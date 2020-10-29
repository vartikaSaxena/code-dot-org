import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivityCard as ActivityCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCard';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivityCard', () => {
  let defaultProps,
    addActivitySection,
    removeActivity,
    moveActivity,
    updateActivityField,
    setActivitySectionRef,
    updateTargetActivitySection,
    updateActivitySectionMetrics;
  beforeEach(() => {
    addActivitySection = sinon.spy();
    removeActivity = sinon.spy();
    moveActivity = sinon.spy();
    updateActivityField = sinon.spy();
    setActivitySectionRef = sinon.spy();
    updateTargetActivitySection = sinon.spy();
    updateActivitySectionMetrics = sinon.spy();
    defaultProps = {
      activity: sampleActivities[0],
      activitiesCount: 1,
      addActivitySection,
      removeActivity,
      moveActivity,
      updateActivityField,
      setActivitySectionRef,
      updateTargetActivitySection,
      updateActivitySectionMetrics,
      targetActivitySectionPos: 1,
      activitySectionMetrics: []
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);
    expect(wrapper.contains('Activity:')).to.be.true;
    expect(wrapper.contains('Duration:')).to.be.true;
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.find('Connect(ActivitySectionCard)').length).to.equal(3);
    expect(wrapper.find('button').length).to.equal(1);
  });

  it('adds activity section when button pressed', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);

    const button = wrapper.find('button');
    expect(button.text()).to.include('Activity Section');
    button.simulate('mouseDown');
    expect(addActivitySection).to.have.been.calledOnce;
  });

  it('edit activity title', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    titleInput.simulate('change', {target: {value: 'New Title'}});
    expect(updateActivityField).to.have.been.calledWith(
      1,
      'displayName',
      'New Title'
    );
  });

  it('edit activity duration', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(1);
    titleInput.simulate('change', {target: {value: '1000'}});
    expect(updateActivityField).to.have.been.calledWith(1, 'duration', 1000);
  });
});
