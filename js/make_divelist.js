// JS functions for the make_divelist.html page

//function show(element) { element.css("display", "block"); }
//function hide(element) { element.css("display", "none"); }

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
        var diveData = new Array();
        for (var i=0;i<my_csv.length;i++){
            diveData.push(my_csv[i].split(","));
        }
        populateDivelist(diveData);
    }
}

function populateDivelist(diveData) {
    var diveSelector = '<a class="selection-circle"></a>';
    for (var i=0; i<diveData.length; i++) {
        var diveID = diveData[i][0];
        var diveGroup = diveID.substring(0,1);
//        console.log(diveGroup);
        var $newDiveRow = $("<tr></tr>", {"class":"dive-entry", "id":diveID,
                                          "dive-group":diveGroup});
        var diveProperties = {
            "dive-id": diveID,
            "dive-name": diveData[i][1],
//            "dive-dd": diveData[i][2], //for all_dives.csv
            "dive-experience": diveData[i][2],
            "dive-predicted-score": diveData[i][3],
            "dive-high-score": diveData[i][4],
            "dive-average-score": diveData[i][5],
            "dive-last-performed": diveData[i][6],
            "dive-selector": diveSelector,
        };
        for (var key in diveProperties) {
            var value = diveProperties[key];
            $td = $("<td></td>", {"class":key}).html(value);
            $newDiveRow.append($td);
        }
        $("#dive-database-table").append($newDiveRow);
    }
    
    // Bind click listener for dives
    $(".dive-entry").click(function() { toggleDive(this) });
}

function toggleDive(clickedDive) {
    console.log("toggling:", clickedDive);
    $("#divelist-container").addClass("hide-quicklist"); //todo for dxh: why not just modify #quicklist's properties instead? -jmn
    $(clickedDive).toggleClass("selected");
    if ($(clickedDive).hasClass("selected")) { // Add it to the box
        $("#list-view").append('<span class="selected-dive" id="'+clickedDive.id+'_selected">'+clickedDive.id+' &nbsp; <strong>Dive</strong></span>');
    } else { // remove it from the box
        $('#'+clickedDive.id+'_selected').remove();
    }
}

function onFilterByDiveGroup(event) {
    
    // Move highlight
    $("#filter-dive-group").find("a").removeClass("selected");
    $(event.currentTarget).addClass("selected");
    
//    console.log(event);
    var diveGroup = event.currentTarget.getAttribute("dive-group");
//    console.log(diveGroup);
    if (diveGroup == "all") {
        console.log("Showing all dives");
        $(".dive-entry").show();
//        for (var $dive in $("#dive-database-table").children()) {
//            show($dive);
//        }
        return;
    }
//    var diveGroupToNumber = {"filter_forward": 1, "filter_back": 2,
//                             "filter_inward": 3, "filter_reverse": 4,
//                             "filter_twist": 5};
//    var filterNumber = diveGroupToNumber[id];
    console.log("Filtering by dive group:", diveGroup);
//    console.log($(".dive-entry").attr("dive-group") == diveGroup);
    $(".dive-entry").each(function(n,dive) {
//        console.log(dive.getAttribute("dive-group") == diveGroup);
        (dive.getAttribute("dive-group") == diveGroup) ? $(dive).show() : $(dive).hide();
    });
    
//    for (var dive in $(".dive-entry")) {
//        firstDigit = $(dive).find(".dive-id").text();
//        console.log($(dive));
//        (firstDigit == filterNumber) ? show($(dive)) : hide($(dive));
//    }
}

$(document).ready(function() {
    
//    loadDiveData("all_dives.csv");
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $("#filter-dive-group").find("a").click(onFilterByDiveGroup);
//    $("#filter-dive-group").find("a").click(function() { filterDives(this) });
});
