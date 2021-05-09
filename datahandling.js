var HSpots;

var dirtable = {
    N: 0,
    NNO: 22.5,
    NO: 45,
    ONO: 45 + 22.5,
    O: 90,
    OSO: 90 + 22.5,
    SO: 90 + 45,
    SSO: 90 + 67.5,
    S: 180,
    SSW: 180 + 22.5,
    SW: 180 + 45,
    WSW: 180 + 67.5,
    W: 270,
    WNW: 270 + 22.5,
    NW: 270 + 45,
    NNW: 270 + 67.5
};

function filterwinddir(dirbutton) {
    var winddir = d3.select(dirbutton).property('value');
    d3.selectAll('div.hotspot').attr('style', 'display:none');
    d3.selectAll('div.hotspot.' + winddir).attr('style', '');
    d3.select('#filter-input').property('checked', false);
}

function getWindDirClasses(windDirData) {
    var classes = ['all'];
    windDirs = windDirData.split(',')
    windDirs.forEach(windDir => {
        var end = ConvertDir2Deg(windDir.split('-')[1]);
        var lw = ConvertDir2Deg(windDir.split('-')[0]);
        end = lw > end ? end + 360 : end;
        while (lw <= end) {
            classes.push(Object.keys(dirtable).find(key => dirtable[key] === lw));
            lw = lw + 22.5;
            if (lw == 360) {
                lw = 0;
                end = end - 360;
            }
        }
    });
    return classes.join(" ");
}

// Prüft, ob Windrichtung zum Standort passt
function winddirmatch(winddir, windlocation) {
    var wlstart, wlend, wdir;
    wlstart = ConvertDir2Deg(windlocation.split('-')[0]);
    wlend = ConvertDir2Deg(windlocation.split('-')[1]);
    if (wlstart > wlend) { wlend = wlend + 360 };
    wdir = ConvertDir2Deg(winddir);
    //console.log(winddir, windlocation)
    return (wdir >= wlstart) && (wdir <= wlend);
};

// Konvertiert Windrichtung in Grad
function ConvertDir2Deg(Direction) {
    return dirtable[Direction];
}

function createArc(current_td) {
    var pi = Math.PI;
    var width = 35;
    var height = 35;
    var r_inner = width / 3.4;
    var r_outer = width / 2;

    var vis = current_td.append('svg')
        .attr("width", width)
        .attr("height", height) // Added height and width so arc is visible
        .attr("class", "windarc")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    var arc_background = d3.svg.arc()
        .innerRadius(r_inner)
        .outerRadius(r_outer)
        .startAngle(0)
        .endAngle(2 * pi);
    // add background arc
    vis.append("path")
        .style("fill", "#AAA")
        .attr("d", arc_background);

    var sdeg;
    var edeg;
    var arc = d3.svg.arc()
        .innerRadius(r_inner)
        .outerRadius(r_outer)
        .startAngle(function (d) {
            sdeg = ConvertDir2Deg(d.Wind.split('-')[0])
            return (sdeg * (pi / 180));
        })
        .endAngle(function (d) {
            edeg = ConvertDir2Deg(d.Wind.split('-')[1])
            if (sdeg > edeg) {
                edeg = edeg + 360;
            }
            return (edeg * (pi / 180));
        })

    // Add the foreground arc in orange, currently showing 12.7%.
    var foreground = vis.append("path")
        .style("fill", "rgb(107, 0, 0)")
        .attr("d", arc);
}

function CreateTable() {

    d3.select('.hotspots').remove()

    var panel = d3.select('#panel').append("div").attr("class", "hotspots");


    var hotspot_div = panel.selectAll('div.hotspot')
        .data(HSpots)
        .enter()
        .append("div").attr("class", function(d) {
            return "hotspot " + getWindDirClasses(d.Wind);
        });

    var current_td = hotspot_div.append('header').attr("class", "clearfix")
        .html(function (m) {
            var ret
            ret = "<div class='headline'>" + m.Hotspot + "</div>"
            ret += "<div class='wind'>" + m.Wind + "</div>";
            return ret;
        });

    createArc(current_td);


    hotspot_div.append('div')
        .attr("class", "meteo-widget")
        .html(function (d) {
            var mburl = "<iframe src='https://www.meteoblue.com/de/wetter/widget/three/" + d.lat + "N" + d.long + "_Europe%2FBerlin?geoloc=fixed&nocurrent=0&nocurrent=1&noforecast=0&days=4&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&layout=bright' allowTransparency='true' frameborder='0' scrolling='NO'></iframe>"
            return mburl;
        });

    hotspot_div.append('ul')
        .attr("class", "links clearfix")
        .html(function (m) {
            var ret
            ret = "<li><a href='https://www.google.com/maps/d/viewer?mid=" + m.HotspotURL + "' target='_blank'>Karte</a></li>";
            ret += "<li><a href='https://www.google.de/maps/dir//" + m.lat + "," + m.long + "' target='_blank'>Anfahrt</a></li>";
            ret += "<li><a href='https://windy.com/" + m.lat + "/" + m.long + "?" + m.lat + "," + m.long + ",16' target='_blank'>Windy</a></li>";
            ret += "<li><a href='https://www.meteoblue.com/de/wetter/woche/" + m.lat + "N" + m.long + "E0_Europe%2FBerlin' target='_blank'>Meteoblue</a></li>";
            return ret;
        });
}