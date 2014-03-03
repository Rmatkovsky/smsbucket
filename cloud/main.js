Parse.Cloud.define('httpRequest', function(request, response) {
	Parse.Cloud.httpRequest({
            url: 'http://gw.unwire.com/service/smspush',
            params: {
    			user: 'redcross',
    			password: 'GE8pKfgdG',
    			to: '4550600468',
    			smsc: 'dk.tdc',
    			price: '0.00DKK',
    			appnr: '1231',
    			text: 'Hello%20Ciklum',
    			mediacode: 'afrika'
  			},		
            success: function(httpResponse) {
               response.success(httpResponse.text)
            }, 
            error: function(httpResponse) {
                response.error('Request failed with response code ' + httpResponse.status);
            }
        });
});