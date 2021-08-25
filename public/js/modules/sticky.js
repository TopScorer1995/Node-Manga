"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function ($) {
  var DEFAULT_TOP_SPACING = 0;

  var Sticky =
  /*#__PURE__*/
  function () {
    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.defaults = {
        topSpacing: DEFAULT_TOP_SPACING,
        zIndex: false,
        stopper: '.sticky-stopper',
        stickyClass: false,
        startScrolling: 'top',
        minWidth: false
      };
      this.$element = element;
      this.options = this.assignOptions(options);
      this.$window = $(window);
      this.stopper = this.options.stopper;
      this.elementWidth = this.$element.outerWidth();
      this.elementHeight = this.$element.outerHeight(true);
      this.$placeholder = $('<div class="sticky-placeholder"></div>');
      this.scrollTop = 0;

      this._getPushPoint();

      this._getStopperPosition();

      this.bindEvents();
    }

    _createClass(Sticky, [{
      key: "assignOptions",
      value: function assignOptions(options) {
        return $.extend({}, this.defaults, options);
      }
    }, {
      key: "bindEvents",
      value: function bindEvents() {
        this.$window.on('scroll resize', this.init.bind(this));
      }
    }, {
      key: "hasZIndex",
      value: function hasZIndex() {
        return typeof this.options.zIndex === 'number';
      }
    }, {
      key: "hasStopper",
      value: function hasStopper() {
        return !!($(this.options.stopper).length || typeof this.options.stopper === 'number');
      }
    }, {
      key: "_getStopperPosition",
      value: function _getStopperPosition() {
        if (typeof this.options.stopper === 'string') {
          this.stopPoint = $(this.stopper).offset().top - this.options.topSpacing * .3;
        } else if (typeof this.options.stopper === 'number') {
          this.stopPoint = this.options.stopper;
        }
      }
    }, {
      key: "_getPushPoint",
      value: function _getPushPoint() {
        if (this.options.startScrolling === 'bottom') {
          this.$pushPoint = this.$element.offset().top + this.$element.outerHeight() - this.$window.innerHeight();
        } else {
          this.$pushPoint = this.$element.offset().top - this.options.topSpacing;
        }
      }
    }, {
      key: "init",
      value: function init() {
        if (this.options.minWidth && this.options.minWidth > this.$window.innerWidth()) {
          return false;
        }

        this.scrollTop = this.$window.scrollTop();

        if (this.$pushPoint < this.scrollTop) {
          this._appendPlaceholder();

          this._stickyStart();
        } else {
          this._stickyEnd();
        }

        this._stop();
      }
    }, {
      key: "_appendPlaceholder",
      value: function _appendPlaceholder() {
        this.$element.after(this.$placeholder);
        this.$placeholder.css({
          width: this.elementWidth,
          height: this.elementHeight
        });
      }
    }, {
      key: "_stickyStart",
      value: function _stickyStart() {
        if (this.options.stickyClass) {
          this.$element.addClass(this.options.stickyClass);
        }

        this.$element.css({
          'position': 'fixed',
          'width': this.elementWidth
        });

        if (this.options.startScrolling === 'bottom') {
          var distanceFromTop = this.$window.innerHeight() - this.$element.height() - this.options.topSpacing / 2;
          this.$element.css({
            top: distanceFromTop
          });
        } else {
          this.$element.css({
            top: this.options.topSpacing
          });
        }

        if (this.hasZIndex()) {
          this.$element.css({
            zIndex: this.options.zIndex
          });
        }
      }
    }, {
      key: "_stickyEnd",
      value: function _stickyEnd() {
        if (this.options.stickyClass) {
          this.$element.removeClass(this.options.stickyClass);
        }

        this.$placeholder.remove();
        this.$element.css({
          position: 'static',
          top: DEFAULT_TOP_SPACING
        });
      }
    }, {
      key: "_stop",
      value: function _stop() {
        if (this.stopPoint < $(this.$element).offset().top + this.$element.height()) {
          var diff = this.stopPoint - ($(this.$element).offset().top + this.$element.height()) + this.options.topSpacing;

          if (this.options.startScrolling === 'bottom') {
            diff = this.stopPoint - (this.scrollTop + this.elementHeight);
          }

          this.$element.css({
            top: diff
          });
        }
      }
    }]);

    return Sticky;
  }();

  $.fn.sticky = function (options) {
    return this.each(function () {
      var sticky = new Sticky($(this), options);
      sticky.init();
    });
  };
})(jQuery);