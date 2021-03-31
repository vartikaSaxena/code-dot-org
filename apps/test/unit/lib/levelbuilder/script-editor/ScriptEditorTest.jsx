import React from 'react';
import {mount} from 'enzyme';
import ScriptEditor from '@cdo/apps/lib/levelbuilder/script-editor/ScriptEditor';
import {assert, expect} from '../../../../util/reconfiguredChai';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import {Provider} from 'react-redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

describe('ScriptEditor', () => {
  let defaultProps, store, server;
  beforeEach(() => {
    server = sinon.fakeServer.create();
    sinon.stub(utils, 'navigateToHref');
    stubRedux();

    registerReducers({...reducers, isRtl});
    store = getStore();
    store.dispatch(
      init(
        [
          {
            bigQuestions: '* One↵* two',
            description: 'laklkldkla"',
            displayName: 'Content',
            key: 'lesson group',
            lessons: [],
            position: 1,
            userFacing: true
          }
        ],
        {}
      )
    );

    defaultProps = {
      id: 1,
      initialAnnouncements: [],
      curriculumUmbrella: 'CSF',
      i18nData: {
        title: 'Test-Script',
        stageDescriptions: [],
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      },
      isLevelbuilder: true,
      locales: [],
      name: 'test-script',
      scriptFamilies: [],
      teacherResources: [],
      versionYearOptions: [],
      initialFamilyName: '',
      initialTeacherResources: [],
      initialProjectSharing: false,
      initialLocales: [],
      isMigrated: false,
      initialLessonLevelData:
        "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name', has_lesson_plan: true\n"
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
    server.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <ScriptEditor {...combinedProps} />
      </Provider>
    );
  };

  describe('Script Editor', () => {
    it('uses old script editor for non migrated script', () => {
      const wrapper = createWrapper({initialHidden: false});

      expect(wrapper.find('input').length).to.equal(22);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(10);
      expect(wrapper.find('textarea').length).to.equal(3);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(8);
      expect(wrapper.find('SaveBar').length).to.equal(1);

      expect(wrapper.find('UnitCard').length).to.equal(0);
      expect(wrapper.find('#script_text').length).to.equal(1);
    });

    it('uses new script editor for migrated script', () => {
      const wrapper = createWrapper({initialHidden: false, isMigrated: true});

      expect(wrapper.find('input').length).to.equal(25);
      expect(wrapper.find('input[type="checkbox"]').length).to.equal(12);
      expect(wrapper.find('textarea').length).to.equal(4);
      expect(wrapper.find('select').length).to.equal(5);
      expect(wrapper.find('CollapsibleEditorSection').length).to.equal(9);
      expect(wrapper.find('SaveBar').length).to.equal(1);

      expect(wrapper.find('UnitCard').length).to.equal(1);
      expect(wrapper.find('#script_text').length).to.equal(0);
    });

    describe('Teacher Resources', () => {
      it('adds empty resources if passed none', () => {
        const wrapper = createWrapper({});
        assert.deepEqual(
          wrapper.find('ScriptEditor').state('teacherResources'),
          [
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''}
          ]
        );
      });

      it('adds empty resources if passed fewer than max', () => {
        const wrapper = createWrapper({
          initialTeacherResources: [
            {type: ResourceType.curriculum, link: '/foo'}
          ]
        });

        assert.deepEqual(
          wrapper.find('ScriptEditor').state('teacherResources'),
          [
            {type: ResourceType.curriculum, link: '/foo'},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''},
            {type: '', link: ''}
          ]
        );
      });
    });

    it('has correct markdown for preview of unit description', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
      expect(
        wrapper
          .find('TextareaWithMarkdownPreview')
          .at(0)
          .prop('markdown')
      ).to.equal(
        '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
      expect(
        wrapper
          .find('TextareaWithMarkdownPreview')
          .at(1)
          .prop('markdown')
      ).to.equal(
        '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
      );
    });

    it('must set family name in order to check standalone course', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      let courseCheckbox = wrapper.find('.isCourseCheckbox');
      let familyNameSelect = wrapper.find('.familyNameSelector');

      expect(courseCheckbox.props().disabled).to.be.true;
      expect(familyNameSelect.props().value).to.equal('');

      familyNameSelect.simulate('change', {target: {value: 'Family'}});

      // have to re-find the items inorder to see updates
      courseCheckbox = wrapper.find('.isCourseCheckbox');
      familyNameSelect = wrapper.find('.familyNameSelector');

      expect(familyNameSelect.props().value).to.equal('Family');
      expect(courseCheckbox.props().disabled).to.be.false;
    });
  });

  describe('Saving Script Editor', () => {
    let clock;

    afterEach(() => {
      if (clock) {
        clock.restore();
        clock = undefined;
      }
    });

    it('can save and keep editing', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        scriptPath: '/s/test-script'
      };
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      clock = sinon.useFakeTimers(new Date('2020-12-01'));
      const expectedLastSaved = Date.now();
      server.respond();
      clock.tick(50);

      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().lastSaved).to.equal(expectedLastSaved);
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      //check that last saved message is showing
      expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();
      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;
      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes not provided', () => {
      const wrapper = createWrapper({initialShowCalendar: true});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal(
        'Please provide instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes is invalid', () => {
      const wrapper = createWrapper({
        initialShowCalendar: true,
        initialWeeklyInstructionalMinutes: -100
      });
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndKeepEditingButton = saveBar.find('button').at(0);
      expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
        .true;
      saveAndKeepEditingButton.simulate('click');

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal(
        'Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
      );

      expect(
        wrapper
          .find('.saveBar')
          .contains(
            'Error Saving: Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
          )
      ).to.be.true;
    });

    it('can save and close', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = {
        scriptPath: '/s/test-script'
      };
      server.respondWith('PUT', `/s/1`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(returnData)
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(1);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();
      scriptEditor.update();
      expect(utils.navigateToHref).to.have.been.calledWith(
        `/s/test-script${window.location.search}`
      );
    });

    it('shows error when save and keep editing has error saving', () => {
      const wrapper = createWrapper({});
      const scriptEditor = wrapper.find('ScriptEditor');

      let returnData = 'There was an error';
      server.respondWith('PUT', `/s/1`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      const saveBar = wrapper.find('SaveBar');

      const saveAndCloseButton = saveBar.find('button').at(1);
      expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
      saveAndCloseButton.simulate('click');

      // check the the spinner is showing
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
      expect(scriptEditor.state().isSaving).to.equal(true);

      server.respond();

      scriptEditor.update();
      expect(utils.navigateToHref).to.not.have.been.called;

      expect(scriptEditor.state().isSaving).to.equal(false);
      expect(scriptEditor.state().error).to.equal('There was an error');
      expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
      expect(
        wrapper.find('.saveBar').contains('Error Saving: There was an error')
      ).to.be.true;
    });
  });

  describe('VisibleInTeacherDashboard', () => {
    it('is checked when hidden is false', () => {
      const wrapper = createWrapper({
        initialHidden: false
      });
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.true;
    });

    it('is unchecked when hidden is true', () => {
      const wrapper = createWrapper({
        initialHidden: true
      });
      const checkbox = wrapper.find('input[name="visible_to_teachers"]');
      expect(checkbox.prop('checked')).to.be.false;
    });
  });

  describe('Professional Learning Course', () => {
    it('disable launching plc course without title and professional learning course', () => {
      const wrapper = createWrapper({});

      const launchButton = wrapper.find('Button[name="launch_plc_course"]');
      expect(launchButton.contains('Launch PLC Course')).to.be.true;
      expect(launchButton.props().disabled).to.be.true;
    });
    it('successfully launch plc course', () => {
      const wrapper = createWrapper({
        initialProfessionalLearningCourse: 'PLC Course'
      });
      const scriptEditor = wrapper.find('ScriptEditor');

      const launchButton = wrapper.find('Button[name="launch_plc_course"]');
      expect(launchButton.contains('Launch PLC Course')).to.be.true;

      expect(scriptEditor.state().plcCourseLaunchStatus).to.equal(null);

      server.respondWith('PUT', `/plc/Test-Script/launch`, [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({})
      ]);

      launchButton.simulate('click');
      server.respond();
      scriptEditor.update();

      expect(scriptEditor.state().plcCourseLaunchStatus).to.equal(
        'Course Launched'
      );
    });

    it('launch plc course gives error', () => {
      const wrapper = createWrapper({
        initialProfessionalLearningCourse: 'PLC Course'
      });
      const scriptEditor = wrapper.find('ScriptEditor');

      const launchButton = wrapper.find('Button[name="launch_plc_course"]');
      expect(launchButton.contains('Launch PLC Course')).to.be.true;

      expect(scriptEditor.state().plcCourseLaunchStatus).to.equal(null);

      let returnData = 'There was an error';
      server.respondWith('PUT', `/plc/Test-Script/launch`, [
        404,
        {'Content-Type': 'application/json'},
        returnData
      ]);

      launchButton.simulate('click');
      server.respond();
      scriptEditor.update();

      expect(scriptEditor.state().plcCourseLaunchStatus).to.equal(
        'There was an error'
      );
    });
  });
});
