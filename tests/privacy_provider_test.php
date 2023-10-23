<?php
// This file is part of the Tutorial Booking activity.
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Tests the full screen button Privacy API implementation.
 *
 * @package     local_fullscreen
 * @copyright   University of Nottingham, 2018
 * @author      Neill Magill <neill.magill@nottingham.ac.uk>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use local_fullscreen\privacy\provider;

defined('MOODLE_INTERNAL') || die();

/**
 * Tests the full screen button privacy provider class.
 *
 * @package     local_fullscreen
 * @copyright   University of Nottingham, 2018
 * @author      Neill Magill <neill.magill@nottingham.ac.uk>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @group local_fullscreen
 * @group uon
 */
class local_fullscreen_privacy_provider_test extends \core_privacy\tests\provider_testcase {
    /**
     * Tests that if the user has never used the full screen button that no data will be exported.
     */
    public function test_no_preference() {
        $this->resetAfterTest(true);
        $user = self::getDataGenerator()->create_user();
        $otheruser = self::getDataGenerator()->create_user();
        set_user_preference('fullscreenmode', true, $otheruser);
        provider::export_user_preferences($user->id);
        $writer = \core_privacy\local\request\writer::with_context(\context_system::instance());
        $this->assertFalse($writer->has_any_data());
    }

    /**
     * Tests that if the user has enabled the full screen button that the preference will be exported.
     */
    public function test_fullscreen_enabled() {
        $this->resetAfterTest(true);
        $user = self::getDataGenerator()->create_user();
        $otheruser = self::getDataGenerator()->create_user();
        set_user_preference('fullscreenmode', true, $user);
        set_user_preference('fullscreenmode', false, $otheruser);
        provider::export_user_preferences($user->id);
        $writer = \core_privacy\local\request\writer::with_context(\context_system::instance());
        $this->assertTrue($writer->has_any_data());
        $preferences = $writer->get_user_preferences('local_fullscreen');
        $this->assertEquals('1', $preferences->fullscreenmode->value);
    }

    /**
     * Tests that if the user has turned off full screen mode.
     */
    public function test_fullscreen_disabled() {
        $this->resetAfterTest(true);
        $user = self::getDataGenerator()->create_user();
        $otheruser = self::getDataGenerator()->create_user();
        set_user_preference('fullscreenmode', false, $user);
        set_user_preference('fullscreenmode', true, $otheruser);
        provider::export_user_preferences($user->id);
        $writer = \core_privacy\local\request\writer::with_context(\context_system::instance());
        $this->assertTrue($writer->has_any_data());
        $preferences = $writer->get_user_preferences('local_fullscreen');
        $this->assertEquals('', $preferences->fullscreenmode->value);
    }
}
