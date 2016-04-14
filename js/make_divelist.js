// BASIC FUNCTIONS
function returnFalse() { return false; }

//////////////////////////////////////////////////
// GLOBAL VARIABLES

// filters is a dictionary mapping filter types (strings) to boolean functions.
// Each filter function f(dive) takes in a dive (js object) and returns true if
// the dive should be hidden, or false if the filter does not require the dive
// to be hidden.  The dive entries that are shown will be exactly those for 
// which all filter functions return false.
var filters = {
    "diveGroup": returnFalse,
    "time": returnFalse,
    "experience": returnFalse,
};

//////////////////////////////////////////////////
// JS FUNCTIONS FOR make_divelist.html

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
    console.log("toggling:", getDiveID(clickedDive));
    $(clickedDive).toggleClass("selected");
    if ($(clickedDive).hasClass("selected")) { // Add it to the box
        var $entry = $('<span class="selected-dive" id="'+getDiveID(clickedDive)+'_selected" dive-id="'+getDiveID(clickedDive)+'">'+getDiveID(clickedDive)+' &nbsp; <strong>'+$(clickedDive).attr("dive-name")+'</strong></span>').appendTo("#list-view");

	$("<span/>",{"class":"drag-handle", "html": "&nbsp;" || "&#x2195;"}).prependTo($entry);
	
        var $remove = $("<span class='remove'>[remove]</span>").click(function() {
            toggleDive(clickedDive);
        }).appendTo($entry);

        var radioName = (new Date()).getTime().toString() + Math.random().toString(); //todo this is a hack to ensure unique names

        // todo: less stringy, more like $('...', {})
        var $span = $("<span class='opt-vol'></span>");
        $span.append("<input type='radio' class='radio-opt' name='"+radioName+"'/>");
        $span.append("<label>Optional</label>");
        $span.append("<input type='radio' class='radio-vol' checked name='"+radioName+"'/>");
        $span.append("<label>Voluntary</label>");
        $entry.append($span);
//        $("<span class='opt-vol'><input type='radio' checked name='"+x+"'/><label>Voluntary</label> <input type='radio' name='"+x+"'/><label>Optional</label></span>").appendTo($entry);

    } else { // remove it from the box
        $('#'+getDiveID(clickedDive)+'_selected').remove();
    }
    
    ($("#list-view").children().length > 0) ? hideQuicklist() : showQuicklist();
}

function setOptional(dive) {
    //input dive can be a dive-entry or a selected dive
    var selectedDive = $("#"+getDiveID(dive)+"_selected");
    $(selectedDive).find(".radio-opt").attr('checked', true);
}

function getDiveID(dive) {
    return $(dive).attr("dive-id");
}


function applyFilters() {
    $(".dive-entry").each(function(n,dive) {

	var any = function(predicate, list) {
	    $(list).each(function(index, x) {
		if(predicate(x)) {
		    return true;
		}
	    });
	    return false;
	};
	var all = function(predicate, list) {
	    $(list).each(function(index, x) {
		if(!predicate(x)) {
		    return false;
		}
	    });
	    return true;
	};
	
        for (var key in filters) { //TODO ask dxh is there 'all' or 'any' in js?
	    // dxh: not as far as I know; see above.
            f = filters[key];
            if (f(dive)) {
                $(dive).hide();
                return;
            }
        }
        $(dive).show(); //all filters returned false
    });
}

function onFilterByDiveGroup(event) {
    // Move highlight
    $("#filter-dive-group").find("a").removeClass("selected");
    $(event.currentTarget).addClass("selected");
        
    var diveGroup = event.currentTarget.getAttribute("dive-group");
    if (diveGroup == "all") {
        console.log("Showing all dives");
        filters["diveGroup"] = returnFalse;
    } else {
        console.log("Filtering by dive group:", diveGroup);
        filters["diveGroup"] = (function(dive) {
            return dive.getAttribute("dive-group") != diveGroup;
        });
    }
    applyFilters();
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
    } else {                      // else, unfilter   
        console.log("Showing all dives");
        filters["time"] = returnFalse;
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
        return !checked.includes(dive.childNodes[2].innerHTML);
    });
    applyFilters();
}

function onSaveButtonClick() {
    alert("Pretend that a 'Save a copy as...' dialogue appeared. (This feature is not implemented yet.)");
}
function onExportButtonClick() {
    alert("Pretend this is an exported version of your divelist.  (This feature is not implemented yet.)");
}

function animate_autosave(fn_when_finished) {
        $("#autosaving").show(0,
			  function() {
			      setTimeout(function(){
				  $("#autosaving").hide(0, fn_when_finished);
			      }, 1000)});
}

function onNewListButtonClick() {
    // dxh: this is a mockup animation
    animate_autosave(function() {
        console.log("Clearing current divelist");
        $(".selected-dive").each(function(n,selectedDive) {
            var dive = $("#"+getDiveID(selectedDive));
            toggleDive(dive);
        });
        $("#divelist-savename").text("Untitled divelist");
	
    });

}

function onLoadDropdownClick() {
    alert("Pretend that this dropdown is populated with your saved lists. (This feature is not implemented yet.)");
}

function alertNotImplemented() {
    alert("(This feature is not implemented yet.)");
}

function autoGen(param) { //todo actually generate correct list of dives
    $(".dive-entry").each(function(n,dive) {
        (n<11) ? toggleDive(dive) : $(dive).show();
        (n<6) ? setOptional(dive) : null; //todo lazy hack
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
    
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $("#filter-dive-group").find("a").click(onFilterByDiveGroup);
    $("#time-box").click(onFilterByTime);
    $("#filter-experience").find("input").click(onFilterByExperience);
    
    $("#btn-save").click(onSaveButtonClick);
    $("#btn-export").click(onExportButtonClick);
    $("#btn-newlist").click(onNewListButtonClick);
    $("#btn-load").mousedown(onLoadDropdownClick); //todo change id (not a button)
    
    $("#ip-search-by-name").click(alertNotImplemented);
    $(".navbar").find("a").click(alertNotImplemented);
    
    // Make divelist items sortable/draggable
    $( ".sortable" ).sortable({"handle" : ".drag-handle"});
    $( ".sortable" ).disableSelection();
});

// TODO: Make entries in the user's list of dives have more consistent spacing. That is, the dive names should all line up vertically and so on via a table structure, or by automatically setting the widths via jquery.


