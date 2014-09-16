var cfg = {
        username: 'redcross',
        password: 'GE8pKfgdG',
        gatewayUrl: 'http://causeicare.dk/test/pay4it/pay.php'
    },
    testPhone = ['004522798828','004520450201','004522671837'];

function trimPhoneNumber(phone) {
    var re160 = new RegExp(String.fromCharCode(160),"g");
	var trimmedPhone = phone.replace(re160, '').replace(/\D+/g, '');

	return trimmedPhone;
};

Parse.Cloud.define('jqueryAjax', function(request,response) {
    Parse.Cloud.httpRequest({
        url: cfg.unwireUrl,
        success: function(httpResponse) {
            response.success(httpResponse)

        },
        error: function(httpResponse) {
            response.error(httpResponse)
        }
    });
    // request.jQuery.ajax(
    //     {
    //         url:'https://api.pay4it.dk:8090/json/SendSMS',
    //         type: 'GET',
    //         data: {
    //             'Message': 'Hello Ciklum 4 part',
    //             'Recipient': '4522671837'
    //         },
    //         headers: {
    //             'UserName':'ji@cphpress.com',
    //             'Password': 'e8d34dcd-fb24-4ae5-9591-31a0abe38eb9',
    //             'Pay4itSecurity': 'e18bb807-5b12-40f3-ad22-0d3a2af8be0e'
    //         }
    //     }
    // ).done(function(data){response.success(data)})
});

Parse.Cloud.define('addDonation', function(request, response) {

    var phoneNumber = request.params.phoneNumber;

	if (phoneNumber) {
		phoneNumber = trimPhoneNumber(phoneNumber);
	};

    var recipientPhoneNumber = request.params.recipientPhoneNumber;

	if (recipientPhoneNumber) {
		recipientPhoneNumber = trimPhoneNumber(recipientPhoneNumber);
	};

    if(!!phoneNumber) {
        var Requests = Parse.Object.extend("Requests"),
            requests = new Requests();

        requests.set({
            phoneNumber: phoneNumber
        });

        var Image = (request.params.userImage) ? Parse.Object.extend("ImageFromUsers") : Parse.Object.extend("Pictures"),
            imageQuery = new Parse.Query(Image),
            photoId = request.params.photoId,
            Charities = Parse.Object.extend("Charities"),
            charityQuery = new Parse.Query(Charities),
            charityId = request.params.charityId,
            userImage = (request.params.userImage) ? true : false ;


        charityQuery.get(charityId, {
            success: function(charity) {
                requests.set("charityId", charity);

                imageQuery.get(photoId, {
                    success: function(images) {
                        requests.set("donation", "" + request.params.donate);
                        requests.set("donatorName", "" + request.params.senderName);
                        requests.set("email", "" + request.params.senderEmail);
                        requests.set("recipientPhoneNumber", recipientPhoneNumber);
                        requests.set("userImage", !!request.params.userImage);
                        requests.set("text","" + request.params.greetingText);
                        requests.set("used", false);
                        if(request.params.userImage) {
                            requests.set("imageFromUserId", images);
                        } else {
                            requests.set("imageId", images);
                        };

                        requests.save(null, {
                            success: function(saveRequest) {
                                httpRequest({
                                        phoneNumber: phoneNumber,
                                        text: 'Tryk på linket http://causeicare.parseapp.com/#/confirm/' + saveRequest.id + ' for at bekræfte din hilsen samt din donation til Røde Kors',
                                        response: response,
                                        sessionid: saveRequest.id
                                    },
                                    function( ) {
                                        response.success({status: 200});
                                    });
                            },
                            error: function(request) {

                                response.error(request);
                            }
                        })
                    },
                    error: function() {
                        response.error({status: 501, method: 'image'});
                    }
                });
            },
            error: function() {
                response.error({status: 501, method: 'charity'});
            }
        });





    } else {
        response.error({status: 400});
    }

});

Parse.Cloud.define('sendDonation', function(request, response) {

    var Requests = Parse.Object.extend("Requests"),
        requestsQuery = new Parse.Query("Requests"),
        mediacode = null;



    if(!!request.params.confirmId ) {
            requestsQuery.get(request.params.confirmId,{
                success: function(item){
                    switch(item.get('donation')+'') {
                        case '25': mediacode = 'bouquet25';break;
                        case '50': mediacode = 'bouquet50';break;
                        case '75': mediacode = 'bouquet75';break;
                        case '100': mediacode = 'bouquet100';break;
                    }
                    httpRequest({
                            phoneNumber: trimPhoneNumber(item.get('recipientPhoneNumber')),
                            text: item.get('donatorName') + ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://causeicare.parseapp.com/#/sms/' + item.id + ' for at se din hilsen.',
                            response: response
                        },
                        function() {
                            httpRequest({
                                    phoneNumber: trimPhoneNumber(item.get('phoneNumber')),
                                    sessionid: item.id,
                                    donation: item.get('donation'),
                                    text: 'Tak for dit bidrag på ' + item.get('donation') + ' Kr til Røde Kors. Med venlig hilsen Cause I Care',
                                    response: response,
                                    mediacode: mediacode
                                },
                                function( ) {
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
    //var donation = params.donation ? parseFloat(params.donation) : 0;
//
//
//    var dParams = {
//        user: cfg.username,
//        password: cfg.password,
//        to: params.phoneNumber,
////            smsc: 'dk.tdc',
//        price: '' + donation.toFixed(2) + 'DKK',
//        appnr: '1231',
//        text: params.text,
//        mediacode: 'afrika',
//        preferredencoding: 'UTF-8'
//    };

    //if( !!params.mediacode ) {
    //    dParams.mediacode = params.mediacode;
    //    if (donation) {
	 //       dParams.vat = '0.00';
	 //   }
    //}
    //if( !!params.sessionid ) {
    //    dParams.sessionid = params.sessionid;
    //    dParams.callbackurl = 'http://qa-causeicare.parseapp.com/#/callback/';
    //}
    //
    //if( testPhone.indexOf( params.phoneNumber ) !== -1) {
    //    dParams.price = '0.00DKK', dParams.mediacode = 'afrika';
    //    delete( dParams.vat );
    //}

    Parse.Cloud.httpRequest({
        url: cfg.gatewayUrl,
        method: 'POST',
        body: {
            'message': params.text,
            'recipient': params.phoneNumber,
            'sendSMS': 'true'
        },

        success: function() {
            callback();
        },
        error: function(httpResponse) {
            params.response.error(httpResponse)
        }
    });
}
