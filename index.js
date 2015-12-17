var _ = require('lodash');
var async = require('async');
var ArcCrud = require('arcgis-crud');
var crud = ArcCrud.featureLayer;

var destURL = '';
var srcURL = '';

crud.connect(destURL, function (err, targObj) {
  if (err) {
    console.error(err.message);
  } else {
    targObj.query({ returnIdsOnly: true, where: "1=1" }, function (err, targData) {
      if (err) {
        console.error(err.message);
      } else {
        crud.connect(srcURL, function (err1, srcObj) {
          if (err1) {
            console.log(err1.message);
          } else {
            async.waterfall(_.map(targData.objectIds, function (id) {
              return function (done) {
                targObj.query({ returnIdsOnly: false, where: "OBJECTID=" + id }, function (err, targData) {
                  var address = targData.features[0].attributes["адрес"];
                  srcObj.query({ returnIdsOnly: false, where: "адрес='" + address + "'"}, function (err, srcData) {

                    if (srcData.features.length) {
                      var attrSrc = srcData.features[0].attributes;

                      srcObj.attachmentInfos(attrSrc.OBJECTID,function (err, resp, body) {
                        var attachInf = JSON.parse(body);
                        if (attachInf.attachmentInfos.length) {
                          var attachObj = attachInf.attachmentInfos[0];
                          var imgPath = srcURL + '/' + attrSrc.OBJECTID + '/attachments/' + attachObj.id;

                          console.log(imgPath);

                          targObj.addAttachmentUrl(id, imgPath, function (err2) {
                            done();
                          });
                        });
                      } else {
                        done();
                      }
	                  } else {
	                    done();
	                  }
                  });
                });
              };
            }),
            function () {
              console.log('complete.');
            });
          }
        });
      }
    });
  }
});
