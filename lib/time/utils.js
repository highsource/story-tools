var moment = require('vis/node_modules/moment');

/**
 * Get the number of milliseconds from the provided arg.
 * @param arg - either Date, range (returns start), string or number
 * @returns milliseconds
 */
getTime = function(arg) {
    if (typeof arg === 'number') {
        return arg;
    }
    if (arg instanceof Date) {
        return arg.getTime();
    }
    if (typeof arg === 'string') {
        return Date.parse(arg);
    }
    if (arg.hasOwnProperty('start')) {
        return getTime(arg.start);
    }
    throw 'cannot call getTime with ' + typeof arg;
};

exports.createRange = function(start, end) {
    if (arguments.length === 1) {
        var other = start;
        if (other.hasOwnProperty('start')) {
            start = other.start;
            end = other.end;
        } else {
            end = start;
        }
    }
    return new Range(getTime(start), getTime(end));
};

exports.rangesEqual = function(a, b) {
    return getTime(a.start) === getTime(b.start) &&
            getTime(a.end) === getTime(b.end);
};

function rangeContains(range, time) {
    return time >= range.start && time < range.end;
}

function Range(start, end) {
    this.start = start;
    this.end = end;
}
Range.prototype.intersects = function(other) {
    if (other.hasOwnProperty('start')) {
        return rangeContains(this, other.start) ||
                rangeContains(this, other.end) ||
                other.start <= this.start && other.end >= this.end;
    } else {
        return rangeContains(this, getTime(other));
    }
};
Range.prototype.toString = function() {
    return new Date(this.start).toUTCString() + " : " + new Date(this.end).toUTCString();
};
Range.prototype.center = function() {
    return Math.floor(this.start + (this.end - this.start) / 2);
};
Range.prototype.width = function() {
    return this.end - this.start;
};
exports.Range = Range;



/**
 * Compute the overall range of provided args. Args must be a sorted array of:
 * date or long, range, object with property containing range
 * @param {type} args
 * @returns range as long
 */
exports.computeRange = function(args, property) {
    if (!Array.isArray(args)) {
        throw 'cannot call computeRange with ' + typeof args;
    }
    if (args.length <= 0) {
        throw 'cannot call computeRange with empty';
    }
    var start = args[0], end = args[args.length - 1], endval = null;
    if (typeof property == 'string') {
        start = start[property];
        end = end[property];
        endval = function(v) { return v[property].end; };
    } 
    if (start.hasOwnProperty('start')) {
        // even if sorted by start time, must check all end times
        start = start.start;
        if (endval === null) {
            endval = function(v) { return v.end; };
        }
        end = start;
        args.forEach(function(a) {
            end = Math.max(end, endval(a));
        });
    }
    return new Range(getTime(start), getTime(end));
};

/** for the given what, find the index in the items that what is closest
 * to. items must be sorted. The lowest closest value possible is returned.
 */
exports.binarySearch = function(items, what) {
    var start = 0;
    var stop = items.length - 1;
    var mid = stop + start / 2 | 0;
    var val;
    if (what < items[0]) {
        return 0;
    }
    if (what > items[stop]) {
        return items.length - 1;
    }
    while ((val = items[mid]) !== what && start < stop) {
        if (what > val) {
            if (what < items[mid + 1]) {
                return mid;
            }
        } else if (what < val) {
            if (what > items[mid - 1]) {
                return mid - 1;
            }
            stop = mid - 1;
        }
        mid = stop + start / 2 | 0;
    }
    return mid;
};

exports.find = function(items, what) {
    if (what < items[0]) {
        return 0;
    }
    for (var i = 0, ii = items.length - 1; i < ii; i++) {
        if (what >= items[i] && what < items[i + 1]) {
            return i;
        }
    }
    return items.length - 1;
};

exports.Events = function() {
    var topics = {};

    // @todo introduce setting topics with arguments and logging/exception
    // on un-fired event

    function event(id) {
        var callbacks, method,
                topic = id && topics[ id ];
        if (!topic) {
            callbacks = jQuery.Callbacks();
            topic = {
                publish: callbacks.fire,
                subscribe: callbacks.add,
                unsubscribe: callbacks.remove
            };
            if (id) {
                topics[ id ] = topic;
            }
        }
        return topic;
    }

    return {
        event: event
    };
};

exports.pickInterval = function(range) {
    var intervals = [
        moment.duration(1, 'seconds').asMilliseconds(),
        moment.duration(1, 'minutes').asMilliseconds(),
        moment.duration(1, 'hours').asMilliseconds(),
        moment.duration(1, 'days').asMilliseconds(),
        moment.duration(1, 'weeks').asMilliseconds(),
        moment.duration(1, 'months').asMilliseconds(),
        moment.duration(1, 'years').asMilliseconds()
    ];
    return intervals[Math.max(exports.find(intervals, range.width()) - 1, 0)];
};

exports.getTime = getTime;
