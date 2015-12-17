var _ = require('lodash');
var async = require('async');
var ArcCrud = require('arcgis-crud');
var crud = ArcCrud.featureLayer;

var targURL = 'http://gisweb.gcheb.cap.ru/arcgis/rest/services/cheb/ai_oks_mkd_12_2015/MapServer/0';
var srcURL = 'http://gisweb.gcheb.cap.ru/arcgis/rest/services/cheb/oks_mkd/MapServer/0';
//"адрес='г. Чебоксары, б-р Олега Волкова, д.3'"
// crud.connect(
// 	srcURL,
// 	function (err, srcObj) {
// 		srcObj.query({ returnIdsOnly: false, where: "адрес='г. Чебоксары, б-р Олега Волкова, д.3'" }, function (err, srcData) {
// 			console.log(srcData);
// 		});
// 	}
// );


crud.connect(
	targURL,
	function (err, targObj) {
		if (err) {
			console.error(err.message);
		} else {
			// targObj.query({ returnIdsOnly: false, where: "OBJECTID=" + 1000 }, function (err, targData) {
			// 	console.log(targData.features);
			// });
			targObj.query({ returnIdsOnly: true, where: "1=1" }, function (err, targData) {
				if (err) {
					console.error(err.message);
				} else {
					// console.log('get objs by query 1=1: ', targData);
					crud.connect(
						srcURL,
						function (err1, srcObj) {
							if (err1) {
								console.log(err1.message);
							} else {
								var totalCmpare = 0;
								async.parallel(
									_.map(
										targData.objectIds,
										function (id) {
											return function (done) {
												// console.log(id);
												targObj.query({ returnIdsOnly: false, where: "OBJECTID=" + id }, function (err, targData) {
													var address = targData.features[0].attributes["адрес"];
													// console.log(id, targData.features[0].attributes["адрес"]);
													srcObj.query(
														{ returnIdsOnly: true, where: 'адрес="' + address + '"' },
														function (err, compare) {
															console.log(id, targData.features[0].attributes["адрес"], compare);
															if (compare) {
																totalCmpare ++;
															}
															done();
														}
													);
												});
											};
										}
									),
									function () {
										srcObj.query({ returnIdsOnly: true, where: "1=1" }, function (err, srcData) {
											console.log('old', srcData.objectIds.length);
											console.log('new', targData.objectIds.length);
											console.log('compare', totalCmpare);
										});

									}
								);
							}
						}
					);
				}
			});
		}
	}
);