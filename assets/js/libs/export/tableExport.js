	(function($){
        $.fn.extend({
            tableExport: function(options) {
                var defaults = {
						separator: ',',
						ignoreColumn: [],
						tableName:'yourTableName',
						type:'csv',
						pdfFontSize:14,
						pdfLeftMargin:20,
						escape:'true',
						htmlContent:'false',
						consoleLog:'false',
						multiple: 0,
						start: 0,
						fileName: 'Report'
				};
				
                if($("#tableID0").length)
                	document.getElementById("tableID0").style.display = "block";

				var options = $.extend(defaults, options);
				var el = this;
				if(defaults.type == 'csv'){

					document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
					document.getElementById('message').innerHTML = '<strong>Downloading Report <i class="fa fa-spinner fa-pulse"></i></strong>';
					document.getElementById('message').style.display = "block";
					
					// Header
					var tdData ="";
					
					if ( $("#tableID0").length ) {
						var el = $("#tableID0");
						var newTitle = $(el).attr("title");
						tdData += "\n";
						tdData += newTitle+"\n";
						$(el).find('thead').find('tr').each(function() {			
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							$(el).find('tfoot').find('tr').each(function() {
								tdData += "\n";
									$(this).filter(':visible').find('td').each(function(index,data) {
										if ($(this).css('display') != 'none'){
											if(defaults.ignoreColumn.indexOf(index) == -1){
												var string = parseString($(this));
												if (string.match(/"|,/)) {
											        string = string; //string.replace(/,/g,' & ');
											    }
												tdData += '"'+ string + '"'+ defaults.separator;
											}
										}
									});
									//tdData = $.trim(tdData);
									tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							tdData += "\n";	
					}
					
					var el = this;
					if($('#tableID1').length)
						var hiddenColumns1 = $('#tableID1').bootstrapTable('getHiddenColumns');
					else
						hiddenColumns1 = [];
					
					var hiddenColumns = $('#tableID').bootstrapTable('getHiddenColumns');
						
					if(hiddenColumns.length > hiddenColumns1.length && hiddenColumns.constructor === Array)
						var finalHidden = hiddenColumns;
					else
						var finalHidden = hiddenColumns1;
					
					console.log(finalHidden);
					var indexs = [];
					for(var cnt = 0; cnt < finalHidden.length; cnt++){
						indexs.push(finalHidden[cnt]['fieldIndex']);
					}
					console.log(indexs);

					var newTitle = $(el).attr("title");
					if(newTitle == null || newTitle === undefined || newTitle == ''){
						newTitle = '';
					}
					tdData += "\n";
					tdData += newTitle+"\n";
					$(el).find('thead').find('tr').each(function() {										
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var string = parseString($(this));
									if (string.match(/"|,/)) {
								        string = string; //string.replace(/,/g,' & ');
								    }
									if (string.match(/"|"/)) {
								        string = string.replace(/"/g,'');
								    }
									tdData += '"'+ string + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					$(el).find('tfoot').find('tr').each(function() {
						tdData += "\n";
							$(this).filter(':visible').find('td').each(function(index,data) {
								if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										var string = parseString($(this));
										if (string.match(/"|,/)) {
									        string = string; //string.replace(/,/g,' & ');
									    }
										tdData += '"'+ string + '"'+ defaults.separator;
									}
								}
							});
							//tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
					
					//console.log(defaults.multiple);
					for(var start=1;start<=defaults.multiple && defaults.multiple != 0;start++){
						el = '#tableID'+start;
						var newTitle = $(el).attr("title");
						tdData += "\n\n";
						if(newTitle == null || newTitle === undefined || newTitle == ''){
							newTitle = '';
						}else{
							tdData += newTitle+"\n";
						}
						
						$(el).find('thead').find('tr').each(function() {
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tfoot').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none' && indexs.indexOf(index) == -1){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
					}
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					//console.log(tdData);
					//window.open('data:text/csv;charset=utf-8,' + escape(tdData));
					//window.open('data:text/csv; filename=exportData.csv;' + base64data);
					var downloadLink = document.createElement("a");
				    var blob = new Blob(["\ufeff", tdData]);
				    var url = URL.createObjectURL(blob);
				    downloadLink.href = url;
				    downloadLink.download = defaults.fileName + ".csv";

				    document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
					document.getElementById('message').innerHTML = '<strong>Report download started</strong>';
					document.getElementById('message').style.display = "block";
					$('#message').delay(5000).fadeOut('slow');

				    document.body.appendChild(downloadLink);
				    downloadLink.click();
				    document.body.removeChild(downloadLink);

				}
				else if(defaults.type == 'sql'){
				
					// Header
					var tdData ="INSERT INTO `"+defaults.tableName+"` (";
					$(el).find('thead').find('tr').each(function() {
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '`' + parseString($(this)) + '`,' ;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					tdData += ") VALUES ";
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "(";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '",';
								}
							}
						});
						
						tdData = $.trim(tdData).substring(0, tdData.length -1);
						tdData += "),";
					});
					
					// Row vs Column
					$(el).find('tfoot').find('tr').each(function() {
					tdData += "(";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '",';
								}
							}
						});
						
						tdData = $.trim(tdData).substring(0, tdData.length -1);
						tdData += "),";
					});
					tdData = $.trim(tdData).substring(0, tdData.length -1);
					tdData += ";";
					
					//output
					//console.log(tdData);
					
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					
					var base64data = "base64," + $.base64.encode(tdData);
					window.open('data:application/sql;filename=exportData;' + base64data);
					
				
				}
				else if(defaults.type == 'json'){
				
					var jsonHeaderArray = [];
					$(el).find('thead').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonHeaderArray.push(jsonArrayTd);						
						
					});
					
					var jsonArray = [];
					$(el).find('tbody').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonArray.push(jsonArrayTd);									
						
					});
					
					$(el).find('tfoot').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonArray.push(jsonArrayTd);									
						
					});
					
					var jsonExportArray =[];
					jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
					
					//Return as JSON
					//console.log(JSON.stringify(jsonExportArray));
					
					//Return as Array
					//console.log(jsonExportArray);
					if(defaults.consoleLog == 'true'){
						console.log(JSON.stringify(jsonExportArray));
					}
					
					var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
					console.log(base64data);
					window.open('data:application/json;filename=exportData;' + base64data);
				}
				else if(defaults.type == 'xml'){
				
					var xml = '<?xml version="1.0" encoding="utf-8"?>';
					xml += '<tabledata><fields>';

					// Header
					$(el).find('thead').find('tr').each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<field>" + parseString($(this)) + "</field>";
								}
							}
						});									
					});					
					xml += '</fields><data>';
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						xml += '<row id="'+rowCount+'">';
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
								}
							}
							colCount++;
						});															
						rowCount++;
						xml += '</row>';
					});	
					$(el).find('tfoot').find('tr').each(function() {
						xml += '<row id="'+rowCount+'">';
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
								}
							}
							colCount++;
						});															
						rowCount++;
						xml += '</row>';
					});	
					
					xml += '</data></tabledata>'
					
					if(defaults.consoleLog == 'true'){
						console.log(xml);
					}
					var base64data = "base64," + $.base64.encode(xml);
					window.open('data:application/xml;filename=exportData;' + base64data);

				}
				else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){
					//console.log($(this).html());
					var excel="<table>";
					// Header
					$(el).find('thead').find('tr').each(function() {
						excel += "<tr>";
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								if(defaults.ignoreColumn.indexOf(index) == -1){
									excel += "<td>" + parseString($(this))+ "</td>";
								}
							}
						});	
						excel += '</tr>';						
						
					});					
					
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						excel += "<tr>";
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									excel += "<td>"+parseString($(this))+"</td>";
								}
							}
							colCount++;
						});															
						rowCount++;
						excel += '</tr>';
					});	
					$(el).find('tfoot').find('tr').each(function() {
						excel += "<tr>";
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									excel += "<td>"+parseString($(this))+"</td>";
								}
							}
							colCount++;
						});															
						rowCount++;
						excel += '</tr>';
					});	
					excel += '</table>'
					
					if(defaults.consoleLog == 'true'){
						console.log(excel);
					}
					
					var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='https://www.w3.org/TR/REC-html40'>";
					excelFile += "<head>";
					excelFile += "<!--[if gte mso 9]>";
					excelFile += "<xml>";
					excelFile += "<x:ExcelWorkbook>";
					excelFile += "<x:ExcelWorksheets>";
					excelFile += "<x:ExcelWorksheet>";
					excelFile += "<x:Name>";
					excelFile += "{worksheet}";
					excelFile += "</x:Name>";
					excelFile += "<x:WorksheetOptions>";
					excelFile += "<x:DisplayGridlines/>";
					excelFile += "</x:WorksheetOptions>";
					excelFile += "</x:ExcelWorksheet>";
					excelFile += "</x:ExcelWorksheets>";
					excelFile += "</x:ExcelWorkbook>";
					excelFile += "</xml>";
					excelFile += "<![endif]-->";
					excelFile += "</head>";
					excelFile += "<body>";
					excelFile += excel;
					excelFile += "</body>";
					excelFile += "</html>";

					var base64data = "base64," + $.base64.encode(excelFile);
					window.open('data:application/vnd.ms-'+defaults.type+';filename=exportData.doc;' + base64data);
					
				}
				else if(defaults.type == 'png'){
					html2canvas($(el), {
						onrendered: function(canvas) {										
							var img = canvas.toDataURL("image/png");
							window.open(img);
						}
					});		
				}
				else if(defaults.type == 'pdf'){
					defaults.separator = '^';

					document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
					document.getElementById('message').innerHTML = '<strong>Downloading Report <i class="fa fa-spinner fa-pulse"></i></strong>';
					document.getElementById('message').style.display = "block";
					
					var tdData ="";
					
					if ( $("#tableID0").length ) {
						var el = $("#tableID0");
						$(el).find('thead').find('tr').each(function() {			
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							$(el).find('tfoot').find('tr').each(function() {
								tdData += "\n";
									$(this).filter(':visible').find('td').each(function(index,data) {
										if ($(this).css('display') != 'none'){
											if(defaults.ignoreColumn.indexOf(index) == -1){
												var string = parseString($(this));
												if (string.match(/"|,/)) {
											        string = string; //string.replace(/,/g,' & ');
											    }
												tdData += '"'+ string + '"'+ defaults.separator;
											}
										}
									});
									//tdData = $.trim(tdData);
									tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							tdData += "\n";	
					}
					
					var headData = tdData;
					headData +="\n\n";
					tdData = "";
					var multipleTable = [];
					var mainTable = "";
					if(defaults.multiple > 1){
						
						for(var start=1;start<=defaults.multiple && defaults.multiple != 0;start++){
							if(defaults.start == 1 && start == 1)
								el = '#datatable';
							else
								el = '#datatable'+start;
							
							$(el).find('thead').find('tr').each(function() {
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tfoot').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							if(start == 1){
								mainTable = tdData;
							}else{
								multipleTable[start] = tdData;
							}
							tdData = "";
						}	
					}else{
						var el = this;
					
						$(el).find('thead').find('tr').each(function() {
							tdData += "\n";				
							$(this).filter(':visible').find('th').each(function(index,data) {
								if ($(this).css('display') != 'none'){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
									}
								}
								
							});
							tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
						
						// Row vs Column
						$(el).find('tbody').find('tr').each(function() {
						tdData += "\n";
							$(this).filter(':visible').find('td').each(function(index,data) {
								if ($(this).css('display') != 'none'){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										var string = parseString($(this));
										
										tdData += '"'+ string + '"'+ defaults.separator;
									}
								}
							});
							//tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
						$(el).find('tfoot').find('tr').each(function() {
							tdData += "\n";
							$(this).filter(':visible').find('td').each(function(index,data) {
								if ($(this).css('display') != 'none'){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										var string = parseString($(this));
										
										tdData += '"'+ string + '"'+ defaults.separator;
									}
								}
							});
							//tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
						mainTable = tdData;
					}
					tdData = mainTable;
					document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
					document.getElementById('message').innerHTML = '<strong>Report download started</strong>';
					document.getElementById('message').style.display = "block";
					$('#message').delay(5000).fadeOut('slow');

					defaults.separator = ',';
					var multipleTable = [];
					multipleTable = JSON.stringify(multipleTable);
					var globalStoreName = $('#storeList option:selected').text();

					if (globalStoreName == '') {
						globalStoreName = $('#sourceList option:selected').text();
					}
					post('../assets/js/libs/export/fpdf/pdfExport.php', {data: tdData, storeName: globalStoreName, multiple: defaults.multiple, multipleData: multipleTable,fileName:defaults.fileName});
				
				}
				else if(defaults.type == 'mail'){
					
					// Header
					var tdData ="";
					
					if ( $("#tableID0").length ) {
						var el = $("#tableID0");
						var newTitle = $(el).attr("title");
						tdData += "\n";
						tdData += newTitle+"\n";
						$(el).find('thead').find('tr').each(function() {			
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							$(el).find('tfoot').find('tr').each(function() {
								tdData += "\n";
									$(this).filter(':visible').find('td').each(function(index,data) {
										if ($(this).css('display') != 'none'){
											if(defaults.ignoreColumn.indexOf(index) == -1){
												var string = parseString($(this));
												if (string.match(/"|,/)) {
											        string = string; //string.replace(/,/g,' & ');
											    }
												tdData += '"'+ string + '"'+ defaults.separator;
											}
										}
									});
									//tdData = $.trim(tdData);
									tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							tdData += "\n";	
					}
					
					el = this;
					
					$(el).find('thead').find('tr').each(function() {
					tdData += "\n";					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var string = parseString($(this));
									if (string.match(/"|,/)) {
								        string = string; //string.replace(/,/g,' - ');
								    }
									tdData += '"'+ string + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					$(el).find('tfoot').find('tr').each(function() {
						tdData += "\n";
							$(this).filter(':visible').find('td').each(function(index,data) {
								if ($(this).css('display') != 'none'){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										var string = parseString($(this));
										if (string.match(/"|,/)) {
									        string = string; //string.replace(/,/g,' - ');
									    }
										tdData += '"'+ string + '"'+ defaults.separator;
									}
								}
							});
							//tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					//console.log(tdData);
					
					var mailTo = $("#mailTo").val();
					var mailCC = $("#mailCC").val();
					var mailSubject = $("#mailSubject").val();
					var mailMessage = $("#mailMessage").val();
					if(mailTo == '' || mailSubject == '' || mailMessage == ''){
						document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Fill all fields to send report!</strong>';
						document.getElementById('message').style.display = "block";
						$('#message').delay(5000).fadeOut('slow');
					}
					else{
						document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Sending Report <i class="fa fa-spinner fa-pulse"></i></strong>';
						document.getElementById('message').style.display = "block";
						$.ajax({
							type: "POST",
							url: "../mail/mailReport.php",
							data: "csvData="+encodeURIComponent(tdData)+"&type=csv&to="+mailTo+"&cc="+mailCC+"&subject="+mailSubject+"&message="+mailMessage+"&fileName="+defaults.fileName,
							success: function(data) {
									console.log(data);
									if(data == true){
										document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Report Sent</strong>';
										document.getElementById('message').style.display = "block";
										$('#message').delay(5000).fadeOut('slow');
										
									}else{
										document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Error in sending report! Try Again</strong>';
										document.getElementById('message').style.display = "block";
										$('#message').delay(5000).fadeOut('slow');
									}
								},
				                error: function(XMLHttpRequest, textStatus, errorThrown) { 
				                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
				                } 
							});
					}
				}
				else if(defaults.type == 'mailOrder'){
					
					el = "#tableID";
					// Header
					var tdData = "\n Order Summary ";
					$(el).find('thead').find('tr').each(function() {
					tdData += "\n";	
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var string = parseString($(this));
									if (string.match(/"|,/)) {
								        string = string; //string.replace(/,/g,' & ');
								    }
									tdData += '"'+ string + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					tdData += "\n\n Order Details ";
					
					el = "#tableID1";
					
					// Header
					$(el).find('thead').find('tr').each(function() {
					tdData += "\n";					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var string = parseString($(this));
									if (string.match(/"|,/)) {
								        string = string; //string.replace(/,/g,' & ');
								    }
									tdData += '"'+ string + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					var mailTo = $("#mailTo").val();
					var mailCC = $("#mailCC").val();
					var mailSubject = $("#mailSubject").val();
					var mailMessage = $("#mailMessage").val();
					if(mailTo == '' || mailSubject == '' || mailMessage == ''){
						document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Fill all fields to send report!</strong>';
						document.getElementById('message').style.display = "block";
					}
					else{
						document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Sending Report <i class="fa fa-spinner fa-pulse"></i></strong>';
						document.getElementById('message').style.display = "block";
						$.ajax({
							type: "POST",
							url: "../mail/mailReport.php",
							data: "csvData="+tdData+"&type=csv&to="+mailTo+"&cc="+mailCC+"&subject="+mailSubject+"&message="+mailMessage+"&fileName="+defaults.fileName,
							success: function(data) {
									console.log(data);
									if(data == true){
										document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Report Sent</strong>';
										document.getElementById('message').style.display = "block";
									}else{
										document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Error in sending report! Try Again</strong>';
										document.getElementById('message').style.display = "block";
									}
								},
				                error: function(XMLHttpRequest, textStatus, errorThrown) { 
				                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
				                } 
							});
					}
				}
				else if(defaults.type == 'mailCSV'){
					// Header
					var tdData ="";
					
					if ( $("#tableID0").length ) {
						var el = $("#tableID0");
						var newTitle = $(el).attr("title");
						tdData += "\n";
						tdData += newTitle+"\n";
						$(el).find('thead').find('tr').each(function() {			
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							$(el).find('tfoot').find('tr').each(function() {
								tdData += "\n";
									$(this).filter(':visible').find('td').each(function(index,data) {
										if ($(this).css('display') != 'none'){
											if(defaults.ignoreColumn.indexOf(index) == -1){
												var string = parseString($(this));
												if (string.match(/"|,/)) {
											        string = string; //string.replace(/,/g,' & ');
											    }
												tdData += '"'+ string + '"'+ defaults.separator;
											}
										}
									});
									//tdData = $.trim(tdData);
									tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							tdData += "\n";	
					}
					
					var el = this;
					var newTitle = $(el).attr("title");
					tdData += "\n";
					tdData += newTitle+"\n";
					$(el).find('thead').find('tr').each(function() {										
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var string = parseString($(this));
									if (string.match(/"|,/)) {
								        string = string; //string.replace(/,/g,' & ');
								    }
									if (string.match(/"|"/)) {
								        string = string.replace(/"/g,'');
								    }
									tdData += '"'+ string + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					$(el).find('tfoot').find('tr').each(function() {
						tdData += "\n";
							$(this).filter(':visible').find('td').each(function(index,data) {
								if ($(this).css('display') != 'none'){
									if(defaults.ignoreColumn.indexOf(index) == -1){
										var string = parseString($(this));
										if (string.match(/"|,/)) {
									        string = string; //string.replace(/,/g,' & ');
									    }
										tdData += '"'+ string + '"'+ defaults.separator;
									}
								}
							});
							//tdData = $.trim(tdData);
							tdData = $.trim(tdData).substring(0, tdData.length -1);
						});
					
					//console.log(defaults.multiple);
					for(var start=1;start<=defaults.multiple && defaults.multiple != 0;start++){
						el = '#tableID'+start;
						var newTitle = $(el).attr("title");
						tdData += "\n\n";
						tdData += newTitle+"\n";
						$(el).find('thead').find('tr').each(function() {
								$(this).filter(':visible').find('th').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											if (string.match(/"|"/)) {
										        string = string.replace(/"/g,'');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;									
										}
									}
									
								});
								tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tbody').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
							
							// Row vs Column
							$(el).find('tfoot').find('tr').each(function() {
							tdData += "\n";
								$(this).filter(':visible').find('td').each(function(index,data) {
									if ($(this).css('display') != 'none'){
										if(defaults.ignoreColumn.indexOf(index) == -1){
											var string = parseString($(this));
											if (string.match(/"|,/)) {
										        string = string; //string.replace(/,/g,' & ');
										    }
											tdData += '"'+ string + '"'+ defaults.separator;
										}
									}
								});
								//tdData = $.trim(tdData);
								tdData = $.trim(tdData).substring(0, tdData.length -1);
							});
					}
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					var mailTo = $("#mailTo").val();
					var mailCC = $("#mailCC").val();
					var mailSubject = $("#mailSubject").val();
					var mailMessage = $("#mailMessage").val();
					if(mailTo == '' || mailSubject == '' || mailMessage == ''){
						document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Fill all fields to send report!</strong>';
						document.getElementById('message').style.display = "block";
						$('#message').delay(5000).fadeOut('slow');
					}
					else{
						document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
						document.getElementById('message').innerHTML = '<strong>Sending Report <i class="fa fa-spinner fa-pulse"></i></strong>';
						document.getElementById('message').style.display = "block";
						$.ajax({
							type: "POST",
							url: "../mail/mailReport.php",
							data: "csvData="+encodeURIComponent(tdData)+"&type=csv&to="+mailTo+"&cc="+mailCC+"&subject="+mailSubject+"&message="+mailMessage+"&fileName="+defaults.fileName,
							success: function(data) {
									console.log(data);
									if(data == true){
										document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Report Sent</strong>';
										document.getElementById('message').style.display = "block";
										$('#message').delay(5000).fadeOut('slow');
										
									}else{
										document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
										document.getElementById('message').innerHTML = '<strong>Error in sending report! Try Again</strong>';
										document.getElementById('message').style.display = "block";
										$('#message').delay(5000).fadeOut('slow');
									}
								},
				                error: function(XMLHttpRequest, textStatus, errorThrown) { 
				                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
				                } 
							});
					}
				
				}
				
				if($("#tableID0").length)
                	document.getElementById("tableID0").style.display = "none";
				
				function parseString(data){
				
					if(defaults.htmlContent == 'true'){
						content_data = data.html().trim();
					}else{
						content_data = data.text().trim();
					}
					
					if(defaults.escape == 'true'){
						content_data = escape(content_data);
					}
					
					
					
					return content_data;
				}
			
			}
        });
    })(jQuery);
	
	function post(path, params, method) {
	    method = method || "post"; // Set method to post by default if not specified.

	    // The rest of this code assumes you are not using a library.
	    // It can be made less wordy if you use one.
	    var form = document.createElement("form");
	    form.setAttribute("method", method);
	    form.setAttribute("action", path);

	    for(var key in params) {
	        if(params.hasOwnProperty(key)) {
	            var hiddenField = document.createElement("input");
	            hiddenField.setAttribute("type", "hidden");
	            hiddenField.setAttribute("name", key);
	            hiddenField.setAttribute("value", params[key]);

	            form.appendChild(hiddenField);
	         }
	    }

	    document.body.appendChild(form);
	    form.submit();
	}

	function mailPDF() {
	    var pdf = new jsPDF('l', 'pt', 'a3');
	    // source can be HTML-formatted string, or a reference
	    // to an actual DOM element from which the text will be scraped.
	    source = $('#dataDiv')[0];
	
	    // we support special element handlers. Register them with jQuery-style 
	    // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
	    // There is no support for any other type of selectors 
	    // (class, of compound) at this time.
	    specialElementHandlers = {
	        // element with id of "bypass" - jQuery style selector
	        '#bypassme': function (element, renderer) {
	            // true = "handled elsewhere, bypass text extraction"
	            return true
	        }
	    };
	    margins = {
	        top: 4,
	        bottom: 4,
	        left: 4,
	        width: 600
	    };
	    // all coords and widths are in jsPDF instance's declared units
	    // 'inches' in this case
	    pdf.fromHTML(
	    source, // HTML string or DOM elem ref.
	    margins.left, // x coord
	    margins.top, { // y coord
	        'width': margins.width, // max width of content on PDF
	        'elementHandlers': specialElementHandlers
	    }, margins);
	    
	    var savepdf = pdf.output();
	    console.log(savepdf);
	    var mailTo = $("#mailTo").val();
		var mailCC = $("#mailCC").val();
		var mailSubject = $("#mailSubject").val();
		var mailMessage = $("#mailMessage").val();
		if(mailTo == '' || mailSubject == '' || mailMessage == ''){
			document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
			document.getElementById('message').innerHTML = '<strong>Fill all fields to send report!</strong>';
			document.getElementById('message').style.display = "block";
		}
		else{
			document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
			document.getElementById('message').innerHTML = '<strong>Sending Report <i class="fa fa-spinner fa-pulse"></i></strong>';
			document.getElementById('message').style.display = "block";
		    $.ajax({
				type: "POST",
				url: "../mail/mailReport.php",
				data: "csvData="+savepdf+"&type=pdf&to="+mailTo+"&cc="+mailCC+"&subject="+mailSubject+"&message="+mailMessage+"&fileName="+defaults.fileName,
				success: function(data) {
						console.log(data);
						if(data == true){
							document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
							document.getElementById('message').innerHTML = '<strong>Report Sent</strong>';
							document.getElementById('message').style.display = "block";
						}else{
							document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
							document.getElementById('message').innerHTML = '<strong>Error in sending report! Try Again</strong>';
							document.getElementById('message').style.display = "block";
						}
					},
	                error: function(XMLHttpRequest, textStatus, errorThrown) { 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	                } 
			});
		}
	}
	
	function mailCSV(){
		// Header
		var tdData ="";
		$(el).find('thead').find('tr').each(function() {
		tdData += "\n";					
			$(this).filter(':visible').find('th').each(function(index,data) {
				if ($(this).css('display') != 'none'){
					if(defaults.ignoreColumn.indexOf(index) == -1){
						tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
					}
				}
				
			});
			tdData = $.trim(tdData);
			tdData = $.trim(tdData).substring(0, tdData.length -1);
		});
		
		// Row vs Column
		$(el).find('tbody').find('tr').each(function() {
		tdData += "\n";
			$(this).filter(':visible').find('td').each(function(index,data) {
				if ($(this).css('display') != 'none'){
					if(defaults.ignoreColumn.indexOf(index) == -1){
						var string = parseString($(this));
						if (string.match(/"|,/)) {
					        string = string; //string.replace(/,/g,' & ');
					    }
						if (string.match(/"|"/)) {
					        string = string.replace(/"/g,'');
					    }
						tdData += '"'+ string + '"'+ defaults.separator;
					}
				}
			});
			//tdData = $.trim(tdData);
			tdData = $.trim(tdData).substring(0, tdData.length -1);
		});
		
		$(el).find('tfoot').find('tr').each(function() {
			tdData += "\n";
				$(this).filter(':visible').find('td').each(function(index,data) {
					if ($(this).css('display') != 'none'){
						if(defaults.ignoreColumn.indexOf(index) == -1){
							var string = parseString($(this));
							if (string.match(/"|,/)) {
						        string = string; //string.replace(/,/g,' & ');
						    }
							tdData += '"'+ string + '"'+ defaults.separator;
						}
					}
				});
				//tdData = $.trim(tdData);
				tdData = $.trim(tdData).substring(0, tdData.length -1);
			});
		
		//console.log(defaults.multiple);
		for(var start=1;start<=defaults.multiple && defaults.multiple != 0;start++){
			el = '#tableID'+start;
			var newTitle = $(el).attr("title");
			$(el).find('thead').find('tr').each(function() {
				tdData += "\n\n";
				tdData += newTitle+"\n";
					$(this).filter(':visible').find('th').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var string = parseString($(this));
								if (string.match(/"|,/)) {
							        string = string; //string.replace(/,/g,' & ');
							    }
								tdData += '"'+ string + '"'+ defaults.separator;									
							}
						}
						
					});
					tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
				
				// Row vs Column
				$(el).find('tbody').find('tr').each(function() {
				tdData += "\n";
					$(this).filter(':visible').find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var string = parseString($(this));
								if (string.match(/"|,/)) {
							        string = string; //string.replace(/,/g,' & ');
							    }
								tdData += '"'+ string + '"'+ defaults.separator;
							}
						}
					});
					//tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
				
				// Row vs Column
				$(el).find('tfoot').find('tr').each(function() {
				tdData += "\n";
					$(this).filter(':visible').find('td').each(function(index,data) {
						if ($(this).css('display') != 'none'){
							if(defaults.ignoreColumn.indexOf(index) == -1){
								var string = parseString($(this));
								if (string.match(/"|,/)) {
							        string = string; //string.replace(/,/g,' & ');
							    }
								tdData += '"'+ string + '"'+ defaults.separator;
							}
						}
					});
					//tdData = $.trim(tdData);
					tdData = $.trim(tdData).substring(0, tdData.length -1);
				});
		}
		
		//output
		if(defaults.consoleLog == 'true'){
			console.log(tdData);
		}
		var base64data = "base64," + $.base64.encode(tdData);
		var mailTo = $("#mailTo").val();
		var mailCC = $("#mailCC").val();
		var mailSubject = $("#mailSubject").val();
		var mailMessage = $("#mailMessage").val();
		if(mailTo == '' || mailSubject == '' || mailMessage == ''){
			document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
			document.getElementById('message').innerHTML = '<strong>Fill all fields to send report!</strong>';
			document.getElementById('message').style.display = "block";
			$('#message').delay(5000).fadeOut('slow');
		}
		else{
			document.getElementById('message').setAttribute("class", "alert alert-info alert-dismissible");
			document.getElementById('message').innerHTML = '<strong>Sending Report <i class="fa fa-spinner fa-pulse"></i></strong>';
			document.getElementById('message').style.display = "block";
			$.ajax({
				type: "POST",
				url: "../mail/mailReport.php",
				data: "csvData="+encodeURIComponent(tdData)+"&type=csv&to="+mailTo+"&cc="+mailCC+"&subject="+mailSubject+"&message="+mailMessage+"&fileName="+defaults.fileName,
				success: function(data) {
						console.log(data);
						if(data == true){
							document.getElementById('message').setAttribute("class", "alert alert-success alert-dismissible");
							document.getElementById('message').innerHTML = '<strong>Report Sent</strong>';
							document.getElementById('message').style.display = "block";
							$('#message').delay(5000).fadeOut('slow');
							
						}else{
							document.getElementById('message').setAttribute("class", "alert alert-danger alert-dismissible");
							document.getElementById('message').innerHTML = '<strong>Error in sending report! Try Again</strong>';
							document.getElementById('message').style.display = "block";
							$('#message').delay(5000).fadeOut('slow');
						}
					},
	                error: function(XMLHttpRequest, textStatus, errorThrown) { 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	                } 
				});
		}
	
	}
