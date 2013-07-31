var exec = require('child_process').exec,
    fs = require('fs'),
    mozProfileBuilder = require('mozilla-profile-builder');


/**
 * Merge two objects and their properties (when objects) with no side effects!
 *
 *    mergeOptions({ prefs: { locked: true } }, { prefs: { debug: true } });
 *
 *    // { prefs: { locked: true, debug: true } }
 *
 * @param {Object} a first object to merge.
 * @param {Object} b second object to merge.
 * @return {Object} merged objects.
 * @private
 */
function mergeOptions(a, b) {
  var result = {};

  // Copy a into result.
  for (var key in a) {
    result[key] = a[key];
  }

  // Merge b into result.
  for (key in b) {
    if (typeof a[key] !== 'object' || typeof b[key] !== 'object') {
      result[key] = b[key];
      continue;
    }

    // When both a and b have object properties, do a merge
    // of those properties rather than an override.
    result[key] = this(a[key], b[key]);
  }

  return result;
}

/**
 * Gaia profile builder API.
 * @param {Function} options for profile builder.
 *     (string) gaia path to gaia directory.
 */
function ProfileBuilder(options) {
  options = options || {};

  this.options = {};
  for (var key in options) {
    this.options[key] = options[key];
  }
}


ProfileBuilder.prototype = {
  /**
   * Profile instance class.
   * @type {Profile}.
   */
  profile: null,


  /**
   * Build the initial version of the profile.
   * @param {Object} overrides to default build options.
   * @param {Function} callback [Error err, Profile profile].
   */
  build: function(overrides, callback) {
    // Merge options from the defaults and the overrides for this run.
    var options = mergeOptions(this.options, overrides || {});

    // Create gaia base profile.
    var gaia = options.gaia;
    var exists = fs.exists(gaia);
    if (!exists) {
      throw 'Invalid gaia path provided';
    }

    exec('make -C ' + gaia, function(err, stdout, stderr) {
      if (err) {
        throw err;
      }

      options.profile = ['baseProfile', gaia];

      mozProfileBuilder.create(options, function(err, profile) {
        if (err) {
          callback(err);
          return;
        }

        this.profile = profile;
        callback(null, profile.path);
      }.bind(this));
    });
  },


  /**
   * Destroy the profile.
   * @param {Function} callback [Error err].
   */
  destroy: function(callback) {
    if (!this.profile) {
      callback();
      return;
    }

    this.profile.destroy(function(err) {
      var path = this.profile.path;
      this.profile = null;
      callback(err, path);
    }.bind(this));
  }
};

module.exports = ProfileBuilder;
