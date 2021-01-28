window.onload = function() {
	toggleLang1f();
	inputFromUrl()
};

// Load from URL
function getUrlVars() {
	let vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		vars[key] = value;
	});
	return vars;
}

function inputFromUrl() {
	// format example.com/url?auto=1&n1=Name1&n2=Name2&l1=test&lf=huts&l2=kloek
	let urlVars = getUrlVars();

	if (urlVars['auto'] === "1") {
		if (urlVars['n1']) {
			$("#lang1name").val(decodeURIComponent(urlVars['n1']));
		}
		if (urlVars['n2']) {
			$("#lang2name").val(decodeURIComponent(urlVars['n2']));
		}
		if (urlVars['l1']) {
			$("#lang1input").val(decodeURIComponent(urlVars['l1']));
		}
		if (urlVars['lf']) {
			$("#lang1finput").val(decodeURIComponent(urlVars['lf']));
			$("#foncheck").prop('checked', true);
		} else {
			$("#foncheck").prop('checked', false);
		}
		if (urlVars['l2']) {
			$("#lang2input").val(decodeURIComponent(urlVars['l2']));
		}

		toggleLang1f();
		opsConvert();
	}
}

// UX functions:

function exampleInput() {
	$("#lang1name").val(examples.lang1name);
	$("#lang2name").val(examples.lang2name);
	$("#foncheck").prop('checked', examples.foncheck);
	$("#lang1input").val(examples.lang1);
	$("#lang1finput").val(examples.lang1f);
	$("#lang2input").val(examples.lang2);
	toggleLang1f();
	opsConvert();
}
function clearInput() {
	$("#inputs *").val("");
	$("#lang1input").trigger("select");
	setOutput("");
	generateSortableHtml("");
}
function copyOutput() {
	$("#output").trigger("select");
	document.execCommand("copy");
}

function toggleLang1f() {
	if (document.getElementById('foncheck').checked ) {
		$("#lang1finputdiv").show();
		$("#lang1inputdiv").addClass("col-lg-4");
		$("#lang2inputdiv").removeClass("col-sm-6 col-lg-6").
			addClass("col-sm-8")
	}
	else {
		$("#lang1finputdiv").hide();
		$("#lang1inputdiv").removeClass("col-lg-4");
		$("#lang2inputdiv").addClass("col-sm-6 col-lg-6").
			removeClass("col-sm-8")
	}
}

function swapLanguages(inputId1a, inputId2a, inputId1b, inputId2b) {
	let t1 = $('#'+inputId1a);
	let t2 = $('#'+inputId2a);
	let temp = t1.val().toString();
	t1.val(t2.val().toString());
	t2.val(temp);

	let l1 = $('#'+inputId1b);
	let l2 = $('#'+inputId2b);
	temp = l1.val().toString();
	l1.val(l2.val().toString());
	l2.val(temp);
}

/////////////////////////////////////////////////////////////////////////////////
// RegEX to match skip list:
const tagListTitle = /Refrein [0-9]:|Refrein:|Refrein [0-9]x:|Refrein \([0-9]x\):|\(refrein [0-9]\)|\(refrein\)|\(refrein [0-9]x\)|(?=^)\([0-9]x\)|Bridge:|Bridge [0-9]x:|Couplet:|Couplet [0-9]:|Slot:/i;
const tagListSplit = /\[split[s]*]/i;
const tagListTag = /\[join]|\[verbind]|\[lang a]|\[lang b]|\[trans off]|\[trans on]/i;

const LineType = {
	TEXT: 0, TITLE: 1, SPLIT: 2, TAG: 3,
};

let language1;
let language2;
let opsOutput;
let splitAmount;

// Convert functions:
function opsConvert() {
	// Get text
	let song1 = $("#lang1input").val();
	let song1f = $("#lang1finput").val();
	let song2 = $("#lang2input").val();

	language1 = $("#lang1name").val();
	language2 = $("#lang2name").val();
	if (language1.match(/^\s*$/)) language1 = "Taal 1";
	if (language2.match(/^\s*$/)) language2 = "Taal 2";

	// Clean up text
	song1 = cleanUpInput(song1);
	song1f = cleanUpInput(song1f);
	song2 = cleanUpInput(song2);

	// Get settings
	let fonetic = $("#foncheck").is(":checked") &&
		(song1f.match(/^\s*$/) === null);
	splitAmount = (fonetic ? $("#splitnumf").val() : $("#splitnum").val());

	// Split song into couplets
	let couplets1 = songToArray(song1);
	let couplets1f = songToArray(song1f);
	let couplets2 = songToArray(song2);

	// Check the lengths
	if (couplets1.length !== couplets2.length) {
		error(language2 + " heeft " + (couplets2.length > couplets1.length ? "meer" : "minder") + " coupletten dan " + language1);
		return;
	}
	if (fonetic && couplets1.length !== couplets1f.length) {
		error("De fonetische tekst heeft "+(couplets1f.length > couplets1.length ? "meer" : "minder")+" coupletten dan "+language1);
		return;
	}

	opsOutput = [];
	// Add title:
	opsOutput.push([{text: language1 + "-" + language2+":", type: LineType.TEXT}]);

	// Loop through couplets and process them:
	for (let i = 0; i < couplets1.length; i++) {
		opsOutput[i+1] = processCouplet(couplets1[i], couplets1f[i], couplets2[i], fonetic, i+1);
	}

	opsOutput = addSplitTags(opsOutput, splitAmount);
	printResult(opsOutput);
	generateSortableHtml(opsOutput);
}

/** Remove unnecessary whitespaces and splits from a string */
function cleanUpInput(text) {
	// Replace unnecessary whitespaces
	return text.replace(/( )+\n/g, "\n").replace(/(\s)*$/, "");
}

/** Write to the output*/
function setOutput(output, error = false) {
	const o = $("#output");
	o.html(output);
	if (error) {
		o.addClass("text-danger");
		o.removeClass("text-light")
	}
	else {
		o.addClass("text-light");
		o.removeClass("text-danger");
	}
}

/** Write an error message to the output*/
function error(msg) {
	setOutput(msg, true);
}

/** Split all couplets of a song to an array*/
function songToArray(song) {
	return song.split(/\n\n/g)
}

function processCouplet(couplet1, couplet1f, couplet2, fonetic, number) {
	// Split couplet into lines
	let lines1 = coupletToArray(couplet1);
	let lines1f = (fonetic ? coupletToArray(couplet1f) : null);
	let lines2 = coupletToArray(couplet2);

	// Check the lengths
	if (lines1.length !== lines2.length) {
		error(language2 + ", couplet "+number+" heeft " + (lines2.length > lines1.length ? "meer" : "minder") + " regels dan " + language1);
		return;
	}
	if (lines1f !== null && lines1.length !== lines1f.length) {
		error("De fonetische tekst, couplet "+number+" heeft "+(lines1f.length > lines1.length ? "meer" : "minder")+" regels dan "+language1);
		return;
	}

	let output = [];

	for (let i = 0; i < lines1.length; i++) {
		let type = getLineType(lines1[i]);
		let text;
		// If the line is not text, only use line 1;
		if (type !== LineType.TEXT) {
			text = lines1[i];
		}

		else if (fonetic) {
			text = "[lang a]\n" + lines1[i] + "\n" + lines1f[i] + "\n[lang b]\n" + lines2[i];
		} else {
			text = lines1[i] + "\n" + lines2[i];
		}

		output.push({text: text, type: type});
	}

	return output;
}

/** Determine the type of a line*/
function getLineType(line) {
	if (tagListTitle.exec(line) !== null) {
		return LineType.TITLE;
	} else if (tagListTag.exec(line) !== null) {
		return LineType.TAG;
	} else if (tagListSplit.exec(line) !== null) {
		return LineType.SPLIT
	} else {
		return LineType.TEXT
	}
}

/** Split all lines of a couplet to an array */
function coupletToArray(couplet) {
	return couplet.toString().split(/\n/g)
}

/** Print the output to HTML*/
function printResult(result) {
	let output = "";
	for (let i = 0; i < result.length; i++) {
		for (let j = 0; j < result[i].length; j++) {
			output += result[i][j].text + "\n"
		}
		output += "\n"
	}
	setOutput(output)
}

/** Add split tags to the output*/
function addSplitTags(output, amount) {
	// Loop through couplets
	for (let i = 0; i < output.length; i++) {
		let lastSplit = 0;
		for (let j = 0; j < output[i].length; j++) {
			switch (output[i][j].type) {
				// In case of text, increment lastSplit
				case LineType.TEXT: lastSplit++; break;
				// In case of a split, reset lastSplit
				case LineType.SPLIT: lastSplit = 0; break;
			}
			// If this is not the last line, next line is not a split, and we have reached the amount
			if (j !== output[i].length - 1 && output[i][j + 1].type !== LineType.SPLIT
				&& lastSplit === Number(amount)) {
				// Insert a split
				output[i].splice(j + 1, 0, {text: "[split]", type: LineType.SPLIT})
			}
		}
	}
	return removeRedundantSplits(output);
}

/** Remove consecutive splits and splits at the end of a couplet*/
function removeRedundantSplits(output) {
	for (let i = 0; i < output.length; i++) {
		let lastLine = {type: LineType.TEXT};
		let length = output[i].length;
		for (let j = 0; j < length; j++) {
				let currentLine = output[i][j];
				// Check if last and current line are both splits
				if (currentLine.type === LineType.SPLIT && lastLine.type === LineType.SPLIT) {
					// Remove split
					output[i].splice(j, 1);
					length--;
				}
				lastLine = currentLine;
		}
		// Check if the last line is a split
		if (output[i][length-1].type === LineType.SPLIT) {
			// Remove split
			output[i].splice(length-1, 1);
		}
		// Check if the first line is a split
		if (output[i][0].type === LineType.SPLIT) {
			// Remove split
			output[i].splice(0, 1);
		}
	}
	return output;
}

/** Add a split into a couplet*/
function addSplitToOutput(couplet) {
	opsOutput[couplet].splice(1, 0, {text: '[split]', type: LineType.SPLIT});

	printResult(opsOutput);
	generateSortableHtml(opsOutput);
}

const coupletClass = 'couplet';
const textClass = 'line';
const splitClass = 'split';
const titleClass = 'title';
const sortableFilterClass = 'sortable-filter';

/** Generate appropriate divs and call {@link makeSortable} to have user-movable splits*/
function generateSortableHtml(result) {
	// Loop through couplets
	let html = "";
	for (let i = 0; i < result.length; i++) {
		// Start of couplet
		html += (result[i].length !== 1 ? "<i class='fa fa-plus' onclick='addSplitToOutput("+i+")'></i>" : "") +
			"<div class="+coupletClass+">";
		for (let j = 0; j < result[i].length; j++) {
			// Start of line, determine the correct class
			html += "<div class=\""+determineClasses(result[i][j].type)+"\">" +
				lineToHtml(result[i][j].text) + "</div>"
		}
		html += "</div>"
	}
	let o = $("#sortable-output");
	o.html(html);

	// Implement Sortable library
	makeSortable();

	// Resize #output to the same size
	$("#output").height(o.height());
}

/** Maps a line type to a class for the associated line*/
function determineClasses(lineType) {
	switch (lineType) {
		case (LineType.SPLIT):
			return splitClass;
		case (LineType.TITLE):
			return titleClass + " " + sortableFilterClass;
		default:
			return textClass + " " + sortableFilterClass;
	}
}

/** Removes lang tags and stylises a line*/
function lineToHtml(line) {
	return styleLines( line.replace(/\[lang .]\n+/gi, "") );
}

/** Applies the Sortable library to the couplets and lines*/
function makeSortable() {
	$('.'+coupletClass).each(function(index) {
		// noinspection JSUnusedGlobalSymbols
		Sortable.create($(this).get(0), {
			filter: '.'+sortableFilterClass,
			animation: 150,
			swapThreshold: 0.4,
			onEnd: function (evt) {
				try {
					applyLineMove(index, evt.oldIndex, evt.newIndex)
				} catch (e) {
					console.log("Error moving line: "+e)
				}
			}
		})
	});
}

/** Move a line in the output after a user has moved it*/
function applyLineMove(couplet, from, to) {
	let fromLine = opsOutput[couplet][from];
	// Delete original
	opsOutput[couplet].splice(from, 1);
	// Insert line at new position
	opsOutput[couplet].splice(to, 0, fromLine);

	// Regenerate HTML
	opsOutput = addSplitTags(opsOutput, splitAmount);
	printResult(opsOutput);
	generateSortableHtml(opsOutput);
}

/** Style lines with <b> and <i>*/
function styleLines(input) {
	let result = "";
	let lines = input.split('\n');
	for (let i = 0; i < lines.length; i++) {
		let tag;
		switch (i) {
			case 1: tag = (lines.length === 2 ? 'i': 'span style=\'color: grey;\''); break;
			case 2: tag = 'i'; break;
			default: tag = 'span'
		}
		result += '<'+tag+'>' + lines[i] + '</'+tag+'><br>'
	}
	return result;
}