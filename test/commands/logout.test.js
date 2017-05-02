const assert = require('assert');
const nock = require('nock');

const logout = require('../../commands/logout');
const { BUILD_URL } = require('../../utils/utils');
const logger = require('../../utils/console');

describe('`logout` command', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  it('should call `/logout`', async () => {
    const mock = nock(BUILD_URL).post('/logout').reply(200);

    await logout.run();

    mock.done();

    // Need to do this on next tick, as it logs after the response
    process.nextTick(() => {
      assert(logger._flush().indexOf() > -1, 'You have been logged out', 'Should show logout message');
    });
  });
});