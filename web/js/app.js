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
            $('.div-block').hide();
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
                $('.smsblock .title').text(data.text);
                $('.smsblock .charity').text(data.charityName);
                image.done( function( dataImage ) {
                    $('.div-block').hide();
                    $('.smsblock .image').attr('src',(data.userImage) ? dataImage.image.url : dataImage.url_image.url);
                    $('.smsblock #link').attr('href',(data.userImage) ? dataImage.image.url : dataImage.url_image.url);
                });
            })
    };

    this.confirm = function( id ) {

        api( {
            method: 'functions',
            point: '',
            objectId: '',
            sendParse: true,
            type: 'POST',
            where: '',
            data: {
                method: 'functions',
                point: 'sendDonation',
                confirmId: id,
                sendParse: true
            }
        } )
            .done( function( data ) {
                if( !!data.error && JSON.parse(data.error).status == '400' ) {
                    $('.div-block').hide();
                    $('.error .title').text('Beskeden er bekræftet');
                    return $('.error').show();
                };
                if( data.result.status == "200" ) {
                    $('.div-block').hide();
                    $('.confirmblock').show();
                    $('.confirmblock .title').text(data.result.text);
                    $('.confirmblock #donation').text(data.result.donation);
                    $('.confirmblock .charity').text(data.result.charityName);
                };
            });
    };
}
