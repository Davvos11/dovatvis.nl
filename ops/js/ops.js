function opsConvert() {
 	var opsNum = parseInt( $("#opsnum").val() );
 	var opsHalfLangsInput = $("#opshalflangs").val();
 	var opsInput = $("#opsinput").val();
 	var opsHalfLangs = opsHalfLangsInput.split(/, |$/);
 	var opsInputEOF = opsInput+"{EOF}"

 	// Talen naar apparte vars
 	var splitRegex = /([A-z]*-[A-z]*|[A-z]*:\n)([\S\s]*?)(?=[A-z]*-[A-z]*:|{EOF})/gm, matches, splits = [];
 	while (matches = splitRegex.exec(opsInputEOF)){
 		splits.push(matches[0]);
 	}
	
	var output = "GAVE "+opsNum+" - ORIGINEEL:\n\n";
 	for (var i = 0; i < splits.length; i++) {
 		// Coupletten/blocks naar apparte vars
 		var blockRegex = /\n\n|\n\s\n/gm;
 		var blocks = splits[i].split(blockRegex);

 		var outputA = ""; var outputB = "";
 		// Titel (taal):
 		var langNames = blocks[0].split(/-|:/)
 		outputA += langNames[0]+":\n";
		outputB += langNames[1]+":\n";	
		// Check of taal in halfLang staat
 		var halfLang
 		for (var l = 0; l < opsHalfLangs.length; l++) {
 			if (outputA.toLowerCase().startsWith(opsHalfLangs[l].toLowerCase()) == true) {halfLang = true}
		}
 		for (var j = 0; j < blocks.length; j++) {
 			if (j != 0) {
 				var lines = blocks[j].split("\n");
 				var langa = false; var langb = false; var kk = 0;
 				for (var k = 0; k < lines.length; k++) {
 					if (lines[k] == "[split]" || lines[k] == "[splits]" || lines[k] == "[join]" || lines[k] == "[verbind]") {}
 					else if (/\[trans off\]/i.exec(lines[k]) != null) {langb = false; langa = true; kk=0;}
 					else if (/\[lang a\]/i.exec(lines[k]) != null) {langb = false; langa = true; kk=0;}
 					else if (/\[lang b\]/i.exec(lines[k]) != null) {langa = false; langb = true; kk=1;}
 					else if (/\[trans on\]/i.exec(lines[k]) != null) {langa = false; langb = false; kk=0;}
 					else if (/Refrein [0-9]:|Refrein:/i.exec(lines[k]) != null) {
 						if (i == 0) {outputA +="Refrein:\n";}
 						else {outputA += "Refrein "+2*i+":\n";}
 						outputB += "Refrein "+(2*i+1)+":\n";
 					}
 					else if (/Refrein [0-9]x:/i.exec(lines[k]) != null) {outputA += lines[k]+"\n"; outputB += lines[k]+"\n";}
 					else if (/\(refrein [0-9]\)|\(refrein\)/i.exec(lines[k]) != null) {
 						if (i == 0) {outputA +="(refrein)\n";}
 						else {outputA += "(refrein "+2*i+")\n";}
 						outputB += "(refrein "+(2*i+1)+")\n";
 					}
 					else if (/\(refrein [0-9]x\)/i.exec(lines[k]) != null) {outputA += lines[k]+"\n"; outputB += lines[k]+"\n";}
 					else if (/\([0-9]x\)|Bridge:|Bridge [0-9]x:|Slot:|Couplet:/i.exec(lines[k]) != null) {outputA += lines[k]+"\n"; outputB += lines[k]+"\n";}
 					else {
 						if (kk % 2 === 0) {
 							if (halfLang == true && /[A-z]{2}/.exec(lines[k]) != null) {} 
 							else {
 								outputA += lines[k]+"\n";
 							} 							
 						} else {
 							outputB += lines[k]+"\n";
 						}
 						if (langa != true && langb != true) {kk++;}
 					} 
 				}
 			}
 			outputA += "\n"; outputB += "\n";
 		}
 		if (langNames[1] == "") {output += outputA;}
 		else if (halfLang == true) {output += outputA;}
 		else {output += outputA+outputB;}
 		var outputA = ""; var outputB = ""; halfLang = false;
 	}
 	output += "\n----------------------------\nGAVE "+opsNum+" - PROJECTIEVERSIE:\n\n"+opsInput;
 	output = output.replace(/\n{3,}/g, "\n\n")
 	$("#opsoutput").html(output);
 	$(document).scrollTop( $("#opsoutput").offset().top );
 	if ( $("#opsnumautoinc").prop("checked") == true ) {
 		var opsNewNum = opsNum + 1;
 		$("#opsnum").val(opsNewNum);
 	}
 } 
function opsCopyOutput() {
	$("#opsoutput").select();
	document.execCommand("copy");
}
function opsClearInput() {
	$("#opsinput").val("");
	$("#opsinput").select();
	$(document).scrollTop( $("#opsnum").offset().top );
}