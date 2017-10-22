"use strict";

// vendors modules
const _ = require("lodash");

// libs modules
const beautifyPath = require("./beautifyPath");

/**
 * Get Diff - find difference between 2 array
 * 
 * @param {array} parent1 
 * @param {array} parent2 
 * @returns {array}
 */
module.exports = function(parent1, parent2) {
	
	/**
	 * find difference between 2 array in case-insensitive mode
	 *
	 * @function diff
	 * @param {array} a1 
	 * @param {array} a2 
	 * @returns {array}
	 */
	 
	var diff = function(a1, a2) {
		var a = [],
			ret = [];
		for (var i = 0; i < a2.length; i++) {
			a[a2[i].toLowerCase()] = a2[i];
		}
		for (var i = 0; i < a1.length; i++) {
			if (a[a1[i].toLowerCase()]) {
				delete a[a1[i].toLowerCase()];
			} else {
        ret.push(a1[i]);
			}
		}
		return ret;
	};
	
	/**
	 * Store 2 results: 
	 * result A: files that exist in filesystem but not in the CSPROJ (need to be included)
	 * result A: files that exist in CSPROJ but not in the filesystem (need to be excluded)
	 */	
	var a = _.sortBy(parent1.map(beautifyPath), function (i) { return i.toLowerCase(); });
	var b = _.sortBy(parent2.map(beautifyPath), function (i) { return i.toLowerCase(); });
	
	return {
		includeList: diff(a, b),
		excludeList: diff(b, a)
	};
}