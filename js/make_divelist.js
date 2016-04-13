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
        var $entry = $('<span class="selected-dive" id="'+getDiveID(clickedDive)+'_selected" dive-id="'+getDiveID(clickedDive)+'">'+getDiveID(clickedDive)+' &nbsp; <strong>'+$(clickedDive).attr("dive-name")+'</strong></span>').appendTo("#list-view");
        
        var $remove = $("<span class='remove'>[remove]</span>").click(function() {
            toggleDive(clickedDive);
        }).appendTo($entry);

        var x = (new Date()).getTime().toString();
        $("<span class='opt-vol'><input type='radio' checked name='"+x+"'/><label>Voluntary</label> <input type='radio' name='"+x+"'/><label>Optional</label></span>").appendTo($entry);
        // $("<span><input type='radio' checked/><label>Optional</label><input type='radio'/><label>Voluntary</label></span>").append($entry);
	
    } else { // remove it from the box
        $('#'+getDiveID(clickedDive)+'_selected').remove();
    }
    
    ($("#list-view").children().length > 0) ? hideQuicklist() : showQuicklist();
}

function getDiveID(dive) {
    return $(dive).attr("dive-id");
}

function returnFalse() { //todo also move this up if moving var filters
    return false;
}

//todo maybe make this non-global or move to top of file
//filters is a list of functions f(dive) with: //todo update "docstring"
//  input: dive = a html/js object with class dive-entry
//  output: true if dive should be hidden, otherwise false (meaning that dive will be shown if f is the only filter, but if there are other filters, they may cause dive to be shown)
var filters = {
    "diveGroup": returnFalse,
    "time": returnFalse,
    "experience": returnFalse,
};

function applyFilters() {
    $(".dive-entry").each(function(n,dive) {
        for (var key in filters) {
            f = filters[key];
//        for (var i=0; i<filters.length; i++) { //TODO ask dxh is there 'all' in js?
//            f = filters[i];
            if (f(dive)) {
                $(dive).hide();
                return;
            }
        }
        $(dive).show(); //all filters returned false
    });
}

function onFilterByDiveGroup(event) { //todo support multiple filter types at once    // Move highlight
    $("#filter-dive-group").find("a").removeClass("selected");
    $(event.currentTarget).addClass("selected");
        
//    filters = []; //todo don't clear all filters; only clear dive-group filters
    var diveGroup = event.currentTarget.getAttribute("dive-group");
    if (diveGroup == "all") {
        console.log("Showing all dives");
        filters["diveGroup"] = returnFalse;
//        $(".dive-entry").show();
//        return;
    } else {
        console.log("Filtering by dive group:", diveGroup);
        filters["diveGroup"] = (function(dive) {
            return dive.getAttribute("dive-group") != diveGroup;
        });
    }
    applyFilters();
//    $(".dive-entry").each(function(n,dive) {
//        (dive.getAttribute("dive-group") == diveGroup) ? $(dive).show() : $(dive).hide();
//    });
}

// Filter by time
// TODO: hard coded for lo-fi; will need fixing for hi-fi
function onFilterByTime(event) {
    $("#filter-time-dropdown").toggleClass("inactive");
    if ($("#time-box:checked").length == 1){ // if the box is checked, filter
        console.log("Filtering by time: in the last month");
        filters["time"] = (function(dive) {
            return dive.childNodes[6].innerHTML != "03/05/2016";
        });
//        $(".dive-entry").each(function(n,dive) {
//            (dive.childNodes[6].innerHTML == "03/05/2016") ? $(dive).show() : $(dive).hide();
//        });
    } else {                      // else, unfilter   
        console.log("Showing all dives");
        filters["time"] = returnFalse;
//        $(".dive-entry").show();
    }
    applyFilters();
}

// Filter by experience
function onFilterByExperience(event) {
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
    filters["experience"] = (function(dive) {
//        console.log(dive.childNodes[2].innerHTML);
        return !checked.includes(dive.childNodes[2].innerHTML);
//        return checked.indexOf(dive.childNodes[2].innerHTML) == -1;
    });
    applyFilters();
//    $(".dive-entry").each(function(n,dive) {
//        (checked.indexOf(dive.childNodes[2].innerHTML) != -1) ? $(dive).show() : $(dive).hide();
//    });
}

function onSaveButtonClick() {
    alert("Pretend that a 'Save As' dialogue appeared. (This feature is not implemented yet.)");
}
function onExportButtonClick() {
    alert("Pretend this is an exported version of your divelist.  (This feature is not implemented yet.)");
}
function onNewListButtonClick() {
    //TODO add "Autosaving..."
    console.log("Clearing current divelist");
    $(".selected-dive").each(function(n,selectedDive) {
        var dive = $("#"+getDiveID(selectedDive));
        toggleDive(dive);
    });
    $("#divelist-savename").text("Untitled divelist");
}
function onOpenButtonClick() {
    alert("Pretend that an 'Open' dialogue appeared. (This feature is not implemented yet.)");
}

function autoGen(param) { //todo actually generate correct list of dives
    $(".dive-entry").each(function(n,dive) {
        (n<8) ? toggleDive(dive) : $(dive).show();
    });
    hideQuicklist();
}

function showQuicklist() {
    $("#divelist-container").removeClass("hide-quicklist");
}
function hideQuicklist() {
    $("#divelist-container").addClass("hide-quicklist"); //TODO for dxh: why not just modify #quicklist's properties instead? -jmn
}

$(document).ready(function() {
    
    // loadDiveData("all_dives.csv");
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $("#filter-dive-group").find("a").click(onFilterByDiveGroup);
    $("#time-box").click(onFilterByTime);
    $("#filter-experience").find("input").click(onFilterByExperience);
    
    $("#btn-save").click(onSaveButtonClick);
    $("#btn-export").click(onExportButtonClick);
    $("#btn-newlist").click(onNewListButtonClick);
    $("#btn-open").click(onOpenButtonClick);
    
    // Make divelist items sortable/draggable
    //TODO dxh make draggable only by arrow (.selected-dive:before)
    $( ".sortable" ).sortable();
    $( ".sortable" ).disableSelection();
});


