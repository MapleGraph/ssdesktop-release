const os = process.env.os;
var basepath = process.env.basepath;
let dbPath = basepath
if (dbPath.indexOf('app.asar') > -1 || os === 'WINDOWS') {
    dbPath = dbPath.replace('app.asar', '')
}
dbPath += '/ssDB';


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);
var scripts = [
		// 'assets/js/libs/jquery/jquery-1.11.2.min.js',
		// 'assets/js/libs/jquery/jquery-migrate-1.2.1.min.js',
		// 'assets/js/libs/bootstrap/bootstrap.min.js',
		// 'assets/js/libs/DataTables/jquery.dataTables.min.js',
		// 'assets/js/libs/bootstrap-table/dist/bootstrap-table.min.js',
		// 'assets/js/libs/bootstrap-table/dist/extensions/filter-control/bootstrap-table-filter-control.min.js',
		// 'assets/js/libs/bootstrap-table/src/extensions/editable/bootstrap-table-editable.js',
		// 'assets/js/libs/bootstrap-datepicker/bootstrap-datepicker.js',
		// 'assets/js/libs/bootstrap-datepicker/daterangepicker.js',
		// 'assets/js/libs/bootstrap-datepicker/bootstrap-datetimepicker.js',
		// 'assets/js/libs/bootstrap-datepicker/bootstrap-timepicker.js',
		// 'assets/js/libs/spin.js/spin.min.js',
		// 'assets/js/libs/autosize/jquery.autosize.min.js',
		// 'assets/js/libs/moment/moment.min.js',
		// 'assets/js/libs/flot/jquery.flot.min.js',
		// 'assets/js/libs/flot/jquery.flot.time.min.js',
		// 'assets/js/libs/flot/jquery.flot.resize.min.js',
		// 'assets/js/libs/flot/jquery.flot.orderBars.js',
		// 'assets/js/libs/flot/jquery.flot.pie.js',
		// 'assets/js/libs/flot/curvedLines.js',
		'assets/js/libs/jquery-knob/jquery.knob.min.js',
		'assets/js/libs/sparkline/jquery.sparkline.min.js',
		'assets/js/libs/nanoscroller/jquery.nanoscroller.min.js',
		'assets/js/libs/toastr/toastr.js',
		'assets/js/core/socket.js',
		'jobs/kernel.js'
];


function loadScript(url)
{
    var body = document.head;
    var script = document.createElement('script');
	script.type = 'text/javascript';
	url = basePath+'/'+url;
    script.src = url;
    body.appendChild(script);
}

for(let i=0; i<scripts.length; i++)
{
    loadScript(scripts[i])
}

