// JS functions for the make_divelist.html page

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
        var $newDiveRow = $("<tr></tr>", {"class":"dive-entry", "id":diveID,
                                          "dive-group":diveGroup});
        var diveProperties = {
            "dive-id": diveID,
            "dive-name": diveData[i][1],
            // "dive-dd": diveData[i][2], //for all_dives.csv
            "dive-experience": diveData[i][2],
            "dive-predicted-score": diveData[i][3],
            "dive-high-score": diveData[i][4],
            "dive-average-score": diveData[i][5],
            "dive-last-performed": diveData[i][6],
            "dive-selector": diveSelector,
        };
        for (var key in diveProperties) {
	    $newDiveRow.attr(key, diveProperties[key]);
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
    $(clickedDive).toggleClass("selected");
    if ($(clickedDive).hasClass("selected")) { // Add it to the box
        var $entry = $('<span class="selected-dive" id="'+clickedDive.id+'_selected">'+clickedDive.id+' &nbsp; <strong>'+$(clickedDive).attr("dive-name")+'</strong></span>').appendTo("#list-view");

	var $nope = $("<span class='nope'>[remove]</span>").click(function() {
	    $(clickedDive).removeClass("selected");
	    $entry.remove();
	}).appendTo($entry);

	var x = (new Date()).getTime().toString();
	$("<span class='whatever'><input type='radio' checked name='"+x+"'/><label>Voluntary</label> <input type='radio' name='"+x+"'/><label>Optional</label></span>").appendTo($entry);
	// $("<span><input type='radio' checked/><label>Optional</label><input type='radio'/><label>Voluntary</label></span>").append($entry);
	
    } else { // remove it from the box
        $('#'+clickedDive.id+'_selected').remove();
    }
    
    if ($("#list-view").children().length > 0){
        $("#divelist-container").addClass("hide-quicklist"); //todo for dxh: why not just modify #quicklist's properties instead? -jmn    
    } else {
        $("#divelist-container").removeClass("hide-quicklist");
    }
}

function onFilterByDiveGroup(event) { //todo support multiple filter types at once (eg filter by dive group and also by experience)
    // Move highlight
    $("#filter-dive-group").find("a").removeClass("selected");
    $(event.currentTarget).addClass("selected");
        
    var diveGroup = event.currentTarget.getAttribute("dive-group");
    if (diveGroup == "all") {
        console.log("Showing all dives");
        $(".dive-entry").show();
        return;
    }
    console.log("Filtering by dive group:", diveGroup);
    $(".dive-entry").each(function(n,dive) {
        (dive.getAttribute("dive-group") == diveGroup) ? $(dive).show() : $(dive).hide();
    });
}

// Filter by time
// TODO: hard coded for lo-fi; will need fixing for hi-fi
function onFilterByTime(event) {
    if ($("#time-box:checked").length == 1){ // if the box is checked, filter
        console.log("Filtering by time: in the last month");
        $(".dive-entry").each(function(n,dive) {
            (dive.childNodes[6].innerHTML == "03/05/2016") ? $(dive).show() : $(dive).hide();
        });
    } else {                      // else, unfilter   
        console.log("Showing all dives");
        $(".dive-entry").show();
    }
}

// Filter by experience
function onFilterByExperience(event) {
    console.log($("#I know it:checked").length); //todo jmn why is this "I know it"?
    var checked = new Array();
    if ($("#know:checked").length == 1) {
        checked.push("⬤ I know it");
    }
    if ($("#learning:checked").length == 1) {
        checked.push("◐ still learning");
    }
    if ($("#unknown:checked").length == 1) {
        checked.push("◯ Don't know");
    }
    console.log(checked);
    $(".dive-entry").each(function(n,dive) {
        (checked.indexOf(dive.childNodes[2].innerHTML) != -1) ? $(dive).show() : $(dive).hide();
    });
}

function autoGen(param) { //todo actually generate correct list of dives
    
    $(".dive-entry").each(function(n,dive) {
        (n<8) ? toggleDive(dive) : $(dive).show();
    });
    $("#divelist-container").addClass("hide-quicklist");
}


$(document).ready(function() {
    
    // loadDiveData("all_dives.csv");
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $("#filter-dive-group").find("a").click(onFilterByDiveGroup);
    $("#time-box").click(onFilterByTime);
    $("#filter-experience").click(onFilterByExperience);
    
    // Make divelist items sortable/draggable
    //todo make draggable only by arrow (.selected-dive:before)
    $( ".sortable" ).sortable();
    $( ".sortable" ).disableSelection();
});


