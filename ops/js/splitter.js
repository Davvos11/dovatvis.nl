let opsUrl;

const inputId = 'input';
const amountId = 'amount';
const regExTitlesId = 'regex-titles';
const regExIgnoreId = 'regex-ignore';
const outputDivId = 'output';
const exportOpsId = 'export-ops';

const additionalRegex = new RegExp(/^(\s)*\n$/ , 'i'); // Matches lines with only blank spaces
const defaultTitlesRegex = new RegExp(/Refrein [0-9]:|Refrein:|Refrein [0-9]x:|Refrein \([0-9]x\):|\(refrein [0-9]\)|\(refrein\)|\(refrein [0-9]x\)|(?=^)\([0-9]x\)|Bridge:|Bridge [0-9]x:|Couplet:|Couplet [0-9]:|Slot:|\[split[s]*]|\[join]|\[verbind]/, 'i');
const defaultIgnoreRegex = new RegExp(/\[lang a]|\[lang b]|\[trans off]|\[trans on]/, 'i');

window.onload = function () {
    if ($('#'+regExTitlesId).val() === "") setDefaultRegex(0);
    if ($('#'+regExIgnoreId).val() === "") setDefaultRegex(1);
};

function setDefaultRegex(i) {
    switch (i) {
        case 0: $('#'+regExTitlesId).val(defaultTitlesRegex.source); break;
        case 1: $('#'+regExIgnoreId).val(defaultIgnoreRegex.source); break;
    }
}

function split() {
    // Get input and settings
    let input = $('#'+inputId).val();
    let amount = $('#'+amountId).val();
    let regExTitlesInput = $('#'+regExTitlesId).val();
    let regExIgnoreInput = $('#'+regExIgnoreId).val();


    // Generate regEx
    let regExTitle;
    if (regExTitlesInput === "") {
        regExTitle = additionalRegex
    } else {
        regExTitle = new RegExp(regExTitlesInput);
        regExTitle = new RegExp(regExTitle.source + '|' + additionalRegex.source, 'i');
    }
                            // noinspection RegExpUnexpectedAnchor (a^ will match nothing, which is what we want)
    let regExIgnore = new RegExp((regExIgnoreInput ? regExIgnoreInput : /a^/i));

    regExTitle.ignoreCase;
    regExIgnore.ignoreCase;


    // Generate array for outputs
    let output = [];
    for (let i = 0; i < amount; i++) {
        output[i] = "";
    }


    // Split into lines
    let lines = toLines(input);

    // Loop through lines
    let j = 0;
    for (let i = 0; i < lines.length; i++) {
        let line= lines[i] + "\n";

        if (line.match(regExTitle)) {
            appendToAll(output, line);
        } else if (line.match(regExIgnore)) {

        } else {
            output[ j % amount ] = output[ j % amount ] + line;
            j++;
        }
    }

    // Output
    outputToTextAreas(output)
}

function toLines(input) {
    return input.toString().split('\n')
}

function appendToAll(array, string) {
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i] + string;
    }
}

function outputToTextAreas(output) {
    let classes = "form-control bg-dark text-light h-100";
    switch (output.length) {
        case (1):
            classes += " col-12";
            break;
        case (2):
            classes += " col-12 col-sm-6";
            break;
        case (3):
            classes += " col-12 col-sm-6 col-md-4";
            break;
        default:
            classes += " col-12 col-sm-6 col-md-4 col-lg-3";
            break;
    }

    let html = "";
    for (let i = 0; i < output.length; i++) {
        html += "<textarea class=\"" + classes + "\" readonly>" +
            output[i] + "</textarea>"
    }

    $('#'+outputDivId).html(html);

    if (output.length === 2 || output.length === 3) {
        opsUrl = generateOpsUrl(output);
        $('#'+exportOpsId).removeClass('d-none')
            .addClass('d-flex')
    } else {
        $('#'+exportOpsId).removeClass('d-flex')
            .addClass('d-none')
    }
}

function generateOpsUrl(text) {
    let output = {};

    output['l1'] = text[0];
    switch (text.length) {
        case 2:
            output['l2'] = text[1];
            break;
        case 3:
            output['lf'] = text[1];
            output['l2'] = text[2];
            break;
    }

    return '../pages/ops2.html?auto=1&' + encodeQueryData(output);
}

function encodeQueryData(data) {
    const ret = [];
    for (let d in data)     if (data.hasOwnProperty(d))
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}

function exportOps() {
    window.location.href = opsUrl;}