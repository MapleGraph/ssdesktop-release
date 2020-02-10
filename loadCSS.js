
var basePath = process.env.basepath;
var scripts = ['assets/css/theme-default/bootstrap.css','assets/css/theme-default/ssweb.css','assets/css/theme-default/font-awesome.min.css'];

function loadScript(url)
{
    var head = document.head;
    var script = document.createElement('link');
    script.type = 'text/css';
    script.rel = 'stylesheet';
    url = basePath+'/'+url;
    script.href = url;

    head.appendChild(script);
}

for(let i=0; i<scripts.length; i++)
{
    loadScript(scripts[i])
}