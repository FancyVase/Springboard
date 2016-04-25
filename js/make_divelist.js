// BASIC FUNCTIONS
function returnFalse() { return false; }

//todo get rid of alerts
//todo add counting thing for list view (how many of each type of dive)

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

// DIVES
var dive_database = [];
var divelist = [];
var dive_attributes = ["dive-id",
		       "dive-name",
		       "dive-experience",
		       "dive-predicted-score",
		       "dive-high-score",
		       "dive-average-score",
		       "dive-last-performed"];

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
        populateDiveDatabase(diveData);
	drawDiveDatabase();

	// todo: debug to populate divelist
	$("#quicklist a")[0].click();
	$("#list-view").hide();
	$("#chart-view").show();
    }
}

function populateDiveDatabase(diveData) {
    // dxh: creating model-view distinction

    $(diveData).each(function(i, datum) {
	var map = {};
	$(dive_attributes).each(function(j, key) {
	    map[key] = datum[j];
	});
	map["diveGroup"] = map["dive-id"].substring(0,1);
	
	dive_database.push(map);
    });
}

function drawDiveDatabase(database) {
    //todo make dive-id be a real column (formatting)

    if(typeof(database) === "undefined") {
	database = dive_database; // global variable as default
    }

    $(database).each(function(i, dive) {
	var $newDiveRow = $("<tr></tr>", {"class":"dive-entry",
					  "id": dive["dive-id"],
                                          "dive-group":dive["diveGroup"]})
	    .appendTo("#dive-database-table");
	//$("#dive-database-table").append($newDiveRow);



	for(var key in dive) {
	    $newDiveRow.attr(key, dive[key]);
         //   var value = dive[key];
         //   $td = $("<td></td>", {"class":key}).html(value);
         //   $newDiveRow.append($td);
	}
	
	var $diveSelector = $('<a/>',{"class":"selection-circle"});

	var $td = $("<td/>").appendTo($newDiveRow);

	$("<h4/>",{"class":"dive-name",
		   "html" : dive["dive-name"]})
	    .prepend(
		"<div class='dive-id'>"+dive["dive-id"]+"</div>"
	    )
	    .appendTo($td);

	
	$details = $("<span/>", {"class":"nondescript"});

	if(dive["dive-experience"].match(/I know/i)) {
	    
	    $("<span/>", {"class" : "known known-well"} ).append("Known well")
		.appendTo($details);

	}
	else if(dive["dive-experience"].match(/learn/i)) {
	    
	    $("<span/>", {"class" : "known known-ok"} ).append("Learning")
		.appendTo($details);

	}
	else {
	    
	    $("<span/>", {"class" : "known known-not"} ).append("Don't know")
		.appendTo($details);
	}

	
	    
	if(dive["dive-last-performed"]) {
	    // DXH todo: measure time in words 'Last March'
	    // mention meet name and/instead of time
	    $details.append("<span class='last-performed'>" + dive["dive-last-performed"]+"</span>"); 
	}
	$details.appendTo($td);


	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-average-score"]){
	    $td.append("<span class='score'>"+dive["dive-average-score"]+"</span>");
	    $("<span/>",{"class":"scoring"})
		.html("Average")
		.appendTo($td);
	
	}

	// todo: most recent score?
	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-high-score"]) {
	    $td.append("<span class='score'>"+dive["dive-high-score"]+"</span>");
	    $("<span/>",{"class":"scoring"})
	    .html("Best")
	    .appendTo($td);

	}

	
	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-predicted-score"]) {
	    $td.append("<span class='score'>"+dive["dive-predicted-score"]+"</span>");
	    $("<span/>",{"class":"scoring"})
	    .html("Predicted")
	    .appendTo($td);

	}

	$td = $("<td/>",{"class":"selector"}).appendTo($newDiveRow);
	$td.append($diveSelector);
    });
        
    // Bind click listener for dives
    $(".dive-entry").click(function() { toggleDive(this) });
}



/// ------------------- DRAW DIVELIST



/// ------------------- MANIPULATE DIVELIST

function get_dive_attributes(htmlObject) {
    // Return a hash of the html object's dive-related attributes, if any.
    var attributes = {};
    $(dive_attributes).each(function(_, k) {
	if($(htmlObject).attr(k)) {
	    attributes[k] = $(htmlObject).attr(k);
	}
    });
    return attributes;
}
function copy_dive_attributes(dive1, dive2) {
    // Copy the dive attributes from dive1 to dive2, overwriting
    // any dive attributes that already exist.
    $(dive_attributes).each(function(_, k) {
	if($(dive1).attr(k)) {
	    $(dive2).attr(k, $(dive1).attr(k));
	}
    }); 
}

function is_same_entry(entry1, entry2) {
    // Return true if two entries in the divelist are the same.
    var key_attributes = ["dive-id", "dive-name"];
    $(key_attributes).each(function(_, key) {
	if(entry1[key] != entry2[key]) {
	    return false;
	}
    });
    return true;
}

function is_match(clickedDive, entry) {
    // Given an html clickedDive and a corresponding entry from the
    // backend divelist, returns true if the two dives are the same.

    // attributes that don't change while you're on the page.
    // for example, excludes vol/opt and dive order

    // todo: perhaps include others, such as height (!)
    var static_attributes = ["dive-id", "dive-name"];

    //  $(clickedDive).attr(key) && entry[key]
    var ret = true;
    $(static_attributes).each(function(_, key) {
	if($(clickedDive).attr(key) != entry[key]) {
	    ret = false;
	}
	
    });
    return ret;
}

function divelist_lookup(clickedDive) {
    // Given an html clickedDive, finds the corresponding javascript
    // entry in the divelist. Returns the entry if found; otherwise
    // returns null.

    var ret = null;
    $(divelist).each(function(_, entry) {
	if(is_match(clickedDive, entry)) {
	    ret = entry; //todo why is this set if it will then return nothing?
	    return; //todo why is this returning nothing?
	}});
    return ret; //todo WHAT IS EVEN GOING ON IN THIS FUNCTION @dxh
    //oh jk it's a lambda function but the tabbing is just weird
}



function divelist_redraw() {

    // Render the list of dives in HTML.
   
    $("#list-view").html("");
    $("#chart-view").html("");


    function add_radio_buttons($entry, is_chart) {
	var radioName = (new Date()).getTime().toString() + Math.random().toString(); //todo this is a hack to ensure unique names

	// todo: less stringy, more like $('...', {})
	// todo: keep track of radio buttons in divelist

	/// -------- CREATE OPT/VOL RADIO BUTTONS
	var $span = $("<span class='opt-vol'></span>");
	$("<input/>", {"type" : "radio",
		       "class" : "radio-opt",
		       "name" : radioName})
	    .click(function() {
		var entry = divelist_lookup($entry);
		entry["dive-willing"] = "optional";
		$entry.attr("dive-willing","optional");
	    }).appendTo($span);
	
	$span.append("<label>Optional</label>");
	if(is_chart) {
	    $span.append("<br/>");
	}
	$("<input/>", {"type" : "radio",
		       "class" : "radio-vol",
		       "name" : radioName})
	    .click(function() {
		var entry = divelist_lookup($entry);
		entry["dive-willing"] = "voluntary";
		$entry.attr("dive-willing","voluntary");
	    }).appendTo($span);
	
	$span.append("<label>Voluntary</label>");
	$entry.append($span);
    };


    
    // FOR THE CHART VIEW
    // $("#list-view").hide(); // todo: this is a debug statement

    var groups = ["fwd", "back", "reverse", "inward", "twist"]; //todo why not "forward"? @dxh
    var $chart = $("<table/>", {"class" : "chart"}).appendTo("#chart-view");

    var $tr = $("<tr/>",{"class" : "headerRow"}).appendTo($chart)
	.append("<td></td>")
    	.append("<td>Optional</td>")
    	.append("<td>Voluntary</td>")
    ;
    $(groups).each(function(_, group){
	var $tr = $("<tr/>",{"class" : group}).appendTo($chart);
	var $th = $("<th/>").appendTo($tr).html(group);
	var $td = $("<td/>", {"class" : "optional"}).appendTo($tr);
	var $td = $("<td/>", {"class" : "voluntary"}).appendTo($tr);
    });


    $(divelist).each(function(i, entry){
	var group = groups[entry["dive-id"].substr(0,1)-1]; // haaaaaack todo
	var willing = entry["dive-willing"];

	var $entry = $("<span/>", {"class" : "selected-dive"});
	$entry.append("<strong>"+entry["dive-id"]+"</strong>&nbsp;&nbsp;");
	$entry.append(entry["dive-name"]);

	$("<button/>",{"class":"toggle-willing",
		      "html" : willing == "optional" ? "Make Voluntary &raquo;" : "&laquo; Make Optional"}).appendTo($entry);
	
	$chart
	    .find("."+group)
	    .find("."+willing)
	    .append($entry);
    });

    
    // FOR THE LIST VIEW
    $(divelist).each(function(i, entry) {
	var dive_id = entry["dive-id"];
	var $entry = $("<span/>", {"class" : "selected-dive",
				   "id" : dive_id+"_selected", // todo: perhaps just use dive id, and add 'selected' as a class
				   "dive-id" : dive_id
				  })
	    .append(dive_id)
	    .append("&nbsp;")
	    .append("<strong>"+entry["dive-name"]+"</strong>")
	    .appendTo("#list-view");
	
	// copy_dive_attributes(clickedDive, $entry); //todo rm?
 
	$(dive_attributes).each(function(_, key) {
	    $entry.attr(key, entry[key]);
	});
	
	$entry.attr("dive-order", entry["dive-order"] || i); // todo: possibly just use the looping var "i". 

	
	$("<span/>",{"class":"drag-handle", "html": "&nbsp;" || "&#x2195;"}).prependTo($entry);


	var $remove = $("<span class='remove'>[remove]</span>").click(function() {
	    divelist_remove_dive($entry);
	}).appendTo($entry);

	add_radio_buttons($entry);

	$entry.attr("dive-willing", entry["dive-willing"]);
	if(entry["dive-willing"] == "voluntary") {
	    $entry.find(".radio-vol").click();
	}
	else {
	    // optional is the default, e.g. if dive-willing is not set.
	    $entry.find(".radio-opt").click();
	}
	
    });
}

function divelist_remove_dive(clickedDive) {
    // Remove a dive in the divelist
    var entry = divelist_lookup(clickedDive);
    var index = divelist.indexOf(entry);

    if(index != -1) {
	divelist.splice(index, 1);
    }

    $(divelist).each(function(i, entry) {
        // renumber dives to preserve order;
        entry["dive-order"] = i;
    });

    divelist_redraw();    
    $('#'+getDiveID(clickedDive)+'_selected').remove();

    //todo: include undo functionality?
}

function divelist_add_dive(clickedDive, is_voluntary) {
    // Add a dive from the database to the divelist
    var attributes = get_dive_attributes(clickedDive);
    var dive_order = divelist.length; // linear order in the list; todo: programmatically
    attributes["dive-order"] = dive_order;
    attributes["dive-willing"] = is_voluntary ? "voluntary" : "optional";
    divelist.push(attributes);
    divelist_redraw();
}


function toggleDive(clickedDive, is_voluntary) {
    $(clickedDive).toggleClass("selected");
    if ($(clickedDive).hasClass("selected")) { // Add it to the box
	   divelist_add_dive(clickedDive, is_voluntary);
    } else { // remove it from the box
	   divelist_remove_dive(clickedDive);
    }
    
    ($("#list-view").children().length > 0) ? hideQuicklist() : showQuicklist();
}

function setOptional(dive) {
    //input dive can be a dive-entry or a selected dive
    var selectedDive = $("#"+getDiveID(dive)+"_selected");
    $(selectedDive).find(".radio-opt").click();
}

function getDiveID(dive) {
    return $(dive).attr("dive-id");
}

///////////////////// FILTERS

function applyFilters() {
    $(".dive-entry").each(function(n,dive) {
        for (var key in filters) {
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
    //todo don't filter by first digit, b/c 5100 is both 5 and 1, and 001 is 1
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
function filterByTime(timeOption) {
    console.log("filter by time", timeOption);
    if (timeOption == "1 Month") {
        console.log("Filtering by time: in the last month");
        filters["time"] = (function(dive) {
            return $(dive).attr("dive-last-performed") != "03/05/2016";
        });
    } else { //Anytime
        console.log("Showing all dives");
        filters["time"] = returnFalse;
    }
    applyFilters();
}

// Filter by experience
function onFilterByExperience(event) {
    var checked = new Array();
    if ($("#know:checked").length == 1) {
        checked.push("known-well");
    }
    if ($("#learning:checked").length == 1) {
        checked.push("known-ok");
    }
    if ($("#unknown:checked").length == 1) {
        checked.push("known-not");
    }
    console.log(checked);
    filters["experience"] = (function(dive) {
        $span = $(dive).find("span.known");
        for (var i in checked) {
            var className = checked[i];
            if ($span.hasClass(className)) {
                return false; //dive should be shown (not filtered)
            }
        }
        return true; //dive should be filtered
    });
    applyFilters();
}

///////////////// SORTING

function sortDivesBy(sortOption) {
    console.log("sort dives by:", sortOption);
    if (sortOption == "Predicted score (highest first)") { //todo don't string-match
        console.log("Sorting dives by predicted score, highest first");
        //todo actually sort
    } else {
        console.error("unimplemented sort option:", sortOption);
    }
    applyFilters(); //todo prob not needed?
}

//////////////// BUTTONS

function onSaveButtonClick() { //todo don't copy/paste from autosaving
    //todo do we want Save or Save a copy?
    $("#saving").show(0, function() {
        setTimeout(function(){
            $("#saving").hide(0);
        }, 1000);
    });
    //todo actually save...
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
        if (n<11) {toggleDive(dive, n>=6);}
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
//    $("#filter-time-dropdown").mouseup(onFilterByTime);
    $("#filter-time-dropdown").change(function() {
        filterByTime($(this).val());
    });
    $("#filter-experience").find("input").prop("checked",true).click(onFilterByExperience);
    $("#sort-dropdown").change(function() {
        sortDivesBy($(this).val());
    });
    
    $("#btn-save").click(onSaveButtonClick);
    $("#btn-export").click(onExportButtonClick);
    $("#btn-newlist").click(onNewListButtonClick);
    $("#dropdown-load").mousedown(onLoadDropdownClick);
    
    $("#ip-search-by-name").click(alertNotImplemented);
    $("#btn-view-as-chart").click(
	function() {
	    $("#list-view").hide();
	    $("#chart-view").show();
	    divelist_redraw();
	}
    );
    $("#btn-view-as-list").click(
	function() {
	    $("#chart-view").hide();
	    $("#list-view").show();
	    divelist_redraw();
	}
    );
    
    $("#divelist-savename").on("keydown", function(event) {
        if (event.which == 13) {
            event.preventDefault();
            event.currentTarget.blur();
            onSaveButtonClick();
        }
    });

    // Make divelist items sortable/draggable
    $( ".sortable" ).sortable({"handle" : ".drag-handle"});
    $( ".sortable" ).disableSelection();
});

// TODO: Make entries in the user's list of dives have more consistent spacing. That is, the dive names should all line up vertically and so on via a table structure, or by automatically setting the widths via jquery.


// Todo: blue dot toggles through blue with opt text, red with vol
// text, and off.
