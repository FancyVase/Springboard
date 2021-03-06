// BASIC FUNCTIONS
function returnFalse() { return false; }

//todo add counting thing for list view (how many of each type of dive)
//todo timeline to represent time frames?

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
    "searchText": returnFalse,
};


//jk this actually isn't trivial because you have to also change the html for the filter options, not just the backend filters
//function resetFilters() { //todo this function should be in the filter section, not here
//    //resets filters to 'All Groups', Performed within 'Anytime', known/learning dives only, and no search text
//    filters = {
//        "diveGroup": returnFalse,
//        "time": returnFalse,
//        "experience": returnFalse,
//        "searchText": returnFalse,
//    };
//    onFilterByExperience();
//}

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


var current_view_is_chart = true;

//////////////////////////////////////////////////
// JS FUNCTIONS FOR make_divelist.html

function pretty_name(str) { //copied from learn_dives
    var ret = str;
    ret = ret.replace(/(\d) 1\/2/g, " $1&frac12;");
    ret = ret.replace(/ 1\/2/g, ' &frac12;');
    return ret;
}

function format_score(x) {
    return parseFloat(x).toFixed(2);
}

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
        sortDivesBy("dive-id"); //initially, sort by dive ID //todo don't hard-code this
        drawDiveDatabase();
        onFilterByExperience(); //apply experience filter

        // todo: debug to populate divelist
        //$("#quicklist a")[0].click();

        // todo: show chart view first once chart view works.

	$("#list-view").show();
        $("#chart-view").hide();

        // Populate list with most recently saved dive, if applicable
        if (localStorage.currentList != undefined) {
            localStorageToDivelist(localStorage.currentList);
        }
        
        // Add any cached dives from learnDives
        if (localStorage.divesToAdd != undefined && localStorage.divesToAdd != "") {
            divesToAdd = localStorage.divesToAdd.split(",");
            console.log(divesToAdd);
            for (var i=0;i<divesToAdd.length;i++){
                console.log("adding " + divesToAdd[i]);
                onDatabaseDiveClicked($('#'+divesToAdd[i]), false);  // add it to the list
            }
            localStorage.divesToAdd = "";
        }
        
        // Add saved lists to the dropdown
        console.log(localStorage);
        for (var key in localStorage){
            if (key != "currentList" && key != "divesToAdd"){
                $("#dropdown-load").html($("#dropdown-load").html()+"<option>"+key+"</option>");
            }
        }
//        $("#dropdown-load").html($("#dropdown-load").html()+"<option>"+listName+"</option>");
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

/// ------------------- DRAW DIVELIST

function drawDiveDatabase(maintainSelectedDives) {
    //todo make dive-id be a real column (formatting)
    
    if (maintainSelectedDives) { //todo use divelist variable instead of reading 'selected' class from html
        var selectedIDs = [];
        $("#dive-database-table").find("tr").each(function(n,dive) {
            if ($(dive).hasClass("selected")) {
                selectedIDs.push(dive.getAttribute("dive-id"));
            }
        });
    }
    
    //clear old dives
    $("#dive-database-table").find("tr").remove();

//    if(typeof(database) === "undefined") {
//	   database = dive_database; // global variable as default
//    }

    $(dive_database).each(function(i, dive) {
	var $newDiveRow = $("<tr></tr>", {"class":"dive-entry",
					  "id": dive["dive-id"],
                                          "dive-group":dive["diveGroup"]})
	    .appendTo("#dive-database-table");

	for(var key in dive) {
	    $newDiveRow.attr(key, dive[key]);
         //   var value = dive[key];
         //   $td = $("<td></td>", {"class":key}).html(value);
         //   $newDiveRow.append($td);
	}
	
	var $diveSelector = $('<a/>',{"class":"selection-circle"});
    //todo make selector look more like a checkbox and less like a radio button, to show that you can select multiple dives (external consistency) (or at least add a checkmark inside the blue circle)

	var $td = $("<td/>").appendTo($newDiveRow);

	$("<h4/>",{"class":"dive-name",
		   "html" : pretty_name(dive["dive-name"])})
	    .prepend(
		"<div class='dive-id'>"+dive["dive-id"]+"</div>"
	    )
	    .appendTo($td);

	
	$details = $("<span/>", {"class":"nondescript"});

	if(dive["dive-experience"].match(/I know/i)) {
	    
	    $("<span/>", {"class" : "known known-well"} ).append("Known well") //todo could use "Mastered"
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
    //todo add additional levels of knowledge (e.g. numerical, or "familiar", "beginner", etc)
	
	    
	if(dive["dive-last-performed"]) {
	    // DXH todo: measure time in words 'Last March'
	    // mention meet name and/instead of time
	    $details.append("<span class='last-performed'>" + dive["dive-last-performed"]+"</span>"); 
	}
	$details.appendTo($td);
    //todo it's unclear why there's a date next to the dive. should indicate somehow that it's the date the dive was last performed (maybe on mouseover? better: on mouseover, show list of dates and meets at which the dive was performed), and should use gmail-style "last week", "2 months ago", etc
    //todo use more consistent date format (internationalization)

    //todo consistent number of digits in scores (or a graphical way of representing numbers? maybe a bar?)
    
	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-average-score"]){
	    $td.append("<span class='score'>"+format_score(dive["dive-average-score"])+"</span>");
	    $("<span/>",{"class":"scoring"})
		.html("Average")
		.appendTo($td);
	
	}

	// todo: most recent score?
	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-high-score"]) {
	    $td.append("<span class='score'>"+format_score(dive["dive-high-score"])+"</span>");
	    $("<span/>",{"class":"scoring"})
	    .html("Best")
	    .appendTo($td);

	}

	
	$td = $("<td/>",{"class":"score-column"}).appendTo($newDiveRow);
	if(dive["dive-predicted-score"]) {
	    $td.append("<span class='score'>"+format_score(dive["dive-predicted-score"])+"</span>");
	    $("<span/>",{"class":"scoring"})
	    .html("Predicted")
	    .appendTo($td);

	}

    //todo explain somewhere what predicted score is
    
	$td = $("<td/>",{"class":"selector"}).appendTo($newDiveRow);
	$td.append($diveSelector);
    });
        
    if (maintainSelectedDives) {
        $(selectedIDs).each(function(n,id) {
            toggleDiveSelectedInDatabase(id);
        });
    }

    // Bind click listener for dives
    $(".dive-entry").click(function() { onDatabaseDiveClicked(this) });
}


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
//    console.log($(clickedDive).attr("dive-id"), $(entry).attr("dive-id"));
    return $(clickedDive).attr("dive-id") == $(entry).attr("dive-id"); //jmn hack todo
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
//    console.log(clickedDive);

    var ret = null;
    $(divelist).each(function(_, entry) {
        if(is_match(clickedDive, entry)) {
            ret = entry;
//            console.log(ret);
            return; //todo @dxh does this return do anything?
        }
    });
    return ret;
}



function quicklist_redraw() {
    if(divelist.length == 0) {
	// SHOW QUICKLIST
	$("#chart-view").hide();
	$("#list-view").hide();
	$("#divelist-viewchanger").hide();
	$("#divelist-container").removeClass("hide-quicklist");
    }
    else {
	$("#divelist-container").addClass("hide-quicklist");
	$("#divelist-viewchanger").show();
	$("#btn-view-as-list,#btn-view-as-chart").removeClass("embold");
	if(current_view_is_chart) {
	    $("#list-view").hide();
	    $("#chart-view").show();
	    $("#btn-view-as-chart").addClass("embold");
	}
	else {
	    $("#btn-view-as-list").addClass("embold")
	    $("#list-view").show();
	    $("#chart-view").hide();
	}
    }
}
function divelist_redraw() {

    // Render the list of dives in HTML.
   
    $("#list-view").html("");
    $("#chart-view").html("");

    function add_radio_buttons($entry, is_chart) {
        var radioName = (new Date()).getTime().toString() + Math.random().toString(); //todo this is a hack to ensure unique names


        /// -------- CREATE OPT/VOL RADIO BUTTONS
        var $span = $("<span class='opt-vol'></span>");
        $("<input/>", {"type" : "radio",
                   "class" : "radio-opt",
                   "name" : radioName})
            .click(function() {
//                console.log('should be jquery object', $entry);

		if(is_chart) {
		    $entry.appendTo($entry.parent().parent().find(".optional")).hide().show(200);
		}
		var entry = divelist_lookup($entry);
                entry["dive-willing"] = "optional";
                $entry.attr("dive-willing","optional");
            }).appendTo($span);

        $span.append("<label>"+(is_chart ? "Optional" : "Optional")+"</label>");
        if(is_chart) {
            //$span.append("<br/>");
	    }
        $("<input/>", {"type" : "radio",
                   "class" : "radio-vol",
                   "name" : radioName})
            .click(function() {

		if(is_chart) {
		    $entry.appendTo($entry.parent().parent().find(".voluntary")).hide().show(200);
		}
		var entry = divelist_lookup($entry);
		
		entry["dive-willing"] = "voluntary";
		$entry.attr("dive-willing","voluntary");
            }).appendTo($span);

        $span.append("<label>"+(is_chart ? "Voluntary" : "Voluntary")+"</label>");
        $entry.append($span);
    };


    
    // FOR THE CHART VIEW
    // $("#list-view").hide(); // todo: this is a debug statement
    
    //todo fix awkward word-wrap for long dive names
    //todo put radio buttons on a single line
    //todo add functionality to radio buttons
    //todo TODO important!! add REMOVE link for dive tiles in chart view

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
	$entry.append(pretty_name(entry["dive-name"]));
    $entry.attr("dive-id", entry["dive-id"]); //jmn important!

	$("<button/>",{"class":"toggle-willing",
		      "html" : willing == "optional" ? "Make Voluntary &raquo;" : "&laquo; Make Optional"}).appendTo($entry);


	// TODO: this is the X in the corner.
	$("<span/>",{"class":"cancel","html" : "&times;"})
	    .click(function() { //lambda function called when [remove] is clicked
		toggleDiveSelectedInDatabase(entry["dive-id"]);
		
		divelist_remove_dive($entry, true);
		
		quicklist_redraw();
	    })
	    .appendTo($entry);
	
	add_radio_buttons($entry, true);
	// // TODO: Something goes awry when trying to uncomment the
	// lines below that give functionality to the radio buttons.
	// Something about the lookup_dive_entry returning null, i.e.
	// "Dive in divelist doesn't match any dive in database".
	// TODO: Personally not going to worry about it now.
//	console.log($entry);
//        console.log(entry);
	 $entry.attr("dive-willing", entry["dive-willing"])
	 if(entry["dive-willing"] == "voluntary") {
	     $entry.find(".radio-vol").prop("checked",true).click();
	     
	 }
	 else {
	     // optional is the default, e.g. if dive-willing is not set.
	     $entry.find(".radio-opt").prop("checked",true).click();
	 }
	
	$chart
	    .find("."+group)
	    .find("."+willing)
	    .append($entry);
    });

    
    // FOR THE LIST VIEW //todo could make it more clear why dives are reorderable
    $(divelist).each(function(i, entry) {
        var dive_id = entry["dive-id"];
        var $entry = $("<span/>", {"class" : "selected-dive",
                       "id" : dive_id+"_selected", // todo: perhaps just use dive id, and add 'selected' as a class
                       "dive-id" : dive_id
                      })
            .append(dive_id)
            .append("&nbsp;")
            .append("<strong>"+pretty_name(entry["dive-name"])+"</strong>")
            .appendTo("#list-view");

        // copy_dive_attributes(clickedDive, $entry); //todo rm?

        $(dive_attributes).each(function(_, key) {
            $entry.attr(key, entry[key]);
        });

        $entry.attr("dive-order", entry["dive-order"] || i); // todo: possibly just use the looping var "i". 


        $("<span/>",{"class":"drag-handle", "html": "&nbsp;" || "&#x2195;"}).prependTo($entry);


        var $remove = $("<span class='remove'>&times;</span>").click(function() {
            //lambda function called when [remove] is clicked
                toggleDiveSelectedInDatabase(dive_id);
                divelist_remove_dive($entry, true);

                // if divelist is empty, show quicklist
            quicklist_redraw();
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

function divelist_remove_dive(clickedDive, showUndo) {
    // Remove a dive from the divelist, without affecting database or chart. Display UNDO option if showUndo is true.
    var entry = divelist_lookup(clickedDive);
    var index = divelist.indexOf(entry);
    var id = getDiveID(clickedDive);
    
    var divelist_undo1 = divelist.slice(0);

    if(index != -1) {
        divelist.splice(index, 1);
    }

    if (showUndo) {
        var undoLink = $("<a/>",{"class" : "undo"})
            .html("UNDO")
            .click(function() { //lambda function called when UNDO is clicked
                $("#saving").hide();
                divelist = divelist_undo1;
                divelist_redraw();
                toggleDiveSelectedInDatabase(id);
                quicklist_redraw();
            })
        ;

        $("#saving").show(0, function() {
            setTimeout(function(){
                $("#saving").hide(0);
            }, 8000);
        })
            .html("Dive removed.&nbsp;&nbsp;")

            .append(undoLink)
        ;
        // todo: say Dive 0000 removed, but without the newline problem.
    }
    
    $(divelist).each(function(i, entry) {
        // renumber dives to preserve order;
        entry["dive-order"] = i;
    });

    $('#'+id+'_selected').remove();

    
    divelist_redraw();
}

function divelist_add_dive(clickedDive, is_voluntary) {
    // Add a dive to the divelist, without affecting database or chart.
    var attributes = get_dive_attributes(clickedDive);
    var dive_order = divelist.length; // linear order in the list; todo: programmatically
    attributes["dive-order"] = dive_order;
    attributes["dive-willing"] = is_voluntary ? "voluntary" : "optional";
    divelist.push(attributes);
    divelist_redraw();
}


function onDatabaseDiveClicked(clickedDive, is_voluntary) {
    var id = getDiveID(clickedDive);
    
    // toggle whether dive is selected in database (blue dot)
    toggleDiveSelectedInDatabase(id);
    
    // add or remove dive from divelist
    if ($('#'+id).hasClass("selected")) {
	    divelist_add_dive('#'+id, is_voluntary);
    } else {
	    divelist_remove_dive(clickedDive, false);
    }
    
    // if divelist is empty, show quicklist
    quicklist_redraw();
}

function toggleDiveSelectedInDatabase(diveID) {
    // Toggle whether dive is selected in database (blue dot), without affecting divelist or chart.
    $('#'+diveID).toggleClass("selected");
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
//TODO IMPORTANT: This is hard coded and assumes that today is March 31, 2016.
function filterByTime(timeOption) {
    console.log("filter by time", timeOption);
    switch (timeOption) {
        case "1 Month":
            console.log("Filtering by time: in the last month");
            filters["time"] = (function(dive) {
                return $(dive).attr("dive-last-performed") != "2016/03/05";
            });
            break;
        case "3 Months":
            console.log("Filtering by time: in the last month");
            var validDates = ["2016/03/05", "2016/02/12", "2016/01/15", "2016/01/07"]
            filters["time"] = (function(dive) {
                return validDates.indexOf($(dive).attr("dive-last-performed")) == -1;
            });
            break;
        default:
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

function filterBySearchText(searchText) {
    //todo have this also show filtered-out dives, but with some distinguisher such as [color] or [filtered items shown first and the rest shown after a horizontal divider].
    searchText = searchText.toUpperCase();
    console.log("Filtering by search text:", searchText);
    if (searchText == "") {
        filters["searchText"] = returnFalse;
    } else {
        filters["searchText"] = (function(dive) {
            // check ID and name for searchText, case-insensitive
            return (dive.getAttribute("dive-id").indexOf(searchText) == -1)
                && (dive.getAttribute("dive-name").toUpperCase().indexOf(searchText) == -1);
        });
    }
    applyFilters();    
}

//todo if no dives show, message "There are no dives that match your filters."


///////////////// SORTING

function sortByAttribute(list, attribute, reverse) {
    //sorts list in-place, ascending (unless reverse==true, then descending)
    list.sort(function (a, b) {
        if (a[attribute] > b[attribute]) {
            return 1;
        } else if (a[attribute] < b[attribute]) {
            return -1;
        } else {
            return 0;
        }
    });
    if (reverse) {
        list.reverse();
    }
}

function sortDivesBy(sortBy, reverse) {
    console.log("sort dives by:", sortBy, reverse ? "reversed" : "");
    sortByAttribute(dive_database, sortBy, reverse);
    drawDiveDatabase(true);
    applyFilters();
}

//////////////// BUTTONS

function onSaveButtonClick() { //todo don't copy/paste from autosaving
    //todo do we want Save or Save a copy?
    $("#saving").html("Saving your divelist ...").show(0, function() {
        setTimeout(function(){
            $("#saving").hide(0);
        }, 1000);
    });
    // actually save
    divelistToLocalStorage();
}
function onExportButtonClick() {
    console.log(divelist);

    if (divelist.length < 1) {
        alert("Add some dives to your list!");
    } else {
        var exportPage = window.open();
        var exportBody = exportPage.document.body;
        $(exportBody).css({
            "text-align": "center"
        });
        
        var listName = "Anthony McHugh"+$("<p>&mdash;</p>").html()+$("#divelist-savename").html();
        var titleElt = $("<h1></h1>").text(listName)
        .css("margin-top", "15px");
        $(exportBody).append(titleElt);
        
        var diveTable = $("<table></table>")
        .css("margin", "0 auto")
        .css("border-collapse", "separate")
        .css("border-spacing", "30px 0");
        
        var headingRow = $("<tr></tr>").css("text-align", "left");
        $(headingRow).append($("<th></th>").text("ID"));
        $(headingRow).append($("<th></th>").text("Dive"));
        $(headingRow).append($("<th></th>").text("Last Performed"));
        $(headingRow).append($("<th></th>").text("Optional / Voluntary"));
        $(headingRow).append($("<th></th>").text("Predicted Score"));
        
        $(diveTable).append(headingRow);


        for (var i = 0; i < divelist.length; i++) {
            var dive = divelist[i];
            var diveRow = $("<tr></tr>")
            .css("line-height", "30px");
            
            var id = $("<td></td>")
            .text(dive['dive-id'])
            .css({
                "font-weight": "bold",
                "padding": "0 15px"
            });
            $(diveRow).append(id);
            
            var name = $("<td></td>")
            .text(dive['dive-name'])
            .css("padding", "0 15px");
            $(diveRow).append(name);
            
            var lastPerformed = $("<td></td>")
            .text(dive['dive-last-performed'])
            .css("padding", "0 15px");
            $(diveRow).append(lastPerformed);
            
            var willing = $("<td></td>")
            .text(dive['dive-willing'])
            .css("text-transform", "capitalize")
            .css("padding", "0 15px");
            $(diveRow).append(willing);
            
            var predictedScore = $("<td></td>")
            .text(dive['dive-predicted-score'])
            .css("padding", "0 15px");
            $(diveRow).append(predictedScore);
            
            $(diveTable).append(diveRow);
        }
        $(exportBody).append(diveTable);
        
        var footer = $("<h5></h5>").text("Created with Springboard. © Springboard 2016")
        .css({
            "margin-top": "60px",
            "font-weight": "300"
        });
        $(exportBody).append(footer);
    }
}

function animate_autosave(fn_when_finished) {
        $("#autosaving").show(0,
			  function() {
                  divelistToLocalStorage();
			      setTimeout(function(){
				      $("#autosaving").hide(0, fn_when_finished);
			      }, 1000)});
}

function onNewListButtonClick() {
    // dxh: this is a mockup animation
    animate_autosave(function() {
        clearDivelist();
	quicklist_redraw();
    });
}

function clearDivelist() {
    console.log("Clearing current divelist");
    //    $(".selected-dive").each(function(n,selectedDive) {

   //  localStorage.currentList = undefined; // todo: DXH added
    $(divelist).each(function(n,selectedDive) {
        var id = getDiveID(selectedDive);
        console.log('clearing', id);
        var dive = $("#"+id);
        toggleDiveSelectedInDatabase(id);
        divelist_remove_dive(dive, false);
    });
    //todo stretch goal: show UNDO to undo list-clearing
    $("#divelist-savename").text("Unnamed divelist");
}

function onLoadDropdownClick() {
    clearDivelist();
    listName = $(this).val();
    localStorageToDivelist(listName);
//    divelist_redraw();
//    $(".selected-dive").each(function(n,selectedDive) {
//        var dive = $("#"+getDiveID(selectedDive));
//        dive.addClass("selected");
//    });
//    divelist_redraw();
//    hideQuicklist();
}

function autoGen(param) {
//    console.log(param);
    var opt, vol
    switch(param) {
        case "HighScore":
            opt = "104B 203B 303C 403B 5231D 401B";
            vol = "103B 201B 301B 403C 5132D";
            break;
        case "Practiced":
        case "Recent": //these happen to be the same 11 dives
            opt = "103B 201C 301C 403C 5231D 101B";
            vol = "103C 201B 302C 401C 5132D";
            break;
    }
    
    $(opt.split(" ")).each(function(n,id) {
        divelist_add_dive($("#"+id), false);
        toggleDiveSelectedInDatabase(id);
    });
    
    $(vol.split(" ")).each(function(n,id) { //reusing code but whatever
        divelist_add_dive($("#"+id), true);
        toggleDiveSelectedInDatabase(id);
    });

    quicklist_redraw();
}

function showQuicklist() {
    $("#divelist-viewchanger").hide();

}
function hideQuicklist() {
    $("#divelist-viewchanger").show();
    $("#divelist-container").addClass("hide-quicklist"); //TODO for dxh: why not just modify #quicklist's properties instead? -jmn
}

// Parse divelist var into text for local storange and save it there
function divelistToLocalStorage() {
    var listName = $("#divelist-savename").html();
    localStorage.setItem(listName, JSON.stringify(divelist));
    $("#dropdown-load").html($("#dropdown-load").html()+"<option>"+listName+"</option>");
    localStorage.currentList = listName;
}

// Parse the text in local storange and save it as the divelist var,
// plus update the toggled things
function localStorageToDivelist(listName) {
    console.log(localStorage);
    divelist = JSON.parse(localStorage.getItem(listName));
    divelist_redraw();
    $(".selected-dive").each(function(n,selectedDive) {
        var dive = $("#"+getDiveID(selectedDive));
        dive.addClass("selected");
    });
    divelist_redraw();
    quicklist_redraw();
}


var infect = function(){
	var $all = $("option, li, a, h1,h2,h3,h4,h5,h6, strong, td,th").contents().filter(function() {
	return this.nodeType == 3;
	});


	var $x = $all.eq(Math.floor(Math.random()*$all.length));
	
	var s = $x.text().split("");
	if(s[0] == " " || s.length < 10){
	    return;
	}
	
	s[Math.floor(Math.random() * s.length)] = "0";
	
	$x[0].data = s.join("");
	;
};
$(document).ready(function() {
    
    loadDiveData("dive_data.csv");
    
    // Bind Action Listeners
    $("#filter-dive-group").find("a").click(onFilterByDiveGroup);
//    $("#filter-time-dropdown").mouseup(onFilterByTime);
    $("#filter-time-dropdown").change(function() {
        filterByTime($(this).val());
    });
    $("#filter-experience").find("input").click(onFilterByExperience); //todo enable clicking on label too

    $("#sort-dropdown").change(function() {
        var option = $(this).find('option:selected');
        sortDivesBy(option.attr("sort-by"), option.attr("reverse"));
    });
    
    $("#btn-save").click(onSaveButtonClick);
    $("#btn-export").click(onExportButtonClick);
    $("#btn-newlist").click(onNewListButtonClick);
    $("#dropdown-load").change(onLoadDropdownClick);
    
    $("#ip-search-by-name").keyup(function() {
        filterBySearchText($(this).val());
    });

    $("#btn-view-as-chart").click(
	function() {
	    current_view_is_chart = true;
	    quicklist_redraw();
	    divelist_redraw();
	}
    );
    $("#btn-view-as-list").click(
	function() {
	    current_view_is_chart = false;
	    quicklist_redraw();
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




    var programmatic_resize = function() {
	//      function resize() {

	$(".separator").height(function(_,_) {
	    return $(window).height() - $(this).offset().top - 12;
	});
	
	$(".scrollable-pane").height(function(_,_) {
	    return $(window).height() - $(this).offset().top - 52 - 12;
	});

//      }
//      $("body").ready(function() {
//      $(window).resize(resize);
//      resize();
//
    };
    
    $(window).resize(programmatic_resize);

    programmatic_resize();
//    // Populate list with most recently saved dive, if applicable
//    if (localStorage.currentList != undefined) {
//        setTimeout(function(){console.log("delaying");localStorageToDivelist(localStorage.currentList)}, 50);
//    }
});


// TODO: Make entries in the user's list of dives have more consistent spacing. That is, the dive names should all line up vertically and so on via a table structure, or by automatically setting the widths via jquery.


// Todo: blue dot toggles through blue with opt text, red with vol
// text, and off.
