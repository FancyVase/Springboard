
var diveData = new Array();
function loadDiveData(filename) {
    $.ajax({
        type: "GET",
        url: filename,
        dataType: "text",
        contentType: "text/csv;charset=utf-8",
        success: processData
    });

    function processData(my_csv) {
        my_csv = my_csv.split("\n");
        for (var i=0;i<my_csv.length;i++){
            diveData.push(my_csv[i].split(","));
        }
        populateBubbles("Back");

    }
}

function populateBubbles(diveType="Forward") {
//    for (var i=0;i<diveData.length;i++){
//        if (diveData[i][1].substring(0,7) == "Forward"){
////            console.log(diveData[i][2]);
//        }
//    }
        $("#circle-holder").html("");
        $(diveData).each(function(i, dive) {
//	       var $newDiveRow = $("<div></div>", {"class":"circleBase",
//					  "id": dive[0],
//                      "dive-name":dive[1]})
            
            if (dive[1].indexOf(diveType) > -1 && "A" == dive[0].substr(dive[0].length - 1)){
//                console.log(dive[0]);
                var $newDiveBubble = $('<div class="circleBase" id='+dive[0]+' style="left:600px;top:'+(dive[2]*700-700)+'px"><p> '+dive[0]+' </p><p>'+dive[1]+' </p></div>')
               .appendTo("#circle-holder");
            } else if (dive[1].indexOf(diveType) > -1 && "B" == dive[0].substr(dive[0].length - 1)){
//                console.log(dive[0]);
                var $newDiveBubble = $('<div class="circleBase" id='+dive[0]+' style="left:400px;top:'+(dive[2]*700-700)+'px"><p> '+dive[0]+' </p><p>'+dive[1]+' </p></div>')
               .appendTo("#circle-holder");
            } else if (dive[1].indexOf(diveType) > -1 && "C" == dive[0].substr(dive[0].length - 1)){
//                console.log(dive[0]);
                var $newDiveBubble = $('<div class="circleBase" id='+dive[0]+' style="left:200px;top:'+(dive[2]*700-700)+'px"><p> '+dive[0]+' </p><p>'+dive[1]+' </p></div>')
               .appendTo("#circle-holder");
            } else if (dive[1].indexOf(diveType) > -1 && "D" == dive[0].substr(dive[0].length - 1)){
//                console.log(dive[0]);
                var $newDiveBubble = $('<div class="circleBase" id='+dive[0]+' style="left:000px;top:'+(dive[2]*700-700)+'px"><p> '+dive[0]+' </p><p>'+dive[1]+' </p></div>')
               .appendTo("#circle-holder");
            }
        });
        console.log("made 'em");
    $(".circleBase").click(function(){ inspectBubble($(this)) });
//    }
}

function inspectBubble(circle){
    var diveID = circle[0].id;
    $("#dive-inspector").html(diveID);
}

$(document).ready(function() {
    
    loadDiveData("all_dives.csv");
//    console.log("hi");
//    (".dive-entry").click(function() { toggleDive(this) });
});


//        <div class="circleBase" style="left:500px;top:800px">
//            <p> 103c </p>
//            <p>Three Flip Spash </p>
//        </div>