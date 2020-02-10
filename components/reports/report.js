var monthTarget = 0;
var mocDetail = null;
var achievedValue = 0;
var voidAmount =0;
var percentage = 0;
var activeBorder = $("#activeBorder");
var customers = [];
var totalSales = 0;
var totalBills = 0;
var beatSearch = "";
var searchQuery = "";
var totalReturnBills = 0;

$(async()=>{ 
    await getMenu('Report')
    $('#imgForward').css('opacity',0.5)
    $('#imgBack').css({'opacity':1 , 'cursor' : 'pointer'}).click(()=>{
        window.location.href="../dashboard.html"
    })
    
})

 function voidOrderData(fromDate, toDate){

    return new Promise((resolve, reject)=>{
			 db.get(`SELECT CASE WHEN round(sum(voidAmount),2) > 0 THEN round(sum(voidAmount),2) ELSE 0 END AS voidAmount, count(VoidOrderInformation.ID) AS orderCount FROM VoidOrderInformation INNER JOIN customers ON VoidOrderInformation.customerID = customers.customerID where isMappedToSS = 0 and posDate between '${fromDate}' AND '${toDate}'`, function(err,row){

		            if(err){
		                console.log(err);
		                resolve(0);
		            }
		            else{
		                 resolve(row);

		            }

		        });
			}); 

}

 function getAchievementData(fromDate, toDate){

	return new Promise((resolve, reject)=>{
                     db.get(`SELECT CASE WHEN round(sum(sales),2) > 0 THEN round(sum(sales),2) ELSE 0 END AS sales, count(orderInformation.ID) AS orderCount FROM orderInformation INNER JOIN customers ON orderInformation.customerID = customers.customerID  where isMappedToSS = 0 and  posDate between '${fromDate}' AND '${toDate}'`, function(err,row){

			            if(err){
			                console.log(err);
			                resolve(0);
			            }
			            else{
			               resolve(row);

			            }

			        })
	            });

    }    

function mocData(){

	return new Promise((resolve, reject)=>{

          db.get("SELECT * FROM mocs", function(err,row){

            if(err){
                console.log(err);
                return false;
            }
            else{
            	var obj = {}

                mocDetail = row;
               if(mocDetail){
                monthTarget = mocDetail['monthTarget'];
                var fromDate = moment(mocDetail['fromDate']).format("YYYY-MM-DD");
                var toDate = moment(mocDetail['toDate']).format("YYYY-MM-DD");
                obj.monthTarget = parseInt(monthTarget);

                getAchievementData(fromDate, toDate).then(function(value){
                	obj.sales = value['sales'];
                	obj.orderCount = value['orderCount'];

                	voidOrderData(fromDate, toDate).then(function(value){
					obj.voidAmount = value['voidAmount'];
					obj.totalReturnBills = value['orderCount'];
                     resolve(obj);
                   });
                });
              }  

            }

          });
        });

}

function getCustomersList(){

	 db.all(`SELECT * FROM customers`, function(err,rows){

			            if(err){
			                console.log(err);
			            }
			            else{
			               
                           if(rows){

								 let dataArray = [];
								 customers = rows;
	                           	for (let i = 0; i < rows.length; i++) {
									let ID = i+1;
									let customerID = rows[i]['customerID'];
	                           		let customerName = rows[i]['firstName']+" "+rows[i]['lastName'] ;
	                           		let address = "";
	                           		let views = `<a href="./customerOrders.html?customerID=${customerID}">View</a>`;
	                           		if(rows[i]['address1']){
	                           			address+=rows[i]['address1']
	                           		}
	                           		if(rows[i]['address2']){
	                           			address+=rows[i]['address2']
	                           		}
	                           		if(rows[i]['city']){
	                           			address+=rows[i]['city']
	                           		}
	                           		if(rows[i]['state']){
	                           			address+=rows[i]['state']
	                           		}
	                           		if(rows[i]['pincode']){
	                           			address+=rows[i]['pincode']
	                           		}
	                           		if(rows[i]['country']){
	                           			address+=rows[i]['country']
									   }
									customers[i]['address'] = address;

	                           		dataArray.push({ID:ID,customerID:customerID,customerName : customerName, address : address, views: views})
	                           	}

                                $('#customersTable').bootstrapTable('destroy');
	                           	$('#customersTable').bootstrapTable(
					                {
					                    data:dataArray,
					                    search:true,
					                    reinit: true,
					                    trimOnSearch:false,
					                    pagination:true
					                }
					            );

					            $('.customInputSearch').css({"margin":"0","border-radius": "4px 0 0 4px"}).after('<button id="searchDiv" class="flex-row"><img src="../../assets/img/search_icon_white.png"</button>');
                                $('.customInputSearchDiv').addClass('flex-row margin-20')

                           }

			            }

			        })

}

function detailFormatter(index, row) {
    var html = [];
	customers.forEach(function(value){
		console.log(value);
      if(row.customerID == value.customerID){
		html.push('<p><b>Address:</b> ' + value['address'] + '</p>');
		html.push('<p><b>HUL CODE:</b> ' + value['customerCode'] + '</p>');
		html.push('<p><b>Channel:</b> ' + value['primaryChannel'] + '</p>');
		html.push('<p><b>Mobile:</b> ' + value['phone'] + '</p>');
	  }
	})

	console.log(html);
     return html.join('')
  }

 function getBeatDetails(beatName, ID){

	return new Promise((resolve,reject)=>{

		db.all(`SELECT A.partyCode, IFNULL(address1, "") AS address1,IFNULL(address2, "") AS address2,IFNULL(city, "") AS city,IFNULL(state, "") AS state,IFNULL(pincode, "") AS pincode,IFNULL(country, "") AS country, B.firstName from customersPartyCode AS A INNER JOIN customers AS B ON A.customerID = B.customerID  where beatName = '${beatName}' GROUP BY partyCode`, function(err, rows){

		if(err){
			console.log(err);
			var dialogOptions = {type: 'info', buttons: ['OK'], message: 'Error in Fetching Data!'}
                dialog.showMessageBox(dialogOptions)
		}
		else{

			if(rows.length){
				let rowHtml = null;
				$("#group-of-rows-"+ID).html(`<tr>
				<th>Child Party Code</th>
				<th>Customer Name</th>
				<td></td>
				<th>Address</th>  
				<th></th>
			   </tr>`);
				 
				 for (let i = 0; i < rows.length; i++) {
				 	   let partyCode = rows[i]['partyCode'];
				 	                let address = "";
	                           		if(rows[i]['address1']){
	                           			address+=rows[i]['address1']
	                           		}
	                           		if(rows[i]['address2']){
	                           			address+=rows[i]['address2']
	                           		}
	                           		if(rows[i]['city']){
	                           			address+=rows[i]['city']
	                           		}
	                           		if(rows[i]['state']){
	                           			address+=rows[i]['state']
	                           		}
	                           		if(rows[i]['pincode']){
	                           			address+=rows[i]['pincode']
	                           		}
	                           		if(rows[i]['country']){
	                           			address+=rows[i]['country']
									   }
				 	   let firstName = rows[i]['firstName'];
				 	    rowHtml+=`<tr>
	                                    <td>${partyCode}</td>
	                                    <td>${firstName}</td>
	                                    <td></td>
	                                    <td>${address}</td>  
	                                    <td><a href="./outletOrders.html?partyCode=${partyCode}">View</a></td>
                                   </tr>`; 
				 }

				 $("#group-of-rows-"+ID).append(rowHtml);
               
			}

		}

	})

	})

}
 function getBeatData(){

	db.all(`SELECT distinct(beatName) AS beatName,  ID, salName, IFNULL(address, "") AS address, serviceDays from customersPartyCode ${searchQuery} GROUP by beatName`, async function(err, rows){

		if(err){
			console.log(err);
			var dialogOptions = {type: 'info', buttons: ['OK'], message: 'Error in Fetching Data!'}
                dialog.showMessageBox(dialogOptions)
		}
		else{
			let html = null;
			$("#beatTable").html(`<thead>
									<tr>
									<th scope="col">Beat Name</th>
									<th scope="col">Supervisor Name</th>
									<th scope="col">Address</th>
									<th data-field="serviceDays">Servicing Days</th>
									<th scope="col"></th>
									</tr>
								</thead>`);

			if(rows.length){
				 for (let i = 0; i < rows.length; i++) {
				 	let ID = rows[i]['ID'];
				 	let beatName = rows[i]['beatName'];
				 	let salName = rows[i]['salName'];
				 	let address = rows[i]['address'];
				 	let serviceDays = rows[i]['serviceDays'];
				 	html+= `<tbody onclick="getBeatDetails('${beatName}', ${ID})">
                                    <tr class="clickable" data-toggle="collapse" data-target="#group-of-rows-${ID}" aria-expanded="false" aria-controls="group-of-rows-${ID}">
                                        <td>${beatName}</td>
                                        <td>${salName}</td>  
                                        <td>${address}</td>
                                        <td>${serviceDays}</td>  
                                        <td><i class="fa fa-chevron-down" style="cursor:pointer" aria-hidden="true"></i></td>
                                    </tr>
                            </tbody>
                            <tbody id="group-of-rows-${ID}" class="collapse" style="background:#f7f5f5">
			                  <tr>
                                <th>Child Party Code</th>
                                <th>Customer Name</th>
                                <th>Address</th>  
                                <th></th>
                               </tr>
                             </tbody>`;
                       // getBeatDetails(beatName, ID).then((data)=>{
                       // 	html+=data;
                       // 	console.log("html");
                       // 	console.log(html);
                       // });
				 }
               
			}
			else{
			html = `<tr>
			          <td colspan="5">
					     <p style="text-align:center;margin: 12px;">No records found !</p>
					   </td>
			        </tr>`;	
			}

			$("#beatTable").append(html);

		}

	})

}

function filter(){
	  beatSearch = $("#beatSearch").val();
	  searchQuery = `where LOWER(beatName) like '%${beatSearch}%' OR LOWER(address) like '%${beatSearch}%' OR LOWER(salName) like '%${beatSearch}%'`;
     getBeatData(searchQuery);
}

function resetBeatSearch(){
	$("#beatSearch").val('');
	$("#resetSearchIcon1").css({"display":"none"});
	filter();
	return false;
}
displaySearchButton1=()=>{
	$('#resetSearchIcon1').css('display','flex')
}





 function getReportData() {
	mocData().then(function(obj){
		console.log(obj);
		monthTarget = obj.monthTarget;
		totalSales = obj.sales;
		voidAmount = obj.voidAmount;
		totalReturnBills = obj.totalReturnBills;
		totalBills = obj.orderCount;
		achievedValue = totalSales - voidAmount;
		var percentage = Math.round(achievedValue/monthTarget*100);
		var degree = percentage/100*360;
		console.log(degree);
	    $(".Target_value").text(monthTarget);
	    if (degree<=180){
        activeBorder.css('background-image','linear-gradient(' + (90+degree) + 'deg, transparent 50%, #2c82be 50%),linear-gradient(90deg, #2c82be 50%, transparent 50%)');
	    }
	    else{
	        activeBorder.css('background-image','linear-gradient(' + (degree-90) + 'deg, transparent 50%, #2c82be 50%),linear-gradient(90deg, #2c82be 50%, transparent 50%)');
	    }
	    $(".Total_sales").text(totalSales);
	    $(".Achieved_Value").text(parseFloat(achievedValue).toFixed(2));
	    $(".Return_value").text(parseFloat(voidAmount).toFixed(2));
		$(".Total_bills").text(totalBills);
		$(".Return_Bills").text(totalReturnBills);
	    $("#percentage").text(percentage+" %");

	});
	getCustomersList();
	getBeatData();
}