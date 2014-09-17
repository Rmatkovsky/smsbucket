var api = function (params) {
    this.appID = 'q5uk1NhQDpJYQqHCpTBqr0lRcR0x3gu411GwQ3Pj';
    this.RESTkey = 'kKmXZ3ruTZq6bLBlc573ADPFomgfZs8EG3dRcRS2';
    this.methods = {
        classes: 'https://api.parse.com/1/classes/',
        functions: 'http://causeicare.dk/test/pay4it/pay.php'
    }

    params.where = params.where || '';

    return $.ajax({
        url: this.methods[ params.method ] + params.point + '/' + params.objectId + params.where,
        type: params.type,
        dataType: 'json',
        data: params.data || {},
        headers: {
            'X-Parse-Application-Id': this.appID,
            'X-Parse-REST-API-Key': this.RESTkey
        }
    })
        .error( function( error ) {
            $('.error').show();
        });
}

var app = function () {
    this.sms = function( id ) {
        api( {
            method: 'classes',
            point:'Requests',
            objectId: id,
            where: ''
        } )
            .done( function( data ) {
                var image = api( {
                    method: 'classes',
                    point: (data.userImage) ? 'ImageFromUsers' : 'Pictures',
                    objectId: (data.userImage) ?  data.imageFromUserId.objectId : data.imageId.objectId ,
                    type: 'GET',
                    where: ''
                } );

                $('.smsblock').show();
                $('.title').text(data.text);
                image.done( function( dataImage ) {
                    $('.smsblock .image').attr('src',(data.userImage) ? dataImage.image.url : dataImage.url_image.url);
                });
            })
    };

    this.confirm = function( id ) {
        var where = {
            "used": {
                "$exists": true
            },
            "objectId": {
                "$in": [id]
            }
        }
        api( {
            method: 'classes',
            point:'Requests',
            objectId: '',
            type: 'GET',
            where: '?where='+ JSON.stringify( where )
        } )
            .done( function( data ) {
                if( data.results.length > 0 ) {
                    $('.confirmblock').show();
                    $('.confirmblock .title').text(data.results[0].text);
                    $('.confirmblock #donation').text(data.results[0].donation);

                    api( {
                        method: 'functions',
                        point: '',
                        objectId: '',
                        data: {
                            text: data.results[0].donatorName + ' har sendt dig en hilsen via Cause I Care. Tryk på linket http://causeicare.dk/test/#/sms/' + data.results[0].objectId + ' for at se din hilsen.',
                            phoneNumber: data.results[0].recipientPhoneNumber,
                            sendSMS: true,
                            method: 'functions',
                            point: 'SendSMS',
                            objectId: id,
                            sendParse: true
                        },
                        type: 'POST',
                        where: ''
                    });

                };
            }).error( function () {});
    };
}
