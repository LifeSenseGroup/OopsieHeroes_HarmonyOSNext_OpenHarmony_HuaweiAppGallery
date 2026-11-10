function describe(_name, fn) {
  fn();
}

function it(name, _flag, fn) {
  try {
    fn();
    console.log('ok ' + name);
  } catch (error) {
    console.error('FAIL ' + name);
    console.error(error);
    process.exitCode = 1;
  }
}

function expect(actual) {
  return {
    assertEqual(expected) {
      if (actual !== expected) {
        throw new Error(String(actual) + ' !== ' + String(expected));
      }
    },
    assertTrue() {
      if (actual !== true) {
        throw new Error('expected true, got ' + String(actual));
      }
    },
    assertContain() {
    }
  };
}

module.exports = { describe, it, expect };
