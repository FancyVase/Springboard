var diveData = new Array();
var selectedId = "";

var position = {
    "Straight": "A",
    "Pike": "B",
    "Tuck": "C",
    "Free": "D"
};

var unabbreviate_position = {
    "A": "Straight",
    "B": "Pike",
    "C": "Tuck",
    "D": "Free"
};

function loadDiveData(filename) {
    $.ajax({
        type: "GET",
        url: filename,
        dataType: "text",
        contentType: "text/csv;charset=utf-8",
        success: processData
    });

    function processData(my_csv) {
        var lines = my_csv.split("\n");

        $(lines).each(function (i, line) {
            var attributes = line.split(",");
            if (attributes.length == 3) {
                diveData.push({
                    "dive-id": attributes[0],
                    "dive-name": pretty_name(attributes[1]),
                    "dive-difficulty": attributes[2]
                });
            }
        });

	$("ul.dive-filters li").eq(1).click();
        render_graph(1);


	
        // TODO: uncomment the next line.
        $("#graph").hide().show(1000);
        // populateBubbles("Back");

    }
}

function pretty_name(str) {
    var ret = str;
    ret = ret.replace(/(\d) 1\/2/g, " $1&frac12;");
    ret = ret.replace(/ 1\/2/g, ' &frac12;');
    return ret;
}

function populateBubbles(diveType) {

    $("#" + diveType).blur(); // remove focus

    // highlight current button
    $("#" + diveType).addClass("active-btn")
        .siblings('[type="button"]')
        .removeClass('active-btn');

    $("#circle-holder").html("");
    $(diveData).each(function (i, dive) {
        //	       var $newDiveRow = $("<div></div>", {"class":"circleBase",
        //					  "id": dive["dive-id"],
        //                      "dive-name":dive["dive-name"]})

        if (!dive["dive-name"]) {
            return;
        }
        if (dive["dive-name"].indexOf(diveType) > -1 && "A" == get_dive_position(dive)) {
            //                console.log(dive["dive-id"]);
            var $newDiveBubble = $('<div class="circleBase" id=' + dive["dive-id"] + ' style="left:600px;top:' + (dive["dive-difficulty"] * 700 - 700) + 'px"><p> ' + dive["dive-id"] + ' </p><p>' + dive["dive-name"] + ' </p></div>')
                .appendTo("#circle-holder");
        } else if (dive["dive-name"].indexOf(diveType) > -1 && "B" == get_dive_position(dive)) {
            //                console.log(dive["dive-id"]);
            var $newDiveBubble = $('<div class="circleBase" id=' + dive["dive-id"] + ' style="left:400px;top:' + (dive["dive-difficulty"] * 700 - 700) + 'px"><p> ' + dive["dive-id"] + ' </p><p>' + dive["dive-name"] + ' </p></div>')
                .appendTo("#circle-holder");
        } else if (dive["dive-name"].indexOf(diveType) > -1 && "C" == get_dive_position(dive)) {
            //                console.log(dive["dive-id"]);
            var $newDiveBubble = $('<div class="circleBase" id=' + dive["dive-id"] + ' style="left:200px;top:' + (dive["dive-difficulty"] * 700 - 700) + 'px"><p> ' + dive["dive-id"] + ' </p><p>' + dive["dive-name"] + ' </p></div>')
                .appendTo("#circle-holder");
        } else if (dive["dive-name"].indexOf(diveType) > -1 && "D" == get_dive_position(dive)) {
            //                console.log(dive["dive-id"]);
            var $newDiveBubble = $('<div class="circleBase" id=' + dive["dive-id"] + ' style="left:000px;top:' + (dive["dive-difficulty"] * 700 - 700) + 'px"><p> ' + dive["dive-id"] + ' </p><p>' + dive["dive-name"] + ' </p></div>')
                .appendTo("#circle-holder");
        }
    });
    console.log("made 'em");
    $(".circleBase").click(function () {
        inspectBubble($(this))
    });
    //    }
}

function dive_info_hide() {
    $(".dive-info").slideUp("fast");
    $(".selected").removeClass("selected");
}

function inspectBubble(circle) {
    var diveID = circle[0].id;
    $("#diveID").html("Dive ID: " + diveID);
    $("#diveName").html("Dive Name: " + getDiveData(diveID)[1]);
    $("#diveDD").html("Degree of Difficulty: " + getDiveData(diveID)[2]);
    $("#diveScores").html("Your average score: 42");
    $("#addDive").html("Add dive to current List &raquo;");
}

function getDiveData(diveID) {
    for (var i = 0; i < diveData.length; i++) {
        if (diveData[i]["dive-id"] == diveID) {
            return diveData[i];
        }
    }
}


function get_dive_position(diveObject) {
    return diveObject["dive-id"].slice(-1);
}

function render_graph(group_number) {
    $(".dive-bubble").remove();

    if (!$("#axis").svg("get")) {
        $("#axis").svg();
        $("#graph").svg();

    }
    var $axis = $("#axis").svg("get");
    var $svg = $("#graph").svg("get");





    var should_be_shown;
    if (!group_number) {
        should_be_shown = function (dive) {
            return true;
        };
    } else {
        should_be_shown = function (dive) {
            //console.log(dive["dive-id"].substr(0,1));
            return (group_number.toString() == dive["dive-id"].substr(0, 1));
        };
    }





    var margin = {
        "top": 64 + $(".navbar").height() + $(".dive-filter-group").height(),
        "left": 32
    };


    var ww = $("#graph").width();
    var hh = $("#graph").height();


    $("#graph").addClass("unselectable");
    // background
    $svg.rect(margin.left * 2, margin.top - 64,
        ww - margin.left * 0, hh, {
            fill: "#acf",
            class: "swimmingpool"
        });


    $axis.rect(0, 0,
        margin.left * 2, hh, {
            fill: "#fff",
            opacity: 0.9
        });

    // horizontal grid
    var min_difficulty = 1;
    var max_difficulty = 4.3;
    var dy = (hh - margin.top * 2) / (max_difficulty - min_difficulty);


    var q = 10;
    for (var i = min_difficulty * q; i <= max_difficulty * q; i += 1) {

        if (i % q == 0) {
            $svg.line(margin.left * 2 - 8, margin.top + (i / q - min_difficulty) * dy,
                ww - margin.left * 0, margin.top + (i / q - min_difficulty) * dy, {
                    stroke: "#fff" || "#222",
                    strokeWidth: 3,
                    opacity: 0.8
                });

            $axis.text(margin.left * 2 - 16,
                margin.top + (i / q - min_difficulty) * dy + 3, (i / q).toString(), {
                    fontFamily: "Lato",
                    fontSize: 24,
                    textAnchor: "end",
                    fill: "#666" || "#222"
                });
        } else {
            $svg.line(margin.left * 2, margin.top + (i / q - min_difficulty) * dy,
                ww - margin.left * 0, margin.top + (i / q - min_difficulty) * dy, {
                    stroke: "#fff" || "#222",
                    strokeWidth: 2,
                    strokeDashArray: "2,2"
                });


            $axis.text(margin.left * 2 - 8,
                margin.top + (i / q - min_difficulty) * dy + 3, (i / q).toString(), {
                    fontFamily: "Lato",
                    fontSize: 14,
                    textAnchor: "end",
                    fill: "#666" || "#222"
                });
        }

    }


    // LEGEND TEXT: DEGREE OF DIFFICULTY
    $axis.text(margin.left * 2 - 40 + 6,
        margin.top / 2 + 28 + 64,
        "D.D" || "DEGREE OF", {
            fontFamily: "Lato",
            fontSize: 13,
            textAnchor: "end",
            fill: "#666"
        });
    $axis.text(margin.left * 2 - 40,
        margin.top / 2 + 28 + 14,
        "" && "DIFFICULTY", {
            fontFamily: "Lato",
            fontSize: 13,
            textAnchor: "end",
            fill: "#666"
        });

    $axis.line(margin.left * 2, margin.top - 64,
        margin.left * 2, hh, {
            stroke: "#000",
            strokeWidth: 1
        });


    // LEGEND TEXT: DIVE POSITION

    var dx = (ww - margin.left - 64) / (4);


    // var ddx = (ww-margin.left)/(2*4+1);
    // for(var i=0; i<4;i++) {
    // 	$svg.text((2*i+1.25)*ddx,
    // 		  margin.top - 12,
    // 		  ["STRAIGHT","PIKE","TUCK","FREE"][i],
    // 		  {fontFamily: "Lato",
    // 		   fontSize: 13,
    // 		   textAnchor: "middle",
    // 		   fill : "#666"
    // 		  }
    // 		 );
    // }




    // ------- TABULATE THE DIVES TO DRAW THEM WELL
    var count = {};

    $(diveData).each(function (i, dive) {

        if (should_be_shown(dive)) {
            var pos = get_dive_position(dive);
            var dd = dive["dive-difficulty"];
            count[dd] = count[dd] || {};
            count[dd][pos] = count[dd][pos] || 0;
            count[dd][pos] += 1;
        }
    });

    // ------ DRAW DIVE BUBBLES
    var w = dx * 0.9;
    var seen = {};


    var bin = {
        "A": 0,
        "B": 1,
        "C": 2,
        "D": 3
    };

    $(diveData).each(function (_, dive) {
        if (should_be_shown(dive)) {
            var pos = get_dive_position(dive);
            var dd = dive["dive-difficulty"];

            seen[dd] = seen[dd] || {};
            seen[dd][pos] = seen[dd][pos] || 0;

            var i = seen[dd][pos];

            var $div = $("<div/>", {
                    "class": "dive-bubble unselectable"
                })
                .addClass(unabbreviate_position[pos])
                .appendTo("#graph")
                .append("<span class='dive-id'>" + dive["dive-id"] + "</span>")
                .append(" " + dive["dive-name"])
                .css({
                    "width": (w / count[dd][pos] - 4).toString() + "px"
                });



            $div.css({
                "top": margin.top + dy * (dd - min_difficulty),
                "left": 2 * margin.left + 16 + bin[pos] * dx + seen[dd][pos] / count[dd][pos] * w
            });


            seen[dd][pos] += 1;
        }
    });

    // Position the dive filters

    $(".dive-filter-group")
        .css("top", $(".navbar").outerHeight())
        .css('left', (margin.left + 34) * 0 + "px");

    ;
    $(window).scroll();

    // RESIZE THE DIVE VIEWING WINDOW

    $(document).click(function (event) {
        if ($(event.target).is(".dive-bubble")) {

            var id = $(event.target).children()[0].innerText;
            selectedID = id;
            var name = getDiveData(id)['dive-name'];
            var difficulty = getDiveData(id)['dive-difficulty'];
            var score = Math.round(difficulty * (Math.floor(Math.random() * (30 - 20)) + 20)); // lol

            $(".dive-info").slideDown("fast")
                .removeClass("inert")
                .html("<p><h2>" + id + " " + name + "</h2>Degree of Difficulty: " + difficulty + "<br/>Your average score: " + score + "<br/><button onclick='addDiveToCurrentList()'>Add dive to current divelist &raquo;</button> </p><iframe width='100%' height='200' src='https://www.youtube.com/embed/V9AZVya-N5Q' frameborder='0' allowfullscreen></iframe>");

            $(".selected").removeClass("selected");
            $(event.target).addClass("selected");
        } else if (!$(event.target).is(".dive-info")) {
            dive_info_hide();
        }
    });

    //$(".scrolling").width($(window).width());
    $(".scrolling").css("width", $(window).width());
    $(".scrolling").css("height", $(window).height());


}

function addDiveToCurrentList() {
    $(".dive-info button").val("Added!");
    console.log("adding!");
    if (localStorage.divesToAdd != undefined) {
        localStorage.divesToAdd = localStorage.divesToAdd + "," + selectedID;
    } else {
        localStorage.divesToAdd = selectedID;
    }
}


function create_dive_filters() {
    var groups = ["All dives", "Forward", "Back", "Reverse", "Inward", "Twist"];

    $(groups).each(function (i, group) {
        $li = $("<li/>")
            .html(group)
            .appendTo("ul.dive-filters");
        $li.click(function () {
            $(".current").removeClass("current");
            $(this).addClass("current");
            render_graph(i);
        });
    });


}

$(document).ready(function () {

    loadDiveData("all_dives.csv");

    
    create_dive_filters();
    console.log("hi");

    $(window).scroll(function () {
        $("#axis").css('left', $(window).scrollLeft() + 'px');
    });

    // Click-and-drag scrolling
    // by Josh Parrett
    // http://codepen.io/JTParrett/pen/rkofB
    var curYPos = 0,
        curXPos = 0,
        curDown = false;

    window.addEventListener('mousemove', function (e) {
//        console.log("yo");
        if (curDown === true) {
            window.scrollTo(document.body.scrollLeft + (curXPos - e.pageX), document.body.scrollTop + (curYPos - e.pageY));
        }
    });

    $(window).on("mousedown",
        function (e) {
            curDown = true;
            curYPos = e.pageY;
            curXPos = e.pageX;
            $(".swimmingpool").addClass("grabbing");
        }
    );

    $(window).on("mouseup",
        function (e) {
            curDown = false;
            $(".swimmingpool").removeClass("grabbing");
        }
    );
});
