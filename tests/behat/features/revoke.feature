@retry

Feature: See other devices and revoke their access
  As a CMS user
  I want to see other devices that are currently logged in
  So that I can revoke their access

  Background:
    Given I am logged in with "ADMIN" permissions
    # Create a mock login session
    And There is a login session for a second device

  Scenario: I can see other devices and revoke their access
    When I go to "/admin/security"
    # Click the ADMIN user
    And I click the ".col-FirstName" element
    # Ensure XHR loaded from endpoint
    And I wait for 2 seconds
    # Assert text for the two login sessions
    Then I should see the text "Current" in the ".login-session  .text-success" element
    Then I should see the text "Log out" in the ".login-session__logout" element
    # Click "Log out" button
    When I click the ".login-session__logout" element
    # Wait for modal to fade in
    And I wait for 2 seconds
    # Click the green button in the modal
    When I click the ".modal-dialog .btn-primary" element
    # Assert text has changed
    Then I should see the text "Logging out..." in the ".login-session__logout" element
    # Assert hidden element is applied which fades to not visible via a css transition
    Then I see the ".login-session.hidden" element
