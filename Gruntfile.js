module.exports = function(grunt) {

	grunt.initConfig({
		pkg:grunt.file.readJSON("package.json"),
		uglify:{
			options: {
		      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
		        '<%= grunt.template.today("yyyy-mm-dd") %> */'
		    },
			bulid:{
				src:"src/inputSelectTree.js",
				dest:"dest/inputSelectTree.min.js"
			}
		},
		wiredep:{
			task:{
				src: ['test/index.html'],
        		ignorePath:  /\.\.\//
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-wiredep');

	grunt.registerTask('default', ["uglify","wiredep"]);
		
}