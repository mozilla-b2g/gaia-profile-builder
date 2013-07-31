var ProfileBuilder = require('../index.js');

suite('ProfileBuilder', function() {
  var subject, options;

  setup(function() {
    options = { gaia: '/path/to/gaia' };
    subject = new ProfileBuilder(options);
  });

  teardown(function() {
    sinon.restore();
  });

  test('initialization', function() {
    assert.deepEqual(subject.options, options);
  });

  suite('#build', function() {
    test('should require a valid gaia path', function() {
      try {
        subject.build();
      } catch (e) {
        assert.strictEqual(e, 'Invalid gaia path provided');
      }
    });

    // TODO(gareth)
  });

  suite('#destroy', function() {
    test('should not explode without a profile', function(done) {
      subject.destroy(done);
    });

    // TODO(gareth)
  });
});
