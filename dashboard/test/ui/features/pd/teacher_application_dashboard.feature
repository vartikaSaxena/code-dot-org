@dashboard_db_access
@eyes

Feature: Teacher Application Dashboard view

  Scenario: Application dashboard, list view, detail view, cohort view
    Given I am a workshop administrator with some applications of each type and status
    And I am on "http://studio.code.org/pd/application_dashboard/summary"
    Then I wait until element "table#summary-csd-teachers" is visible

    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View all applications)"
    Then I wait until element "h2:contains('CS Discoveries Teacher Applications')" is visible
    Then I wait until element "table#quick-view" is visible
    And I open my eyes to test "Teacher Application Dashboard"
    # TODO: (suresh) Remove " in test environment" when test generates the same checkpoint image in test and CircleCI.
    And I see no difference for "Teacher List View" in test environment

    # Access the Detail View by navigating to the first row's "view application" button href
    # rather than clicking so it does not open in a new tab.
    Then execute JavaScript expression "window.location = $('table#quick-view a.btn:contains(View Application):first()').prop('href')"
    Then I wait until element "#detail-view" is visible
    # TODO: (suresh) Remove " in test environment" when test generates the same checkpoint image in test and CircleCI..
    And I see no difference for "Teacher Detail View" in test environment

    Then I press the first "#admin-edit" element
    Then I wait until element "a:contains('(Admin) Edit Form Data')" is visible
    Then I click selector "a:contains('(Admin) Edit Form Data')"
    Then I wait until current URL contains "/edit"
    Then I wait until element "#form-data-edit" is visible
    # TODO: (suresh) Remove " in test environment" when test generates the same checkpoint image in test and CircleCI.
    And I see no difference for "Admin Edit View" in test environment

    Then I click selector ".breadcrumb a:contains('Application Dashboard')"
    Then I wait until element "table#summary-csd-teachers" is visible
    Then I click selector "table#summary-csd-teachers ~ .btn:contains(View accepted cohort)"
    Then I wait until element "table#cohort-view" is visible
    # TODO: (suresh) Remove " in test environment" when test generates the same checkpoint image in test and CircleCI.
    And I see no difference for "Teacher Cohort View" in test environment
    And I close my eyes
