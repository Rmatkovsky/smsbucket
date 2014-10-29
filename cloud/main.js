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
                        requests.set("charityName","" + charity.get('charityName'));
                        requests.set("used", false);
                        if(request.params.userImage) {
                            requests.set("imageFromUserId", images);
                        } else {
                            requests.set("imageId", images);
                        };

                        requests.save(null, {
                            success: function(saveRequest) {
                                httpRequest({
                                        recipient: phoneNumber,
                                        message: 'Tryk på linket http://causeicare.dk/test/#/confirm/' + saveRequest.id + ' for at bekræfte din hilsen samt din donation til ' + charity.get('charityName'),
                                        sessionid: saveRequest.id,
                                        sendSMS: true
                                    },
                                    function( ) {
                                        response.success({status: 200});
                                    }, response);
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
        requestsQuery = new Parse.Query(Requests),
        confirmId = request.params.confirmId,
        mediacode = null;



    if( !!confirmId ) {

        requestsQuery.get(confirmId,{
                success: function(item){

                    if(item.get('used')) {
                       return response.error({status: 400});
                    };

                    httpRequest({
                            recipient: trimPhoneNumber(item.get('recipientPhoneNumber')),
                            message: item.get('donatorName') + ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://causeicare.dk/test/#/sms/' + item.id + ' for at se din hilsen.',
                            sendSMS: true
                        },
                        function() {
                            httpRequest({
                                    recipient: trimPhoneNumber(item.get('phoneNumber')),
                                    sessionid: item.id,
                                    amount: 1,//item.get('donation'),
                                    message: 'Tak for dit bidrag på ' + item.get('donation') + ' Kr til ' + item.get('charityName') + '. Med venlig hilsen Cause I Care',
                                    sendPaySMS: true
                                },
                                function( ) {
                                    item.set("used",true);
                                    item.save();
                                    response.success({status: 200, text: item.get('text'), donation: item.get('donation'), charityName: item.get('charityName')});
                                },response)
                        },response)

                },
                error: function() {
                    response.error({status: 400});
                }
            });

    } else {
        response.error({status: 400});
    }

});

Parse.Cloud.define('SendSMS', function( request, response ) {
    httpRequest(request.params, function() {
        response.success({status: 200});
    });
});

function httpRequest(params,callback,response) {
    Parse.Cloud.httpRequest({
        url: cfg.gatewayUrl,
        method: 'POST',
        body: params,

        success: function ( ) {
            callback();
        },
        error: function (httpResponse) {
            response.error(httpResponse)
        }
    });
};
