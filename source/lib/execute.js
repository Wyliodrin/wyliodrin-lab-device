
var spawn = require ('child-process-promise').spawn;

function spawnPrivileged() {
	if (process.geteuid() !== 0) {
		if (!arguments[1]) arguments[1] = [];
		arguments[1].splice(0, 0, '-E', arguments[0]);
		arguments[0] = 'sudo';
	}
	return spawn.apply(this, arguments);
}

module.exports.spawnPrivileged = spawnPrivileged;
module.exports.spawn = spawn;