var path = require('path');
var fs = require('fs');
var less = require('less');
var colors = require('colors');

module.exports = function(cwd, args) {
    var config = {},
        ps = [];
    var fromDir = args._[0];
    var destDir = args._[1];
    fromDir = path.join(cwd, fromDir);
    destDir = path.join(cwd, destDir);

    fs.exists(fromDir, function(exist) {
        if (!exist) {
            console.log('Error : Dir ' + fromDir + ' does not exist!');
            return;
        };
        var configPath = path.join(fromDir, 'fcss.config.json');
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath).toString());
            if (config.paths && typeof config.paths == 'object' && config.paths.hasOwnProperty('length')) {
                config.paths.forEach(function(p) {
                    ps.push(path.join(fromDir, p));
                });
                config.paths = ps;
            };
        } else {
            fs.writeFile(configPath, '{}', function(err) {
                if (err) console.log(err);
            });
        }
        var destExist = fs.existsSync(destDir);
        if (!destExist) {
            fs.mkdir(destDir);
        };
        fs.watch(fromDir, function(event, filename) {
            var basename = passfileter(filename);
            if (basename) {
                var fileDir = path.join(fromDir, filename);
                fs.createReadStream(fileDir)
                    .on('error', function(err) {
                        if (err) {
                            console.log(err);
                        };
                    })
                    .on('data', function(data) {
                        var srcString = data.toString();
                        less.render(srcString, config, function(e, output) {
                            if (e) {
                                console.log(e);
                            } else {
                                var destString = output.css;
                                fs.writeFile(path.join(destDir, basename + '.css'), destString, function(err) {
                                    if (err) console.log(err);
                                });
                            }
                        });
                    })
            }
        });
        console.log('fcss is watching ' + fromDir.green);
    })

}

function passfileter(filename) {
    var extname = path.extname(filename);
    //暂且只支持less
    var filter = ['.less'];

    for (var i = 0; i < filter.length; i++) {
        if (filter[i] == extname) {
            return path.basename(filename, extname);
        };
    };

    return false;
}
