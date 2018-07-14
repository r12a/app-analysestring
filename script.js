function escapeRegExp(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}


function chars2cps ( chars ) { 
	// this is needed because of javascript's handling of supplementary characters
	// char: a string of unicode characters
	// returns an array of decimal code point values
	var haut = 0
	var out = []
	for (var i = 0; i < chars.length; i++) {
		var b = chars.charCodeAt(i)
		if (b < 0 || b > 0xFFFF) {
			alert( 'Error in chars2cps: byte out of range ' + b.toString(16) + '!' )
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) {
				out.push(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00))
				haut = 0
				continue
				}
			else {
				alert( 'Error in chars2cps: surrogate out of range ' + haut.toString(16) + '!' )
				haut = 0
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b
			}
		else {
			out.push( b )
			}
		}
	return out
	}


function makeList (stream) {
	stream = stream.replace(/ /g,'')
    var chars = [...stream]
    
    var out = ''
    for (let i=0;i<chars.length;i++) {
        out += listChars(chars[i].codePointAt(0))
        }
    
    

	document.getElementById('out').innerHTML = out
	}



function listChars ( codepoint ) { 
	// displays a description of a single character in the right panel, plus notes if appropriate
	// codepoint: a decimal integer representing the Unicode scalar value of the character to be displayed
    // removes calls to decodeunicode images
    
	var MsPadding = ''  // Will be set to a space if this is a non-spacing mark
	var description = false
	var div, span, img, table, tbody, tr, td, button

    var out = '<div class="charInfo" id="charInfo">'
    
	charData = getDataFor(codepoint)
	charType = getCharType( codepoint )
	scriptGroup = findScriptGroup(codepoint)
	
	if (charType == 2 || charType == 3 || charType == 5) { 
		var cRecord = charData.split(';')
		if (cRecord[3] > 0) { MsPadding = '\u00A0' }  // ie. this is a combining character

		// draw the large character
        out += '<div class="largeCharDiv">'
        
        // add img, if available and graphic toggle set
		if (charType === 2) {
            out += '<img class="largeChar" title="' + parseInt(cRecord[0], 16) + '" '
            if (document.getElementById('showLargeImg').checked) size = '/large' 
            else size = ''
            out += 'src="' + '../c/'+scriptGroup.replace(/ /g,'_')+size+'/'+cRecord[0]+'.png' + '"/>' 
            }       
        // otherwise add text
		else { 
            out += '<span class="largeChar" title="' + parseInt(cRecord[0], 16) + '"'
            if (document.getElementById('showLargeImg').checked) out += ' style="font-size:190px;"'
            else out += ' style="font-size: 28px;"'
            out += '>'
            out += MsPadding + getCharFromInt(parseInt(cRecord[0],16))
            out += '</span>'
			}
       out += "</div>" 
		

		// character no. & name
        out += '<div class="charNameAndNum">'
        //out += '<span class="charNum" style="margin-right:.75em;">' + 'U+'+cRecord[HEX_NUM] + '</span>'
        out += '<a class="charNum" style="margin-right:.75em;" target="blockdata" href="../uniview/?char='+cRecord[HEX_NUM]+'">' + 'U+'+cRecord[HEX_NUM] + '</a>'
        out += ' '+cRecord[CHAR_NAME]
        out += '</div>'
        

        if (document.getElementById('showBlockInfo').checked) {
            //find script group
            out += '<p class="scriptGroup"><strong>Unicode block:</strong> <a href="../uniview/?block='+scriptGroup+'" target="blockdata">' + scriptGroup + '</a>'


            // display script group
            var subgroup = ''
            if (st[cRecord[SUBTITLE_FIELD]]) subgroup = ', <span class="subcat">'+st[cRecord[SUBTITLE_FIELD]]+'</span>'
            out += subgroup + '</p>'
            }



        if (document.getElementById('showProps').checked || document.getElementById('showOther').checked) {
        out += '<table class="propsTable"><tbody>'
        
        if (document.getElementById('showProps').checked) {
        // fill out properties table	
        out += '<tr><td>General category:</td><td>' + cRecord[GEN_CAT]+' - '+generalProp[ cRecord[GEN_CAT] ] + '</td></tr>'
        
        out += '<tr><td>Canonical combining class:</td><td>' + cRecord[CAN_COMB_CL]+' - '+combClass[ cRecord[CAN_COMB_CL] ] + '</td></tr>'
        
        let string = cRecord[BIDI_CAT] + ' - ' + bidiProp[ cRecord[BIDI_CAT] ]
			if (cRecord[9] == 'Y' ) { string += '\u00A0 \u00A0 [Mirrored]' }
        out += '<tr><td>Bidirectional category:</td><td>' + string + '</td></tr>'
        
		if (cRecord[DECOMP_MAP]) {
            out += '<tr><td>Character decomposition mapping:</td><td>' + cRecord[DECOMP_MAP] +  ' \u00A0\u00A0 '
            let cps = cRecord[DECOMP_MAP].split(' ')
            let dresult = ''
            for (let n=0; n<cps.length; n++) {
                if (cps[n].charAt(0) != '[') {
                    dresult += getCharFromInt(parseInt(cps[n],16))+''
                    }
                }
            out += '<span class="ie">' + dresult + '</span>'
            out += '</td></tr>'
           }
        
 		if (cRecord[DEC_DIG_VALUE]) {
            out += '<tr><td>Decimal digit value:</td><td>' + cRecord[DEC_DIG_VALUE] + '</td></tr>'
            }
        
 		if (cRecord[DIG_VALUE]) {
            out += '<tr><td>Digit value:</td><td>' + cRecord[DIG_VALUE] + '</td></tr>'
            }
        
 		if (cRecord[NUMERIC_VALUE]) {
            out += '<tr><td>Numeric value:</td><td>' + cRecord[NUMERIC_VALUE] + '</td></tr>'
            }
        
 		if (cRecord[UC_MAP]) {
            out += '<tr><td>Uppercase mapping:</td><td>' + cRecord[UC_MAP] +' \u00A0\u00A0 '
            let dresult = getCharFromInt(parseInt(cRecord[UC_MAP],16))+''
            out += '<span class="ie">' + dresult + '</span>'
            out += '</td></tr>'
            }
        
 		if (cRecord[TC_MAP]) {
            out += '<tr><td>Titlecase mapping:</td><td>' + cRecord[TC_MAP] +' \u00A0\u00A0 '
            let dresult = getCharFromInt(parseInt(cRecord[TC_MAP],16))+''
            out += '<span class="ie">' + dresult + '</span>'
            out += '</td></tr>'
            }
        
 		if (cRecord[LC_MAP]) {
            out += '<tr><td>Lowercase mapping:</td><td>' + cRecord[LC_MAP] +' \u00A0\u00A0 '
            let dresult = getCharFromInt(parseInt(cRecord[LC_MAP],16))+''
            out += '<span class="ie">' + dresult + '</span>'
            out += '</td></tr>'
            }
        }
        
        
         if (document.getElementById('showOther').checked) {
        // fill out additional table	
 		if (cRecord[UNICODE_1_NAME]) {
            out += '<tr><td>Unicode 1.0 name:</td><td>' + cRecord[UNICODE_1_NAME] + '</td></tr>'
            }
        
 		if (cRecord[ISO_COMMENT]) {
            out += '<tr><td>10646 comment field:</td><td>' + cRecord[ISO_COMMENT] + '</td></tr>'
            }
        
        out += '<tr><td>Unicode version:</td><td>' + cRecord[AGE_FIELD] + '</td></tr>'
        
		// add character
        out += '<tr><td>As text:</td><td class="astext">' + MsPadding + getCharFromInt(parseInt(cRecord[0],16)) + '</td></tr>'
        
		// add decimal value
        out += '<tr><td>Decimal:</td><td class="astext">' + codepoint + '</td></tr>'
        

        }

        out += '</tbody></table>'
        }

		// return block name if this character listed as contained in block doc
		var blockfile = charInfoPointer(cRecord[HEX_NUM])
        //blockfile = false
		

		if (document.getElementById('showDescriptions').checked) { 
		// display Description heading
		if (desc[eval('0x'+cRecord[HEX_NUM])] || blockfile) { 
            out += '<p class="descriptions"><strong>Description:</strong>'
            }

        // display any Unicode descriptions
        if (desc[eval('0x'+cRecord[HEX_NUM])]) {
            dRecord = desc[eval('0x'+cRecord[HEX_NUM])].split('¶')
            description = true
            for (var j=0; j < dRecord.length; j++ ) {
                out += dRecord[j] + '<br/>'
                }
            }

        // display link to character notes
        if (blockfile) {
            out += '<br/><a class="notesexplx" target="blockdata" href="'+'../scripts/'+blockfile+'/block#char'+cRecord[HEX_NUM]+ '">Show character notes.</a>'
            }
        out += '</p>'
        
		//add link to UniHan db
		var pageNum = 0
		var approx = ''
		if (scriptGroup == 'CJK Unified Ideographs') { pageNum = Math.floor(((codepoint-0x4E00)/40)+2); blockstart = '4E00'; approx = ' [35Mb file!]'  }
		if (scriptGroup == 'CJK Unified Ideographs Extension A') { pageNum = Math.floor(((codepoint-13312)/56.25)+2); blockstart = '3400'; approx = ', approx [6Mb file!]' }
		if (scriptGroup == 'CJK Unified Ideographs Extension B') { pageNum = Math.floor(((codepoint-0x20000)/58.67)+2); blockstart = '20000'; approx = ', approx [40Mb file!]' }
		if (scriptGroup == 'CJK Unified Ideographs Extension C') { pageNum = Math.floor(((codepoint-0x2A700)/78.26)+2); blockstart = '2A700'; approx = ', approx' }
		if (scriptGroup == 'CJK Unified Ideographs Extension D') { pageNum = Math.floor(((codepoint-0x2B740)/80)+2); blockstart = '2B740' }
		if (scriptGroup == 'CJK Unified Ideographs Extension E') { pageNum = Math.floor(((codepoint-0x2B820)/80)+2); blockstart = '2B820' }
		if (scriptGroup == 'CJK Unified Ideographs Extension F') { pageNum = Math.floor(((codepoint-0x2CEB0)/80)+2); blockstart = '2CEB0' }
		if (scriptGroup == 'Hangul Syllables') { pageNum = Math.floor(((codepoint-0xAC00)/256)+2); blockstart = 'AC00' }
			
		// add link to Unihan db
		if (pageNum > 0 && scriptGroup != 'Hangul Syllables') {
            out += '<p class="descriptions"><strong>Description:</strong>'
            out += '<br/>Show in <a href="http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint='+cRecord[0]+'&useutf8=true" target="blockdata">UniHan database</a>'
            out += '</p>'
			}
/*		
		// add pointer to PDF code chart page
		if (pageNum > 0 && scriptGroup) {
			p = newContent.appendChild( document.createElement( 'p' ))
			p.appendChild( document.createTextNode( 'View in ' ))
			a = p.appendChild( document.createElement( 'a' ))
			a.appendChild( document.createTextNode( 'PDF code charts' ))
			a.setAttribute( 'href', 'http://www.unicode.org/charts/PDF/U'+blockstart+'.pdf#page='+pageNum )
			a.setAttribute( 'target', 'unihan' )
			p.appendChild( document.createTextNode( ' (page '+pageNum+approx+')' ))
			}
            */
        }


    out += '<br style="line-height:1px; clear:both;"/></div>'
 
    return out
    }
    
    
	else { // this is either  an unassigned character or a surrogate character
		var group = findScriptGroup(codepoint)
		
		// character no. & name
        out += '<div style="margin-top:10px".'
        var hexcpvalue = codepoint.toString(16).toUpperCase()
		while (hexcpvalue.length < 4) { hexcpvalue = '0'+hexcpvalue }
		out += 'U+'+hexcpvalue+' '+'Unassigned character.' + '</div>'
		
		//find script group
        out += '<p style="margin-top: 18px;"><strong>Unicode block:</strong> <a href="#" onclick="showSelection( getRange(scriptGroup) ); return false;">' + scriptGroup + '</a></p>'
		}
    
    
    
    
    
    
    /*


			
		
		// add NCR value
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( 'HTML escape:' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( '&#x'+cRecord[0]+';' ))

		// add URL encoded value
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( 'URL escape:' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.appendChild( document.createTextNode( convertChar2pEsc(codepoint) ))

		// add link to Conversion tool
		tr = tbody.appendChild( document.createElement( 'tr' ))
		td = tr.appendChild( document.createElement( 'td' ))
        td.setAttribute( 'colspan', '2')
        td.innerHTML = '<a href="../app-conversion?q='+getCharFromInt(parseInt(cRecord[0],16))+'" target="conversion">More alternative forms</a>'


			
		//add link to CLDR
		p = newContent.appendChild( document.createElement( 'p' ))
        p.style.marginTop = "18px"
		p.appendChild( document.createTextNode( 'More properties at ' ))
		a = p.appendChild( document.createElement( 'a' ))
		a.appendChild( document.createTextNode( 'CLDR\'s Property demo' ))
		a.setAttribute( 'href', 'http://unicode.org/cldr/utility/character.jsp?a='+cRecord[0] )
		a.setAttribute( 'target', 'cldr' )
		
		//add link to decodeUnicode
		p = newContent.appendChild( document.createElement( 'p' ))
        p.style.marginTop = "0px"
		p.appendChild( document.createTextNode( 'Descriptions at ' ))
		a = p.appendChild( document.createElement( 'a' ))
		a.appendChild( document.createTextNode( 'decodeUnicode' ))
		a.setAttribute( 'href', 'http://www.decodeunicode.org/U+'+cRecord[0] )
		a.setAttribute( 'target', 'decodeunicode' )
		
		//add link to FileFormat
		p = newContent.appendChild( document.createElement( 'p' ))
        p.style.marginTop = "0px"
		p.appendChild( document.createTextNode( 'Java data at ' ))
		a = p.appendChild( document.createElement( 'a' ))
		a.appendChild( document.createTextNode( 'FileFormat' ))
		a.setAttribute( 'href', 'http://www.fileformat.info/info/unicode/char/'+cRecord[0] )
		a.setAttribute( 'target', 'fileformat' )
		

		
		

		}
*/		
	}	



function copyToClipboard (node) {
	var oldContent = node.textContent
	node.textContent=node.textContent.replace(/\u200B/g,'')
	node.contentEditable=true
	node.focus()
	document.execCommand('selectAll')
	document.execCommand('copy')
	node.contentEditable=false
	node.textContent=oldContent
	}