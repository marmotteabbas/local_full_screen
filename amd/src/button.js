// This file is part of the fullscreen button plugin.
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
 * A javascript module that adds the fullscreen button to a page.
 *
 * @module     local_fullscreen/button
 * @package    local_fullscreen
 * @copyright  2018 University of Nottingham
 * @author     Neill Magill <neill.magill@nottingham.ac.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['jquery', 'core/log', 'core/templates', 'core/ajax', 'core/notification'],
    function($, log, Templates, Ajax, Notification) {

        var SELECTORS = {
            /** The attachment point for Boost themes. */
            attachBoost: '#region-main > .card-block',
            /** The attachment point for Clean themes. */
            attachClean: '#region-main',
            /** The class of the fullscreen button. */
            button: '.local-fullscreen',
        };

        var CLASSES = {
            /** Added to the body tag to switch fullscreen mode on. */
            toggle: 'fullscreenmode',
            /** The button is fixed relative to it's container. */
            fixed: 'fixed',
            /** The button floats at the top of the browser window. */
            'float': 'float'
        };

        var TEMPLATES = {
            /** The name of the template that renders the fullscreen button. */
            button: 'local_fullscreen/button'
        };

        /**
         * Used to stop Fullscreen mode from toggling repeatedly if the keyboard combination is held down.
         *
         * @type Boolean
         */
        var KEYPRESSED = false;

        /**
         * Adds the rendered button into the page.
         *
         * @param {String} html
         * @returns {undefined}
         */
        var addButton = function(html) {
            var element = $(html);
            var attachpoint = $(SELECTORS.attachBoost);
            if (attachpoint.length === 0) {
                // No boost selector found, fallback to the method used for clean.
                attachpoint = $(SELECTORS.attachClean);
            }
            attachpoint.prepend(element);
            // Add handlers.
            $(SELECTORS.button).click(toggleFullscreen);
            var root = $(document);
            root.keydown(keyDownHandler);
            root.keyup(keyUpHandler);
            root.scroll(scrollHandler);
            return;
        };

        /**
         * Adds the full screen button to the page.
         *
         * @param {boolean} fullscreen Should the button will be initialised in fullscreen mode.
         * @returns {Promise}
         */
        var init = function(fullscreen) {
            log.debug('Adding fullscreen button to the page (fullscreen=' + fullscreen + ')', 'local_fullscreen/button');
            // Get the user's fullscreen preference.
            var variables = {
                fullscreen: false
            };
            if (fullscreen == true) {
                $('body').addClass(CLASSES.toggle);
                variables.fullscreen = true;
            }

            document.addEventListener('fullscreenchange', onFullScreenChange, false);
            document.addEventListener('webkitfullscreenchange', onFullScreenChange, false);
            document.addEventListener('mozfullscreenchange', onFullScreenChange, false);

            return Templates.render(TEMPLATES.button, variables).then(addButton);
        };

        var onFullScreenChange = function() {
            var fullscreenElement =
            document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement;

            if (fullscreenElement === null) {
                put_all_normal();
            }

        };

        /**
         * Toggle fullscreen mode when Ctrl+Alt+b is pressed.
         *
         * @param {Event} event
         * @returns {undefined}
         */
        var keyDownHandler = function(event) {
            if (KEYPRESSED === true || event.key !== 'b' || event.ctrlKey === false || event.altKey === false) {
                return;
            }
            KEYPRESSED = true;
            toggleFullscreen(event);
        };

        /**
         * Lets us know the keyboard toggle combination has stopped.
         *
         * @param {Event} event
         * @returns {undefined}
         */
        var keyUpHandler = function(event) {
            if (KEYPRESSED === false || event.key !== 'b' || event.ctrlKey === false || event.altKey === false) {
                return;
            }
            KEYPRESSED = false;
        };

        /**
         * Changes the mode of the fullscreen button to either be relative to an element,
         * or floating at the top of the page, depending on how far a user has scrolled.
         *
         * @returns {undefined}
         */
        var scrollHandler = function() {
            if (window.pageYOffset > 205) {
                $(SELECTORS.button).addClass(CLASSES.float);
            } else {
                $(SELECTORS.button).removeClass(CLASSES.float);
            }
        };

        /**
         * Toggles the fullscreen mode.
         *
         * @returns {undefined}
         */
        var toggleFullscreen = function() {
            var bodyelement = $('body');
            var button = $(SELECTORS.button);
            var preference;

            if (bodyelement.hasClass(CLASSES.toggle)) {

                $("#page-header").hide(); 
                $("#top-footer").hide();
                $("#nav-drawer").hide();
                $("#page-footer").hide();
                $("#nav-drawer-footer").hide();
                $(".fixed-top").hide();

                $('#page').addClass("temp_page_full_screen");
                $('.temp_page_full_screen').removeAttr('id');

                $("body").addClass("tempory_margin_zero");

                bodyelement.removeClass(CLASSES.toggle);
                button.attr('aria-checked', 'false');
                preference = false;

            } else {
                put_all_normal();
            }

            full_screen_switch();
            updateUserPreference(preference);
        };

        var put_all_normal = function() {

            var bodyelement = $('body');
            var button = $(SELECTORS.button);
            var preference;

            $("#page-header").show(); 
            $("#top-footer").show();
            $("#nav-drawer").show();
            $("#page-footer").show();
            $("#nav-drawer-footer").show();
            $(".fixed-top").show();

            $('.temp_page_full_screen').attr('id','page');
            $('#page').removeClass("temp_page_full_screen");
               
            $("body").removeClass("tempory_margin_zero");

            bodyelement.addClass(CLASSES.toggle);
            button.attr('aria-checked', 'true');
            preference = true;
        };

        var full_screen_switch = function() {
            var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);

            var docElm = document.documentElement;
                if (!isInFullScreen) {
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    } else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                    } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }  
        };

        /**
         * Updates the user's fullscreen preference.
         *
         * @param {boolean} fullscreen
         * @returns {Promise}
         */
        var updateUserPreference = function(fullscreen) {
            var request = {
                methodname: 'core_user_update_user_preferences',
                args: {
                    preferences: [
                        {
                            type: 'fullscreenmode',
                            value: fullscreen
                        }
                    ]
                }
            };
            return Ajax.call([request])[0].fail(Notification.exception);
        };

        return {
            init: init(true)
        };
    }
);
