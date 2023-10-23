@theme @local_fullscreen
Feature: Fullscreen button expands content area.
    In order to expand the content area
    As a user (e.g. student)
    I need to be able to see the Fullscreen button on a course page

    Background:
        Given the following "users" exist:
            | username | firstname | lastname | email | country |
            | student1 | Sam | Student | student1@example.com | GB |
        And the following "courses" exist:
            | fullname | shortname | category |
            | C1 | C1 | 0 |
        And the following "course enrolments" exist:
            | user | course | role |
            | student1 | C1 | student |

    @javascript
    Scenario: A user is able to view and use the full screen button in Classic
        Given I log in as "student1"
        And I use the classic theme
        And I am on "C1" course homepage
        And ".local-fullscreen" "css_element" should exist in the "#region-main" "css_element"
        When I click on ".local-fullscreen" "css_element" in the "#region-main" "css_element"
        Then ".fullscreenmode" "css_element" should exist in the "body" "css_element"
        And "Navigation" "block" should not be visible
        When I click on ".local-fullscreen" "css_element" in the "#region-main" "css_element"
        Then ".fullscreenmode" "css_element" should not exist in the "body" "css_element"
        And "Navigation" "block" should be visible

    @javascript
    Scenario: A user is able to view and use the full screen button in Boost
        Given I log in as "student1"
        And I am on "C1" course homepage
        And ".local-fullscreen" "css_element" should exist in the "#region-main" "css_element"
        When I click on ".local-fullscreen" "css_element" in the "#region-main" "css_element"
        Then ".fullscreenmode" "css_element" should exist in the "body" "css_element"
        When I click on ".local-fullscreen" "css_element" in the "#region-main" "css_element"
        Then ".fullscreenmode" "css_element" should not exist in the "body" "css_element"
