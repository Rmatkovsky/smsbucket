var cfg = {
    username: 'redcross',
    password: 'GE8pKfgdG',
    unwireUrl: 'http://gw.unwire.com/service/smspush'
}

Parse.Cloud.define('addDonation', function(request, response) {

    var Requests = Parse.Object.extend("Requests"),
        requests = {};
//        digitRand = 0000;// Math.floor(Math.random()*10000+1);

    if(!!request.params.phoneNumber) {

        requests = new Requests();

        requests.set({
            phoneNumber: parseInt(request.params.phoneNumber)
        });

        var Image = Parse.Object.extend("Pictures"),
            imageQuery = new Parse.Query(Image),
            photoId = parseInt(request.params.photoId);

        imageQuery.get(photoId, {
            success: function(images) {
                requests.set("donation", ""+request.params.donate);
                requests.set("donatorName", ""+request.params.senderName);
                requests.set("email", ""+request.params.senderEmail);
                requests.set("recipientPhoneNumber", parseInt(request.params.recipientPhoneNumber));
                requests.set("imageId",  images);
                requests.set("text",""+request.params.greetingText);
                requests.set("used",false);
                requests.save(null,{
                    success: function(saveRequest) {
                        httpRequest({
                                phoneNumber: request.params.phoneNumber,
                                text: 'Tryk på linket http://smsbucket.parseapp.com/#/confirm/' + saveRequest.id + ' for at bekræfte din hilsen samt din donation til Røde Kors',
                                response: response
                            },
                            function() {
                                response.success({status: 200});
                            });
                    },
                    error: function(request) {

                        response.error({status: 501});
                    }
                })
            },
            error: function() {
               response.error({status: 501});
            }
        })




    } else {
        response.error({status: 400});
    }

});

Parse.Cloud.define('sendDonation', function(request, response) {

    var Requests = Parse.Object.extend("Requests"),
        requestsQuery = new Parse.Query("Requests");

    if(!!request.params.confirmId ) {
            requestsQuery.get(request.params.confirmId,{
                success: function(item){
                    httpRequest({
                            phoneNumber: item.get('recipientPhoneNumber'),
                            text: item.get('donatorName') + ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://smsbucket.parseapp.com/#/sms/' + item.id + ' for at se din hilsen.',
                            response: response
                        },
                        function() {
                            httpRequest({
                                    phoneNumber:item.get('phoneNumber'),
                                    text: 'Tak for dit bidrag på ' + item.get('donation') + ' til Røde Kors. Med venlig hilsen Cause I Care',
                                    response: response
                                },
                                function() {
                                    item.set("used",true);
                                    item.save();
                                    response.success({status: 200});
                                })
                        })

                },
                error: function() {
                    response.error({status: 400});
                }
            });

    } else {
        response.error({status: 400});
    }

});
function httpRequest(params,callback) {
    Parse.Cloud.httpRequest({
        url: cfg.unwireUrl,
        params: {
            user: cfg.username,
            password: cfg.password,
            to: params.phoneNumber,
            smsc: 'dk.tdc',
            price: '0.00DKK',
            appnr: '1231',
            text: params.text,
            mediacode: 'afrika',
            preferredencoding: 'UTF-8'
        },
        success: function(httpResponse) {
            callback();

        },
        error: function(httpResponse) {
            if(httpResponse.status == 400) {
                params.response.error({status: 400});
            } else {
                params.response.error({status: 500});
            }
        }
    });
}

//Parse.Cloud.define('sendGreeting', function(request, response) {
//    var Requests = Parse.Object.extend("Requests"),
//        requestsQuery = new Parse.Query(Requests);
//
//    if(!!request.params.confirmId) {
//        requestsQuery.get(request.params.confirmId,{
//            success: function(requests) {
//                    var Image = Parse.Object.extend("Pictures"),
//                        imageQuery = new Parse.Query(Image),
//                        photoId = parseInt(request.params.photoId);
//
//                    imageQuery.get(photoId, {
//                        success: function(images) {
//                            requests.set("donation", request.params.donate);
//                            requests.set("donatorName", request.params.senderName);
//                            requests.set("email", request.params.senderEmail);
//                            requests.set("recipientPhoneNumber", parseInt(request.params.recipientPhoneNumber));
//                            requests.set("imageId",  images);
//                            requests.set("text", request.params.greetingText);
//                            requests.save(null,{
//                                success: function(saveRequest) {
//                                    httpRequest({
//                                        phoneNumber: request.params.recipientPhoneNumber,
//                                        text: ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://smsbucket.parseapp.com/#/sms/' + requests.id + ' for at se din hilsen.',
//                                        response: response
//                                    },
//                                    function() {
//                                        httpRequest({
//                                                phoneNumber: requests.get('phoneNumber'),
//                                                text: 'Tak for dit bidrag på ' + request.params.donate + ' til Røde Kors. Med venlig hilsen Cause I Care',
//                                                response: response
//                                            },
//                                            function() {
//                                                response.success({status: 200});
//                                            })
//                                    })
//                                },
//                                error: function(saveRequest) {
//                                    response.error({status: 501});
//                                }
//                            })
//                        },
//                        error: function() {
//                            requests.set("donation", request.params.donate);
//                            requests.set("donatorName", request.params.senderName);
//                            requests.set("email", request.params.senderEmail);
//                            requests.set("recipientPhoneNumber", request.params.recipientPhoneNumber);
//                            requests.set("text", request.params.greetingText);
//                            requests.save(null,{
//                                success: function(saveRequest) {
//                                    response.success(saveRequest);
//                                },
//                                error: function() {
//                                    response.error({status: 501});
//                                }
//                            })
//                        }
//                    })
//
//            },
//            error: function(queryRequest) {
//                response.error({status: 501});
//            }
//        });
//
//    } else {
//        response.error({status: 400})
//    }
//});