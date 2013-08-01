var ChildProcess = require('child_process'),
    ProfileBuilder = require('../index.js'),
    mozProfileBuilder = require('mozilla-profile-builder');

suite('ProfileBuilder', function() {
  var sandbox, subject, options;

  setup(function() {
    options = { dog: 'Linus', gaia: '/path/to/gaia' };
    subject = new ProfileBuilder(options);
  });

  test('initialization', function() {
    assert.deepEqual(subject.options, options);
  });

  suite('#build', function() {
    var exec, create, overrides, profile;

    setup(function() {
      // Mock ChildProcess#exec.
      exec = sinon.stub(ChildProcess, 'exec');
      exec.callsArgWith(2, null);

      // Mock mozProfileBuilder#create.
      create = sinon.stub(mozProfileBuilder, 'create');
      profile = { path: __dirname };
      create.callsArgWith(1, null, profile);

      overrides = { bird: 'Harvey', gaia: __dirname };
    });

    teardown(function() {
      ChildProcess.exec.restore();
      mozProfileBuilder.create.restore();
    });

    test('should require a valid gaia path', function() {
      try {
        subject.build();
      } catch (e) {
        assert.strictEqual(e, 'Invalid gaia path provided');
      }
    });

    test('should shell out to make appropriately', function(done) {
      subject.build(overrides, function() {
        sinon.assert.calledWith(exec, 'make -C ' + __dirname);
        done();
      });
    });

    test('should send correct options to #create', function(done) {
      subject.build(overrides, function() {
        sinon.assert.calledWith(create, {
          bird: 'Harvey',
          dog: 'Linus',
          gaia: __dirname,
          profile: ['baseProfile', __dirname + '/profile']
        });

        done();
      });
    });

    test('should set the profile', function(done) {
      subject.build(overrides, function() {
        assert.strictEqual(subject.profile, profile);
        done();
      });
    });
  });

  suite('#destroy', function() {
    var destroy;

    setup(function() {
      subject.profile = { path: __dirname, destroy: function() {} };
      destroy = sinon.stub(subject.profile, 'destroy');
      destroy.callsArgWith(0, null);
    });

    test('should not explode without a profile', function(done) {
      subject.destroy(done);
    });

    // TODO(gareth)
    test('should call destroy on the profile', function(done) {
      subject.destroy(function(err) {
        sinon.assert.calledOnce(destroy);
        done();
      });
    });

    test('should purge profile from memory', function(done) {
      subject.destroy(function(err) {
        assert.ok(!subject.profile);
        done();
      });
    });
  });
});
