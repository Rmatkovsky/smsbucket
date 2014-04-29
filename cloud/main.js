var cfg = {
    username: 'redcross',
    password: 'GE8pKfgdG',
    unwireUrl: 'http://gw.unwire.com/service/smspush'
}

Parse.Cloud.define('addDonation', function(request, response) {

    var Requests = Parse.Object.extend("Requests"),
        requests = {};

    if(!!request.params.phoneNumber) {

        requests = new Requests();

        requests.set({
            phoneNumber: request.params.phoneNumber
        });

        var Image = Parse.Object.extend("Pictures"),
            imageQuery = new Parse.Query(Image),
            photoId = parseInt(request.params.photoId),
            mediacode = null;

        imageQuery.get(photoId, {
            success: function(images) {
                requests.set("donation", ""+request.params.donate);
                requests.set("donatorName", ""+request.params.senderName);
                requests.set("email", ""+request.params.senderEmail);
                requests.set("recipientPhoneNumber", request.params.recipientPhoneNumber);
                requests.set("imageId",  images);
                requests.set("text",""+request.params.greetingText);
                requests.set("used",false);
                requests.save(null,{
                    success: function(saveRequest) {
                        httpRequest({
                                phoneNumber: request.params.phoneNumber,
                                text: 'Tryk på linket http://causeicare.parseapp.com/#/confirm/' + saveRequest.id + ' for at bekræfte din hilsen samt din donation til Røde Kors',
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
                            phoneNumber: item.get('recipientPhoneNumber'),
                            text: item.get('donatorName') + ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://causeicare.parseapp.com/#/sms/' + item.id + ' for at se din hilsen.',
                            response: response
                        },
                        function() {
                            httpRequest({
                                    phoneNumber:item.get('phoneNumber'),
                                    sessionid: item.id,
                                    donation: item.get('donation'),
                                    text: 'Tak for dit bidrag på ' + item.get('donation') + ' Kr til Røde Kors. Med venlig hilsen Cause I Care',
                                    response: response,
                                    mediacode: mediacode
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
    var donation = params.donation ? parseFloat(params.donation) : 0;
    var dParams = {
        user: cfg.username,
        password: cfg.password,
        to: params.phoneNumber,
//            smsc: 'dk.tdc',
        price: '' + donation.toFixed(2) + 'DKK',
        appnr: '1231',
        text: params.text,
        mediacode: 'afrika',
        preferredencoding: 'UTF-8'
    }

    if(!!params.mediacode) {
        dParams.mediacode = params.mediacode;
        if (donation) {
	        dParams.vat = '0.00';
	    }
    }
    if(!!params.sessionid) {
        dParams.sessionid = params.sessionid;
        dParams.callbackurl = 'http://causeicare.parseapp.com/#/callback/';
    }

    Parse.Cloud.httpRequest({
        url: cfg.unwireUrl,
        params: dParams,
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