"use strict";

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _fixtures = require("../boot_tests/fixtures");
var _userStats = require("./user-stats");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
jest.useFakeTimers('modern');
const PST = 'America/Los_Angeles';
describe('user stats', () => {
  beforeEach(() => {
    // setting now to 2016-02-03T11:00:00 (PST)
    jest.setSystemTime(1454526000000);
  });
  describe('prepUniqueDaysByHours', () => {
    it('should return correct epoch when all entries fall into ' + 'one day in UTC', () => {
      expect((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('8/3/2015 14:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('8/3/2015 20:00', 'M/D/YYYY H:mm').valueOf()])).toEqual([1438567200000]);
    });
    it('should return correct epoch when given two identical dates', () => {
      expect((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf()])).toEqual([1438567200000]);
    });
    it('should return 2 epochs when dates fall into two days in PST', () => {
      expect((0, _userStats.prepUniqueDaysByHours)([
      // 8/2/2015 in America/Los_Angeles
      _momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('8/3/2015 14:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('8/3/2015 20:00', 'M/D/YYYY H:mm').valueOf()], PST)).toEqual([1438567200000, 1438610400000]);
    });
    it('should return 3 epochs when dates fall into three days', () => {
      expect((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/1/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('3/3/2015 14:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/30/2014 20:00', 'M/D/YYYY H:mm').valueOf()])).toEqual([1412107200000, 1425391200000, 1438394400000]);
    });
    it('should return same but sorted array if all input dates are ' + 'start of day', () => {
      expect((0, _userStats.prepUniqueDaysByHours)([1438387200000, 1425340800000, 1412035200000])).toEqual([1412035200000, 1425340800000, 1438387200000]);
    });
  });
  describe('calcCurrentStreak', function () {
    it('should return 1 day when today one challenge was completed', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(1);
    });
    it('should return 1 day when today more than one challenge ' + 'was completed', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(1);
    });
    it('should return 0 days when today 0 challenges were completed', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(0);
    });
    it('should return 2 days when today and yesterday challenges were ' + 'completed', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(2);
    });
    it('should return 3 when today and for two days before user was ' + 'active', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 3:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 5:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(2, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(3);
    });
    it('should return 1 when there is a 1.5 day long break and ' + 'dates fall into two days separated by third', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(47, 'hours')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(11, 'hours')).valueOf()]))).toEqual(1);
    });
    it('should return 2 when the break is more than 1.5 days ' + 'but dates fall into two consecutive days', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(40, 'hours')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(2);
    });
    it('should return correct count in default timezone UTC ' + 'given `undefined` timezone', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(1);
    });
    it('should return 2 days when today and yesterday ' + 'challenges were completed given PST', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()], PST), PST)).toEqual(2);
    });
    it('should return 17 when there is no break in given timezone ' + '(but would be the break if in UTC)', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([1453174506164, 1453175436725, 1453252466853, 1453294968225, 1453383782844, 1453431903117, 1453471373080, 1453594733026, 1453645014058, 1453746762747, 1453747659197, 1453748029416, 1453818029213, 1453951796007, 1453988570615, 1454069704441, 1454203673979, 1454294055498, 1454333545125, 1454415163903, 1454519128123, _momentTimezone.default.tz(PST).valueOf()], PST), PST)).toEqual(17);
    });
    it('should return 4 when there is a break in UTC ' + '(but would be no break in PST)', () => {
      expect((0, _userStats.calcCurrentStreak)((0, _userStats.prepUniqueDaysByHours)([1453174506164, 1453175436725, 1453252466853, 1453294968225, 1453383782844, 1453431903117, 1453471373080, 1453594733026, 1453645014058, 1453746762747, 1453747659197, 1453748029416, 1453818029213, 1453951796007, 1453988570615, 1454069704441, 1454203673979, 1454294055498, 1454333545125, 1454415163903, 1454519128123, _momentTimezone.default.utc().valueOf()]))).toEqual(4);
    });
  });
  describe('calcLongestStreak', function () {
    it('should return 1 when there is the only one one-day-long ' + 'streak available', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('9/12/2015 4:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(1);
    });
    it('should return 4 when there is the only one ' + 'more-than-one-days-long streak available', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 3:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 1:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(4);
    });
    it('should return 1 when there is only one one-day-long streak ' + 'and it is today', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(1);
    });
    it('should return 2 when yesterday and today makes longest streak', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(2);
    });
    it('should return 4 when there is a month long break', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/4/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/5/2015 5:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/6/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/7/2015 5:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('11/3/2015 2:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(4);
    });
    it('should return 2 when there is a more than 1.5 days ' + 'long break of (36 hours)', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 15:30', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc('9/12/2015 15:30', 'M/D/YYYY H:mm').add(37, 'hours')).valueOf(), _momentTimezone.default.utc('9/14/2015 22:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/15/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/3/2015 2:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(2);
    });
    it('should return 4 when the longest streak consist of ' + 'several same day timestamps', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 3:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 5:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(2, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc().valueOf()]))).toEqual(4);
    });
    it('should return 4 when there are several longest streaks ' + '(same length)', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('8/3/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 5:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/12/2015 1:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/13/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('10/14/2015 5:00', 'M/D/YYYY H:mm').valueOf()]))).toEqual(4);
    });
    it('should return correct longest streak when there is a very ' + 'long period', () => {
      let cals = [];
      const n = 100;
      for (let i = 0; i < n; i++) {
        cals.push(_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(i, 'days')).valueOf());
      }
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)(cals))).toEqual(n);
    });
    it('should return correct longest streak in default timezone ' + 'UTC given `undefined` timezone', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'days')).valueOf(), _momentTimezone.default.utc(_momentTimezone.default.utc().subtract(1, 'hours')).valueOf()]))).toEqual(2);
    });
    it('should return 4 when there is the only one more-than-one-days-long ' + 'streak available given PST', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('9/11/2015 4:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 3:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 1:00', 'M/D/YYYY H:mm').valueOf()]), PST)).toEqual(4);
    });
    it('should return 3 when longest streak is 3 in PST ' + '(but would be different in default timezone UTC)', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([_momentTimezone.default.utc('9/11/2015 23:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/12/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/13/2015 2:00', 'M/D/YYYY H:mm').valueOf(), _momentTimezone.default.utc('9/14/2015 6:00', 'M/D/YYYY H:mm').valueOf()], PST), PST)).toEqual(3);
    });
    it('should return 17 when there is no break in PST ' + '(but would be break in UTC) and it is current', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([1453174506164, 1453175436725, 1453252466853, 1453294968225, 1453383782844, 1453431903117, 1453471373080, 1453594733026, 1453645014058, 1453746762747, 1453747659197, 1453748029416, 1453818029213, 1453951796007, 1453988570615, 1454069704441, 1454203673979, 1454294055498, 1454333545125, 1454415163903, 1454519128123, _momentTimezone.default.tz(PST).valueOf()], PST), PST)).toEqual(17);
    });
    it('should return a streak of 4 when there is a break in UTC ' + '(but no break in PST)', () => {
      expect((0, _userStats.calcLongestStreak)((0, _userStats.prepUniqueDaysByHours)([1453174506164, 1453175436725, 1453252466853, 1453294968225, 1453383782844, 1453431903117, 1453471373080, 1453594733026, 1453645014058, 1453746762747, 1453747659197, 1453748029416, 1453818029213, 1453951796007, 1453988570615, 1454069704441, 1454203673979, 1454294055498, 1454333545125, 1454415163903, 1454519128123, _momentTimezone.default.utc().valueOf()]))).toEqual(4);
    });
  });
  describe('getUserById', () => {
    const stubUser = {
      findById(id, cb) {
        cb(null, {
          id: 123
        });
      }
    };
    it('returns a promise', () => {
      expect.assertions(3);
      expect(typeof (0, _userStats.getUserById)('123', stubUser).then).toEqual('function');
      expect(typeof (0, _userStats.getUserById)('123', stubUser).catch).toEqual('function');
      expect(typeof (0, _userStats.getUserById)('123', stubUser).finally).toEqual('function');
    });
    it('resolves a user for a given id', done => {
      expect.assertions(4);
      (0, _userStats.getUserById)(_fixtures.mockUserID, _fixtures.mockApp.models.User).then(user => {
        expect(user).toEqual(_fixtures.mockUser);
        expect(user).toHaveProperty('progressTimestamps');
        expect(user).toHaveProperty('completedChallengeCount');
        expect(user).toHaveProperty('completedChallenges');
      }).then(done).catch(done);
    });
    it('throws when no user is found', done => {
      const noUserError = new Error('No user found');
      const throwyUserModel = {
        findById(_, cb) {
          cb(noUserError);
        }
      };
      expect((0, _userStats.getUserById)('not-a-real-id', throwyUserModel).catch(error => {
        expect(error).toEqual(noUserError);
        done();
      }));
    });
  });
});