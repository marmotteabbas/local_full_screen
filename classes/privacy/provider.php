<?php
// This file is part of the local fullscreen plugin for Moodle
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
 * Privacy API implementation for the full screen button.
 *
 * @package    local_fullscreen
 * @copyright  2018 University of Nottingham
 * @author     Neill Magill <neill.magill@nottingham.ac.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_fullscreen\privacy;
use core_privacy\local\metadata\collection;
use \core_privacy\local\request\writer;

defined('MOODLE_INTERNAL') || die();

/**
 * Provider for the full screen button.
 *
 * @package    local_fullscreen
 * @copyright  2018 University of Nottingham
 * @author     Neill Magill <neill.magill@nottingham.ac.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\user_preference_provider {
    /**
     * Returns meta data about the full screen button.
     *
     * @param \core_privacy\local\metadata\collection $collection
     * @return \core_privacy\local\metadata\collection
     */
    public static function get_metadata(collection $collection) : collection {
        $collection->add_user_preference('fullscreenmode', 'privacy:metadata:preference:fullscreenmode');
        return $collection;
    }

    /**
     * Exports the user's preferences.
     *
     * @param int $userid
     */
    public static function export_user_preferences(int $userid) {
        $fullscreen = get_user_preferences('fullscreenmode', null, $userid);
        if (!is_null($fullscreen)) {
            switch ($fullscreen) {
                case true:
                    $fullscreendesc = get_string('fullscreenon', 'local_fullscreen');
                    break;
                case false:
                default:
                    $fullscreendesc = get_string('fullscreenoff', 'local_fullscreen');
                    break;
            }
            writer::export_user_preference('local_fullscreen', 'fullscreenmode', $fullscreen, $fullscreendesc);
        }
    }
}
