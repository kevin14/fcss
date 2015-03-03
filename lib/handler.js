var path = require('path');
var fs = require('fs');
var less = require('less');

module.exports = function(cwd, args) {

    var fromDir = args._[0];
    var destDir = args._[1];

    fromDir = path.join(cwd, fromDir);
    destDir = path.join(cwd, destDir);

    fs.exists(fromDir, function(exist) {
        if (!exist) {
            console.log('Error : Dir ' + fromDir + ' does not exist!');
            return;
        };
        var destExist = fs.existsSync(destDir);
        if (!destExist) {
        	fs.mkdir(destDir);
        };
        fs.watch(fromDir, function(event, filename) {
        	var basename = passfileter(filename);
            if (basename) {
                var fileDir = path.join(fromDir, filename);
                fs.createReadStream(fileDir)
                	.on('error',function(err){
                		console.log(err);
                	})
                    .on('data', function(data) {
                        var srcString = data.toString();
                        less.render(srcString, function(e, output) {
                        	if (e) {
                        		console.log(e);
                        	};
                        	var destString = output.css;
                        	fs.writeFile(path.join(destDir,basename+'.css'),destString,function(err){
                        		console.log(err);
                        	});
                        });
                    })
            }
        })
    })

}

function passfileter(filename) {
    var extname = path.extname(filename);
    //暂且只支持less
    var filter = ['.less'];

    for (var i = 0; i < filter.length; i++) {
        if (filter[i] == extname) {
            return path.basename(filename,extname);
        };
    };

    return false;
}
