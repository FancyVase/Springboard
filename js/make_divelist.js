// JS functions for the make_divelist.html page

function loadDiveData(filename) {
    var diveData = getDivesFromCsv(filename);
    populateDivelist(diveData);
}

function getDivesFromCsv(filename) {
    // all_dives.csv cols are: ID, name, DD
    var client = new XMLHttpRequest(); //todo see console warning
    client.open('GET', filename, false);
    client.send();
    var my_csv = client.responseText;
    my_csv = my_csv.split("\n");
    var dives_set = new Array();
    for (var i=0;i<my_csv.length;i++){
        dives_set.push(my_csv[i].split(","));
    }
    return dives_set;
}

function populateDivelist(diveData) {
    var diveSelector = '<a class="selection-circle"></a>';
    for (var i=0; i<diveData.length; i++) {
        var $newDiveRow = $("<tr></tr>", {"class":"dive-entry", "id":diveData[i][0]});
        var diveProperties = {
            "dive-id": diveData[i][0],
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
}

function toggleDive(clicked) {
    console.log("toggling!");
    $("#divelist-container").addClass("hide-quicklist");
    $(clicked).toggleClass("selected");
    if ($(clicked).hasClass("selected")) { // Add it to the box
        $("#list-view").append('<span class="selected-dive" id="'+clicked.id+'_selected">'+clicked.id+' &nbsp; <strong>Dive</strong></span>');
    } else { // remove it from the box
        $('#'+clicked.id+'_selected').remove();
    }
}

$(document).ready(function() {
    
//    loadDiveData("all_dives.csv");
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $(".dive-entry").click(toggleDive);
});


