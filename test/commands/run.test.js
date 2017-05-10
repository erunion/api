const assert = require('assert');
const nock = require('nock');

const { BUILD_URL } = require('../../utils/utils');
const { run } = require('../../commands/run');

describe('run command', () => {
  it('should throw if no service provided', () => {
    assert.throws(() => {
      run(['run']);
    }, 'Missing service');
  });

  it('should throw if no action provided', () => {
    assert.throws(() => {
      run(['run', 'service']);
    }, 'Missing action');
  });

  it('should default team to personal team', () => {
    const key = '123456';
    const service = 'service';
    const action = 'action';
    const teamsMock = nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [
        { key, personal: true },
        { key: '456789', personal: false },
      ],
    }));

    const invokeMock = nock(BUILD_URL)
      .post(`/services/${service}/${action}/invoke`)
      .basicAuth({ user: key })
      .reply(200, {});

    return run(['run', service, action], {}).then(() => {
      teamsMock.done();
      invokeMock.done();
    });
  });

  it('should report invalid team', () => {
    const key = '123456';
    const service = 'service';
    const action = 'action';
    nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [
        { key, personal: true, name: 'team1' },
        { key: '456789', personal: false, name: 'team2' },
      ],
    }));

    return run(['run', service, action], { team: 'team3' }).catch((err) => {
      assert.equal(err.message, 'Cannot find team team3');
    });
  });

  it('should prefix service name with @ if it contains a slash', () => {
    const key = '123456';
    const service = 'team/service-1';
    const action = 'action';
    nock(BUILD_URL).get('/users/me').reply(200, JSON.stringify({
      teams: [{ key, personal: true }],
    }));

    const invokeMock = nock(BUILD_URL)
      .post(`/services/@${service}/${action}/invoke`)
      .basicAuth({ user: key })
      .reply(200, {});

    return run(['run', service, action], {}).then(() => {
      return invokeMock.done();
    });
  });
});
