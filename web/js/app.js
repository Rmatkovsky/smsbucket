var api = function (params) {
    this.appID = 'X0UY3A7Y78VafC2i6LDnVce3FBd6WKN8TDXpHOkv';
    this.RESTkey = '5URAW90R2VrLpdZJHwWnFky2thrqz8nxcFVgfTKk';

    return $.ajax({
        url: 'https://api.parse.com/1/classes/' + params.classes + '/' + params.objectId,
        type: params.type,
        dataType: 'json',
        headers: {
            'X-Parse-Application-Id': this.appID,
            'X-Parse-REST-API-Key': this.RESTkey
        }
    })
        .error( function( ) {
            $('.error').show();
        });
}

var app = function () {
    this.sms = function( id ) {
        api( {classes:'Requests', objectId: id } )
            .done( function( data ) {
                var image = api({
                    classes: 'Pictures',
                    objectId: data.imageId.objectId });

                $('.smsblock').show();
                $('.title').text(data.text);
                image.done( function( dataImage ) {
                    $('.smsblock .image').attr('src',dataImage.url_image.url);
                })
            })
    };

    this.confirm = function( id ) {
        api( {classes:'Requests', objectId: id } )
            .done( function( data ) {

            });
    };
}
